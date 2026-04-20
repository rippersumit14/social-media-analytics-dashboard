import SocialAccount from "../models/SocialAccount.js";

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