import type { WorkflowAIContext } from "../ai.types.js";

export function buildWorkflowReviewPrompt(
    context: WorkflowAIContext
): string {
    const {
    workflowTitle,
    workflowTemplate,
    organizationName,
    requesterName,
    currentStep,
    payload,
    previousSteps,
    remainingSteps
} = context;
    return `

        You are reviewing an enterprise workflow request.

        Your goal is to identify potential risks before approval.

        The workflow information is below.

        Workflow Information:

        Title: ${workflowTitle}

        Template: ${workflowTemplate}

        Organization: ${organizationName}

        Requester: ${requesterName}

        Current Step: ${currentStep}

        Previous Steps: ${previousSteps.length ? previousSteps.join(", ") : "None"}

        Remaining Steps: ${remainingSteps.length ? remainingSteps.join(", ") : "None"}

        Payload: ${JSON.stringify(payload, null, 4)}

        Review this workflow.

        For each reviewer provide:

        - Risk
        - Confidence
        - Reasoning
        - Checks

        Do not invent facts.

        Use only the supplied workflow context.

        If information is missing,
        state "Insufficient Information".

        Return ONLY valid JSON.
    `;
}