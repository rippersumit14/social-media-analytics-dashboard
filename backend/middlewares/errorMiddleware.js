import multer from "multer";

import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * --------------------------------------------------
 * Global Error Middleware
 * --------------------------------------------------
 *
 * Handles:
 * - AppError
 * - Multer Errors
 * - JWT Errors
 * - Mongoose Errors
 * - Duplicate Key Errors
 * - Unknown Server Errors
 */

const errorMiddleware = (
  error,
  req,
  res,
  next
) => {
  let statusCode =
    error.statusCode || 500;

  let message =
    error.message ||
    "Internal server error";

  /**
   * --------------------------------------------------
   * Multer Errors
   * --------------------------------------------------
   */

  if (
    error instanceof multer.MulterError
  ) {
    if (
      error.code ===
      "LIMIT_FILE_SIZE"
    ) {
      statusCode = 400;

      message =
        "Image size exceeds 5MB limit.";
    } else if (
      error.code ===
      "LIMIT_FILE_COUNT"
    ) {
      statusCode = 400;

      message =
        "Maximum 5 images allowed.";
    } else {
      statusCode = 400;

      message =
        error.message;
    }
  }

  /**
   * --------------------------------------------------
   * JWT Errors
   * --------------------------------------------------
   */

  if (
    error.name ===
    "JsonWebTokenError"
  ) {
    statusCode = 401;

    message =
      "Invalid authentication token.";
  }

  if (
    error.name ===
    "TokenExpiredError"
  ) {
    statusCode = 401;

    message =
      "Authentication token expired.";
  }

  /**
   * --------------------------------------------------
   * MongoDB Cast Error
   * --------------------------------------------------
   */

  if (
    error.name ===
    "CastError"
  ) {
    statusCode = 400;

    message =
      "Invalid resource ID.";
  }

  /**
   * --------------------------------------------------
   * MongoDB Validation Error
   * --------------------------------------------------
   */

  if (
    error.name ===
    "ValidationError"
  ) {
    statusCode = 400;

    message = Object.values(
      error.errors
    )
      .map(
        (value) =>
          value.message
      )
      .join(", ");
  }

  /**
   * --------------------------------------------------
   * Duplicate Key Error
   * --------------------------------------------------
   */

  if (
    error.code === 11000
  ) {
    statusCode = 409;

    const duplicateField =
      Object.keys(
        error.keyValue || {}
      )[0];

    message =
      `${duplicateField} already exists`;
  }

  /**
   * --------------------------------------------------
   * Hide Unexpected Errors
   * In Production
   * --------------------------------------------------
   */

  if (
    !(error instanceof AppError) &&
    process.env.NODE_ENV ===
      "production"
  ) {
    message =
      "Internal server error";
  }

  /**
   * --------------------------------------------------
   * Error Logging
   * --------------------------------------------------
   */

  console.error(
    "[GLOBAL_ERROR]",
    {
      route:
        req.originalUrl,

      method:
        req.method,

      statusCode,

      message,

      stack:
        process.env.NODE_ENV ===
        "development"
          ? error.stack
          : undefined,
    }
  );

  /**
   * --------------------------------------------------
   * Standardized Error Response
   * --------------------------------------------------
   */

  return res.status(
    statusCode
  ).json(
    new ApiResponse({
      success: false,

      statusCode,

      message,

      ...(process.env.NODE_ENV ===
      "development"
        ? {
            meta: {
              stack:
                error.stack,
            },
          }
        : {}),
    })
  );
};

export default errorMiddleware;