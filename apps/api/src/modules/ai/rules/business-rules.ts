import type { AIReviewResult } from "../ai.types.js";

export class BusinessRules {
    apply(review: AIReviewResult): AIReviewResult {
        return review;
    }
}