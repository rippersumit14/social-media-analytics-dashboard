import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User from "../models/User.js";
import { generateAnalyticsInsights } from "../services/aiService.js";

/**
 * @desc    Generate AI insights for a social account
 * @route   POST /api/ai/insights/:socialAccountId
 * @access  Private
 */
export const getAIInsights = async (req, res) => {
  try {
    const { socialAccountId } = req.params;

    // Get current user from DB
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check AI usage quota
    if (user.aiUsageCount >= user.aiUsageLimit) {
      return res.status(403).json({
        message: "AI usage limit reached. Upgrade your plan or try again later.",
      });
    }

    // Verify social account belongs to logged-in user
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    // Fetch snapshots
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    // Generate AI insights
    const insights = await generateAnalyticsInsights(socialAccount, snapshots);

    // Increase usage count
    user.aiUsageCount += 1;
    await user.save();

    res.status(200).json({
      message: "AI insights generated successfully",
      insights,
      remainingUsage: user.aiUsageLimit - user.aiUsageCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while generating AI insights",
      error: error.message,
    });
  }
};