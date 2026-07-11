export enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}

export enum Recommendation {
    APPROVE = "APPROVE",
    HUMAN_REVIEW = "HUMAN_REVIEW",
    REJECT = "REJECT"
}

export enum CheckStatus {
    PASSED = "PASSED",
    WARNING = "WARNING",
    FAILED = "FAILED"
}

export interface AIReviewRequest {
    workflowId?: string;

    title: string;

    workflowTemplate: string;

    payload: Record<string, unknown>;
}

export interface AgentCheck {
    name: string;

    status: CheckStatus;

    reasoning: string;
}

export interface AIReviewResponse {
    risk: RiskLevel;

    confidence: number;

    recommendation: Recommendation;

    summary: string;

    reasoning: string[];

    checks: AgentCheck[];
}

export interface AIReviewSection {
    risk: string;

    confidence: number;

    reasoning: string[];

    checks: string[];
}

export interface AIReviewDecision {
    overallRisk: string;

    recommendation: string;

    summary: string;

    confidence: number;

    escalated?: boolean;
}

export interface AIReviewResult {
    security: AIReviewSection;

    compliance: AIReviewSection;

    operations: AIReviewSection;

    cost: AIReviewSection;

    decision: AIReviewDecision;
}

export interface WorkflowAIContext {
    workflowTitle: string;

    workflowTemplate: string;

    organizationName: string;

    requesterName: string;

    currentStep: string;

    payload: Record<string, unknown>;

    previousSteps: string[];

    remainingSteps: string[];
}

export interface TemplateOption {
    id: string;
    name: string;
}

export interface ParseWorkflowInput {
    text: string;
    templates: TemplateOption[];
}

export interface ParseWorkflowResult {
    title: string;
    workflowTemplateId: string;
    templateName: string;
    payload: Record<string, unknown>;
}