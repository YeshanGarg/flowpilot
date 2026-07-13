import type { ApiSuccess, Organization, User, Workflow, WorkflowTemplate, AIReviewResult } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const ADMIN_TOKEN_KEY = "flowpilot_admin_token";

export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

const DEMO_MODE_KEY = "flowpilot_demo_mode";

// Demo mode is ON by default so the app opens with isolated, disposable demo data.
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(DEMO_MODE_KEY) !== "off";
}

export function setDemoMode(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_MODE_KEY, on ? "on" : "off");
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  createUser: (payload: { name: string; email: string; organizationId: string; managerId?: string | null; role?: string }) =>
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
    steps: Array<{ order: number; name: string; type: string; requiredRole?: string | null }>;
  }) =>
    api<WorkflowTemplate>("/workflow-templates", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getWorkflows: () => api<Workflow[]>(`/workflows?demo=${isDemoMode() ? "true" : "false"}`),
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
      body: JSON.stringify({ ...payload, isDemo: isDemoMode() }),
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

  deleteWorkflow: (id: string) =>
    api<{ id: string }>(`/workflows/${id}`, {
      method: "DELETE",
    }),

  endDemo: () =>
    api<{ deleted: number }>("/workflows/end-demo", {
      method: "POST",
    }),

  adminLogin: (email: string, password: string) =>
    api<{ token: string; user: { email: string; role: string; name: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
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

  draftEscalation: (input: {
    workflowTitle: string;
    currentStep: string;
    pendingLabel: string;
    requesterName: string;
    approverName: string;
    overallRisk?: string;
  }) =>
    api<{ subject: string; body: string; recipient: string }>("/ai/escalation", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  remindWorkflow: (id: string, message: string) =>
    api<Workflow>(`/workflows/${id}/remind`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  getAutoEscalation: () =>
    api<{ enabled: boolean; intervalSeconds: number; slaSeconds: number; remindedCount: number }>("/ai/auto-escalation"),

  setAutoEscalation: (enabled: boolean) =>
    api<{ enabled: boolean; intervalSeconds: number; slaSeconds: number; remindedCount: number }>("/ai/auto-escalation", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),
};
