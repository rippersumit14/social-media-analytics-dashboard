import mongoose from "mongoose";

/**
 * ---------------------------------------------------
 * Chat Session Schema
 * ---------------------------------------------------
 *
 * Represents:
 * - AI conversation thread
 * - session persistence
 * - sidebar rendering
 * - active chat lifecycle
 */

const chatSessionSchema =
  new mongoose.Schema(

    {

      /**
       * Session owner
       */

      user: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

        index:
          true,
      },

      /**
       * Connected social account
       */

      socialAccount: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "SocialAccount",

        required:
          true,

        index:
          true,
      },

      /**
       * Session title
       */

      title: {

        type:
          String,

        required:
          true,

        trim:
          true,

        maxlength:
          120,

        default:
          "New Chat",
      },

      /**
       * Persist preferred AI model
       */

      selectedModel: {

        type:
          String,

        default:
          null,
      },

      /**
       * Future UX feature
       */

      isPinned: {

        type:
          Boolean,

        default:
          false,
      },

      /**
       * Future scalability support
       */

      isArchived: {

        type:
          Boolean,

        default:
          false,
      },
    },

    {

      timestamps:
        true,
    }
  );

/**
 * ---------------------------------------------------
 * Sidebar Query Optimization
 * ---------------------------------------------------
 *
 * Common query:
 * - load all sessions
 * - sort by latest activity
 */

chatSessionSchema.index({

  user: 1,

  socialAccount: 1,

  updatedAt: -1,
});

/**
 * ---------------------------------------------------
 * Fast Session Ownership Lookup
 * ---------------------------------------------------
 */

chatSessionSchema.index({

  _id: 1,

  user: 1,
});

/**
 * ---------------------------------------------------
 * Frontend-Compatible JSON
 * ---------------------------------------------------
 *
 * IMPORTANT:
 * Preserve native Mongo _id.
 *
 * Frontend now depends on:
 * - session._id
 */

chatSessionSchema.set(

  "toJSON",

  {

    versionKey:
      false,
  }
);

const ChatSession =
  mongoose.model(

    "ChatSession",

    chatSessionSchema
  );

export default ChatSession;