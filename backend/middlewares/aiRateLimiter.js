import rateLimit from "express-rate-limit";

/**
 * Short-window limiter for AI routes.
 *
 * This protects provider quotas and keeps one client from saturating the
 * simulated streaming endpoint.
 */
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many AI requests. Please wait a minute and try again.",
  },
});

export default aiRateLimiter;



