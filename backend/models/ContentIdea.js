import mongoose from "mongoose";

export const IDEA_STATUS = {
  DRAFT: "DRAFT",
  PLANNED: "PLANNED",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
};

export const IDEA_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};

export const IDEA_SOURCE = {
  MANUAL: "MANUAL",
  AI: "AI",
  CONVERSATION: "CONVERSATION",
};

const contentIdeaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    instagramAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstagramAccount",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 10000,
    },

    platform: {
      type: String,
      enum: ["INSTAGRAM", "YOUTUBE", "LINKEDIN", "OTHER"],
      default: "INSTAGRAM",
    },

    status: {
      type: String,
      enum: Object.values(IDEA_STATUS),
      default: IDEA_STATUS.DRAFT,
    },

    priority: {
      type: String,
      enum: Object.values(IDEA_PRIORITY),
      default: IDEA_PRIORITY.MEDIUM,
    },

    source: {
      type: String,
      enum: Object.values(IDEA_SOURCE),
      default: IDEA_SOURCE.MANUAL,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

contentIdeaSchema.index({
  user: 1,
  createdAt: -1,
});

contentIdeaSchema.index({
  instagramAccount: 1,
  createdAt: -1,
});

const ContentIdea = mongoose.model(
  "ContentIdea",
  contentIdeaSchema
);

export default ContentIdea;