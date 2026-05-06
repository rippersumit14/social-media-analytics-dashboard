import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    socialAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
      maxlength: 80,
    },
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.index({
  user: 1,
  socialAccount: 1,
  updatedAt: -1,
});

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

export default ChatSession;