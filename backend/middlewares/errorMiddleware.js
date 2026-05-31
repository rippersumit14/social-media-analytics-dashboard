// middlewares/errorMiddleware.js

import multer
  from "multer";

import AppError
  from "../utils/AppError.js";

/**
 * ---------------------------------------------------
 * Global Error Middleware
 * ---------------------------------------------------
 *
 * Handles:
 * - AppError
 * - multer errors
 * - mongoose errors
 * - JWT errors
 * - validation errors
 * - unknown server errors
 */

const errorMiddleware =
  (
    error,
    req,
    res,
    next
  ) => {

    /**
     * Default error state
     */

    let statusCode =
      error.statusCode || 500;

    let message =
      error.message ||

      "Internal server error";

    /**
     * ---------------------------------------------------
     * Multer Errors
     * ---------------------------------------------------
     */

    if (
      error instanceof multer.MulterError
    ) {

      /**
       * File too large
       */

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {

        statusCode = 400;

        message =
          "Image size exceeds 5MB limit.";
      }

      /**
       * Too many files
       */

      else if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {

        statusCode = 400;

        message =
          "Maximum 5 images allowed.";
      }

      /**
       * Generic multer error
       */

      else {

        statusCode = 400;

        message =
          error.message;
      }
    }

    /**
     * ---------------------------------------------------
     * JWT Errors
     * ---------------------------------------------------
     */

    if (
      error.name ===
      "JsonWebTokenError"
    ) {

      statusCode = 401;

      message =
        "Invalid authentication token.";
    }

    /**
     * Expired JWT
     */

    if (
      error.name ===
      "TokenExpiredError"
    ) {

      statusCode = 401;

      message =
        "Authentication token expired.";
    }

    /**
     * ---------------------------------------------------
     * Mongo Cast Errors
     * ---------------------------------------------------
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
     * ---------------------------------------------------
     * Mongo Validation Errors
     * ---------------------------------------------------
     */

    if (
      error.name ===
      "ValidationError"
    ) {

      statusCode = 400;

      message =

        Object.values(
          error.errors
        )

          .map(
            (value) =>
              value.message
          )

          .join(", ");
    }

    /**
     * ---------------------------------------------------
     * Duplicate Key Errors
     * ---------------------------------------------------
     */

    if (
      error.code === 11000
    ) {

      statusCode = 400;

      const duplicateField =

        Object.keys(
          error.keyValue || {}
        )[0];

      message =
        `${duplicateField} already exists`;
    }

    /**
     * ---------------------------------------------------
     * Production Error Logging
     * ---------------------------------------------------
     */

    console.error(

      "[GLOBAL_ERROR]",

      {

        route:
          req.originalUrl,

        method:
          req.method,

        message,

        stack:

          process.env.NODE_ENV ===
          "development"

            ? error.stack

            : undefined,
      }
    );

    /**
     * ---------------------------------------------------
     * Standardized Error Response
     * ---------------------------------------------------
     */

    return res.status(
      statusCode
    ).json({

      success:
        false,

      message,

      ...(process.env.NODE_ENV ===
      "development"

        ? {
            stack:
              error.stack,
          }

        : {}),
    });
  };

export default errorMiddleware;