import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import User from "../models/User.js";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";

import {
  generateAnalyticsResponse,
} from "../services/aiService.js";

import {
  uploadImageToCloudinary,
} from "../services/cloudinaryStorageService.js";

import {
  prepareAIUsageForRequest,

  buildUsageInfo,

  buildUserMessageText,

  getOrCreateChatSession,

  buildHistoryMessages,

  buildAnalyticsContext,

  finalizeAIResponse,

} from "../services/chatService.js";

import asyncHandler
  from "../middlewares/asyncHandler.js";

import AppError
  from "../utils/AppError.js";

import ApiResponse
  from "../utils/ApiResponse.js";

import logger
  from "../utils/logger.js";

import {
  isValidObjectId,
} from "../utils/validateObjectId.js";

/**
 * ---------------------------------------------------
 * Upload Images In Parallel
 * ---------------------------------------------------
 */

const handleOptionalImageUploads =
  async (
    files = []
  ) => {

    if (!files.length) {
      return [];
    }

    return await Promise.all(

      files.map(

        async (file) =>

          await uploadImageToCloudinary(
            file
          )
      )
    );
  };

/**
 * ---------------------------------------------------
 * Standard AI Chat Route
 * ---------------------------------------------------
 *
 * Delegates to streaming controller.
 *
 * IMPORTANT:
 * Do NOT wrap with asyncHandler
 * because downstream controller
 * already uses asyncHandler.
 */

export const chatWithAI =
  async (
    req,
    res,
    next
  ) => {

    return await chatWithAIStream(
      req,
      res,
      next
    );
  };

/**
 * ---------------------------------------------------
 * Main Streaming AI Route
 * ---------------------------------------------------
 */

export const chatWithAIStream =
  asyncHandler(async (
    req,
    res
  ) => {

    const startedAt =
      Date.now();

    const {
      socialAccountId,
    } = req.params;

    const {
      message,
      sessionId,
    } = req.body || {};

    /**
     * Validate social account id
     */
    if (
      !isValidObjectId(
        socialAccountId
      )
    ) {

      throw new AppError(
        "Invalid social account id",
        400
      );
    }

    /**
     * Validate session id
     */
    if (
      sessionId &&
      !isValidObjectId(
        sessionId
      )
    ) {

      throw new AppError(
        "Invalid session id",
        400
      );
    }

    const userId =
      req.user._id;

    /**
     * Uploaded files
     */
    const uploadedFiles =
      req.files || [];

    const hasImages =
      uploadedFiles.length > 0;

    /**
     * Build user message
     */
    const userMessageText =
      buildUserMessageText(

        message,

        hasImages
      );

    /**
     * Empty request protection
     */
    if (
      !userMessageText &&
      !hasImages
    ) {

      throw new AppError(
        "Message or image required",
        400
      );
    }

    /**
     * Fetch user + social account
     */
    const [
      user,
      socialAccount,
    ] =
      await Promise.all([

        User.findById(
          userId
        ),

        SocialAccount.findOne({

          _id:
            socialAccountId,

          user:
            userId,
        }).lean(),
      ]);

    /**
     * User validation
     */
    if (!user) {

      throw new AppError(
        "User not found",
        404
      );
    }

    /**
     * Social account validation
     */
    if (!socialAccount) {

      throw new AppError(
        "Social account not found",
        404
      );
    }

    /**
     * Prepare AI usage
     */
    await prepareAIUsageForRequest(
      user
    );

    /**
     * Usage limit protection
     */
    if (
      user.aiUsageCount >=
      user.aiUsageLimit
    ) {

      throw new AppError(
        "AI usage limit reached",
        403
      );
    }

    /**
     * Create/get session
     */
    const activeSession =
      await getOrCreateChatSession({

        sessionId,

        userId,

        socialAccountId,

        userMessageText,
      });

    /**
     * Upload images
     */
    const uploadedImages =
      await handleOptionalImageUploads(
        uploadedFiles
      );

    /**
     * First image for Gemini multimodal
     */
    const firstImage =
      uploadedFiles[0] || null;

    const imageBase64 =
      firstImage
        ? firstImage.buffer.toString(
            "base64"
          )
        : null;

    const imageMimeType =
      firstImage?.mimetype ||
      null;

    /**
     * Save user message
     */
    const userMessage =
      await ChatMessage.create({

        session:
          activeSession._id,

        user:
          userId,

        socialAccount:
          socialAccountId,

        role:
          "user",

        content:
          userMessageText,

        images:
          uploadedImages,
      });

    /**
     * Fetch history + analytics
     */
    const [
      historyMessages,
      snapshots,
    ] =
      await Promise.all([

        buildHistoryMessages(
          activeSession._id
        ),

        AnalyticsSnapshot.find({

          socialAccount:
            socialAccountId,
        })
          .sort({
            capturedAt: -1,
          })

          .limit(30)

          .lean(),
      ]);

    /**
     * Build analytics context
     */
    const analyticsContext =
      buildAnalyticsContext(

        socialAccount,

        snapshots.reverse()
      );

    logger.ai(
      "Generating AI chat response",

      {
        socialAccountId,

        sessionId:
          activeSession._id.toString(),
      }
    );

    /**
     * Generate AI response
     */
    const aiResult =
      await generateAnalyticsResponse({

        analyticsContext,

        historyMessages,

        latestUserMessage:
          userMessageText,

        imageBase64,

        imageMimeType,
      });

    /**
     * Finalize response
     */
    const {
      aiReply,
    } =
      await finalizeAIResponse({

        user,

        activeSession,

        userId,

        socialAccountId,

        aiResult,
      });

    logger.success(
      "AI response generated",

      {

        sessionId:
          activeSession._id.toString(),

        latencyMs:
          aiResult.latencyMs,
      }
    );

    return res.status(200).json(

      new ApiResponse(
        true,
        "AI response generated successfully",

        {

          sessionId:
            activeSession._id.toString(),

          sessionTitle:
            activeSession.title,

          userMessage,

          aiReply,

          modelUsed:
            aiResult.modelUsed,

          modelName:
            aiResult.modelName,

          latencyMs:
            aiResult.latencyMs,

          usage:
            buildUsageInfo(
              user
            ),
        }
      )
    );
  });

/**
 * ---------------------------------------------------
 * Get Chat Sessions
 * ---------------------------------------------------
 */

export const getChatSessions =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      socialAccountId,
    } = req.params;

    const userId =
      req.user._id;

    const sessions =
      await ChatSession.find({

        user:
          userId,

        socialAccount:
          socialAccountId,
      })

        .sort({
          updatedAt: -1,
        })

        .lean();

    return res.status(200).json(

      new ApiResponse(
        true,
        "Sessions fetched successfully",

        sessions
      )
    );
  });

/**
 * ---------------------------------------------------
 * Get Session Messages
 * ---------------------------------------------------
 */

export const getSessionMessages =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      sessionId,
    } = req.params;

    const userId =
      req.user._id;

    const messages =
      await ChatMessage.find({

        session:
          sessionId,

        user:
          userId,
      })

        .sort({
          createdAt: 1,
        })

        .lean();

    return res.status(200).json(

      new ApiResponse(
        true,
        "Messages fetched successfully",

        messages
      )
    );
  });