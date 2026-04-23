/**
 * Generate AI response using OpenRouter.
 *
 * Supports:
 * 1. Default insights mode
 * 2. Custom prompt mode (used by AI chat)
 */
export const generateAnalyticsInsights = async (
  socialAccount,
  snapshots,
  customPrompt = null
) => {
  try {
    // If no snapshots and no custom prompt exists
    if ((!snapshots || snapshots.length === 0) && !customPrompt) {
      return "No analytics data available. Please sync your account first.";
    }

    const first = snapshots?.[0] || null;
    const latest = snapshots?.[snapshots.length - 1] || null;

    /**
     * Default structured prompt for AI Insights feature
     */
const defaultPrompt = `
You are a professional social media analytics expert.

Your job:
- Analyze account performance clearly
- Provide structured, informative, professional output
- Focus on growth, engagement, content performance, and actionable recommendations
- Do not use emojis
- Do not sound casual or childish
- Do not produce random decorative titles
- Avoid one long paragraph
- Keep the response polished and readable

Required structure:

Performance Breakdown
- Summarize the current performance using the available data
- Mention meaningful metric changes where relevant

Key Findings
- Explain the most important growth or performance signals
- Highlight what appears to be helping or hurting growth

Recommended Actions
- Give practical steps the user can apply next
- Keep suggestions specific and useful

Rules:
- Use professional headings
- Use bullet points where helpful
- Be analytical but clear
- Mention percentages or metric movement when relevant
- Keep the tone serious, useful, and product-quality

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

Latest Snapshot:
- Followers: ${latest.followers}
- Following: ${latest.following}
- Posts: ${latest.posts}
- Likes: ${latest.likes}
- Comments: ${latest.comments}
- Engagement Rate: ${latest.engagementRate}
- Impressions: ${latest.impressions}
- Reach: ${latest.reach}

Change Summary:
- Follower change: ${(latest.followers ?? 0) - (first.followers ?? 0)}
- Engagement rate change: ${(
    (latest.engagementRate ?? 0) - (first.engagementRate ?? 0)
  ).toFixed(2)}
- Post change: ${(latest.posts ?? 0) - (first.posts ?? 0)}
- Likes change: ${(latest.likes ?? 0) - (first.likes ?? 0)}
- Comments change: ${(latest.comments ?? 0) - (first.comments ?? 0)}
`
    : `
No detailed analytics snapshots are available yet.
`
}

Generate a professional structured response now.
`;
    // Use custom prompt if provided by chatbot
    const prompt = customPrompt || defaultPrompt;

    // Confirmed working free model
    const models = ["inclusionai/ling-2.6-flash:free"];

    let lastError = null;

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
              max_tokens: 500,
            }),
          }
        );

        const data = await response.json();

        console.log("MODEL USED:", model);
        console.log(
          "OPENROUTER RAW RESPONSE:",
          JSON.stringify(data, null, 2)
        );

        if (!response.ok) {
          throw new Error(data?.error?.message || "Model request failed");
        }

        const content = data?.choices?.[0]?.message?.content;

        if (content && typeof content === "string") {
          return content.trim();
        }

        throw new Error("No usable response text returned by model");
      } catch (error) {
        console.error(`Model failed: ${model}`, error.message);
        lastError = error.message;
      }
    }

    return `All AI models failed. Last error: ${lastError}`;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    return `Error generating insights: ${error.message}`;
  }
};