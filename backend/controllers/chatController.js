import SocialAccount
  from "../models/SocialAccount.js";

import AnalyticsSnapshot
  from "../models/AnalyticsSnapshot.js";

import User
  from "../models/User.js";

import ChatSession
  from "../models/ChatSession.js";

import ChatMessage
  from "../models/ChatMessage.js";

import {

  generateAnalyticsResponse,

  generateStreamingAnalyticsResponse,

} from "../services/aiService.js";

import {
  uploadImageToCloudinary,
} from "../services/cloudinaryStorageService.js";

import {
  extractTextFromImage,
} from "../services/ocrService.js";

import {

  prepareAIUsageForRequest,

  buildUsageInfo,

  buildUserMessageText,

  getOrCreateChatSession,

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
 * Upload images in parallel
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
 * Extract OCR text from uploaded images
 */

const extractOCRFromImages =
  async (
    files = []
  ) => {

    if (!files.length) {
      return "";
    }

    const results =
      await Promise.all(

        files.map(

          async (file) =>

            await extractTextFromImage(
              file.buffer
            )
        )
      );

    return results

      .filter(
        (result) =>
          result.hasText
      )

      .map(
        (result) =>
          result.extractedText
      )

      .join("\n\n");
  };

/**
 * Load recent chat history
 */

const loadRecentHistory =
  async (
    sessionId
  ) => {

    const messages =
      await ChatMessage.find({

        session:
          sessionId,
      })

        .sort({
          createdAt: -1,
        })

        .limit(20)

        .lean();

    return messages.reverse();
  };

/**
 * Build final AI prompt message
 */

const buildFinalUserMessage =
  (
    userMessageText,
    extractedOCRText
  ) => {

    if (!extractedOCRText) {
      return userMessageText;
    }

    return `
${userMessageText}

--------------------------------------------------
OCR EXTRACTED TEXT
--------------------------------------------------

${extractedOCRText}
`;
  };

/**
 * Normalize messages response
 */

const buildMessagesResponse =
  (
    userMessage,
    aiReply
  ) => {

    return [
      userMessage,
      aiReply,
    ];
  };

/**
 * Main AI Chat Controller
 */

export const chatWithAI =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      socialAccountId,
    } = req.params;

    const {
      message,
      sessionId,
    } = req.body || {};

    /**
     * Validate social account
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

    const uploadedFiles =
      req.files || [];

    const hasImages =
      uploadedFiles.length > 0;

    /**
     * Normalize user message
     */

    const userMessageText =
      buildUserMessageText(

        message,

        hasImages
      );

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
     * Load user + account
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

    if (!user) {

      throw new AppError(
        "User not found",
        404
      );
    }

    if (!socialAccount) {

      throw new AppError(
        "Social account not found",
        404
      );
    }

    /**
     * Validate AI usage
     */

    await prepareAIUsageForRequest(
      user
    );

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
     * Create or fetch session
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
     * OCR extraction
     */

    const extractedOCRText =
      await extractOCRFromImages(
        uploadedFiles
      );

    /**
     * Final AI prompt
     */

    const finalUserMessage =
      buildFinalUserMessage(

        userMessageText,

        extractedOCRText
      );

    /**
     * Persist user message
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
          finalUserMessage,

        images:
          uploadedImages,
      });

    /**
     * Refresh session updatedAt
     */

    activeSession.updatedAt =
      new Date();

    await activeSession.save();

    /**
     * Load history + analytics
     */

    const [
      historyMessages,
      snapshots,
    ] =
      await Promise.all([

        loadRecentHistory(
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

    /**
     * Generate AI response
     */

    const aiResult =
      await generateAnalyticsResponse({

        analyticsContext,

        historyMessages,

        latestUserMessage:
          finalUserMessage,
      });

    /**
     * Persist AI reply
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

    /**
     * Final normalized response
     */

    return res.status(200).json(

      new ApiResponse(
        true,
        "AI response generated successfully",

        {

          session: {

            _id:
              activeSession._id,

            title:
              activeSession.title,

            createdAt:
              activeSession.createdAt,

            updatedAt:
              activeSession.updatedAt,
          },

          messages:
            buildMessagesResponse(

              userMessage,

              aiReply
            ),

          provider:
            aiResult.provider,

          modelUsed:
            aiResult.modelUsed,

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
 * Real Streaming AI Controller
 */

export const chatWithAIStream =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      socialAccountId,
    } = req.params;

    const {
      message = "",
      sessionId,
    } = req.body || {};

    /**
     * Validate ids
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

    /**
     * SSE headers
     */

    res.writeHead(200, {

      "Content-Type":
        "text/event-stream",

      "Cache-Control":
        "no-cache",

      Connection:
        "keep-alive",
    });

    /**
     * Initial SSE event
     */

    res.write(

      `data: ${JSON.stringify({

        type:
          "connected",
      })}\n\n`
    );

    try {

      const userId =
        req.user._id;

      /**
       * Create or fetch session
       */

      const activeSession =
        await getOrCreateChatSession({

          sessionId,

          userId,

          socialAccountId,

          userMessageText:
            message,
        });

      /**
       * Persist user message
       */

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
          message,
      });

      /**
       * Stream AI response
       */

      const stream =
        await generateStreamingAnalyticsResponse({

          analyticsContext:
            "Streaming AI analysis",

          historyMessages:
            [],

          latestUserMessage:
            message,
        });

      let fullResponse =
        "";

      /**
       * Forward tokens
       */

      for await (
        const chunk
        of stream
      ) {

        const token =
          chunk?.choices?.[0]
            ?.delta?.content || "";

        if (!token) {
          continue;
        }

        fullResponse +=
          token;

        res.write(

          `data: ${JSON.stringify({

            type:
              "token",

            content:
              token,
          })}\n\n`
        );
      }

      /**
       * Persist AI reply
       */

      const aiReply =
        await ChatMessage.create({

          session:
            activeSession._id,

          user:
            userId,

          socialAccount:
            socialAccountId,

          role:
            "assistant",

          content:
            fullResponse,
        });

      /**
       * Refresh session timestamp
       */

      activeSession.updatedAt =
        new Date();

      await activeSession.save();

      /**
       * Stream completion event
       */

      res.write(

        `data: ${JSON.stringify({

          type:
            "done",

          session: {

            _id:
              activeSession._id,

            title:
              activeSession.title,

            createdAt:
              activeSession.createdAt,

            updatedAt:
              activeSession.updatedAt,
          },

          aiReply,
        })}\n\n`
      );

      res.end();

    } catch (error) {

      logger.error(

        "Streaming AI error",

        {
          message:
            error.message,
        }
      );

      /**
       * SSE error event
       */

      res.write(

        `data: ${JSON.stringify({

          type:
            "error",

          message:
            error.message,
        })}\n\n`
      );

      res.end();
    }
  });

/**
 * Get chat sessions
 */

export const getChatSessions =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      socialAccountId,
    } = req.params;

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

    const sessions =
      await ChatSession.find({

        user:
          req.user._id,

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

        {
          sessions,
        }
      )
    );
  });

/**
 * Get session messages
 */

export const getSessionMessages =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      sessionId,
    } = req.params;

    if (
      !isValidObjectId(
        sessionId
      )
    ) {

      throw new AppError(
        "Invalid session id",
        400
      );
    }

    const messages =
      await ChatMessage.find({

        session:
          sessionId,

        user:
          req.user._id,
      })

        .sort({
          createdAt: 1,
        })

        .lean();

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
 * Rename chat session
 */

export const renameChatSession =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      sessionId,
    } = req.params;

    const {
      title,
    } = req.body;

    if (
      !isValidObjectId(
        sessionId
      )
    ) {

      throw new AppError(
        "Invalid session id",
        400
      );
    }

    const session =
      await ChatSession.findOne({

        _id:
          sessionId,

        user:
          req.user._id,
      });

    if (!session) {

      throw new AppError(
        "Chat session not found",
        404
      );
    }

    session.title =
      title?.trim() ||
      session.title;

    await session.save();

    return res.status(200).json(

      new ApiResponse(
        true,
        "Session renamed successfully",

        {
          session,
        }
      )
    );
  });

/**
 * Delete chat session
 */

export const deleteChatSession =
  asyncHandler(async (
    req,
    res
  ) => {

    const {
      sessionId,
    } = req.params;

    if (
      !isValidObjectId(
        sessionId
      )
    ) {

      throw new AppError(
        "Invalid session id",
        400
      );
    }

    const session =
      await ChatSession.findOne({

        _id:
          sessionId,

        user:
          req.user._id,
      });

    if (!session) {

      throw new AppError(
        "Chat session not found",
        404
      );
    }

    await Promise.all([

      ChatMessage.deleteMany({

        session:
          sessionId,
      }),

      ChatSession.deleteOne({

        _id:
          sessionId,
      }),
    ]);

    return res.status(200).json(

      new ApiResponse(
        true,
        "Session deleted successfully",

        {
          deletedSessionId:
            sessionId,
        }
      )
    );
  });