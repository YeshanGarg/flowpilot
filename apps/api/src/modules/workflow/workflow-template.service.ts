import { WorkflowTemplateRepository } from "./workflow-template.repository.js";
import type { CreateWorkflowTemplateDto } from "./workflow-template.types.js";
import { OrganizationService } from "../organization/organization.service.js";
import { AppError } from "../../core/errors/app-error.js";

export class WorkflowTemplateService {
    constructor(
        private readonly workflowTemplateRepository = new WorkflowTemplateRepository(),
        private readonly organizationService = new OrganizationService()
    ) {}

    async create(createWorkflowTemplateDto: CreateWorkflowTemplateDto) {
        const { name, description, organizationId, steps } = createWorkflowTemplateDto;

        const trimmedName = name?.trim();
        const trimmedDescription = description?.trim() || null;
        const trimmedOrganizationId = organizationId?.trim();

        if (!trimmedName || !trimmedOrganizationId) {
            throw new AppError("Name, organizationId, and steps are required");
        }

        if (!Array.isArray(steps) || steps.length === 0) {
            throw new AppError("Name, organizationId, and steps are required");
        }

        const trimmedSteps = steps.map(step => ({
            order: step.order,
            name: step.name.trim(),
            type: step.type,
            requiredRole: step.requiredRole ?? null
        }));

        await this.organizationService.findById(trimmedOrganizationId);

        return this.workflowTemplateRepository.create({
            name: trimmedName,
            description: trimmedDescription,
            organizationId: trimmedOrganizationId,
            steps: trimmedSteps
        });
    }

    async findAll() {
        return this.workflowTemplateRepository.findAll();
    }

    async findById(id: string) {
        const workflowTemplate = await this.workflowTemplateRepository.findById(id);

        if (!workflowTemplate) {
            throw new AppError("Workflow template not found");
        }

        return workflowTemplate;
    }
}   