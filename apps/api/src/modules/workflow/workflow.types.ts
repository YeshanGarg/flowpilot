import type { Prisma, WorkflowStatus, WorkflowStepStatus } from "../../../generated/prisma/client.js";

export interface CreateWorkflowDto {
    title: string;
    workflowTemplateId: string;
    requesterId: string;
    organizationId: string;
    payload: Prisma.InputJsonValue;
}

export interface ApproveWorkflowDto {
    actedByUserId: string;
    comments?: string;
}

export interface RejectWorkflowDto {
    actedByUserId: string;
    comments?: string;
}

export interface WorkflowResponseDto {
    id: string;
    title: string;
    status: WorkflowStatus;
    currentStepOrder: number;
    workflowTemplateId: string;
    requesterId: string;
    organizationId: string;
    payload: Prisma.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkflowStepExecutionResponseDto {
    id: string;
    workflowId: string;
    workflowTemplateStepId: string;
    status: WorkflowStepStatus;
    assignedToUserId: string | null;
    actedByUserId: string | null;
    comments: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}