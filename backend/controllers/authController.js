import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import generateToken from "../utils/generateToken.js";

import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  loginWithGoogle as loginWithGoogleService,
  getCurrentUser as getCurrentUserService,
  updatePassword as updatePasswordService,
} from "../services/authService.js";

const buildSessionPayload = (user) => ({
  user,
  token:
    generateToken(
      user._id
    ),
});

export const registerUser = asyncHandler(
  async (req, res) => {
    const result =
      await registerUserService(
        req.body
      );

    return res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        message:
          result.message,
        data: result,
      })
    );
  }
);

export const loginUser =
  asyncHandler(
    async (req, res) => {
      const user =
        await loginUserService(
          req.body
        );

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            "Login successful",
          data:
            buildSessionPayload(
              user
            ),
        })
      );
    }
  );

export const loginWithGoogle =
  asyncHandler(
    async (req, res) => {
      const user =
        await loginWithGoogleService(
          req.body
        );

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            "Google login successful",
          data:
            buildSessionPayload(
              user
            ),
        })
      );
    }
  );

export const getCurrentUser =
  asyncHandler(
    async (req, res) => {
      const user =
        await getCurrentUserService(
          req.user.id
        );

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            "Current user fetched successfully",
          data: user,
        })
      );
    }
  );

export const updatePassword =
  asyncHandler(
    async (req, res) => {
      const result =
        await updatePasswordService({
          userId:
            req.user.id,

          currentPassword:
            req.body.currentPassword,

          newPassword:
            req.body.newPassword,
        });

      return res.status(200).json(
        new ApiResponse({
          statusCode: 200,
          message:
            result.message,
        })
      );
    }
  );
