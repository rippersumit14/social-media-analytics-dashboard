import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Instagram Media Schema
 * --------------------------------------------------
 *
 * Purpose:
 * Stores Instagram content fetched from Meta APIs.
 *
 * Supports:
 * - Feed Posts
 * - Reels
 * - Videos
 * - Carousel Albums
 *
 * Future Usage:
 * - Analytics Dashboard
 * - Creator Score Engine
 * - AI Content Analysis
 * - Growth Reports
 * - Historical Tracking
 */

const instagramMediaSchema =
  new mongoose.Schema(
    {
      /**
       * Parent Instagram Account
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
       * Unique Instagram Media ID
       */
      mediaId: {
        type: String,

        required: true,

        unique: true,

        trim: true,

        index: true,
      },

      /**
       * Media Type
       *
       * IMAGE
       * VIDEO
       * REEL
       * CAROUSEL_ALBUM
       */
      mediaType: {
        type: String,

        required: true,

        enum: [
          "IMAGE",
          "VIDEO",
          "REEL",
          "CAROUSEL_ALBUM",
        ],

        index: true,
      },

      /**
       * Product Type
       *
       * FEED
       * REELS
       * STORY
       */
      productType: {
        type: String,

        default: "",

        trim: true,
      },

      /**
       * Caption
       */
      caption: {
        type: String,

        default: "",

        trim: true,
      },

      /**
       * Extracted Hashtags
       *
       * Future:
       * - AI Analysis
       * - Trend Detection
       * - Hashtag Insights
       */
      hashtags: {
        type: [String],

        default: [],
      },

      /**
       * Original Media URL
       */
      mediaUrl: {
        type: String,

        default: "",
      },

      /**
       * Thumbnail URL
       *
       * Mostly useful for:
       * - Reels
       * - Videos
       */
      thumbnailUrl: {
        type: String,

        default: "",
      },

      /**
       * Instagram Permalink
       */
      permalink: {
        type: String,

        default: "",
      },

      /**
       * Instagram Shortcode
       */
      shortcode: {
        type: String,

        default: "",
      },

      /**
       * Original Publish Time
       */
      postedAt: {
        type: Date,

        required: true,

        index: true,
      },

      /**
       * Last Sync Timestamp
       */
      syncedAt: {
        type: Date,

        default:
          Date.now,

        index: true,
      },

      /**
       * Soft Delete
       *
       * If media disappears from Instagram,
       * we preserve historical records.
       */
      isDeleted: {
        type: Boolean,

        default: false,

        index: true,
      },

      /**
       * --------------------------------------------------
       * Analytics Metrics
       * --------------------------------------------------
       *
       * Updated by scheduled sync jobs.
       *
       * Creator Score will use these values.
       */

      analytics: {
        /**
         * Engagement Metrics
         */

        likeCount: {
          type: Number,

          default: 0,

          min: 0,
        },

        commentCount: {
          type: Number,

          default: 0,

          min: 0,
        },

        saveCount: {
          type: Number,

          default: 0,

          min: 0,
        },

        shareCount: {
          type: Number,

          default: 0,

          min: 0,
        },

        /**
         * Reach Metrics
         */

        reachCount: {
          type: Number,

          default: 0,

          min: 0,
        },

        impressionCount: {
          type: Number,

          default: 0,

          min: 0,
        },

        profileVisitCount: {
          type: Number,

          default: 0,

          min: 0,
        },

        /**
         * Derived Metrics
         */

        engagementCount: {
          type: Number,

          default: 0,

          min: 0,
        },

        engagementRate: {
          type: Number,

          default: 0,

          min: 0,
        },

        /**
         * Creator Score
         *
         * Calculated by
         * creatorScoreService.
         */

        creatorScore: {
          type: Number,

          default: 0,

          min: 0,

          max: 100,
        },
      },
    },
    {
      timestamps: true,
    }
  );

/**
 * --------------------------------------------------
 * Compound Indexes
 * --------------------------------------------------
 */

/**
 * Dashboard Media Listing
 */
instagramMediaSchema.index({
  instagramAccount: 1,
  postedAt: -1,
});

/**
 * Filter By Media Type
 */
instagramMediaSchema.index({
  instagramAccount: 1,
  mediaType: 1,
});

/**
 * Active Media Queries
 */
instagramMediaSchema.index({
  instagramAccount: 1,
  isDeleted: 1,
});

/**
 * Top Performing Content
 */
instagramMediaSchema.index({
  "analytics.creatorScore": -1,
});

/**
 * Recent Sync Queries
 */
instagramMediaSchema.index({
  syncedAt: -1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

instagramMediaSchema.set(
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

const InstagramMedia =
  mongoose.model(
    "InstagramMedia",
    instagramMediaSchema
  );

export default InstagramMedia;