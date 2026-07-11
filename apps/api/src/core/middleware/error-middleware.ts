import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";

export function errorMiddleware(error: Error, _: Request, res: Response, __: NextFunction) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}
