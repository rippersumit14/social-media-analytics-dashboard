/**
 * ---------------------------------------------------
 * Global Async Handler
 * ---------------------------------------------------
 *
 * Prevents repetitive try/catch
 * blocks in controllers.
 *
 * Automatically forwards
 * async errors to global
 * error middleware.
 */

const asyncHandler =
  (controller) => {

    return async (
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
  };

export default asyncHandler;