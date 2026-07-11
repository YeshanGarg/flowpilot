import type { Request, Response } from "express";
import { WorkflowTemplateService } from "./workflow-template.service.js";

const workflowTemplateService = new WorkflowTemplateService();

export class WorkflowTemplateController {
    async create(req: Request, res: Response) {
        const createWorkflowTemplateDto = req.body;
        const workflowTemplate = await workflowTemplateService.create(createWorkflowTemplateDto);

        return res.status(201).json({ success: true, data: workflowTemplate });
    }

    async findAll(_: Request, res: Response) {
        const workflowTemplates = await workflowTemplateService.findAll();

        return res.status(200).json({ success: true, data: workflowTemplates });
    }

    async findById(req: Request, res: Response) {
        const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) ?? "";
        const workflowTemplate = await workflowTemplateService.findById(id);

        return res.status(200).json({ success: true, data: workflowTemplate });
    }
}
