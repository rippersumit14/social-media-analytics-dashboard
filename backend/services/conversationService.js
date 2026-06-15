import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

import InstagramAccount
  from "../models/InstagramAccount.js";

import AnalyticsSnapshot
  from "../models/AnalyticsSnapshot.js";

import CreatorScore
  from "../models/CreatorScore.js";

import CreatorInsight
  from "../models/CreatorInsight.js";

import AppError
  from "../utils/AppError.js";

/**
 * Create conversation (core function)
 */

export const createConversation = async({
    userId,
    instagramAccountId,
    title,
}) => {
    return Conversation.create({
        user: userId,
        instagramAccount: instagramAccountId,

        title: title || "New Chat",
    });
};

/**
 * Get User Conversations
 */

export const getUserConversations = async (userId) => {
    return Conversation.find({
        user: userId,
        isArchived: false,
    }).sort({
        latestMessageAt: -1,
    });
};

/**
 * Save User Message
 */

export const saveUserMessage =
  async ({
    conversationId,
    userId,
    content,
    attachments = [],
  }) => {

    return Message.create({

      conversation:
        conversationId,

      user:
        userId,

      role:
        "user",

      content,

      attachments,
    });
  };

  /**
   * Save assistant Message
   */

export const saveAssistantMessage =
  async ({
    conversationId,
    userId,
    content,
    provider,
    model,
    tokensUsed = 0,
    latencyMs = 0,
  }) => {

    return Message.create({

      conversation:
        conversationId,

      user:
        userId,

      role:
        "assistant",

      content,

      provider,

      model,

      tokensUsed,

      latencyMs,
    });
  };

/**
 * Get Conversation Messages
 */

export const getConversationMessages =
  async (
    conversationId
  ) => {

    return Message.find({

      conversation:
        conversationId,
    })
      .sort({
        createdAt: 1,
      });
  };

/**
 * Build history Window
 */

export const buildHistoryMessages =
  async (
    conversationId
  ) => {

    const messages =
      await Message.find({

        conversation:
          conversationId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();

    return messages
      .reverse()
      .map((message) => ({
        role:
          message.role,

        content:
          message.content,
      }));
  };

/**
 * Build creator context 
 */

export const buildCreatorContext =
  async (
    instagramAccountId
  ) => {

    const account =
      await InstagramAccount.findById(
        instagramAccountId
      );

    if (!account) {

      throw new AppError(
        "Instagram account not found",
        404
      );
    }

    const latestSnapshot =
      await AnalyticsSnapshot
        .findOne({
          instagramAccount:
            instagramAccountId,
        })
        .sort({
          createdAt: -1,
        });

    const latestScore =
      await CreatorScore
        .findOne({
          instagramAccount:
            instagramAccountId,
        })
        .sort({
          createdAt: -1,
        });

    const insights =
      await CreatorInsight.find({
        instagramAccount:
          instagramAccountId,

        isActive: true,
      });

    return `
Creator Username:
${account.username}

Followers:
${latestSnapshot?.followers || 0}

Engagement Rate:
${latestSnapshot?.engagementRate || 0}

Creator Score:
${latestScore?.totalScore || 0}

Insights:
${insights
  .map(
    (insight) =>
      `- ${insight.title}`
  )
  .join("\n")}
`;
  };


/**
 * Update Conversation Activity 
 */

export const updateConversationActivity = async(conversationId) => {
    await Conversation.findByIdAndUpdate(
        conversationId,

        {
            lastMessageAt:
            new Date(),
        }
    );
};