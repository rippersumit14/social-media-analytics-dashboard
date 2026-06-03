import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Attachment Schema
 * --------------------------------------------------
 */

const attachmentSchema = new mongoose.Schema(
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
      default: null,
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
 * - User Prompts
 * - AI Responses
 * - Attachments
 * - Token Usage
 *
 */

const messageSchema = new mongoose.Schema(
  {
    /**
     * Parent conversation
     */
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    /**
     * Message owner
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Message role
     */
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
      index: true,
    },

    /**
     * Message content
     */
    content: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * AI model used
     */
    model: {
      type: String,
      default: null,
      trim: true,
    },

    /**
     * Token usage
     */
    tokensUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Uploaded files
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
 * Load conversation messages
 */
messageSchema.index({
  conversation: 1,
  createdAt: 1,
});

/**
 * User message history
 */
messageSchema.index({
  user: 1,
  createdAt: -1,
});

/**
 * Ownership validation
 */
messageSchema.index({
  conversation: 1,
  user: 1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

messageSchema.set("toJSON", {
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

const Message = mongoose.model(
  "Message",
  messageSchema
);

export default Message;