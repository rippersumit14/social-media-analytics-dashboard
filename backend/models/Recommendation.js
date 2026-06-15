import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Recommendation Schema
 * --------------------------------------------------
 *
 * Stores AI/System generated
 * recommendations for creators.
 *
 * Generated From:
 *
 * Analytics
 * Creator Score
 * Creator Insights
 *
 */

const recommendationSchema =
  new mongoose.Schema(
    {
      /**
       * Instagram Account
       */

      instagramAccount: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "InstagramAccount",

        required: true,

        index: true,
      },

      /**
       * Recommendation Type
       */

      type: {
        type: String,

        enum: [
          "growth",
          "engagement",
          "content",
          "consistency",
          "hashtags",
          "posting-time",
          "general",
        ],

        default: "general",
      },

      /**
       * Priority
       */

      priority: {
        type: String,

        enum: [
          "low",
          "medium",
          "high",
        ],

        default: "medium",
      },

      /**
       * Recommendation Title
       */

      title: {
        type: String,

        required: true,

        trim: true,
      },

      /**
       * Detailed Description
       */

      description: {
        type: String,

        required: true,

        trim: true,
      },

      /**
       * Recommended Action
       */

      action: {
        type: String,

        default: "",
      },

      /**
       * Optional Score Impact
       */

      expectedImpact: {
        type: Number,

        default: 0,
      },

      /**
       * Recommendation Source
       */

      source: {
        type: String,

        enum: [
          "system",
          "analytics",
          "creator-score",
          "creator-insight",
        ],

        default: "system",
      },

      /**
       * Read Status
       */

      isRead: {
        type: Boolean,

        default: false,
      },

      /**
       * Active Recommendation
       */

      isActive: {
        type: Boolean,

        default: true,
      },

      /**
       * Metadata
       */

      metadata: {
        type: Object,

        default: {},
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

recommendationSchema.index({
  instagramAccount: 1,
  createdAt: -1,
});

recommendationSchema.index({
  isActive: 1,
});

/**
 * --------------------------------------------------
 * Model
 * --------------------------------------------------
 */

const Recommendation =
  mongoose.model(
    "Recommendation",
    recommendationSchema
  );

export default Recommendation;