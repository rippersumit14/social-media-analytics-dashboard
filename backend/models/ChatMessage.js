import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },

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

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    audioUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({
  session: 1,
  createdAt: 1,
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;