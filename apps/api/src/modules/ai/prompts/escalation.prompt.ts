export function buildEscalationPrompt(input: {
    workflowTitle: string;
    currentStep: string;
    pendingLabel: string;
    requesterName: string;
    approverName: string;
    overallRisk?: string | undefined;
}): string {
    return `
You write a short, professional escalation reminder for a stalled approval.

Details:
- Request: ${input.workflowTitle}
- Stuck at step: ${input.currentStep}
- Pending for: ${input.pendingLabel}
- Requester: ${input.requesterName}
- Approver: ${input.approverName}
${input.overallRisk ? `- AI risk assessment: ${input.overallRisk}` : ""}

Return ONLY a JSON object in exactly this shape:
{
  "subject": "a concise email subject line",
  "body": "2-3 sentence polite but firm reminder asking the approver to act"
}

Do not return Markdown. Do not wrap the JSON in code blocks.
`;
}
