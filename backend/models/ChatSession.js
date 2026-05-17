import mongoose from "mongoose";

/**
 * Chat session schema.
 *
 * Represents a single AI conversation thread.
 *
 * Examples:
 * - Instagram growth discussion
 * - Reel analysis chat
 * - Analytics review session
 */
const chatSessionSchema = new mongoose.Schema(
  {
    /**
     * Session owner.
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
     * Human-readable session title.
     *
     * Usually generated from
     * first user message.
     */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    /**
     * Persist last successful AI model.
     *
     * Useful for:
     * - preferred model continuity
     * - frontend model display
     * - analytics/debugging
     */
    selectedModel: {
      type: String,
      default: null,
    },

    /**
     * Optional session pinning.
     *
     * Future UX feature.
     */
    isPinned: {
      type: Boolean,
      default: false,
    },

    /**
     * Soft archive support.
     *
     * Future scalability feature.
     */
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Fast sidebar loading.
 *
 * Common query:
 * - fetch all sessions
 * - sort by latest updated
 */
chatSessionSchema.index({
  user: 1,
  socialAccount: 1,
  updatedAt: -1,
});

/**
 * Ensure consistent frontend response.
 */
chatSessionSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.sessionId = ret._id.toString();

    delete ret._id;
    delete ret.__v;

    return ret;
  },
});

const ChatSession = mongoose.model(
  "ChatSession",
  chatSessionSchema
);

export default ChatSession;