import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import { generateAnalyticsInsights } from "../services/aiService.js";

/**
 * @desc    Generate AI insights for a social account
 * @route   POST /api/ai/insights/:socialAccountId
 * @access  Private
 */
export const getAIInsights = async (req, res) => {
  try {
    const { socialAccountId } = req.params;

    // 1. Check account belongs to user
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    // 2. Get snapshot history
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    // 3. Generate AI insights
    const insights = await generateAnalyticsInsights(
      socialAccount,
      snapshots
    );

    // 4. Return response
    res.status(200).json({
      message: "AI insights generated successfully",
      insights,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while generating AI insights",
      error: error.message,
    });
  }
};