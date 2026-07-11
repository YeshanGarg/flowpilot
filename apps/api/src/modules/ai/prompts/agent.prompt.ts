import type { WorkflowAIContext } from "../ai.types.js";

export interface AgentSpec {
    key: "security" | "compliance" | "operations" | "cost";
    title: string;
    focus: string;
}

export const REVIEW_AGENTS: AgentSpec[] = [
    {
        key: "security",
        title: "Security Reviewer",
        focus: "privileged or production access, sensitive resources, and least-privilege violations"
    },
    {
        key: "compliance",
        title: "Compliance Reviewer",
        focus: "policy violations, missing approvals, audit concerns, and regulatory implications"
    },
    {
        key: "operations",
        title: "Operations Reviewer",
        focus: "operational risk, production impact, deployment or infrastructure concerns, and rollback complexity"
    },
    {
        key: "cost",
        title: "Cost Reviewer",
        focus: "financial impact, unnecessary resource usage, and expensive requests"
    }
];

export function buildAgentPrompt(agent: AgentSpec, context: WorkflowAIContext): string {
    return `
You are the ${agent.title} in an enterprise workflow approval system.
Focus ONLY on: ${agent.focus}.

Workflow context:
- Title: ${context.workflowTitle}
- Template: ${context.workflowTemplate}
- Organization: ${context.organizationName}
- Requester: ${context.requesterName}
- Current step: ${context.currentStep}
- Payload: ${JSON.stringify(context.payload)}

Respond ONLY with a JSON object in exactly this shape:
{
  "risk": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": 0-100,
  "reasoning": ["short bullet", "short bullet"],
  "checks": ["short check", "short check"]
}

Do not return Markdown. Do not wrap the JSON in code blocks. Only reason from the context above.
`;
}
