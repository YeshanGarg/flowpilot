export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  managerId: string | null;
}

export interface WorkflowTemplateStep {
  id: string;
  order: number;
  name: string;
  type: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  steps: WorkflowTemplateStep[];
}

export interface WorkflowStepExecution {
  id: string;
  status: string;
  comments: string | null;
  startedAt: string | null;
  completedAt: string | null;
  workflowTemplateStep: WorkflowTemplateStep;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string | null;
  message: string | null;
  createdAt: string;
}

export interface Workflow {
  id: string;
  title: string;
  status: string;
  currentStepOrder: number;
  workflowTemplateId: string;
  requesterId: string;
  organizationId: string;
  createdAt: string;
  payload?: Record<string, unknown> | null;
  workflowTemplate?: WorkflowTemplate;
  workflowSteps?: WorkflowStepExecution[];
  auditLogs?: AuditLog[];
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
