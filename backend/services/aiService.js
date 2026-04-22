/**
 * Generate AI response using OpenRouter.
 *
 * This service supports 2 modes:
 * 1. Default analytics insights mode
 *    - used by /api/ai/insights/:socialAccountId
 * 2. Custom prompt mode
 *    - used by /api/ai/chat/:socialAccountId
 *
 * It also supports fallback across multiple models.
 */

export const generateAnalyticsInsights = async (
  socialAccount,
  snapshots,
  customPrompt = null
) => {
  try {
    // If no snapshots and no custom prompt context exists,
    // return a fallback message.
    if ((!snapshots || snapshots.length === 0) && !customPrompt) {
      return "No analytics data available. Please sync your account first.";
    }

    const first = snapshots?.[0] || null;
    const latest = snapshots?.[snapshots.length - 1] || null;

    /**
     * Default prompt for AI Insights feature
     * Used only when a custom prompt is not provided.
     */
    const defaultPrompt = `
You are a social media analytics expert.

Analyze this account's performance and provide:
1. A short performance summary
2. A key trend over time
3. One actionable recommendation

Account:
- Username: ${socialAccount?.username || "Unknown"}
- Platform: ${socialAccount?.platform || "Unknown"}

${
  first && latest
    ? `
First Snapshot:
- Followers: ${first.followers}
- Following: ${first.following}
- Posts: ${first.posts}
- Likes: ${first.likes}
- Comments: ${first.comments}
- Engagement Rate: ${first.engagementRate}
- Impressions: ${first.impressions}
- Reach: ${first.reach}
- Captured At: ${first.capturedAt}

Latest Snapshot:
- Followers: ${latest.followers}
- Following: ${latest.following}
- Posts: ${latest.posts}
- Likes: ${latest.likes}
- Comments: ${latest.comments}
- Engagement Rate: ${latest.engagementRate}
- Impressions: ${latest.impressions}
- Reach: ${latest.reach}
- Captured At: ${latest.capturedAt}
`
    : `
No detailed snapshots are available yet.
`
}

Respond in simple English using exactly 3 short bullet points.
`;

    // Use custom prompt for chatbot, otherwise fallback to default insights prompt
    const prompt = customPrompt || defaultPrompt;

    /**
     * OpenRouter models
     * First model is your confirmed working free model.
     * You can add more fallback models later if needed.
     */
    const models = [
      "inclusionai/ling-2.6-flash:free",
    ];

    let lastError = null;

    // Try models one by one
    for (const model of models) {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              temperature: 0.5,
              max_tokens: 400,
            }),
          }
        );

        const data = await response.json();

        // Helpful debug logs for development
        console.log("MODEL USED:", model);
        console.log(
          "OPENROUTER RAW RESPONSE:",
          JSON.stringify(data, null, 2)
        );

        // If API/provider returned error, throw so fallback can continue
        if (!response.ok) {
          throw new Error(data?.error?.message || "Model request failed");
        }

        // Extract model text safely
        const content = data?.choices?.[0]?.message?.content;

        if (content && typeof content === "string") {
          return content.trim();
        }

        throw new Error("No usable insight text returned by model");
      } catch (error) {
        console.error(`Model failed: ${model}`, error.message);
        lastError = error.message;
      }
    }

    // If all models fail
    return `All AI models failed. Last error: ${lastError}`;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    return `Error generating insights: ${error.message}`;
  }
};