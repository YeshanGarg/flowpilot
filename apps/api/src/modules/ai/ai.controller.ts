import type { Request, Response } from "express";
import { AIService } from "./ai.service.js";
import { VLLMProvider } from "./providers/vllm.provider.js";
import { autoEscalationService } from "./auto-escalation.service.js";

const aiService = new AIService(
    new VLLMProvider()
);

export class AIController {
    async review(req: Request, res: Response) {
        const review = await aiService.review(req.body);

        return res.status(200).json({
            success: true,
            data: review
        });
    }

    async parseWorkflow(req: Request, res: Response) {
        const result = await aiService.parseWorkflow(req.body);

        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async escalation(req: Request, res: Response) {
        const result = await aiService.draftEscalation(req.body);

        return res.status(200).json({
            success: true,
            data: result
        });
    }

    async getAutoEscalation(_: Request, res: Response) {
        return res.status(200).json({ success: true, data: autoEscalationService.getStatus() });
    }

    async setAutoEscalation(req: Request, res: Response) {
        const status = autoEscalationService.setEnabled(Boolean(req.body?.enabled));
        return res.status(200).json({ success: true, data: status });
    }
}