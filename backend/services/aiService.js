/**
 * Generate AI insights using OpenRouter
 */
export const generateAnalyticsInsights = async (socialAccount, snapshots) => {
  try {
    if (!snapshots || snapshots.length === 0) {
      return "No analytics data available. Please sync your account first.";
    }

    const latest = snapshots[snapshots.length - 1];
    const first = snapshots[0];

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

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.4,
          max_tokens: 300,
        }),
      }
    );

    const data = await response.json();

    console.log("OPENROUTER RAW RESPONSE:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data?.error?.message || "OpenRouter request failed");
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      return "AI responded, but no usable insight text was returned.";
    }

    return content.trim();
  } catch (error) {
    console.error("AI Service Error:", error.message);
    return `Error generating insights: ${error.message}`;
  }
};