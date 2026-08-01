import express
  from "express";

import protect
  from "../middlewares/authMiddleware.js";
import {
  aiChatRateLimiter,
} from "../middlewares/rateLimiter.js";

import {

  createConversationController,

  getConversationsController,

  getConversationMessagesController,

  chatWithAIController,

  archiveConversationController,

  renameConversationController,

  deleteConversationController,

  restoreConversationController,

  streamChatWithAIController,

  

} from "../controllers/conversationController.js";

const router =
  express.Router();

/**
 * --------------------------------------------------
 * Conversations
 * --------------------------------------------------
 */

router.post(
  "/",
  protect,
  createConversationController
);

router.get(
  "/",
  protect,
  getConversationsController
);

/**
 * --------------------------------------------------
 * Messages
 * --------------------------------------------------
 */

router.get(
  "/:conversationId/messages",
  protect,
  getConversationMessagesController
);

/**
 * --------------------------------------------------
 * AI Chat
 * --------------------------------------------------
 */

router.post(
  "/:conversationId/chat",
  protect,
  aiChatRateLimiter,
  chatWithAIController
);

//Streaming

router.post(
  "/:conversationId/chat/stream",
  protect,
  aiChatRateLimiter,
  streamChatWithAIController
);

/**
 * --------------------------------------------------
 * Archive
 * --------------------------------------------------
 */

router.patch(
  "/:conversationId/archive",
  protect,
  archiveConversationController
);


/**
 * --------------------------------------------------
 * Rename Conversation
 * --------------------------------------------------
 *
 * PATCH /api/conversation/:conversationId
 */

router.patch(
  "/:conversationId",
  protect,
  renameConversationController
);

/**
 * --------------------------------------------------
 * Delete Conversation
 * --------------------------------------------------
 *
 * Soft delete.
 */

router.delete(
  "/:conversationId",
  protect,
  deleteConversationController
);

/**
 * --------------------------------------------------
 * Restore Conversation
 * --------------------------------------------------
 */

router.patch(
  "/:conversationId/restore",
  protect,
  restoreConversationController
);




export default router;
