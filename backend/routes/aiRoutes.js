import express from "express";

import protect from "../middlewares/authMiddleware.js";

import aiRateLimiter from "../middlewares/aiRateLimiter.js";

import {
  uploadImages,
} from "../middlewares/uploadMiddleware.js";

import {

  chatWithAI,

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
 * AI Analytics Insights
 * ---------------------------------------------------
 *
 * Generates:
 * - growth analysis
 * - engagement insights
 * - content recommendations
 * - audience analysis
 */

router.post(

  "/insights/:socialAccountId",

  protect,

  aiRateLimiter,

  getAIInsights
);

/**
 * ---------------------------------------------------
 * Standard AI Chat Route
 * ---------------------------------------------------
 *
 * Supports:
 * - text chat
 * - image uploads
 * - multimodal AI
 * - OCR analysis
 *
 * multipart/form-data
 *
 * Frontend fields:
 * - message
 * - sessionId (optional)
 * - images[]
 */

router.post(

  "/chat/:socialAccountId",

  protect,

  aiRateLimiter,

  /**
   * Multiple image uploads
   *
   * Max:
   * 5 images
   */
  uploadImages.array(

    "images",

    5
  ),

  chatWithAI
);

/**
 * ---------------------------------------------------
 * SSE Streaming AI Chat Route
 * ---------------------------------------------------
 *
 * Features:
 * - realtime chunk streaming
 * - AI typing effect
 * - SSE synchronization
 * - multimodal AI streaming
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
 * Get All Chat Sessions
 * ---------------------------------------------------
 *
 * Returns:
 * - session list
 * - titles
 * - previews
 * - updated timestamps
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
 *
 * Returns:
 * - chat history
 * - AI responses
 * - uploaded images
 * - timestamps
 */

router.get(

  "/chat/session/:sessionId/messages",

  protect,

  getSessionMessages
);

/**
 * ---------------------------------------------------
 * Future Routes
 * ---------------------------------------------------
 *
 * Planned:
 * - rename chat session
 * - delete chat session
 * - pin sessions
 * - AI summaries
 * - export chats
 *
 * Temporarily disabled during
 * stabilization phase.
 */

export default router;