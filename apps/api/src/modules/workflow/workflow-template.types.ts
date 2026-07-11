export interface CreateWorkflowTemplateDto {
    name: string;
    description?: string | null;
    organizationId: string;
    steps: CreateWorkflowTemplateStepDto[];
}

export interface CreateWorkflowTemplateStepDto {
    order: number;
    name: string;
    type: WorkflowStepType;
    requiredRole?: string | null;
}

export enum WorkflowStepType {
    APPROVAL = "APPROVAL",
    REVIEW = "REVIEW",
    AI_REVIEW = "AI_REVIEW",
    AUTO_APPROVAL = "AUTO_APPROVAL",
    NOTIFICATION = "NOTIFICATION"
}