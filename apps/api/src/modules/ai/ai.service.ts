import type { LLMProvider } from "./providers/llm-provider.js";
import type { WorkflowAIContext } from "./ai.types.js";
import { ContextBuilder } from "./builders/context.builder.js";
import { ResponseParser } from "./parsers/response.parser.js";
import { BusinessRules } from "./rules/business-rules.js";
import { buildWorkflowReviewPrompt } from "./prompts/workflow-review.prompt.js";
import { SYSTEM_PROMPT } from "./prompts/system.prompt.js";
import { AppError } from "../../core/errors/app-error.js";

export class AIService {
    constructor(
        private readonly provider: LLMProvider,
        private readonly contextBuilder = new ContextBuilder(),
        private readonly parser = new ResponseParser(),
        private readonly businessRules = new BusinessRules()
    ) {}

    async review(context: WorkflowAIContext) {
        this.validate(context);

        const aiContext = this.contextBuilder.build(context);
        const userPrompt = buildWorkflowReviewPrompt(aiContext);
        const response = await this.provider.generate({
                            systemPrompt: SYSTEM_PROMPT,
                            userPrompt
                        });
        const parsedResponse = this.parser.parse(response);
        const validatedResponse = this.businessRules.apply(parsedResponse, aiContext);
        return validatedResponse;
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