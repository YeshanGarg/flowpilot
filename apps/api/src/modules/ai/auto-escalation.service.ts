import { WorkflowRepository } from "../workflow/workflow.repository.js";
import { WorkflowService } from "../workflow/workflow.service.js";
import { AIService } from "./ai.service.js";
import { VLLMProvider } from "./providers/vllm.provider.js";

const SLA_MS = Number(process.env["SLA_SECONDS"] ?? 30) * 1000;  // overdue threshold (demo default 30s; set higher in prod)
const TICK_MS = 15 * 1000;          // how often the scheduler checks

function pendingLabel(iso: Date | string): string {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"}`;
    const hours = Math.floor(mins / 60);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
}

/**
 * Background scheduler that automatically detects overdue approvals,
 * asks the AI to draft a reminder, and sends + logs it — no human click.
 * Toggleable at runtime so users can use manual and automatic modes.
 */
export class AutoEscalationService {
    private enabled = false;
    private timer: NodeJS.Timeout | null = null;
    private readonly reminded = new Set<string>();

    constructor(
        private readonly workflowRepository = new WorkflowRepository(),
        private readonly workflowService = new WorkflowService(),
        private readonly aiService = new AIService(new VLLMProvider())
    ) {}

    start() {
        if (this.timer) return;
        this.timer = setInterval(() => {
            void this.tick();
        }, TICK_MS);
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) {
            this.reminded.clear();
        }
        return this.getStatus();
    }

    getStatus() {
        return {
            enabled: this.enabled,
            intervalSeconds: TICK_MS / 1000,
            slaSeconds: SLA_MS / 1000,
            remindedCount: this.reminded.size
        };
    }

    private async tick() {
        if (!this.enabled) {
            return;
        }

        try {
            const workflows = await this.workflowRepository.findAll();
            const now = Date.now();

            for (const workflow of workflows) {
                if (workflow.status !== "RUNNING") continue;
                if (this.reminded.has(workflow.id)) continue;
                if (now - new Date(workflow.createdAt).getTime() <= SLA_MS) continue;

                const steps = workflow.workflowSteps ?? [];
                const active = steps.find((s) => s.status === "ACTIVE");

                const draft = await this.aiService.draftEscalation({
                    workflowTitle: workflow.title,
                    currentStep: active?.workflowTemplateStep?.name ?? "the current step",
                    pendingLabel: pendingLabel(workflow.createdAt),
                    requesterName: "Requester",
                    approverName: active?.workflowTemplateStep?.requiredRole ?? "Approver"
                });

                await this.workflowService.remind(workflow.id, `[AUTO] ${draft.subject} — ${draft.body}`);
                this.reminded.add(workflow.id);
            }
        } catch {
            // Never let a scheduler tick crash the process.
        }
    }
}

export const autoEscalationService = new AutoEscalationService();
