import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth/token.js";
import { AppError } from "../errors/app-error.js";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";

    if (!token) {
        throw new AppError("Admin authentication required", 401);
    }

    const payload = verifyToken(token);

    if (!payload || payload.role !== "ADMIN") {
        throw new AppError("Invalid or expired admin session", 401);
    }

    next();
}
