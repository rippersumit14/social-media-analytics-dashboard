import SocialAccount from "../models/SocialAccount.js";
import { fetchMockAnalyticsData } from "../services/analyticsSyncService.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import { isValidObjectId } from "../utils/validateObjectId.js";

/**
 * @desc    Create a new social account
 * @route   POST /api/social-accounts
 * @access  Private
 */
export const createSocialAccount = async (req, res) => {
  try {
    const { platform, username, profileId, profileImage } = req.body;

    if (!platform || !username) {
      return res.status(400).json({
        message: "Platform and username are required",
      });
    }

    const account = await SocialAccount.create({
      user: req.user._id,
      platform,
      username: username.trim(),
      profileId,
      profileImage,
    });

    return res.status(201).json({
      message: "Social account connected successfully",
      account,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This account is already connected",
      });
    }

    console.error("[CREATE_SOCIAL_ACCOUNT_ERROR]", {
      message: error.message,
    });

    return res.status(500).json({
      message: "Server error while creating social account",
    });
  }
};


/**
 * @desc Get all social accounts of logged-in user
 * @route GET /api/social-accounts
 * @access Private
 */
export const getUserSocialAccount = async (req, res) => {
  try {
    const accounts = await SocialAccount.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: accounts.length,
      accounts,
    });
  } catch (error) {
    console.error("[GET_SOCIAL_ACCOUNTS_ERROR]", {
      message: error.message,
    });

    return res.status(500).json({
      message: "Server error while fetching accounts",
    });
  }
};

/**
 * @desc    Sync analytics for a social account
 * @route   POST /api/social-accounts/:id/sync
 * @access  Private
 */

export const syncSocialAccountAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid social account id",
      });
    }

    const socialAccount = await SocialAccount.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    /**
     * Current MVP sync source.
     * Later this becomes the Instagram Graph analytics service.
     */
    const analyticsData = await fetchMockAnalyticsData(socialAccount);

    const snapshot = await AnalyticsSnapshot.create({
      socialAccount: analyticsData.socialAccount,
      followers: analyticsData.followers,
      following: analyticsData.following,
      posts: analyticsData.posts,
      likes: analyticsData.likes,
      comments: analyticsData.comments,
      engagementRate: analyticsData.engagementRate,
      impressions: analyticsData.impressions,
      reach: analyticsData.reach,
      capturedAt: analyticsData.capturedAt,
    });

    socialAccount.lastSyncedAt = new Date();
    await socialAccount.save();

    return res.status(201).json({
      message: "Social account synced successfully",
      socialAccount,
      snapshot,
    });
  } catch (error) {
    console.error("[SYNC_SOCIAL_ACCOUNT_ERROR]", {
      message: error.message,
    });

    return res.status(500).json({
      message: "Server error while syncing social account",
    });
  }
};
