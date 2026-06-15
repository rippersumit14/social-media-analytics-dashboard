import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Conversation Schema
 * --------------------------------------------------
 *
 * Stores chat session metadata.
 *
 * Messages are stored separately
 * in Message collection.
 */

const conversationSchema =
  new mongoose.Schema(
    {
      /**
       * Conversation Owner
       */

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /**
       * Linked Instagram Account
       */

      instagramAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstagramAccount",
        default: null,
        index: true,
      },

      /**
       * Conversation Title
       */

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      /**
       * Soft Delete / Archive
       */

      isArchived: {
        type: Boolean,
        default: false,
        index: true,
      },

      /**
       * Last Activity
       */

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

/**
 * User Conversations
 */

conversationSchema.index({
  user: 1,
  updatedAt: -1,
});

/**
 * User Active Conversations
 */

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