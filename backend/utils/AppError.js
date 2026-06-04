/**
 * --------------------------------------------------
 * Application Error Class
 * --------------------------------------------------
 *
 * Purpose:
 * Standardized operational errors
 * throughout the backend.
 *
 * Example:
 *
 * throw new AppError(
 *   "User not found",
 *   404
 * );
 */

class AppError extends Error {
  constructor(
    message,
    statusCode = 500
  ) {
    super(message);

    this.name = "AppError";

    this.statusCode = statusCode;

    this.success = false;

    /**
     * Operational Error
     *
     * Indicates an expected application error,
     * not a programming bug.
     */
    this.isOperational = true;

    Error.captureStackTrace(
      this,
      this.constructor
    );
  }
}

export default AppError;