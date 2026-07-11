import type { Request, Response } from "express";
import { WorkflowService } from "./workflow.service.js";

const workflowService = new WorkflowService();

export class WorkflowController {
	async create(req: Request, res: Response) {
		const createWorkflowDto = req.body;
		const workflow = await workflowService.create(createWorkflowDto);

		return res.status(201).json({ success: true, data: workflow });
	}

	async findAll(_: Request, res: Response) {
		const workflows = await workflowService.findAll();

		return res.status(200).json({ success: true, data: workflows });
	}

	async findById(req: Request, res: Response) {
		const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) ?? "";
		const workflow = await workflowService.findById(id);

		return res.status(200).json({ success: true, data: workflow });
	}

	async approve(req: Request, res: Response) {
		const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) ?? "";
		const approveWorkflowDto = req.body;
		const workflow = await workflowService.approve(id, approveWorkflowDto);

		return res.status(200).json({ success: true, data: workflow });
	}

	async reject(req: Request, res: Response) {
		const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) ?? "";
		const rejectWorkflowDto = req.body;
		const workflow = await workflowService.reject(id, rejectWorkflowDto);

		return res.status(200).json({ success: true, data: workflow });
	}
}
