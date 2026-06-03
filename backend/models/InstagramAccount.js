import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Instagram Account Schema
 * --------------------------------------------------
 *
 * Purpose:
 * Represents an Instagram Professional Account
 * connected to a user through Meta OAuth.
 *
 * Relationship:
 *
 * User
 *   └── InstagramAccount(s)
 *           └── AnalyticsSnapshots
 *
 * Supports:
 * - Multiple Instagram accounts per user
 * - Account switching
 * - Analytics syncing
 * - Token management
 * - Creator score calculations
 *
 */

const instagramAccountSchema = new mongoose.Schema(
  {
    /**
     * Owner of this Instagram account.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Instagram Business / Creator Account ID.
     *
     * Returned by Graph API.
     *
     * Globally unique.
     */
    instagramUserId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    /**
     * Facebook Page ID linked to
     * the Instagram professional account.
     */
    pageId: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Instagram username.
     *
     * Example:
     * @sumit.codes
     */
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    /**
     * Public display name.
     */
    displayName: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Instagram profile image URL.
     */
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Latest follower count.
     *
     * Cached here for quick dashboard rendering.
     */
    followers: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Total media count.
     *
     * Cached from Instagram.
     */
    mediaCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Instagram account type.
     */
    accountType: {
      type: String,
      enum: ["creator", "business"],
      default: "creator",
    },

    /**
     * OAuth permissions granted.
     *
     * Useful for debugging and future checks.
     */
    permissions: {
      type: [String],
      default: [],
    },

    /**
     * Long-lived Instagram access token.
     *
     * Hidden from normal queries.
     */
    accessToken: {
      type: String,
      required: true,
      select: false,
    },

    /**
     * Token expiration timestamp.
     */
    tokenExpiresAt: {
      type: Date,
      default: null,
    },

    /**
     * Last successful analytics sync.
     */
    lastSyncedAt: {
      type: Date,
      default: null,
    },

    /**
     * Primary account for dashboard loading.
     *
     * Useful when user has multiple accounts.
     */
    isPrimary: {
      type: Boolean,
      default: false,
    },

    /**
     * Soft delete support.
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * --------------------------------------------------
 * Indexes
 * --------------------------------------------------
 */

/**
 * Load all accounts for a user.
 */
instagramAccountSchema.index({
  user: 1,
});

/**
 * Dashboard account switching.
 */
instagramAccountSchema.index({
  user: 1,
  isPrimary: 1,
});

/**
 * Sync jobs.
 */
instagramAccountSchema.index({
  lastSyncedAt: 1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 *
 * Never expose:
 * - accessToken
 * - __v
 */

instagramAccountSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.accessToken; //Never expose the sensative tokens to the frontend
    delete ret.__v;

    return ret;
  },
});

/**
 * --------------------------------------------------
 * Model
 * --------------------------------------------------
 */

const InstagramAccount = mongoose.model(
  "InstagramAccount",
  instagramAccountSchema
);

export default InstagramAccount;