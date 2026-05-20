import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import SocialAccount from "../models/SocialAccount.js";
import { isValidObjectId } from "../utils/validateObjectId.js";

/**
 * @desc    Create a new analytics snapshot for a social account
 * @route   POST /api/analytics-snapshots
 * @access  Private
 */

export const createAnalyticsSnapshot = async (req, res) => {
  try {
    const {
      socialAccountId,
      followers,
      following,
      posts,
      likes,
      comments,
      engagementRate,
      impressions,
      reach,
      capturedAt,
    } = req.body;

    if (!socialAccountId) {
      return res.status(400).json({
        message: "socialAccountId is required",
      });
    }

    if (!isValidObjectId(socialAccountId)) {
      return res.status(400).json({
        message: "Invalid social account id",
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

    const snapshot = await AnalyticsSnapshot.create({
      socialAccount: socialAccountId,
      followers,
      following,
      posts,
      likes,
      comments,
      engagementRate,
      impressions,
      reach,
      capturedAt,
    });

    return res.status(201).json({
      message: "Analytics snapshot created successfully",
      snapshot,
    });
  } catch (error) {
    console.error("[CREATE_ANALYTICS_SNAPSHOT_ERROR]", {
      message: error.message,
    });

    return res.status(500).json({
      message: "Server error while creating analytics snapshot",
    });
  }
};

/**
 * @desc    Get all analytics snapshots for a social account
 * @route   GET /api/analytics-snapshots/:socialAccountId
 * @access  Private
 */

export const getAnalyticsSnapshotsByAccount = async (req, res) => {
  try {
    const { socialAccountId } = req.params;

    if (!isValidObjectId(socialAccountId)) {
      return res.status(400).json({
        message: "Invalid social account id",
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

    return res.status(200).json({
      count: snapshots.length,
      snapshots,
    });
  } catch (error) {
    console.error("[GET_ANALYTICS_SNAPSHOTS_ERROR]", {
      message: error.message,
    });

    return res.status(500).json({
      message: "Server error while fetching analytics snapshots",
    });
  }
};
