import mongoose from "mongoose";

/**
 * Individual uploaded image metadata.
 *
 * Why separate sub-schema?
 * - reusable structure
 * - cleaner validation
 * - future CDN/provider support
 * - easier frontend rendering
 */
const imageSchema = new mongoose.Schema(
  {
    /**
     * Public CDN URL.
     * Frontend renders this directly.
     */
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Cloudinary asset identifier.
     * Used for safe deletion/cleanup.
     */
    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Storage provider.
     * Future scalable provider support.
     */
    provider: {
      type: String,
      enum: ["cloudinary"],
      default: "cloudinary",
    },

    /**
     * Original uploaded MIME type.
     */
    mimeType: {
      type: String,
      default: null,
    },

    /**
     * Optimized image size in bytes.
     */
    size: {
      type: Number,
      default: null,
    },

    /**
     * Optimized image width.
     */
    width: {
      type: Number,
      default: null,
    },

    /**
     * Optimized image height.
     */
    height: {
      type: Number,
      default: null,
    },

    /**
     * Final optimized image format.
     * Example:
     * - webp
     * - jpg
     * - png
     */
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
 *
 * Supports:
 * - user messages
 * - assistant messages
 * - multimodal images
 * - AI metadata
 * - future streaming support
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
     *
     * user:
     * human prompt
     *
     * assistant:
     * AI response
     */
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
      index: true,
    },

    /**
     * Main message text content.
     *
     * Can be:
     * - user prompt
     * - assistant reply
     * - image-only fallback text
     */
    content: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Multiple uploaded images.
     *
     * IMPORTANT:
     * Always an array for frontend consistency.
     */
    images: {
      type: [imageSchema],
      default: [],
    },

    /**
     * Optional audio support.
     *
     * Future:
     * voice uploads / TTS support.
     */
    audioUrl: {
      type: String,
      default: null,
    },

    /**
     * AI model used for assistant response.
     *
     * Example:
     * - openai/gpt-4o
     * - claude-3
     * - gemini
     */
    model: {
      type: String,
      default: null,
    },

    /**
     * Human-readable model name.
     */
    modelName: {
      type: String,
      default: null,
    },

    /**
     * AI response latency.
     *
     * Useful for:
     * - frontend display
     * - analytics
     * - model monitoring
     */
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
 * Fast session message loading.
 */
chatMessageSchema.index({
  session: 1,
  createdAt: 1,
});

/**
 * Fast user/session filtering.
 */
chatMessageSchema.index({
  user: 1,
  socialAccount: 1,
  createdAt: -1,
});

/**
 * Ensure frontend always receives:
 * images: []
 */
chatMessageSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.images = ret.images || [];
    return ret;
  },
});

const ChatMessage = mongoose.model(
  "ChatMessage",
  chatMessageSchema
);

export default ChatMessage;