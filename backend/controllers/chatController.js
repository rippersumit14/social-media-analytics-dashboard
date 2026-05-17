// backend/controllers/chatController.js

import SocialAccount from "../models/SocialAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";

import User, {
  PLAN_AI_LIMITS,
} from "../models/User.js";

import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";

import {
  generateAnalyticsResponse,
} from "../services/aiService.js";

import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../services/cloudinaryStorageService.js";

/**
 * Limits
 */
const MAX_SESSIONS_PER_ACCOUNT =
  20;

const MAX_MESSAGES_PER_SESSION =
  100;

const MAX_CONTEXT_MESSAGES =
  12;

const ONE_DAY_IN_MS =
  24 * 60 * 60 * 1000;

/**
 * Safe cloudinary cleanup
 */
const safeDeleteCloudinaryImage =
  async (publicId) => {
    try {
      if (!publicId) return;

      await deleteImageFromCloudinary(
        publicId
      );
    } catch (error) {
      console.error(
        "[CLOUDINARY_DELETE_ERROR]",
        {
          publicId,

          message:
            error.message,
        }
      );
    }
  };

/**
 * Upload multiple images
 */
const handleOptionalImageUploads =
  async (files = []) => {
    if (!files.length) {
      return [];
    }

    const uploadedImages = [];

    for (const file of files) {
      const uploaded =
        await uploadImageToCloudinary(
          file
        );

      uploadedImages.push(
        uploaded
      );
    }

    return uploadedImages;
  };

/**
 * Usage reset
 */
const shouldResetAIUsage = (
  resetDate
) => {
  if (!resetDate) {
    return true;
  }

  const lastReset =
    new Date(
      resetDate
    ).getTime();

  return (
    Date.now() -
      lastReset >=
    ONE_DAY_IN_MS
  );
};

/**
 * Prepare usage
 */
const prepareAIUsageForRequest =
  async (user) => {
    const limit =
      PLAN_AI_LIMITS[
        user.plan
      ] ||
      PLAN_AI_LIMITS.FREE;

    user.aiUsageLimit =
      limit;

    if (
      shouldResetAIUsage(
        user.aiUsageResetDate
      )
    ) {
      user.aiUsageCount = 0;

      user.aiUsageResetDate =
        new Date();
    }

    await user.save();

    return user;
  };

/**
 * Usage info
 */
const buildUsageInfo = (
  user
) => {
  return {
    plan: user.plan,

    used:
      user.aiUsageCount,

    limit:
      user.aiUsageLimit,

    remaining: Math.max(
      user.aiUsageLimit -
        user.aiUsageCount,
      0
    ),

    resetDate:
      user.aiUsageResetDate,
  };
};

/**
 * Session title
 */
const buildSessionTitle = (
  message
) => {
  const clean =
    message
      ?.replace(/\s+/g, " ")
      .trim();

  if (!clean) {
    return "New Chat";
  }

  return clean.length > 60
    ? `${clean.slice(
        0,
        60
      )}...`
    : clean;
};

/**
 * Normalize message
 */
const buildUserMessageText = (
  message,
  hasImages
) => {
  const clean =
    message?.trim() || "";

  if (clean) {
    return clean;
  }

  if (hasImages) {
    return "Analyze the uploaded images.";
  }

  return "";
};

/**
 * Trim sessions
 */
const trimOldSessions =
  async (
    userId,
    socialAccountId
  ) => {
    const sessions =
      await ChatSession.find({
        user: userId,

        socialAccount:
          socialAccountId,
      })
        .sort({
          updatedAt: -1,
        })
        .select("_id");

    if (
      sessions.length <=
      MAX_SESSIONS_PER_ACCOUNT
    ) {
      return;
    }

    const sessionsToDelete =
      sessions.slice(
        MAX_SESSIONS_PER_ACCOUNT
      );

    const sessionIds =
      sessionsToDelete.map(
        (session) =>
          session._id
      );

    const messages =
      await ChatMessage.find({
        session: {
          $in: sessionIds,
        },
      });

    for (const message of messages) {
      for (const image of message.images || []) {
        await safeDeleteCloudinaryImage(
          image.publicId
        );
      }
    }

    await ChatMessage.deleteMany({
      session: {
        $in: sessionIds,
      },
    });

    await ChatSession.deleteMany({
      _id: {
        $in: sessionIds,
      },
    });
  };

/**
 * Trim messages
 */
const trimOldMessages =
  async (sessionId) => {
    const messages =
      await ChatMessage.find({
        session: sessionId,
      })
        .sort({
          createdAt: 1,
        })
        .select("_id images");

    if (
      messages.length <=
      MAX_MESSAGES_PER_SESSION
    ) {
      return;
    }

    const messagesToDelete =
      messages.slice(
        0,
        messages.length -
          MAX_MESSAGES_PER_SESSION
      );

    for (const message of messagesToDelete) {
      for (const image of message.images || []) {
        await safeDeleteCloudinaryImage(
          image.publicId
        );
      }
    }

    await ChatMessage.deleteMany({
      _id: {
        $in: messagesToDelete.map(
          (message) =>
            message._id
        ),
      },
    });
  };

/**
 * Get/create session
 */
const getOrCreateChatSession =
  async ({
    sessionId,
    userId,
    socialAccountId,
    userMessageText,
  }) => {
    if (sessionId) {
      return await ChatSession.findOne(
        {
          _id: sessionId,

          user: userId,

          socialAccount:
            socialAccountId,
        }
      );
    }

    const session =
      await ChatSession.create({
        user: userId,

        socialAccount:
          socialAccountId,

        title:
          buildSessionTitle(
            userMessageText
          ),
      });

    await trimOldSessions(
      userId,
      socialAccountId
    );

    return session;
  };

/**
 * Build history
 */
const buildHistoryMessages =
  async (sessionId) => {
    const messages =
      await ChatMessage.find({
        session: sessionId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(
          MAX_CONTEXT_MESSAGES
        )
        .lean();

    return messages
      .reverse()
      .map((msg) => ({
        role: msg.role,

        content:
          msg.content,
      }));
  };

/**
 * Analytics context
 */
const buildAnalyticsContext = (
  socialAccount,
  snapshots
) => {
  const latest =
    snapshots[
      snapshots.length - 1
    ] || {};

  return `
Platform: ${socialAccount.platform}
Username: ${socialAccount.username}
Followers: ${latest.followers || 0}
Engagement Rate: ${latest.engagementRate || 0}
Reach: ${latest.reach || 0}
Impressions: ${latest.impressions || 0}
`;
};

/**
 * Finalize response
 */
const finalizeAIResponse =
  async ({
    user,
    activeSession,
    userId,
    socialAccountId,
    aiResult,
  }) => {
    await ChatMessage.create({
      session:
        activeSession._id,

      user: userId,

      socialAccount:
        socialAccountId,

      role: "assistant",

      content:
        aiResult.reply,

      images: [],

      model:
        aiResult.modelUsed,

      latencyMs:
        aiResult.latencyMs,
    });

    user.aiUsageCount += 1;

    await user.save();

    activeSession.updatedAt =
      new Date();

    await activeSession.save();

    await trimOldMessages(
      activeSession._id
    );

    return {
      aiReply:
        aiResult.reply,
    };
  };

/**
 * Non-stream route
 */
export const chatWithAI =
  async (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "Use streaming endpoint.",
    });
  };

/**
 * Streaming route
 */
export const chatWithAIStream =
  async (req, res) => {
    try {
      const {
        socialAccountId,
      } = req.params;

      const {
        message,
        sessionId,
      } = req.body || {};

      const userId =
        req.user._id;

      const uploadedFiles =
        req.files?.images ||
        req.files ||
        [];

      const hasImages =
        uploadedFiles.length > 0;

      const userMessageText =
        buildUserMessageText(
          message,
          hasImages
        );

      if (
        !userMessageText &&
        !hasImages
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Message or image required",
          });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User not found",
          });
      }

      await prepareAIUsageForRequest(
        user
      );

      const socialAccount =
        await SocialAccount.findOne(
          {
            _id:
              socialAccountId,

            user: userId,
          }
        );

      if (!socialAccount) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Social account not found",
          });
      }

      const activeSession =
        await getOrCreateChatSession(
          {
            sessionId,

            userId,

            socialAccountId,

            userMessageText,
          }
        );

      const uploadedImages =
        await handleOptionalImageUploads(
          uploadedFiles
        );

      const firstImage =
        uploadedFiles[0] ||
        null;

      const imageBase64 =
        firstImage
          ? firstImage.buffer.toString(
              "base64"
            )
          : null;

      const imageMimeType =
        firstImage?.mimetype ||
        null;

      const userMessage =
        await ChatMessage.create({
          session:
            activeSession._id,

          user: userId,

          socialAccount:
            socialAccountId,

          role: "user",

          content:
            userMessageText,

          images:
            uploadedImages,
        });

      const historyMessages =
        await buildHistoryMessages(
          activeSession._id
        );

      const snapshots =
        await AnalyticsSnapshot.find(
          {
            socialAccount:
              socialAccountId,
          }
        ).sort({
          capturedAt: 1,
        });

      const analyticsContext =
        buildAnalyticsContext(
          socialAccount,
          snapshots
        );

      /**
       * SSE
       */
      res.setHeader(
        "Content-Type",
        "text/event-stream"
      );

      res.setHeader(
        "Cache-Control",
        "no-cache"
      );

      res.setHeader(
        "Connection",
        "keep-alive"
      );

      res.flushHeaders?.();

      const sendEvent = (
        event,
        data
      ) => {
        res.write(
          `event: ${event}\n`
        );

        res.write(
          `data: ${JSON.stringify(
            data
          )}\n\n`
        );
      };

      sendEvent(
        "session",
        {
          sessionId:
            activeSession._id.toString(),

          sessionTitle:
            activeSession.title,
        }
      );

      sendEvent(
        "userMessage",
        {
          message:
            userMessage,
        }
      );

      const aiResult =
        await generateAnalyticsResponse(
          {
            analyticsContext,

            historyMessages,

            latestUserMessage:
              userMessageText,

            imageBase64,

            imageMimeType,
          }
        );

      sendEvent(
        "model",
        {
          modelUsed:
            aiResult.modelUsed,

          modelName:
            aiResult.modelName,
        }
      );

      /**
       * Simulated streaming
       */
      const words =
        aiResult.reply.split(
          " "
        );

      for (const word of words) {
        sendEvent(
          "chunk",
          {
            chunk:
              word + " ",
          }
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              15
            )
        );
      }

      const { aiReply } =
        await finalizeAIResponse(
          {
            user,

            activeSession,

            userId,

            socialAccountId,

            aiResult,
          }
        );

      sendEvent(
        "done",
        {
          success: true,

          reply: aiReply,

          sessionId:
            activeSession._id.toString(),

          sessionTitle:
            activeSession.title,

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

          remainingUsage:
            Math.max(
              user.aiUsageLimit -
                user.aiUsageCount,
              0
            ),
        }
      );

      res.end();
    } catch (error) {
      console.error(
        "[CHAT_STREAM_ERROR]",
        {
          message:
            error.message,

          stack:
            error.stack,
        }
      );

      if (!res.headersSent) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "AI is currently busy, please try again.",
          });
      }

      res.write(
        `event: error\n`
      );

      res.write(
        `data: ${JSON.stringify(
          {
            message:
              "AI is currently busy, please try again.",
          }
        )}\n\n`
      );

      res.end();
    }
  };

/**
 * Get sessions
 */
export const getChatSessions =
  async (req, res) => {
    try {
      const {
        socialAccountId,
      } = req.params;

      const userId =
        req.user._id;

      const sessions =
        await ChatSession.find({
          user: userId,

          socialAccount:
            socialAccountId,
        })
          .sort({
            updatedAt: -1,
          })
          .lean();

      const formattedSessions =
        await Promise.all(
          sessions.map(
            async (session) => {
              const lastMessage =
                await ChatMessage.findOne(
                  {
                    session:
                      session._id,
                  }
                )
                  .sort({
                    createdAt: -1,
                  })
                  .lean();

              return {
                sessionId:
                  session._id.toString(),

                title:
                  session.title,

                updatedAt:
                  session.updatedAt,

                selectedModel:
                  session.selectedModel ||
                  null,

                lastMessagePreview:
                  lastMessage?.content?.slice(
                    0,
                    80
                  ) || "",
              };
            }
          )
        );

      return res.status(200).json({
        success: true,

        sessions:
          formattedSessions,
      });
    } catch (error) {
      console.error(
        "[GET_SESSIONS_ERROR]",
        {
          message:
            error.message,
        }
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load sessions",
      });
    }
  };

/**
 * Get session messages
 */
export const getSessionMessages =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const userId =
        req.user._id;

      const messages =
        await ChatMessage.find({
          session: sessionId,

          user: userId,
        }).sort({
          createdAt: 1,
        });

      return res.status(200).json({
        success: true,

        messages,
      });
    } catch (error) {
      console.error(
        "[GET_MESSAGES_ERROR]",
        {
          message:
            error.message,
        }
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load messages",
      });
    }
  };

/**
 * Rename session
 */
export const renameChatSession =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const { title } =
        req.body;

      const userId =
        req.user._id;

      if (
        !title ||
        !title.trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Session title required",
          });
      }

      const session =
        await ChatSession.findOneAndUpdate(
          {
            _id: sessionId,

            user: userId,
          },

          {
            title:
              title.trim(),
          },

          {
            new: true,
          }
        );

      if (!session) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Session not found",
          });
      }

      return res.status(200).json({
        success: true,

        session: {
          sessionId:
            session._id.toString(),

          title:
            session.title,

          updatedAt:
            session.updatedAt,
        },
      });
    } catch (error) {
      console.error(
        "[RENAME_SESSION_ERROR]",
        {
          message:
            error.message,
        }
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to rename session",
      });
    }
  };

/**
 * Delete session
 */
export const deleteChatSession =
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const userId =
        req.user._id;

      const session =
        await ChatSession.findOne(
          {
            _id: sessionId,

            user: userId,
          }
        );

      if (!session) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Session not found",
          });
      }

      const messages =
        await ChatMessage.find({
          session: sessionId,
        });

      /**
       * Cleanup images
       */
      for (const message of messages) {
        for (const image of message.images || []) {
          await safeDeleteCloudinaryImage(
            image.publicId
          );
        }
      }

      await ChatMessage.deleteMany({
        session: sessionId,
      });

      await ChatSession.deleteOne({
        _id: sessionId,
      });

      return res.status(200).json({
        success: true,

        sessionId,

        message:
          "Session deleted successfully",
      });
    } catch (error) {
      console.error(
        "[DELETE_SESSION_ERROR]",
        {
          message:
            error.message,
        }
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to delete session",
      });
    }
  };