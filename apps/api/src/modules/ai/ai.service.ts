import type { LLMProvider } from "./providers/llm-provider.js";
import type { WorkflowAIContext, ParseWorkflowInput, ParseWorkflowResult, AIReviewResult, AIReviewSection, EscalationInput, EscalationResult } from "./ai.types.js";
import { ContextBuilder } from "./builders/context.builder.js";
import { BusinessRules } from "./rules/business-rules.js";
import { REVIEW_AGENTS, buildAgentPrompt, type AgentSpec } from "./prompts/agent.prompt.js";
import { buildParseRequestPrompt } from "./prompts/parse-request.prompt.js";
import { buildEscalationPrompt } from "./prompts/escalation.prompt.js";
import { AppError } from "../../core/errors/app-error.js";

export class AIService {
    constructor(
        private readonly provider: LLMProvider,
        private readonly contextBuilder = new ContextBuilder(),
        private readonly businessRules = new BusinessRules()
    ) {}

    async review(context: WorkflowAIContext) {
        this.validate(context);

        const aiContext = this.contextBuilder.build(context);

        // Multi-agent review: four specialised agents run IN PARALLEL on the
        // AMD Developer Cloud vLLM endpoint, each assessing one risk dimension.
        const start = Date.now();
        const sections = await Promise.all(
            REVIEW_AGENTS.map((agent) => this.runAgent(agent, aiContext))
        );
        const latencyMs = Date.now() - start;

        const confidence = Math.round(
            sections.reduce((sum, s) => sum + (s.confidence || 0), 0) / (sections.length || 1)
        );

        const result: AIReviewResult = {
            security: sections[0]!,
            compliance: sections[1]!,
            operations: sections[2]!,
            cost: sections[3]!,
            decision: {
                overallRisk: "LOW",
                recommendation: "APPROVE",
                summary: "",
                confidence
            }
        };

        const validated = this.businessRules.apply(result, aiContext);
        validated.engine = {
            model:
                process.env["AI_MODEL_LABEL"] ??
                process.env["VLLM_MODEL"] ??
                "Qwen/Qwen3-0.6B",
            provider: "vLLM on AMD Developer Cloud",
            agents: REVIEW_AGENTS.length,
            parallel: true,
            latencyMs
        };
        return validated;
    }

    private async runAgent(agent: AgentSpec, context: WorkflowAIContext): Promise<AIReviewSection> {
        try {
            const response = await this.provider.generate({
                systemPrompt: `You are the ${agent.title}. Reply with JSON only.`,
                userPrompt: buildAgentPrompt(agent, context)
            });
            return this.parseSection(this.extractJson(response));
        } catch {
            return {
                risk: "LOW",
                confidence: 0,
                reasoning: ["Agent unavailable; defaulted to low risk."],
                checks: []
            };
        }
    }

    private parseSection(json: Record<string, unknown>): AIReviewSection {
        const risk = typeof json["risk"] === "string" ? (json["risk"] as string).toUpperCase() : "LOW";
        const validRisk = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(risk) ? risk : "LOW";
        const confidenceRaw = typeof json["confidence"] === "number" ? (json["confidence"] as number) : 60;
        const confidence = Math.min(100, Math.max(0, confidenceRaw));
        const reasoning = Array.isArray(json["reasoning"])
            ? (json["reasoning"] as unknown[]).filter((x): x is string => typeof x === "string")
            : [];
        const checks = Array.isArray(json["checks"])
            ? (json["checks"] as unknown[]).filter((x): x is string => typeof x === "string")
            : [];

        return { risk: validRisk, confidence, reasoning, checks };
    }

    async parseWorkflow(input: ParseWorkflowInput): Promise<ParseWorkflowResult> {
        const text = input?.text?.trim();
        const templates = Array.isArray(input?.templates) ? input.templates : [];

        if (!text) {
            throw new AppError("Request text is required", 400);
        }

        if (templates.length === 0) {
            throw new AppError("At least one workflow template is required", 400);
        }

        let llmJson: Record<string, unknown> = {};
        try {
            const response = await this.provider.generate({
                systemPrompt: "You extract structured workflow requests. Reply with JSON only.",
                userPrompt: buildParseRequestPrompt(text, templates.map((t) => t.name))
            });
            llmJson = this.extractJson(response);
        } catch {
            llmJson = {};
        }

        const template = this.matchTemplate(templates, llmJson["template"], text);
        const title = typeof llmJson["title"] === "string" && (llmJson["title"] as string).trim()
            ? (llmJson["title"] as string).trim()
            : this.deriveTitle(text);
        const payload = this.buildPayload(llmJson["payload"], text);

        return {
            title,
            workflowTemplateId: template.id,
            templateName: template.name,
            payload
        };
    }

    async draftEscalation(input: EscalationInput): Promise<EscalationResult> {
        const recipient = input?.approverName?.trim() || "Approver";
        const title = input?.workflowTitle?.trim();

        if (!title) {
            throw new AppError("workflowTitle is required", 400);
        }

        let json: Record<string, unknown> = {};
        try {
            const response = await this.provider.generate({
                systemPrompt: "You write concise escalation reminders. Reply with JSON only.",
                userPrompt: buildEscalationPrompt({
                    workflowTitle: title,
                    currentStep: input.currentStep || "the current step",
                    pendingLabel: input.pendingLabel || "some time",
                    requesterName: input.requesterName || "the requester",
                    approverName: recipient,
                    overallRisk: input.overallRisk
                })
            });
            json = this.extractJson(response);
        } catch {
            json = {};
        }

        const subject = typeof json["subject"] === "string" && (json["subject"] as string).trim()
            ? (json["subject"] as string).trim()
            : `Action needed: "${title}" pending for ${input.pendingLabel || "a while"}`;
        const body = typeof json["body"] === "string" && (json["body"] as string).trim()
            ? (json["body"] as string).trim()
            : `Reminder: "${title}" has been awaiting your approval at ${input.currentStep || "the current step"} for ${input.pendingLabel || "some time"}. Please review and take action to keep the workflow moving.`;

        return { subject, body, recipient };
    }

    private extractJson(raw: string): Record<string, unknown> {
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start === -1 || end === -1 || end < start) {
            return {};
        }
        try {
            const parsed = JSON.parse(raw.slice(start, end + 1)) as unknown;
            return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
        } catch {
            return {};
        }
    }

    private matchTemplate(templates: ParseWorkflowInput["templates"], suggested: unknown, text: string) {
        const lowerText = text.toLowerCase();

        if (typeof suggested === "string") {
            const s = suggested.toLowerCase();
            const exact = templates.find((t) => t.name.toLowerCase() === s);
            if (exact) return exact;
            const partial = templates.find((t) => s.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(s));
            if (partial) return partial;
        }

        // Deterministic fallback: score templates by keyword overlap with the request text.
        let best = templates[0]!;
        let bestScore = -1;
        for (const t of templates) {
            const words = t.name.toLowerCase().split(/\s+/);
            const score = words.filter((w) => w.length > 2 && lowerText.includes(w)).length;
            if (score > bestScore) {
                bestScore = score;
                best = t;
            }
        }
        return best;
    }

    private deriveTitle(text: string): string {
        const clean = text.replace(/\s+/g, " ").trim();
        const short = clean.length > 60 ? `${clean.slice(0, 57)}...` : clean;
        return short.charAt(0).toUpperCase() + short.slice(1);
    }

    private buildPayload(suggested: unknown, text: string): Record<string, unknown> {
        const payload: Record<string, unknown> =
            typeof suggested === "object" && suggested !== null && !Array.isArray(suggested)
                ? { ...(suggested as Record<string, unknown>) }
                : {};

        if (payload["amount"] === undefined) {
            const amountMatch = text.match(/\$?\s*(\d[\d,]*)(?:\.\d+)?/);
            if (amountMatch && amountMatch[1]) {
                const amount = Number(amountMatch[1].replace(/,/g, ""));
                if (!Number.isNaN(amount)) {
                    payload["amount"] = amount;
                }
            }
        }

        if (payload["reason"] === undefined) {
            payload["reason"] = text;
        }

        return payload;
    }

    private validate(context: WorkflowAIContext) {
        if (!context || typeof context !== "object") {
            throw new AppError("Invalid workflow context", 400);
        }

        const requiredFields: Array<keyof WorkflowAIContext> = [
            "workflowTitle",
            "workflowTemplate",
            "organizationName",
            "requesterName",
            "currentStep"
        ];

        for (const field of requiredFields) {
            const value = context[field];
            if (typeof value !== "string" || value.trim().length === 0) {
                throw new AppError(`${field} is required`, 400);
            }
        }

        if (!Array.isArray(context.previousSteps)) {
            throw new AppError("previousSteps must be an array", 400);
        }

        if (!Array.isArray(context.remainingSteps)) {
            throw new AppError("remainingSteps must be an array", 400);
        }

        if (typeof context.payload !== "object" || context.payload === null || Array.isArray(context.payload)) {
            throw new AppError("payload must be an object", 400);
        }
    }
}