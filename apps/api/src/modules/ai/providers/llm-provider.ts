export interface GenerateRequest {
    systemPrompt: string;
    userPrompt: string;
}

export interface LLMProvider {
    generate(request: GenerateRequest): Promise<string>;
}