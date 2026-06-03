import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Attachment Schema
 * --------------------------------------------------
 *
 * Future Support:
 * - Images
 * - Documents
 * - Other uploaded files
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
 * - User Messages
 * - AI Responses
 * - Conversation History
 * - Attachments
 * - Token Usage
 *
 * Relationship:
 *
 * User
 *   ↓
 * Conversation
 *   ↓
 * Message
 *
 */

const messageSchema = new mongoose.Schema(
  {
    /**
     * Parent Conversation
     */
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    /**
     * Message Owner
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Message Role
     *
     * user
     * assistant
     * system
     */
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
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
     * AI Model Used
     *
     * Examples:
     * gemini-2.5-flash
     * llama-4
     * deepseek-chat
     */
    model: {
      type: String,
      default: null,
      trim: true,
    },

    /**
     * Token Usage
     *
     * Useful for:
     * - Usage Analytics
     * - AI Limits
     * - Cost Tracking
     */
    tokensUsed: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * File Attachments
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
 *
 * Most Common Query:
 *
 * Message.find({
 *   conversation
 * }).sort({
 *   createdAt: 1
 * });
 */
messageSchema.index({
  conversation: 1,
  createdAt: 1,
});

/**
 * User Message History
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