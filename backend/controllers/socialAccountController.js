import SocialAccount from "../models/SocialAccount.js";
import { fetchMockAnalyticsData } from "../services/analyticsSyncService.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";


/**
 * @desc    Create a new social account
 * @route   POST /api/social-accounts
 * @access  Private
 */
export const createSocialAccount = async (req, res) => {
  try {
    const { platform, username, profileId, profileImage } = req.body;

    // Basic validation
    if (!platform || !username) {
      return res.status(400).json({
        message: "Platform and username are required",
      });
    }

    // Create new social account
    const account = await SocialAccount.create({
      user: req.user._id, // from auth middleware
      platform,
      username,
      profileId,
      profileImage,
    });

    res.status(201).json({
      message: "Social account connected successfully",
      account,
    });
  } catch (error) {
    // Handle duplicate account error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This account is already connected",
      });
    }

    res.status(500).json({
      message: "Server error while creating social account",
      error: error.message,
    });
  }
};


/**
 * @desec Get all social accounts of logged-in user
 * @route GET /api/social-accounts
 * @access Private
 */

export const getUserSocialAccount = async(req, res) => {
    try{
        const accounts = await SocialAccount.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            count: accounts.length,
            accounts,
        })
    }catch (error){
        res.status(500).json({
            message: "Server error while fetching accounts",
            error: error.message,
        });
    }
};

/**
 * @desc    Sync analytics for a social account
 * @route   POST /api/social-accounts/:id/sync
 * @access  Private
 */

export const syncSocialAccountAnalytics = async (req, res) => {
  try{
    const { id } = req.params; //id will come from the url path 

    //Make sure the social account exists and belongs to the logged in user
    const socialAccount = await SocialAccount.findOne({
      _id: id,
      user: req.user._id,
    });

    if(!socialAccount){
      return res.status(404).json({
        message: "Social account not found or not authorized",
      });
    }

    //Fetch mock analytics data (Later we will replace with real API integration)
    const analyticsData = await fetchMockAnalyticsData(socialAccount);

      // Create a new analytics snapshot
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

    //upadte sync time on the social account 
    socialAccount.lastSyncedAt = new Date();
    await socialAccount.save();

    res.status(201).json({
      message:"Social account synced successfully",
      socialAccount,
      snapshot,

    });
  } catch(error){
    res.status(500).json({
      message:"Server error while syncing social account",
      error: error.message,
    });
  }
};

