import mongoose from "mongoose";

const creatorNewsItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
      maxlength: 600,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    sourceName: {
      type: String,
      default: "Unknown source",
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "creator-economy",
        "instagram",
        "influencer-marketing",
        "ai-tools",
        "platform-updates",
      ],
      required: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sourceApi: {
      type: String,
      default: "gdelt-doc-2",
    },
  },
  {
    timestamps: true,
  }
);

creatorNewsItemSchema.index({
  category: 1,
  publishedAt: -1,
});

const CreatorNewsItem = mongoose.model(
  "CreatorNewsItem",
  creatorNewsItemSchema
);

export default CreatorNewsItem;
