/**
 * Generate AI insights using OpenRouter (FREE models)
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

Analyze this Instagram account data and give:
1. Performance summary
2. Trend (increase/decrease)
3. One actionable tip

Account: ${socialAccount.username}

Start:
Followers: ${first.followers}
Engagement: ${first.engagementRate}

Latest:
Followers: ${latest.followers}
Engagement: ${latest.engagementRate}

Give answer in 3 short bullet points.
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
          model: "mistralai/mistral-7b-instruct", // FREE model
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return data.choices?.[0]?.message?.content || "No insights generated.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Error generating insights.";
  }
};