import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Note Types
 * --------------------------------------------------
 *
 * Used to organize creator learnings,
 * observations and research.
 */

export const NOTE_TYPES = {
  LEARNING: "LEARNING",
  INSIGHT: "INSIGHT",
  EXPERIMENT: "EXPERIMENT",
  REFLECTION: "REFLECTION",
  FRAMEWORK: "FRAMEWORK",
  CONTENT_RESEARCH: "CONTENT_RESEARCH",
  OTHER: "OTHER",
};

/**
 * --------------------------------------------------
 * Note Sources
 * --------------------------------------------------
 *
 * MANUAL
 *      User created note
 *
 * AI
 *      Generated directly by AI
 *
 * CONVERSATION
 *      Saved from an AI conversation
 */

export const NOTE_SOURCES = {
  MANUAL: "MANUAL",
  AI: "AI",
  CONVERSATION: "CONVERSATION",
};

/**
 * --------------------------------------------------
 * Note Schema
 * --------------------------------------------------
 *
 * Purpose:
 *
 * Creator Learning Vault
 *
 * Stores:
 * - Learnings
 * - Insights
 * - Experiments
 * - Frameworks
 * - Research
 * - Personal Reflections
 *
 * Supports:
 * - CRUD Operations
 * - Search
 * - Pinning
 * - Favorites
 * - Archiving
 * - AI Saved Notes
 * - Learning Score Calculation
 *
 */

const noteSchema = new mongoose.Schema(
  {
    /**
     * Owner of the note
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Associated Instagram Account
     */
    instagramAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true,
    },

    /**
     * Note Title
     */
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150,
    },

    /**
     * Main Note Content
     */
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: 10000,
    },

    /**
     * Note Category
     */
    noteType: {
      type: String,
      enum: Object.values(NOTE_TYPES),
      default: NOTE_TYPES.LEARNING,
      index: true,
    },

    /**
     * Search Tags
     */
    tags: {
      type: [String],
      default: [],
    },

    /**
     * Creation Source
     */
    source: {
      type: String,
      enum: Object.values(NOTE_SOURCES),
      default: NOTE_SOURCES.MANUAL,
    },

    /**
     * Pin Note
     */
    isPinned: {
      type: Boolean,
      default: false,
    },

    /**
     * Favorite Note
     */
    isFavorite: {
      type: Boolean,
      default: false,
    },

    /**
     * Archive Instead Of Delete
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
 * --------------------------------------------------
 * Indexes
 * --------------------------------------------------
 */

/**
 * Load user notes
 */
noteSchema.index({
  user: 1,
  createdAt: -1,
});

/**
 * Account specific notes
 */
noteSchema.index({
  instagramAccount: 1,
  createdAt: -1,
});

/**
 * Sidebar sorting
 */
noteSchema.index({
  user: 1,
  isPinned: -1,
  createdAt: -1,
});

/**
 * Fast filtering
 */
noteSchema.index({
  noteType: 1,
});

/**
 * Search tags
 */
noteSchema.index({
  tags: 1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

noteSchema.set("toJSON", {
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

const Note = mongoose.model(
  "Note",
  noteSchema
);

export default Note;