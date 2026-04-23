import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User from "../models/User.js";
import { generateAnalyticsInsights } from "../services/aiService.js";

/**
 * @desc    AI chatbot for analytics questions
 * @route   POST /api/ai/chat/:socialAccountId
 * @access  Private
 *
 * This controller:
 * - validates the question
 * - checks usage limit
 * - verifies account ownership
 * - loads analytics context
 * - builds a structured conversational prompt
 * - calls the AI service
 */
export const chatWithAI = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const { message } = req.body;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    // Get current user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check AI usage limit
    if (user.aiUsageCount >= user.aiUsageLimit) {
      return res.status(403).json({
        message:
          "AI usage limit reached. Please try again later or upgrade your plan.",
      });
    }

    // Verify selected account belongs to the user
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    // Load snapshots for context
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    const first = snapshots[0] || null;
    const latest = snapshots[snapshots.length - 1] || null;

    // Structured conversational prompt
const prompt = `
You are an AI assistant inside a professional social media analytics platform.

Your role:
- Act like a helpful assistant and social media growth expert
- Use analytics data when relevant
- Answer clearly, professionally, and in a structured way
- Do not use emojis
- Do not sound childish or overly casual
- Do not write one long raw paragraph
- Do not generate random decorative titles
- Keep the response informative, practical, and polished

Formatting rules:
- Use clear professional section headings
- Prefer 2 to 3 sections maximum
- Use bullet points when useful
- Keep the structure clean and readable
- Make the answer feel like a serious AI assistant, not a casual chatbot

Preferred response styles:

For account/performance questions:
Performance Summary
- ...

Key Insight
- ...

Recommended Action
- ...

For general strategy questions:
Direct Answer
...

Why This Matters
...

Recommended Next Step
...

User question:
"${message}"

Account information:
- Username: ${socialAccount.username}
- Platform: ${socialAccount.platform}

${
  first && latest
    ? `
Analytics context:

First snapshot:
- Followers: ${first.followers}
- Engagement Rate: ${first.engagementRate}
- Posts: ${first.posts}
- Likes: ${first.likes}
- Comments: ${first.comments}
- Impressions: ${first.impressions}
- Reach: ${first.reach}

Latest snapshot:
- Followers: ${latest.followers}
- Engagement Rate: ${latest.engagementRate}
- Posts: ${latest.posts}
- Likes: ${latest.likes}
- Comments: ${latest.comments}
- Impressions: ${latest.impressions}
- Reach: ${latest.reach}

Change over time:
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
If useful, guide the user generally and suggest syncing the account for more accurate insights.
`
}

Now answer in a professional, structured, informative format.
`;
    // Call AI service using custom prompt
    const aiReply = await generateAnalyticsInsights(
      socialAccount,
      snapshots,
      prompt
    );

    // Increase usage count after successful attempt
    user.aiUsageCount += 1;
    await user.save();

    return res.status(200).json({
      reply: aiReply,
      remainingUsage: user.aiUsageLimit - user.aiUsageCount,
    });
  } catch (error) {
    console.error("chatWithAI error:", error.message);

    return res.status(500).json({
      message: "Chat AI error",
      error: error.message,
    });
  }
};