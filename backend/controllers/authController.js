// controllers/authController.js

import asyncHandler
    from "../middlewares/asyncHandler.js";

import ApiResponse
    from "../utils/ApiResponse.js";

import {
    registerNewUser,
    loginExistingUser,
    getAuthenticatedUser,
} from "../services/authService.js";

/**
 * ---------------------------------------------------
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 * ---------------------------------------------------
 */

export const registerUser = asyncHandler(

    async (req, res) => {

        /**
         * Delegate registration logic
         * to auth service layer
         */
        const result =
            await registerNewUser(req.body);

        /**
         * Standardized success response
         */
        return res.status(201).json(

            new ApiResponse(
                true,
                "User registered successfully",
                result
            )
        );
    }
);

/**
 * ---------------------------------------------------
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 * ---------------------------------------------------
 */

export const loginUser = asyncHandler(

    async (req, res) => {

        /**
         * Delegate login logic
         * to auth service layer
         */
        const result =
            await loginExistingUser(req.body);

        /**
         * Standardized success response
         */
        return res.status(200).json(

            new ApiResponse(
                true,
                "Login successful",
                result
            )
        );
    }
);

/**
 * ---------------------------------------------------
 * @desc    Get authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 * ---------------------------------------------------
 */

export const getCurrentUser = asyncHandler(

    async (req, res) => {

        /**
         * Get authenticated user
         */
        const user =
            await getAuthenticatedUser(
                req.user
            );

        /**
         * Standardized success response
         */
        return res.status(200).json(

            new ApiResponse(
                true,
                "Current user fetched successfully",
                user
            )
        );
    }
);