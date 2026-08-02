import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Creator Score Schema
 * --------------------------------------------------
 *
 * Purpose:
 * Stores historical creator scores.
 *
 * We NEVER overwrite scores.
 * Every score calculation creates
 * a new document.
 *
 * This enables:
 *
 * - Score History
 * - Trend Tracking
 * - Growth Reports
 * - Dashboard Charts
 * - AI Insights
 *
 */

const creatorScoreSchema =
  new mongoose.Schema(
    {
      /**
       * Parent Instagram Account
       */

      instagramAccount: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "InstagramAccount",

        required: true,

        index: true,
      },

      /**
       * Final Creator Score
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
       * ------------------------------------------
       * Score Components
       * ------------------------------------------
       */

      engagementScore: {
        type: Number,

        default: 0,

        min: 0,

        max: 40,
      },

      growthScore: {
        type: Number,

        default: 0,

        min: 0,

        max: 20,
      },

      consistencyScore: {
        type: Number,

        default: 0,

        min: 0,

        max: 20,
      },

      activityScore: {
        type: Number,

        default: 0,

        min: 0,

        max: 20,
      },

      /**
       * ------------------------------------------
       * Raw Metrics Used
       * ------------------------------------------
       *
       * Saved for:
       * - Auditing
       * - Debugging
       * - AI Insights
       */

      breakdown: {
        followers: {
          type: Number,
          default: 0,
        },

        mediaCount: {
          type: Number,
          default: 0,
        },

        totalLikes: {
          type: Number,
          default: 0,
        },

        totalComments: {
          type: Number,
          default: 0,
        },

        totalEngagement: {
          type: Number,
          default: 0,
        },

        averageEngagement: {
          type: Number,
          default: 0,
        },
      },

      /**
       * ------------------------------------------
       * Metadata
       * ------------------------------------------
       */

      metadata: {
        username: {
          type: String,
          default: "",
        },

        accountType: {
          type: String,
          default: "",
        },

        dataMode: {
          type: String,
          enum: [
            "account-aware",
            "manual-estimate",
            "limited",
          ],
          default: "limited",
        },

        hasManualMetrics: {
          type: Boolean,
          default: false,
        },

        metricSources: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },

      /**
       * Formula Version
       */

      scoreVersion: {
        type: String,

        default: "v1",

        trim: true,
      },

      /**
       * Calculation Timestamp
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
 * Score history queries
 */

creatorScoreSchema.index({
  instagramAccount: 1,
  calculatedAt: -1,
});

/**
 * Dashboard ranking queries
 */

creatorScoreSchema.index({
  totalScore: -1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

creatorScoreSchema.set(
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

const CreatorScore =
  mongoose.model(
    "CreatorScore",
    creatorScoreSchema
  );

export default CreatorScore;
