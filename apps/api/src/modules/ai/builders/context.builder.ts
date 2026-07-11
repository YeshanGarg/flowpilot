import type { WorkflowAIContext } from "../ai.types.js";

export class ContextBuilder {

    build({
        workflowTitle,
        workflowTemplate,
        organizationName,
        requesterName,
        currentStep,
        payload,
        previousSteps,
        remainingSteps
    }: WorkflowAIContext): WorkflowAIContext {

        return {
            workflowTitle,
            workflowTemplate,
            organizationName,
            requesterName,
            currentStep,
            payload,
            previousSteps,
            remainingSteps
        };

    }

}