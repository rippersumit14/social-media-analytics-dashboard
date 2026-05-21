// utils/AppError.js

// Create custom production-safe error class
// Extends built-in JavaScript Error class
class AppError extends Error {

    // Constructor runs whenever:
    // new AppError(...) is called
    constructor(message, statusCode = 500){

        // Call parent Error constructor
        // Properly sets:
        // - error message
        // - stack trace
        super(message);

        // Store custom HTTP status code
        // Example:
        // 400 -> Bad Request
        // 404 -> Not Found
        // 500 -> Internal Server Error
        this.statusCode = statusCode;

        // Standardized API response structure
        this.success = false;

        // Cleaner stack traces for debugging
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;