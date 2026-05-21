// Create standardized API success response class
class ApiResponse {

    // Constructor runs whenever:
    // new ApiResponse(...) is called
    constructor(
        success = true,
        message = "Request successful",
        data = null
    ) {

        // Standard success flag
        // Helps frontend identify request status
        this.success = success;

        // Response message
        // Useful for UI notifications and debugging
        this.message = message;

        // Main response payload
        // Example:
        // user data
        // analytics data
        // AI insights
        this.data = data;
    }
}

// Export reusable response class
export default ApiResponse;

