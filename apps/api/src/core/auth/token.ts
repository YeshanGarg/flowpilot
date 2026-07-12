import crypto from "node:crypto";

const DEFAULT_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): string {
    return process.env["ADMIN_TOKEN_SECRET"] ?? "flowpilot-dev-secret-change-me";
}

function base64url(input: Buffer | string): string {
    return Buffer.from(input)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export interface TokenPayload {
    sub: string;
    role: string;
    exp: number;
}

export function signToken(sub: string, role: string, ttlSeconds = DEFAULT_TTL_SECONDS): string {
    const payload: TokenPayload = {
        sub,
        role,
        exp: Math.floor(Date.now() / 1000) + ttlSeconds
    };
    const body = base64url(JSON.stringify(payload));
    const signature = base64url(crypto.createHmac("sha256", secret()).update(body).digest());
    return `${body}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
    const parts = token.split(".");
    if (parts.length !== 2) {
        return null;
    }
    const [body, signature] = parts as [string, string];
    const expected = base64url(crypto.createHmac("sha256", secret()).update(body).digest());
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return null;
    }
    try {
        const payload = JSON.parse(Buffer.from(body, "base64").toString("utf8")) as TokenPayload;
        if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload;
    } catch {
        return null;
    }
}
