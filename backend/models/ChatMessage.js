import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    /**
     * Chat session reference.
     * Groups all messages belonging to one AI conversation.
     */
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },

    /**
     * User who owns this message.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Connected social account related to this AI chat.
     * Example:
     * Instagram account / LinkedIn page / etc.
     */
    socialAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
      index: true,
    },

    /**
     * Message role.
     * user      -> human message
     * assistant -> AI response
     */
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    /**
     * Main text message content.
     * Supports:
     * - text-only
     * - image + text
     * - assistant responses
     */
    content: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Persistent uploaded image metadata.
     * Actual image file lives in Cloudinary.
     * MongoDB stores only metadata + delivery URL.
     */
    image: {
      /**
       * Public CDN URL used by frontend.
       */
      imageUrl: {
        type: String,
        default: null,
      },

      /**
       * Cloudinary internal file identifier.
       * Used later for delete/update operations.
       */
      publicId: {
        type: String,
        default: null,
      },

      /**
       * Storage provider.
       * Helpful if migrating providers later.
       */
      provider: {
        type: String,
        enum: ["cloudinary", null],
        default: null,
      },

      /**
       * Original uploaded mime type.
       * Example:
       * image/png
       */
      mimeType: {
        type: String,
        default: null,
      },

      /**
       * File size in bytes.
       */
      size: {
        type: Number,
        default: null,
      },

      /**
       * Image width returned by Cloudinary.
       */
      width: {
        type: Number,
        default: null,
      },

      /**
       * Image height returned by Cloudinary.
       */
      height: {
        type: Number,
        default: null,
      },

      /**
       * Image format.
       * Example:
       * png / jpg / webp
       */
      format: {
        type: String,
        default: null,
      },
    },

    /**
     * Optional voice/audio message URL.
     * Reserved for future voice-chat support.
     */
    audioUrl: {
      type: String,
      default: null,
    },

    /**
     * AI model used for assistant response.
     * Example:
     * openai/gpt-4o
     */
    model: {
      type: String,
      default: null,
    },

    /**
     * AI response generation latency in milliseconds.
     * Useful for analytics + model performance tracking.
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
 * Optimized index for:
 * - loading session chat history
 * - sorting messages chronologically
 */
chatMessageSchema.index({
  session: 1,
  createdAt: 1,
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;