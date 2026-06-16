import asyncHandler
  from "../middlewares/asyncHandler.js";

import ApiResponse
  from "../utils/ApiResponse.js";

import AppError
  from "../utils/AppError.js";

import {
  createConversation,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  saveUserMessage,
  saveAssistantMessage,
  buildHistoryMessages,
  buildCreatorContext,
  updateConversationActivity,
  archiveConversation,
} from "../services/conversationService.js";

import {
  generateAnalyticsResponse,
} from "../services/aiService.js";

/**
 * --------------------------------------------------
 * Create Conversation
 * --------------------------------------------------
 */

export const createConversationController =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      instagramAccountId,
      title,
    } = req.body;

    const conversation =
      await createConversation({

        userId:
          req.user._id,

        instagramAccountId,

        title,
      });

    return res.status(201).json(

      new ApiResponse(
        true,
        "Conversation created successfully",

        {
          conversation,
        }
      )
    );
  });

/**
 * --------------------------------------------------
 * Get User Conversations
 * --------------------------------------------------
 */

export const getConversationsController =
  asyncHandler(async (
    req,
    res
  ) => {

    const conversations =
      await getUserConversations(
        req.user._id
      );

    return res.status(200).json(

      new ApiResponse(
        true,
        "Conversations fetched successfully",

        {
          conversations,
        }
      )
    );
  });

/**
 * --------------------------------------------------
 * Get Conversation Messages
 * --------------------------------------------------
 */

export const getConversationMessagesController =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      conversationId,
    } = req.params;

    await getConversationById(

      conversationId,

      req.user._id
    );

    const messages =
      await getConversationMessages(
        conversationId
      );

    return res.status(200).json(

      new ApiResponse(
        true,
        "Messages fetched successfully",

        {
          messages,
        }
      )
    );
  });

/**
 * --------------------------------------------------
 * Chat With AI
 * --------------------------------------------------
 */

export const chatWithAIController =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      conversationId,
    } = req.params;

    const {
      message,
    } = req.body;

    if (
      !message?.trim()
    ) {

      throw new AppError(
        "Message is required",
        400
      );
    }

    const conversation =
      await getConversationById(

        conversationId,

        req.user._id
      );

    /**
     * Save User Message
     */

    await saveUserMessage({

      conversationId,

      userId:
        req.user._id,

      content:
        message,
    });

    /**
     * Build AI Context
     */

    const [
      historyMessages,
      creatorContext,
    ] = await Promise.all([

      buildHistoryMessages(
        conversationId
      ),

      buildCreatorContext(
        conversation.instagramAccount
      ),
    ]);

    /**
     * Generate AI Response
     */

    const aiResult =
      await generateAnalyticsResponse({

        analyticsContext:
          creatorContext,

        historyMessages,

        latestUserMessage:
          message,
      });

    /**
     * Save Assistant Message
     */

    const aiMessage =
      await saveAssistantMessage({

        conversationId,

        userId:
          req.user._id,

        content:
          aiResult.reply,

        provider:
          aiResult.provider,

        model:
          aiResult.modelUsed,

        latencyMs:
          aiResult.latencyMs,
      });

    await updateConversationActivity(
      conversationId
    );

    return res.status(200).json(

      new ApiResponse(
        true,
        "AI response generated successfully",

        {
          reply:
            aiMessage,
        }
      )
    );
  });

/**
 * --------------------------------------------------
 * Archive Conversation
 * --------------------------------------------------
 */

export const archiveConversationController =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      conversationId,
    } = req.params;

    const conversation =
      await archiveConversation(

        conversationId,

        req.user._id
      );

    return res.status(200).json(

      new ApiResponse(
        true,
        "Conversation archived successfully",

        {
          conversation,
        }
      )
    );
  });