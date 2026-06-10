import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Creator Insight Schema
 * --------------------------------------------------
 *
 * Purpose:
 * Stores human-readable insights generated
 * from analytics snapshots and creator scores.
 *
 * Examples:
 *
 * "Your engagement increased by 15%"
 *
 * "You haven't posted in 7 days"
 *
 * "Carousel posts are outperforming reels"
 *
 * Future Usage:
 *
 * - Dashboard Insight Cards
 * - Weekly Reports
 * - AI Recommendations
 * - Notifications
 * - Creator Growth Assistant
 *
 */

const creatorInsightSchema =
  new mongoose.Schema(
    {
      /**
       * --------------------------------------------------
       * Parent Instagram Account
       * --------------------------------------------------
       */

      instagramAccount: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "InstagramAccount",

        required: true,

        index: true,
      },

      /**
       * --------------------------------------------------
       * Insight Type
       * --------------------------------------------------
       */

      type: {
        type: String,

        required: true,

        enum: [
          "growth",
          "engagement",
          "consistency",
          "activity",
          "score",
          "content",
          "audience",
        ],

        index: true,
      },

      /**
       * --------------------------------------------------
       * Priority
       * --------------------------------------------------
       */

      priority: {
        type: String,

        enum: [
          "low",
          "medium",
          "high",
          "critical",
        ],

        default: "medium",

        index: true,
      },

      /**
       * --------------------------------------------------
       * Short Title
       * --------------------------------------------------
       *
       * Example:
       * "Engagement Dropped"
       */

      title: {
        type: String,

        required: true,

        trim: true,

        maxlength: 120,
      },

      /**
       * --------------------------------------------------
       * Description
       * --------------------------------------------------
       *
       * Example:
       *
       * "Average engagement decreased by 18%
       * compared to the previous snapshot."
       */

      description: {
        type: String,

        required: true,

        trim: true,

        maxlength: 1000,
      },

      /**
       * --------------------------------------------------
       * Recommendation
       * --------------------------------------------------
       *
       * Example:
       *
       * "Try posting 2 additional times
       * this week."
       */

      recommendation: {
        type: String,

        default: "",

        trim: true,

        maxlength: 1000,
      },

      /**
       * --------------------------------------------------
       * Insight Metadata
       * --------------------------------------------------
       *
       * Raw values used to generate
       * this insight.
       */

      metadata: {
        currentValue: {
          type: Number,

          default: 0,
        },

        previousValue: {
          type: Number,

          default: 0,
        },

        changePercent: {
          type: Number,

          default: 0,
        },
      },

      /**
       * --------------------------------------------------
       * Visibility
       * --------------------------------------------------
       */

      isActive: {
        type: Boolean,

        default: true,

        index: true,
      },

      /**
       * --------------------------------------------------
       * Read Status
       * --------------------------------------------------
       */

      isRead: {
        type: Boolean,

        default: false,

        index: true,
      },

      /**
       * --------------------------------------------------
       * Generation Source
       * --------------------------------------------------
       *
       * system
       * ai
       */

      source: {
        type: String,

        enum: [
          "system",
          "ai",
        ],

        default: "system",
      },

      /**
       * --------------------------------------------------
       * Generated At
       * --------------------------------------------------
       */

      generatedAt: {
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
 * Dashboard Insights
 */

creatorInsightSchema.index({
  instagramAccount: 1,
  generatedAt: -1,
});

/**
 * Filter By Type
 */

creatorInsightSchema.index({
  instagramAccount: 1,
  type: 1,
});

/**
 * Unread Insights
 */

creatorInsightSchema.index({
  instagramAccount: 1,
  isRead: 1,
});

/**
 * Priority Insights
 */

creatorInsightSchema.index({
  instagramAccount: 1,
  priority: 1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

creatorInsightSchema.set(
  "toJSON",
  {
    transform: (_, ret) => {
      delete ret.__v;

      return ret;
    },
  }
);

/**
 * --------------------------------------------------
 * Model
 * --------------------------------------------------
 */

const CreatorInsight =
  mongoose.model(
    "CreatorInsight",
    creatorInsightSchema
  );

export default CreatorInsight;