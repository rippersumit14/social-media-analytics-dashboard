import mongoose from "mongoose";

/**
 * AnalyticsSnapshot schema
 * Stores analytics metrics of a connected social account at a specific point in time.
 */
const analyticsSnapshotSchema = new mongoose.Schema(
  {
    socialAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
      index: true,
    },
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
    posts: {
      type: Number,
      default: 0,
      min: 0,
    },
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
    engagementRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },
    reach: {
      type: Number,
      default: 0,
      min: 0,
    },
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
 * Compound index to optimize account-based time-series queries.
 * Useful when fetching snapshot history for one account ordered by date.
 */
analyticsSnapshotSchema.index({ socialAccount: 1, capturedAt: -1 });

const AnalyticsSnapshot = mongoose.model(
  "AnalyticsSnapshot",
  analyticsSnapshotSchema
);

export default AnalyticsSnapshot;