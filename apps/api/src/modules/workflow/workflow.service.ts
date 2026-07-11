import { WorkflowRepository } from "./workflow.repository.js";
import { AppError } from "../../core/errors/app-error.js";
import type { ApproveWorkflowDto, CreateWorkflowDto, RejectWorkflowDto } from "./workflow.types.js";

export class WorkflowService {
	constructor(
		private readonly workflowRepository = new WorkflowRepository()
	) {}

	async create(createWorkflowDto: CreateWorkflowDto) {
		const title = createWorkflowDto.title?.trim();
		const workflowTemplateId = createWorkflowDto.workflowTemplateId?.trim();
		const organizationId = createWorkflowDto.organizationId?.trim();
		const requesterId = createWorkflowDto.requesterId?.trim();
		const payload = createWorkflowDto.payload;

		if (!title) {
			throw new AppError("Title is required");
		}

		if (!workflowTemplateId) {
			throw new AppError("Workflow template ID is required");
		}

		if (!organizationId) {
			throw new AppError("Organization ID is required");
		}

		if (!requesterId) {
			throw new AppError("Requester ID is required");
		}

		if (payload === undefined || payload === null) {
			throw new AppError("Payload is required");
		}

		return this.workflowRepository.create({
			...createWorkflowDto,
			title,
			workflowTemplateId,
			organizationId,
			requesterId
		});
	}

	async findAll() {
		return this.workflowRepository.findAll();
	}

	async findById(id: string) {
		const workflowId = id?.trim();

		if (!workflowId) {
			throw new AppError("Workflow ID is required");
		}

		const workflow = await this.workflowRepository.findById(workflowId);

		if (!workflow) {
			throw new AppError("Workflow not found");
		}

		return workflow;
	}

	async approve(id: string, approveWorkflowDto: ApproveWorkflowDto) {
		const workflowId = id?.trim();
		const actedByUserId = approveWorkflowDto.actedByUserId?.trim();
		const comments = approveWorkflowDto.comments?.trim();

		if (!workflowId) {
			throw new AppError("Workflow ID is required");
		}

		if (!actedByUserId) {
			throw new AppError("actedByUserId is required");
		}

		return this.workflowRepository.approve(workflowId, actedByUserId, comments);
	}

	async reject(id: string, rejectWorkflowDto: RejectWorkflowDto) {
		const workflowId = id?.trim();
		const actedByUserId = rejectWorkflowDto.actedByUserId?.trim();
		const comments = rejectWorkflowDto.comments?.trim();

		if (!workflowId) {
			throw new AppError("Workflow ID is required");
		}

		if (!actedByUserId) {
			throw new AppError("actedByUserId is required");
		}

		return this.workflowRepository.reject(workflowId, actedByUserId, comments);
	}
}
