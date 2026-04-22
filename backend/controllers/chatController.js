import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User from "../models/User.js";
import { generateAnalyticsInsights } from "../services/aiService.js";

/**
 * @desc    AI chatbot for analytics questions
 * @route   POST /api/ai/chat/:socialAccountId
 * @access  Private
 */
export const chatWithAI = async (req, res) => {
  try {
    const { socialAccountId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const user = await User.findById(req.user._id);

    // usage limit
    if (user.aiUsageCount >= user.aiUsageLimit) {
      return res.status(403).json({
        message: "AI usage limit reached",
      });
    }

    // verify account
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found",
      });
    }

    // fetch snapshots
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    // 🔥 build custom prompt
    const latest = snapshots[snapshots.length - 1];

    const prompt = `
You are a social media analytics assistant.

User question:
"${message}"

Latest data:
Followers: ${latest?.followers}
Engagement: ${latest?.engagementRate}
Posts: ${latest?.posts}

Answer clearly and helpfully.
`;

    // reuse AI service (you'll modify it slightly next)
    const aiResponse = await generateAnalyticsInsights(
      socialAccount,
      snapshots,
      prompt // we will support custom prompt
    );

    user.aiUsageCount += 1;
    await user.save();

    res.status(200).json({
      reply: aiResponse,
      remainingUsage: user.aiUsageLimit - user.aiUsageCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Chat AI error",
      error: error.message,
    });
  }
};