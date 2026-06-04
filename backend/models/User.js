import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * --------------------------------------------------
 * User Plans
 * --------------------------------------------------
 */

export const USER_PLANS = {
  FREE: "FREE",
  PRO: "PRO",
};

/**
 * --------------------------------------------------
 * User Schema
 * --------------------------------------------------
 */

const userSchema = new mongoose.Schema(
  {
    /**
     * Full Name
     */

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    /**
     * Email Address
     */

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address",
      ],
    },

    /**
     * Password
     *
     * Hidden by default
     */

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    /**
     * Profile Avatar
     */

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Email Verification
     */

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    /**
     * Subscription Plan
     */

    plan: {
      type: String,
      enum: Object.values(USER_PLANS),
      default: USER_PLANS.FREE,
    },

    /**
     * AI Usage Tracking
     */

    aiUsageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    aiUsageResetDate: {
      type: Date,
      default: Date.now,
    },

    /**
     * Account Status
     */

    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Login Tracking
     */

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * --------------------------------------------------
 * Password Hashing Middleware
 * --------------------------------------------------
 */

userSchema.pre(
  "save",
  async function () {
    if (
      !this.isModified(
        "password"
      )
    ) {
      return;
    }

    const salt =
      await bcrypt.genSalt(12);

    this.password =
      await bcrypt.hash(
        this.password,
        salt
      );
  }
);

/**
 * --------------------------------------------------
 * Compare Password
 * --------------------------------------------------
 */

userSchema.methods.comparePassword =
  async function (
    enteredPassword
  ) {
    return bcrypt.compare(
      enteredPassword,
      this.password
    );
  };

/**
 * --------------------------------------------------
 * Reset AI Usage
 * --------------------------------------------------
 */

userSchema.methods.resetAIUsage =
  function () {
    this.aiUsageCount = 0;

    this.aiUsageResetDate =
      new Date();
  };

/**
 * --------------------------------------------------
 * Hide Internal Fields
 * --------------------------------------------------
 */

userSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret.password;
    delete ret.__v;

    return ret;
  },
});

/**
 * --------------------------------------------------
 * Model Export
 * --------------------------------------------------
 */

const User = mongoose.model(
  "User",
  userSchema
);

export default User;