import mongoose from "mongoose";

export const REMINDER_TYPES = {
  POST_REEL: "POST_REEL",
  POST_CAROUSEL: "POST_CAROUSEL",
  POST_STORY: "POST_STORY",
  ANALYZE_INSIGHTS: "ANALYZE_INSIGHTS",
  CREATE_CONTENT: "CREATE_CONTENT",
  OTHER: "OTHER",
};

export const REMINDER_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};

const reminderSchema = new mongoose.Schema(
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
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    reminderType: {
      type: String,
      enum: Object.values(REMINDER_TYPES),
      default: REMINDER_TYPES.OTHER,
    },

    priority: {
      type: String,
      enum: Object.values(REMINDER_PRIORITY),
      default: REMINDER_PRIORITY.MEDIUM,
    },

    dueDate: {
      type: Date,
      required: true,
      index: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({
  user: 1,
  dueDate: 1,
});

reminderSchema.index({
  instagramAccount: 1,
  dueDate: 1,
});

const Reminder = mongoose.model(
  "Reminder",
  reminderSchema
);

export default Reminder;

