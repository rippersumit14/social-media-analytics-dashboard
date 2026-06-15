import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Attachment Schema
 * --------------------------------------------------
 *
 * Supports:
 * - Images
 * - PDFs
 * - Documents
 * - Future Media Uploads
 */

const attachmentSchema =
  new mongoose.Schema(
    {
      url: {
        type: String,
        required: true,
        trim: true,
      },

      publicId: {
        type: String,
        default: null,
        trim: true,
      },

      mimeType: {
        type: String,
        default: null,
      },

      size: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    {
      _id: false,
    }
  );

/**
 * --------------------------------------------------
 * Message Schema
 * --------------------------------------------------
 *
 * Stores:
 * - User Messages
 * - Assistant Responses
 * - System Messages
 * - Attachments
 * - Token Usage
 */

const messageSchema =
  new mongoose.Schema(
    {
      /**
       * Parent Conversation
       */

      conversation: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Conversation",

        required: true,

        index: true,
      },

      /**
       * Message Owner
       */

      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      /**
       * Message Role
       */

      role: {
        type: String,

        enum: [
          "user",
          "assistant",
          "system",
        ],

        required: true,

        index: true,
      },

      /**
       * Message Content
       */

      content: {
        type: String,

        required: true,

        trim: true,

        maxlength: 50000,
      },

      /**
       * AI Provider Used
       */

      provider: {
        type: String,

        default: null,

        trim: true,
      },

      /**
       * AI Model Used
       */

      model: {
        type: String,

        default: null,

        trim: true,
      },

      /**
       * Token Consumption
       */

      tokensUsed: {
        type: Number,

        default: 0,

        min: 0,
      },

      /**
       * Generation Latency
       */

      latencyMs: {
        type: Number,

        default: 0,

        min: 0,
      },

      /**
       * Uploaded Attachments
       */

      attachments: {
        type: [attachmentSchema],

        default: [],
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
 * Load Conversation Messages
 */

messageSchema.index({
  conversation: 1,
  createdAt: 1,
});

/**
 * User Chat History
 */

messageSchema.index({
  user: 1,
  createdAt: -1,
});

/**
 * Ownership Validation
 */

messageSchema.index({
  conversation: 1,
  user: 1,
});

/**
 * Role Queries
 */

messageSchema.index({
  role: 1,
  createdAt: -1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

messageSchema.set(
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

const Message =
  mongoose.model(
    "Message",
    messageSchema
  );

export default Message;