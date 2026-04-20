import mongoose from "mongoose";

//SocialAccount schema
// Represents a social media account connected by an authenticated app user

const socialAccountSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        platform: {
            type: String,
            required: [true, "Platform is required"],
            enum: ["instagram", "twitter", "youtube", "linkedin"],
            lowercase: true,
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
        },
        //profile id 
        profileId: {
            type: String,
            trim: true,
            default: "",
        },
        profileImage: {
            type: String,
            trim: true,
            default: "",
        },
        accessToken: {
            type: String,
            default: "",
            select: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastSyncedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

//Optional compound index to reduce duplicate account connections 
//for the same user + platform + usernam combination
socialAccountSchema.index(
    {user: 1, platform: 1, username: 1},
    {unique: true}
);

const SocialAccount = mongoose.model("SocialAccount", socialAccountSchema);

export default SocialAccount;

