import type { Request, Response } from "express";
import { WorkflowService } from "./workflow.service.js";

const workflowService = new WorkflowService();

export class WorkflowController {
	async create(req: Request, res: Response) {
		const createWorkflowDto = req.body;
		const workflow = await workflowService.create(createWorkflowDto);

		return res.status(201).json({ success: true, data: workflow });
	}

	async findAll(req: Request, res: Response) {
		const demoParam = Array.isArray(req.query.demo) ? req.query.demo[0] : req.query.demo;
		const isDemo = demoParam === undefined ? undefined : demoParam === "true";
		const workflows = await workflowService.findAll(isDemo);

		return res.status(200).json({ success: true, data: workflows });
	}

	async endDemo(_: Request, res: Response) {
		const result = await workflowService.endDemo();

		return res.status(200).json({ success: true, data: result });
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

	async remind(req: Request, res: Response) {
		const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) ?? "";
		const workflow = await workflowService.remind(id, req.body?.message);

		return res.status(200).json({ success: true, data: workflow });
	}

	async remove(req: Request, res: Response) {
		const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) ?? "";
		const result = await workflowService.remove(id);

		return res.status(200).json({ success: true, data: result });
	}
}
