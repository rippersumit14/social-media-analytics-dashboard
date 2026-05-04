import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Available SaaS plans.
 *
 * FREE:
 * - Default plan for all users
 * - Limited daily AI usage
 *
 * PRO:
 * - Higher daily AI usage limit
 * - Can be connected to payment system later
 */
const USER_PLANS = {
  FREE: "FREE",
  PRO: "PRO",
};

/**
 * Daily AI usage limits for each plan.
 *
 * Keeping limits in one object makes it easy to update later
 * without changing logic in multiple places.
 */
const PLAN_AI_LIMITS = {
  FREE: 20,
  PRO: 200,
};

/**
 * User Schema
 *
 * Handles:
 * - authentication data
 * - password hashing
 * - SaaS plan information
 * - daily AI usage tracking
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    /**
     * User subscription plan.
     * Default is FREE for every new user.
     */
    plan: {
      type: String,
      enum: Object.values(USER_PLANS),
      default: USER_PLANS.FREE,
    },

    /**
     * Number of AI requests used in the current daily usage window.
     */
    aiUsageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Maximum AI requests allowed per day.
     * Default is based on FREE plan.
     */
    aiUsageLimit: {
      type: Number,
      default: PLAN_AI_LIMITS.FREE,
      min: 0,
    },

    /**
     * Date when AI usage should reset.
     *
     * For new users, this starts as current date.
     * Controller logic will reset usage when this date becomes old.
     */
    aiUsageResetDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving user.
 *
 * Modern Mongoose style:
 * - async middleware returns a promise
 * - no need to use next()
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
/**
 * Compare entered password with hashed password.
 *
 * Important:
 * Since password has select: false,
 * login controller must use .select("+password").
 *
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Keep AI usage limit synced with current plan.
 *
 * Useful when upgrading/downgrading plan later.
 */
userSchema.methods.syncAIUsageLimitWithPlan = function () {
  this.aiUsageLimit = PLAN_AI_LIMITS[this.plan] || PLAN_AI_LIMITS.FREE;
};

/**
 * Export plan constants so controllers can reuse them safely.
 */
export { USER_PLANS, PLAN_AI_LIMITS };

const User = mongoose.model("User", userSchema);

export default User;