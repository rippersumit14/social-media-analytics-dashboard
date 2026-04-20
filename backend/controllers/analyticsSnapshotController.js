import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import SocialAccount from "../models/SocialAccount.js";


/**
 * @desc    Create a new analytics snapshot for a social account
 * @route   POST /api/analytics-snapshots
 * @access  Private
 */

export const createAnalyticsSnapshot = async (req, res) => {
    try{
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

        //validate required field
        if(!socialAccountId){
            return res.status(400).json({
                message: "socialAccountId is required",
            });
        }

        //make sure social account exists and belongs to the logged-in user 
        const socialAccount = await SocialAccount.findOne({
            _id: socialAccountId,
            user: req.user._id,
        });

        if (!socialAccount){
            return res.status(404).json({
                message: "Social account not found or not authorized",
            })
        }

        //Create snapshot 
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


        res.status(201).json({
      message: "Analytics snapshot created successfully",
      snapshot,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating analytics snapshot",
      error: error.message,
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

    // Make sure the social account exists and belongs to the logged-in user
    const socialAccount = await SocialAccount.findOne({
      _id: socialAccountId,
      user: req.user._id,
    });

    if (!socialAccount) {
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    // Fetch snapshots ordered by oldest -> newest
    const snapshots = await AnalyticsSnapshot.find({
      socialAccount: socialAccountId,
    }).sort({ capturedAt: 1 });

    res.status(200).json({
      count: snapshots.length,
      snapshots,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching analytics snapshots",
      error: error.message,
    });
  }
};