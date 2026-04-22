/**
 * Generate AI insights using OpenRouter with fallback models.
 * This service:
 * 1. Accepts a social account and its analytics snapshots
 * 2. Builds a prompt for the AI model
 * 3. Tries multiple free/cheap models one by one
 * 4. Returns the first successful insight text
 */

export const generateAnalyticsInsights = async (socialAccount, snapshots) => {
  try {
    // If there is no analytics history yet, return a safe fallback message
    if (!snapshots || snapshots.length === 0) {
      return "No analytics data available. Please sync your account first.";
    }

    // Use first snapshot and latest snapshot for trend comparison
    const first = snapshots[0];
    const latest = snapshots[snapshots.length - 1];

    /**
     * Build a structured prompt using account + analytics history.
     * We are giving:
     * - account details
     * - starting metrics
     * - latest metrics
     * - clear instruction on output format
     */
    const prompt = `
You are a social media analytics expert.

Analyze this Instagram account data and provide:
1. A short performance summary
2. A key trend over time
3. One actionable recommendation

Account:
- Username: ${socialAccount.username}
- Platform: ${socialAccount.platform}

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

Respond in simple English using exactly 3 short bullet points.
`;

    /**
     * Fallback model list
     * If one model fails, we try the next one automatically.
     * This makes the AI system more stable.
     *
     * Note:
     * Some free models may go down or become unavailable temporarily.
     */
    const models = [
      "inclusionai/ling-2.6-flash:free",
    ];

    let lastError = null;

    /**
     * Try models one by one until one succeeds
     */
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
              temperature: 0.4, // low randomness for stable analytics-style output
              max_tokens: 300, // keep response short and cheap
            }),
          }
        );

        const data = await response.json();

        // Helpful backend debug log
        console.log("MODEL USED:", model);
        console.log("OPENROUTER RAW RESPONSE:", JSON.stringify(data, null, 2));

        // If provider returned an error, throw it so we can try next model
        if (!response.ok) {
          throw new Error(data?.error?.message || "Model request failed");
        }

        /**
         * Safe extraction of response text
         * Optional chaining prevents crashes if any nested field is missing
         */
        const content = data?.choices?.[0]?.message?.content;

        // If model returned text successfully, return it immediately
        if (content && typeof content === "string") {
          return content.trim();
        }

        // If no usable content came back, mark it as an error and continue fallback
        throw new Error("No usable insight text returned by model");
      } catch (error) {
        console.error(`Model failed: ${model}`, error.message);
        lastError = error.message;
      }
    }

    /**
     * If all models fail, return final fallback message
     */
    return `All AI models failed. Last error: ${lastError}`;
  } catch (error) {
    // Outer catch handles unexpected service-level failures
    console.error("AI Service Error:", error.message);
    return `Error generating insights: ${error.message}`;
  }
};