import express
  from "express";

import protect
  from "../middlewares/authMiddleware.js";

import aiRateLimiter
  from "../middlewares/aiRateLimiter.js";

import {
  uploadImages,
} from "../middlewares/uploadMiddleware.js";

import {

  chatWithAIStream,

  getChatSessions,

  getSessionMessages,

} from "../controllers/chatController.js";

import {
  getAIInsights,
} from "../controllers/aiController.js";

const router =
  express.Router();

/**
 * ---------------------------------------------------
 * Generate AI Insights
 * ---------------------------------------------------
 */

router.post(

  "/insights/:socialAccountId",

  protect,

  aiRateLimiter,

  getAIInsights
);

/**
 * ---------------------------------------------------
 * Streaming AI Chat
 * ---------------------------------------------------
 *
 * Main AI chat route
 * using SSE streaming.
 */

router.post(

  "/chat/:socialAccountId/stream",

  protect,

  aiRateLimiter,

  uploadImages.array(

    "images",

    5
  ),

  chatWithAIStream
);

/**
 * ---------------------------------------------------
 * Temporary Alias Route
 * ---------------------------------------------------
 *
 * Keeps frontend compatibility.
 *
 * Internally redirects
 * to streaming controller.
 */

router.post(

  "/chat/:socialAccountId",

  protect,

  aiRateLimiter,

  uploadImages.array(

    "images",

    5
  ),

  chatWithAIStream
);

/**
 * ---------------------------------------------------
 * Get Chat Sessions
 * ---------------------------------------------------
 */

router.get(

  "/chat/sessions/:socialAccountId",

  protect,

  getChatSessions
);

/**
 * ---------------------------------------------------
 * Get Session Messages
 * ---------------------------------------------------
 */

router.get(

  "/chat/session/:sessionId/messages",

  protect,

  getSessionMessages
);

export default router;