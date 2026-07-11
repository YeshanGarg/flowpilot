import type { AIReviewResult } from "../ai.types.js";

export class ResponseParser {
    parse(response: string): AIReviewResult {
        let parsed: unknown;

        try {
            parsed = JSON.parse(response.trim());
        } catch {
            throw new Error("Failed to parse AI response: invalid JSON");
        }

        if (typeof parsed !== "object" || parsed === null) {
            throw new Error("AI response must be an object");
        }

        const result = parsed as Record<string, unknown>;

        const requiredSections = [
            "security",
            "compliance",
            "operations",
            "cost",
            "decision"
        ];

        for (const section of requiredSections) {
            if (!(section in result)) {
                throw new Error(`Missing section: ${section}`);
            }

            if (
                typeof result[section] !== "object" ||
                result[section] === null
            ) {
                throw new Error(`${section} must be an object`);
            }
        }

        return result as unknown as AIReviewResult;
    }
}