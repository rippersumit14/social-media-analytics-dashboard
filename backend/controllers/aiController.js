import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User from "../models/User.js";
import { generateAnalyticsInsights } from "../services/aiService.js";
import { isValidObjectId } from "../utils/validateObjectId.js";

/**
 * @desc    Generate AI insights for a social account
 * @route   POST /api/ai/insights/:socialAccountId
 * @access  Private
 */
export const getAIInsights = async (req, res) => {
  try {
    const { socialAccountId } = req.params;

    if (!isValidObjectId(socialAccountId)) {
      return res.status(400).json({
        message: "Invalid social account id",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.aiUsageCount >= user.aiUsageLimit) {
      return res.status(403).json({
        message: "AI usage limit reached. Upgrade your plan or try again later.",
      });
    }

    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    const insights = await generateAnalyticsInsights(socialAccount, snapshots);

    user.aiUsageCount += 1;
    await user.save();

    return res.status(200).json({
      message: "AI insights generated successfully",
      insights,
      remainingUsage: user.aiUsageLimit - user.aiUsageCount,
    });
  } catch (error) {
    console.error("[AI_INSIGHTS_ERROR]", {
      message: error.message,
    });

    return res.status(500).json({
      message: "Server error while generating AI insights",
    });
  }
};
