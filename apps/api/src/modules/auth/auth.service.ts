import crypto from "node:crypto";
import { AppError } from "../../core/errors/app-error.js";
import { signToken } from "../../core/auth/token.js";

interface LoginDto {
    email?: string;
    password?: string;
}

function safeEqual(a: string, b: string): boolean {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) {
        return false;
    }
    return crypto.timingSafeEqual(ba, bb);
}

export class AuthService {
    async login(dto: LoginDto) {
        const email = dto.email?.trim().toLowerCase();
        const password = dto.password ?? "";

        if (!email || !password) {
            throw new AppError("Email and password are required");
        }

        const adminEmail = (process.env["ADMIN_EMAIL"] ?? "admin@flowpilot.dev").toLowerCase();
        const adminPassword = process.env["ADMIN_PASSWORD"] ?? "flowpilot-admin";

        if (!safeEqual(email, adminEmail) || !safeEqual(password, adminPassword)) {
            throw new AppError("Invalid email or password", 401);
        }

        const token = signToken(adminEmail, "ADMIN");

        return {
            token,
            user: { email: adminEmail, role: "ADMIN", name: "Admin User" }
        };
    }
}
