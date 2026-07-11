import type { AIReviewResult, AIReviewSection, WorkflowAIContext } from "../ai.types.js";

const RISK_ORDER: Record<string, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
};

const RISK_LABEL = ["LOW", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

const HIGH = 3;

// Deterministic high-risk signals in the request itself. These do not depend on
// the LLM's judgement, so risky requests always escalate consistently.
const HIGH_RISK_KEYWORDS = [
    "prod",
    "production",
    "root",
    "admin",
    "superuser",
    "delete",
    "drop",
    "secret",
    "credential",
    "privileged"
];

const HIGH_VALUE_THRESHOLD = 1000;

export class BusinessRules {
    apply(review: AIReviewResult, context?: WorkflowAIContext): AIReviewResult {
        const sections: AIReviewSection[] = [
            review.security,
            review.compliance,
            review.operations,
            review.cost
        ];

        let maxRisk = sections.reduce((max, section) => {
            const level = RISK_ORDER[section.risk?.toUpperCase()] ?? 1;
            return Math.max(max, level);
        }, 1);

        if (context && this.hasDeterministicRisk(context)) {
            maxRisk = Math.max(maxRisk, HIGH);
        }

        // Deterministic guardrail: never auto-approve a high-risk request.
        // Any HIGH or CRITICAL signal forces the workflow to human review.
        review.decision.overallRisk = RISK_LABEL[maxRisk] ?? "MEDIUM";

        if (maxRisk >= HIGH) {
            review.decision.recommendation = "HUMAN_REVIEW";
            review.decision.escalated = true;
            review.decision.summary =
                "Escalated to human review: this request matches high-risk policy signals (e.g. production/admin access or high value) and cannot be auto-approved.";
        } else {
            review.decision.escalated = false;
        }

        return review;
    }

    private hasDeterministicRisk(context: WorkflowAIContext): boolean {
        const blob = JSON.stringify({
            title: context.workflowTitle,
            template: context.workflowTemplate,
            step: context.currentStep,
            payload: context.payload
        }).toLowerCase();

        if (HIGH_RISK_KEYWORDS.some((keyword) => blob.includes(keyword))) {
            return true;
        }

        const amount = (context.payload as { amount?: unknown })?.amount;
        return typeof amount === "number" && amount >= HIGH_VALUE_THRESHOLD;
    }
}