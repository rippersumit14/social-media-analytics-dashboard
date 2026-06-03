import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Creator Score Schema
 * --------------------------------------------------
 *
 * Purpose:
 * Store historical creator scores for an
 * Instagram account.
 *
 * A new document is created every time
 * the score engine runs.
 *
 * This enables:
 *
 * - Score History
 * - Trend Graphs
 * - Weekly Comparisons
 * - Monthly Comparisons
 * - Creator Growth Tracking
 *
 * IMPORTANT:
 * We store score history.
 * We DO NOT overwrite previous scores.
 *
 */

const creatorScoreSchema = new mongoose.Schema(
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
     * Final Score
     *
     * Range:
     * 0 - 100
     */
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    /**
     * Engagement Component
     *
     * Derived from:
     * likes
     * comments
     * saves
     * shares
     * engagement rate
     */
    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 40,
    },

    /**
     * Growth Component
     *
     * Derived from:
     * follower growth
     * reach growth
     * impression growth
     */
    growthScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 30,
    },

    /**
     * Consistency Component
     *
     * Derived from:
     * posting frequency
     * reels frequency
     */
    consistencyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },

    /**
     * Learning Component
     *
     * Derived from:
     * conversations
     * notes
     * content ideas
     */
    learningScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    /**
     * Score Formula Version
     *
     * Useful when score algorithm
     * changes in future releases.
     */
    scoreVersion: {
      type: String,
      default: "v1",
      trim: true,
    },

    /**
     * Score Calculation Timestamp
     */
    calculatedAt: {
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
 * Get score history
 * for an Instagram account.
 */
creatorScoreSchema.index({
  instagramAccount: 1,
  calculatedAt: -1,
});

/**
 * Used by dashboard analytics
 * and reporting jobs.
 */
creatorScoreSchema.index({
  calculatedAt: -1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

creatorScoreSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  },
});

/**
 * --------------------------------------------------
 * Model
 * --------------------------------------------------
 */

const CreatorScore = mongoose.model(
  "CreatorScore",
  creatorScoreSchema
);

export default CreatorScore;