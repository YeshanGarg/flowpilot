import type {
    GenerateRequest,
    LLMProvider
} from "./llm-provider.js";

interface VLLMResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
}

export class VLLMProvider implements LLMProvider {

    async generate(
        request: GenerateRequest
    ): Promise<string> {

        const baseUrl =
            process.env["VLLM_URL"] ??
            "http://127.0.0.1:8000/v1/chat/completions";

        const model =
            process.env["VLLM_MODEL"] ??
            "Qwen/Qwen3-0.6B";

        const apiKey = process.env["VLLM_API_KEY"];

        const headers: Record<string, string> = {
            "Content-Type": "application/json"
        };

        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }

        let response: Response;

        try {
            response = await fetch(baseUrl, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model,
                    temperature: 0,
                    messages: [
                        {
                            role: "system",
                            content: request.systemPrompt
                        },
                        {
                            role: "user",
                            content: request.userPrompt
                        }
                    ]
                })
            });
        } catch (error) {
            const reason =
                error instanceof Error
                    ? error.message
                    : "unknown error";

            throw new Error(`vLLM request failed: ${reason}`);
        }

        if (!response.ok) {
            const body = await response.text();

            throw new Error(
                `vLLM returned ${response.status}: ${body}`
            );
        }

        const data =
            (await response.json()) as VLLMResponse;

        const content =
            data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error(
                "vLLM response did not contain content"
            );
        }

        return content
            .replace(/<think>[\s\S]*?<\/think>/g, "")
            .trim();
    }
}