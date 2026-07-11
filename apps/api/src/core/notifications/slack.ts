/**
 * Sends a message to Slack via an Incoming Webhook.
 * Returns true if delivered, false if not configured or delivery failed.
 * Never throws — reminder logging must succeed regardless of Slack.
 */
export async function sendSlackMessage(text: string): Promise<boolean> {
    const webhookUrl = process.env["SLACK_WEBHOOK_URL"];

    if (!webhookUrl) {
        return false;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        return response.ok;
    } catch {
        return false;
    }
}
