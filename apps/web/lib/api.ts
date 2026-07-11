import type { ApiSuccess, Organization, User, Workflow, WorkflowTemplate, AIReviewResult } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const json = (await response.json()) as { success: boolean; data?: T; message?: string };

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Request failed: ${path}`);
  }

  return json.data as T;
}

export const apiClient = {
  getOrganizations: () => api<Organization[]>("/organizations"),
  createOrganization: (name: string) =>
    api<Organization>("/organizations", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getUsers: () => api<User[]>("/users"),
  createUser: (payload: { name: string; email: string; organizationId: string; managerId?: string | null }) =>
    api<User>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getWorkflowTemplates: () => api<WorkflowTemplate[]>("/workflow-templates"),
  getWorkflowTemplate: (id: string) => api<WorkflowTemplate>(`/workflow-templates/${id}`),
  createWorkflowTemplate: (payload: {
    name: string;
    description?: string | null;
    organizationId: string;
    steps: Array<{ order: number; name: string; type: string }>;
  }) =>
    api<WorkflowTemplate>("/workflow-templates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getWorkflows: () => api<Workflow[]>("/workflows"),
  getWorkflow: (id: string) => api<Workflow>(`/workflows/${id}`),
  createWorkflow: (payload: {
    title: string;
    workflowTemplateId: string;
    organizationId: string;
    requesterId: string;
    payload: Record<string, unknown>;
  }) =>
    api<Workflow>("/workflows", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  approveWorkflow: (id: string, payload: { actedByUserId: string; comments?: string }) =>
    api<Workflow>(`/workflows/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  rejectWorkflow: (id: string, payload: { actedByUserId: string; comments?: string }) =>
    api<Workflow>(`/workflows/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  reviewWorkflow: (context: {
    workflowTitle: string;
    workflowTemplate: string;
    organizationName: string;
    requesterName: string;
    currentStep: string;
    payload: Record<string, unknown>;
    previousSteps: string[];
    remainingSteps: string[];
  }) =>
    api<AIReviewResult>("/ai/review", {
      method: "POST",
      body: JSON.stringify(context),
    }),

  parseWorkflow: (input: { text: string; templates: Array<{ id: string; name: string }> }) =>
    api<{ title: string; workflowTemplateId: string; templateName: string; payload: Record<string, unknown> }>(
      "/ai/parse-workflow",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    ),
};
