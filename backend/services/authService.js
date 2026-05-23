// services/authService.js

import User from "../models/User.js";

import AppError from "../utils/AppError.js";

import generateToken from "../utils/generateToken.js";

/**
 * Build safe user response
 * Never expose password
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
 * Register new user
 */
export const registerNewUser = async ({
    name,
    email,
    password,
}) => {

    /**
     * Normalize email
     */
    const normalizedEmail =
        email.trim().toLowerCase();

    /**
     * Check existing user
     */
    const userExists =
        await User.findOne({
            email: normalizedEmail,
        });

    if (userExists) {

        throw new AppError(
            "User already exists",
            400
        );
    }

    /**
     * Create user
     */
    const user = await User.create({

        name: name.trim(),

        email: normalizedEmail,

        password,
    });

    /**
     * Generate JWT token
     */
    const token =
        generateToken(user._id.toString());

    return {
        user: buildUserResponse(user),
        token,
    };
};

/**
 * Login existing user
 */
export const loginExistingUser = async ({
    email,
    password,
}) => {

    /**
     * Normalize email
     */
    const normalizedEmail =
        email.trim().toLowerCase();

    /**
     * Explicitly include password
     * for comparison
     */
    const user =
        await User.findOne({
            email: normalizedEmail,
        }).select("+password");

    /**
     * User not found
     */
    if (!user) {

        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    /**
     * Compare password
     */
    const isPasswordCorrect =
        await user.matchPassword(password);

    if (!isPasswordCorrect) {

        throw new AppError(
            "Invalid email or password",
            401
        );
    }

    /**
     * Generate JWT token
     */
    const token =
        generateToken(user._id.toString());

    return {
        user: buildUserResponse(user),
        token,
    };
};

/**
 * Get authenticated user
 */
export const getAuthenticatedUser = async (
    user
) => {

    return buildUserResponse(user);
};