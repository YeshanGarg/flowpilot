export function buildParseRequestPrompt(text: string, templateNames: string[]): string {
    return `
You convert a plain-English employee request into a structured workflow.

Available workflow templates:
${templateNames.map((n) => `- ${n}`).join("\n")}

Return ONLY a JSON object in exactly this shape:

{
  "title": "a short title for the request",
  "template": "one of the available template names above",
  "payload": { "key": "value" }
}

Extract any relevant details (amount, resource, reason, item, etc.) into "payload".
Do not return Markdown. Do not wrap the JSON in code blocks.

Request:
"${text}"
`;
}
