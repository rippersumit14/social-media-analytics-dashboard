/**
 * --------------------------------------------------
 * Standard API Response
 * --------------------------------------------------
 *
 * Purpose:
 * Provide a consistent response format
 * across the entire backend.
 *
 * Example:
 *
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "Login successful",
 *   data: {...},
 *   meta: {...}
 * }
 */

class ApiResponse {
  constructor({
    success = true,
    statusCode = 200,
    message = "Request successful",
    data = null,
    meta = null,
  } = {}) {
    this.success = success;

    this.statusCode = statusCode;

    this.message = message;

    this.data = data;

    this.meta = meta;
  }
}

export default ApiResponse;