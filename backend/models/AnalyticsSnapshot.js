import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Analytics Snapshot Schema
 * --------------------------------------------------
 *
 * Historical Instagram Analytics Storage
 *
 * Every sync inserts a new document.
 * Never update old snapshots.
 *
 * Used For:
 * - Analytics Dashboard
 * - Growth Charts
 * - Creator Score Engine
 * - Weekly Comparisons
 * - Monthly Comparisons
 * - Trend Analysis
 *
 */

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    /**
     * Parent Instagram Account
     */
    instagramAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true,
    },

    /**
     * Audience Metrics
     */
    followers: {
      type: Number,
      default: 0,
      min: 0,
    },

    following: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Content Metrics
     */
    posts: {
      type: Number,
      default: 0,
      min: 0,
    },

    reels: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Engagement Metrics
     */
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    comments: {
      type: Number,
      default: 0,
      min: 0,
    },

    saves: {
      type: Number,
      default: 0,
      min: 0,
    },

    shares: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Reach Metrics
     */
    reach: {
      type: Number,
      default: 0,
      min: 0,
    },

    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Reel Specific Metrics
     */
    reelPlays: {
      type: Number,
      default: 0,
      min: 0,
    },

    reelReach: {
      type: Number,
      default: 0,
      min: 0,
    },

    reelShares: {
      type: Number,
      default: 0,
      min: 0,
    },

    reelSaves: {
      type: Number,
      default: 0,
      min: 0,
    },

    reelReposts: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Calculated Metrics
     */
    engagementRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Snapshot Timestamp
     */
    capturedAt: {
      type: Date,
      default: Date.now,
      index: true,
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
 * Most common query:
 *
 * Get account analytics history
 * sorted by latest snapshots.
 */
analyticsSnapshotSchema.index({
  instagramAccount: 1,
  capturedAt: -1,
});

/**
 * Used by analytics aggregation
 * and creator score jobs.
 */
analyticsSnapshotSchema.index({
  capturedAt: -1,
});

const AnalyticsSnapshot = mongoose.model(
  "AnalyticsSnapshot",
  analyticsSnapshotSchema
);

export default AnalyticsSnapshot;