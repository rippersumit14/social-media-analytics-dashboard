import mongoose from "mongoose";

/**
 * SocialAccount schema
 *
 * Represents a social media account connected by an authenticated app user.
 *
 * Why this model matters:
 * This becomes the bridge between a user and external platforms like Instagram.
 * Analytics snapshots, AI insights, and dashboard data will connect back to this account.
 */
const socialAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    platform: {
      type: String,
      required: [true, "Platform is required"],
      enum: ["instagram", "twitter", "youtube", "linkedin"],
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },

    /**
     * Display name from the provider.
     *
     * Why separate from username:
     * Username is usually the handle, while displayName is the public profile name.
     */
    displayName: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Generic provider profile id.
     *
     * Why keep this:
     * Existing code already uses profileId.
     * We preserve it for backward compatibility.
     */
    profileId: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Instagram business/creator account id.
     *
     * Why separate from profileId:
     * Instagram Graph API uses this id for insights and media queries.
     * Keeping it explicit makes future analytics code clearer.
     */
    instagramUserId: {
      type: String,
      trim: true,
      index: true,
    },

    /**
     * Facebook Page id linked to the Instagram professional account.
     *
     * Why needed:
     * Instagram Graph API access is usually routed through Meta Pages.
     */
    pageId: {
      type: String,
      trim: true,
      default: "",
    },

    profileImage: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Provider access token.
     *
     * Why select false:
     * Tokens are sensitive and should never be returned accidentally
     * in normal account queries.
     */
    accessToken: {
      type: String,
      default: "",
      select: false,
    },

    /**
     * Token expiry timestamp.
     *
     * Why needed:
     * Future sync jobs can check whether the token is expired
     * before calling Instagram APIs.
     */
    tokenExpiresAt: {
      type: Date,
      default: null,
    },

    /**
     * Platform account type.
     *
     * Why:
     * Instagram insights require professional accounts.
     */
    accountType: {
      type: String,
      enum: ["business", "creator", "unknown"],
      default: "unknown",
    },

    /**
     * Granted OAuth permissions.
     *
     * Why:
     * Useful for debugging missing Instagram API access later.
     */
    permissions: {
      type: [String],
      default: [],
    },

    /**
     * Flexible provider-specific metadata.
     *
     * Why:
     * Lets us store small provider details without constantly changing schema
     * for non-critical fields.
     */
    providerMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate manually connected accounts.
 *
 * Why keep this:
 * Existing app behavior likely depends on unique user + platform + username.
 */
socialAccountSchema.index(
  { user: 1, platform: 1, username: 1 },
  { unique: true }
);

/**
 * Prevent duplicate Instagram OAuth connections.
 *
 * Why sparse:
 * Older/manual accounts may not have instagramUserId.
 * Sparse keeps the index from blocking those documents.
 */
socialAccountSchema.index(
  { user: 1, platform: 1, instagramUserId: 1 },
  { unique: true, sparse: true }
);

const SocialAccount = mongoose.model("SocialAccount", socialAccountSchema);

export default SocialAccount;