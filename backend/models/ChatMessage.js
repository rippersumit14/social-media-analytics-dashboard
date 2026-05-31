import mongoose from "mongoose";

/**
 * ---------------------------------------------------
 * Uploaded Image Metadata Schema
 * ---------------------------------------------------
 *
 * Stores:
 * - optimized image
 * - CDN metadata
 * - storage references
 */

const imageSchema =
  new mongoose.Schema(

    {

      /**
       * Public CDN URL
       */

      imageUrl: {

        type:
          String,

        required:
          true,

        trim:
          true,
      },

      /**
       * Cloudinary asset id
       */

      publicId: {

        type:
          String,

        required:
          true,

        trim:
          true,
      },

      /**
       * Storage provider
       */

      provider: {

        type:
          String,

        enum:
          ["cloudinary"],

        default:
          "cloudinary",
      },

      /**
       * Original MIME type
       */

      mimeType: {

        type:
          String,

        default:
          null,
      },

      /**
       * Optimized image size
       */

      size: {

        type:
          Number,

        default:
          null,
      },

      /**
       * Image width
       */

      width: {

        type:
          Number,

        default:
          null,
      },

      /**
       * Image height
       */

      height: {

        type:
          Number,

        default:
          null,
      },

      /**
       * Final optimized format
       */

      format: {

        type:
          String,

        default:
          null,
      },
    },

    {

      _id:
        false,
    }
  );

/**
 * ---------------------------------------------------
 * Chat Message Schema
 * ---------------------------------------------------
 *
 * Supports:
 * - user prompts
 * - assistant replies
 * - multimodal images
 * - OCR persistence
 * - AI metadata
 * - streaming persistence
 */

const chatMessageSchema =
  new mongoose.Schema(

    {

      /**
       * Parent chat session
       */

      session: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "ChatSession",

        required:
          true,

        index:
          true,
      },

      /**
       * Message owner
       */

      user: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      /**
       * Connected social account
       */

      socialAccount: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "SocialAccount",

        required:
          true,

        index:
          true,
      },

      /**
       * Message role
       */

      role: {

        type:
          String,

        enum:
          ["user", "assistant"],

        required:
          true,

        index:
          true,
      },

      /**
       * Main text content
       */

      content: {

        type:
          String,

        required:
          true,

        trim:
          true,
      },

      /**
       * Uploaded images
       *
       * ALWAYS array
       * for frontend consistency
       */

      images: {

        type:
          [imageSchema],

        default:
          [],
      },

      /**
       * Future voice support
       */

      audioUrl: {

        type:
          String,

        default:
          null,
      },

      /**
       * AI model identifier
       */

      model: {

        type:
          String,

        default:
          null,
      },

      /**
       * Human-readable model name
       */

      modelName: {

        type:
          String,

        default:
          null,
      },

      /**
       * AI latency tracking
       */

      latencyMs: {

        type:
          Number,

        default:
          null,
      },
    },

    {

      timestamps:
        true,
    }
  );

/**
 * ---------------------------------------------------
 * Fast Session Message Loading
 * ---------------------------------------------------
 */

chatMessageSchema.index({

  session: 1,

  createdAt: 1,
});

/**
 * ---------------------------------------------------
 * Fast User Filtering
 * ---------------------------------------------------
 */

chatMessageSchema.index({

  user: 1,

  socialAccount: 1,

  createdAt: -1,
});

/**
 * ---------------------------------------------------
 * Fast Session Ownership Validation
 * ---------------------------------------------------
 */

chatMessageSchema.index({

  session: 1,

  user: 1,
});

/**
 * ---------------------------------------------------
 * Frontend-Compatible JSON
 * ---------------------------------------------------
 *
 * IMPORTANT:
 * Always return:
 * images: []
 */

chatMessageSchema.set(

  "toJSON",

  {

    versionKey:
      false,

    transform:
      (_, ret) => {

        ret.images =
          ret.images || [];

        return ret;
      },
  }
);

const ChatMessage =
  mongoose.model(

    "ChatMessage",

    chatMessageSchema
  );

export default ChatMessage;