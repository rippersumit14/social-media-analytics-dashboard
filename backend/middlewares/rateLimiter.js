// middlewares/rateLimiter.js

import rateLimit from "express-rate-limit";

import ApiResponse from "../utils/ApiResponse.js";

/**
 * ---------------------------------------------------
 * Global API Rate Limiter
 * ---------------------------------------------------
 *
 * Protects:
 * - API abuse
 * - brute force attacks
 * - spam requests
 * - server overload
 */

export const globalRateLimiter =
  rateLimit({

    /**
     * 15 minute window
     */
    windowMs:
      15 * 60 * 1000,

    /**
     * Max requests per IP
     */
    max: 300,


    

    /**
     * Standard headers
     */
    standardHeaders:
      true,

    /**
     * Disable legacy headers
     */
    legacyHeaders:
      false,

    /**
     * Custom rate limit response
     */
    handler: (
      req,
      res
    ) => {

      return res.status(429).json(

        new ApiResponse(
          false,
          "Too many requests. Please try again later."
        )
      );
    },
  });

/**
 * ---------------------------------------------------
 * AI Chat Rate Limiter
 * ---------------------------------------------------
 *
 * Strict protection for:
 * - AI generation abuse
 * - token flooding
 * - SSE spam
 */

export const aiChatRateLimiter =
  rateLimit({

    /**
     * 15 minute window
     */
    windowMs:
      15 * 60 * 1000,

    /**
     * Lower AI request limit
     */
    max: 40,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    handler: (
      req,
      res
    ) => {

      return res.status(429).json(

        new ApiResponse(
          false,
          "AI request limit exceeded. Please slow down."
        )
      );
    },
  });

/**
 * ---------------------------------------------------
 * Authentication Rate Limiter
 * ---------------------------------------------------
 *
 * Protects:
 * - brute force attacks
 * - credential stuffing
 */

export const authRateLimiter =
  rateLimit({

    /**
     * 10 minute window
     */
    windowMs:
      10 * 60 * 1000,

    /**
     * Strict auth protection
     */
    max: 15,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    handler: (
      req,
      res
    ) => {

      return res.status(429).json(

        new ApiResponse(
          false,
          "Too many authentication attempts. Please try again later."
        )
      );
    },
  });

/**
 * ---------------------------------------------------
 * Upload Rate Limiter
 * ---------------------------------------------------
 *
 * Protects:
 * - image spam
 * - OCR abuse
 * - upload flooding
 */

export const uploadRateLimiter =
  rateLimit({

    /**
     * 15 minute window
     */
    windowMs:
      15 * 60 * 1000,

    /**
     * Upload protection
     */
    max: 50,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    handler: (
      req,
      res
    ) => {

      return res.status(429).json(

        new ApiResponse(
          false,
          "Upload limit exceeded. Please try again later."
        )
      );
    },
  });