import mongoose from "mongoose";

/**
 * Image metadata schema.
 *
 * Stores persistent cloud image details.
 */
const imageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: null,
    },

    publicId: {
      type: String,
      default: null,
    },

    provider: {
      type: String,
      enum: ["cloudinary", null],
      default: null,
    },

    mimeType: {
      type: String,
      default: null,
    },

    size: {
      type: Number,
      default: null,
    },

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    format: {
      type: String,
      default: null,
    },
  },

  {
    _id: false,
  }
);

/**
 * Chat message schema.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    /**
     * Parent chat session.
     */
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },

    /**
     * Message owner.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Connected social account.
     */
    socialAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
      index: true,
    },

    /**
     * Message role.
     */
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    /**
     * Text message content.
     */
    content: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Multiple uploaded images.
     */
    images: {
      type: [imageSchema],
      default: [],
    },

    /**
     * Future voice/audio support.
     */
    audioUrl: {
      type: String,
      default: null,
    },

    /**
     * AI model metadata.
     */
    model: {
      type: String,
      default: null,
    },

    latencyMs: {
      type: Number,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

/**
 * Optimized session message loading.
 */
chatMessageSchema.index({
  session: 1,
  createdAt: 1,
});

const ChatMessage = mongoose.model(
  "ChatMessage",
  chatMessageSchema
);

export default ChatMessage;