/**
 * --------------------------------------------------
 * Async Handler Middleware
 * --------------------------------------------------
 *
 * Purpose:
 * Eliminates repetitive try/catch
 * blocks inside controllers.
 *
 * Any thrown error is automatically
 * forwarded to Express error middleware.
 */

const asyncHandler =
  (controller) =>
  async (
    req,
    res,
    next
  ) => {
    try {
      await controller(
        req,
        res,
        next
      );
    } catch (error) {
      next(error);
    }
  };

export default asyncHandler;