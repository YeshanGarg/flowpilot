import type { Request, Response } from "express";
import { AIService } from "./ai.service.js";
import { VLLMProvider } from "./providers/vllm.provider.js";

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
}