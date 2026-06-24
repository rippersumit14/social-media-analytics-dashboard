import mongoose from "mongoose";

/**
 * --------------------------------------------------
 * Personal Note Schema
 * --------------------------------------------------
 *
 * Creator private notes.
 */

const personalNoteSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      title: {
        type: String,

        required: true,

        trim: true,

        maxlength: 120,
      },

      content: {
        type: String,

        required: true,

        trim: true,

        maxlength: 10000,
      },

      category: {
        type: String,

        trim: true,

        default: "general",
      },

      isPinned: {
        type: Boolean,

        default: false,
      },

      isArchived: {
        type: Boolean,

        default: false,
      },

      isDeleted: {
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

personalNoteSchema.index({
  user: 1,
  updatedAt: -1,
});

personalNoteSchema.index({
  user: 1,
  isPinned: 1,
});

personalNoteSchema.index({
  user: 1,
  isArchived: 1,
});

/**
 * --------------------------------------------------
 * Model
 * --------------------------------------------------
 */

const PersonalNote =
  mongoose.model(
    "PersonalNote",
    personalNoteSchema
  );

export default PersonalNote;