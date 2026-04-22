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
 * 1. Validates the incoming message
 * 2. Checks the logged-in user's AI quota
 * 3. Verifies the selected social account belongs to the user
 * 4. Loads analytics snapshots for that account
 * 5. Builds a conversational prompt with analytics context
 * 6. Calls the AI service
 * 7. Returns the AI reply + remaining usage
 */
export const chatWithAI = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const { message } = req.body;

    // Validate incoming message
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    // Load current user from DB
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Enforce AI usage limit
    if (user.aiUsageCount >= user.aiUsageLimit) {
      return res.status(403).json({
        message: "AI usage limit reached. Please try again later or upgrade your plan.",
      });
    }

    // Verify social account belongs to the logged-in user
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    // Load all snapshots for this account (oldest to latest)
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    // If no snapshots exist, still allow AI to respond but with less context
    const first = snapshots[0] || null;
    const latest = snapshots[snapshots.length - 1] || null;

    // Build a conversational + expert-style prompt
    const prompt = `
You are an AI assistant inside a social media analytics platform.

Your role:
- Answer like a helpful, smart, conversational assistant
- Also act like a social media growth expert and strategist
- Use analytics data when relevant
- If the user's question is general, answer generally
- If the user's question is about account performance, use the analytics data below
- If the user asks for strategy, combine social media best practices with the account data
- Avoid repeating the same "insights summary" style every time
- Be practical, direct, and easy to understand
- Keep the answer concise but helpful

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

Latest snapshot:
- Followers: ${latest.followers}
- Engagement Rate: ${latest.engagementRate}
- Posts: ${latest.posts}
- Likes: ${latest.likes}
- Comments: ${latest.comments}

Changes over time:
- Follower change: ${(latest.followers ?? 0) - (first.followers ?? 0)}
- Engagement rate change: ${(
    (latest.engagementRate ?? 0) - (first.engagementRate ?? 0)
  ).toFixed(2)}
- Post count change: ${(latest.posts ?? 0) - (first.posts ?? 0)}
`
    : `
No detailed analytics snapshots are available yet.
If useful, guide the user generally and suggest syncing the account for more accurate insights.
`
}

Answer naturally and directly.
`;

    // Call AI service with custom conversational prompt
    const aiReply = await generateAnalyticsInsights(
      socialAccount,
      snapshots,
      prompt
    );

    // Increment user usage count only after a successful AI attempt
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