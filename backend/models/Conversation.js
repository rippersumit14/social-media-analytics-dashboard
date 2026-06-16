import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Conversation Schema
 * --------------------------------------------------
 */

const conversationSchema =
  new mongoose.Schema(
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
        default: null,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      isArchived: {
        type: Boolean,
        default: false,
        index: true,
      },

      lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true,
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

conversationSchema.index({
  user: 1,
  updatedAt: -1,
});

conversationSchema.index({
  user: 1,
  isArchived: 1,
});

/**
 * --------------------------------------------------
 * JSON Transform
 * --------------------------------------------------
 */

conversationSchema.set(
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

const Conversation =
  mongoose.model(
    "Conversation",
    conversationSchema
  );

export default Conversation;