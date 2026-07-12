import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const authService = new AuthService();

export class AuthController {
    async login(req: Request, res: Response) {
        const result = await authService.login(req.body ?? {});

        return res.status(200).json({ success: true, data: result });
    }
}
