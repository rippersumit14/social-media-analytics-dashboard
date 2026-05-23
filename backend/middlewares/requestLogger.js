// middlewares/requestLogger.js

import logger from "../utils/logger.js";

/**
 * ---------------------------------------------------
 * Request Logger Middleware
 * ---------------------------------------------------
 *
 * Tracks:
 * - method
 * - route
 * - status code
 * - response time
 * - request metadata
 */

const requestLogger = (
  req,
  res,
  next
) => {

  /**
   * Request start timestamp
   */
  const startedAt =
    Date.now();

  /**
   * Request metadata
   */
  const requestMeta = {

    method:
      req.method,

    route:
      req.originalUrl,

    ip:
      req.ip,

    userAgent:
      req.get(
        "user-agent"
      ),

    userId:
      req.user?._id?.toString?.(),
  };

  /**
   * Request start log
   */
  logger.info(
    "Incoming request",
    requestMeta
  );

  /**
   * Detect response completion
   */
  res.on(
    "finish",
    () => {

      /**
       * Request duration
       */
      const durationMs =
        Date.now() -
        startedAt;

      /**
       * Final response log
       */
      logger.info(
        "Request completed",

        {

          ...requestMeta,

          statusCode:
            res.statusCode,

          durationMs,
        }
      );
    }
  );

  /**
   * Detect aborted requests
   */
  res.on(
    "close",
    () => {

      /**
       * Ignore normal completed responses
       */
      if (
        res.writableEnded
      ) {
        return;
      }

      /**
       * Request aborted duration
       */
      const durationMs =
        Date.now() -
        startedAt;

      logger.warn(
        "Request aborted by client",

        {

          ...requestMeta,

          durationMs,
        }
      );
    }
  );

  next();
};

export default requestLogger;