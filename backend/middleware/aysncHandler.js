// middlewares/asyncHandler.js

// Wraps async controllers/services
// Automatically catches async errors
const asyncHandler = (handler) => {

    // Return wrapped middleware function
    return async (req, res, next) => {

        try {

            // Execute original async controller
            await handler(req, res, next);

        } catch (error) {

            // Forward error to centralized
            // global error middleware
            next(error);
        }
    };
};

export default asyncHandler;