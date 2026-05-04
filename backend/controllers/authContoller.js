import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/**
 * Build safe user response.
 *
 * We never return password from controller responses.
 */
const buildUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    aiUsageCount: user.aiUsageCount,
    aiUsageLimit: user.aiUsageLimit,
    aiUsageResetDate: user.aiUsageResetDate,
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /**
     * Basic validation.
     * Later we can move this to validation middleware.
     */
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: buildUserResponse(user),
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("[REGISTER_USER_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      message: "Server error while registering user",
    });
  }
};

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    /**
     * Basic validation.
     */
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /**
     * Password has select: false in User model.
     * So we explicitly include it only for login comparison.
     */
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: buildUserResponse(user),
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("[LOGIN_USER_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      message: "Server error while logging in",
    });
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      user: buildUserResponse(req.user),
    });
  } catch (error) {
    console.error("[GET_CURRENT_USER_ERROR]", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      message: "Server error while fetching current user",
    });
  }
};