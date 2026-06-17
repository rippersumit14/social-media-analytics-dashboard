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
 * --------------------------------------------------
 * Create Conversation
 * --------------------------------------------------
 *
 * Creates a new chat session
 * for a specific user.
 */

export const createConversation =
  async ({
    userId,
    instagramAccountId,
    title,
  }) => {

    return Conversation.create({

      user:
        userId,

      instagramAccount:
        instagramAccountId,

      title:
        title || "New Chat",
    });
  };

/**
 * --------------------------------------------------
 * Get User Conversations
 * --------------------------------------------------
 *
 * Returns active conversations
 * sorted by latest activity.
 */

export const getUserConversations =
  async (
    userId
  ) => {

    return Conversation.find({

      user:
        userId,

      isArchived:
        false,
    })
      .sort({

        lastMessageAt:
          -1,
      })
      .lean();
  };

/**
 * --------------------------------------------------
 * Get Conversation By Id
 * --------------------------------------------------
 *
 * Ownership validation.
 */

export const getConversationById =
  async (
    conversationId,
    userId
  ) => {

    const conversation =
      await Conversation.findOne({

        _id:
          conversationId,

        user:
          userId,

        isArchived:
          false,
      });

    if (!conversation) {

      throw new AppError(
        "Conversation not found",
        404
      );
    }

    return conversation;
  };

/**
 * --------------------------------------------------
 * Save User Message
 * --------------------------------------------------
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
 * --------------------------------------------------
 * Save Assistant Message
 * --------------------------------------------------
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
 * --------------------------------------------------
 * Get Conversation Messages
 * --------------------------------------------------
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
      })
      .lean();
  };

/**
 * --------------------------------------------------
 * Build History Messages
 * --------------------------------------------------
 *
 * Returns latest 20 messages
 * for AI context.
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
      .map(
        (message) => ({
          role:
            message.role,

          content:
            message.content,
        })
      );
  };

/**
 * --------------------------------------------------
 * Build Creator Context
 * --------------------------------------------------
 *
 * Builds analytics context
 * for AI chat.
 */

export const buildCreatorContext =
  async (
    instagramAccountId
  ) => {

    const [

      account,

      latestSnapshot,

      latestScore,

      insights,

    ] = await Promise.all([

      InstagramAccount
        .findById(
          instagramAccountId
        )
        .lean(),

      AnalyticsSnapshot
        .findOne({
          account:
            instagramAccountId,
        })
        .sort({
          createdAt: -1,
        })
        .lean(),

      CreatorScore
        .findOne({
          instagramAccount:
            instagramAccountId,
        })
        .sort({
          createdAt: -1,
        })
        .lean(),

      CreatorInsight
        .find({
          instagramAccount:
            instagramAccountId,

          isActive:
            true,
        })
        .lean(),
    ]);

    if (!account) {

      throw new AppError(
        "Instagram account not found",
        404
      );
    }

    /**
     * Temp Debugging
     */

    console.log("\nACCOUNT:");
    console.dir(account, { depth: null });
    
    console.log("\nLATEST SNAPSHOT:");
    console.dir(latestSnapshot, { depth: null });
    
    console.log("\nLATEST SCORE:");
    console.dir(latestScore, { depth: null });
    
    console.log("\nINSIGHTS:");
    console.dir(insights, { depth: null });
    



    return `
Creator Username:
${account.username || "Unknown"}

Followers:
${latestSnapshot?.followers || 0}

Engagement Rate:
${latestSnapshot?.engagementRate || 0}

Creator Score:
${latestScore?.totalScore || 0}

Insights:
${insights.length > 0
  ? insights
      .map(
        (insight) =>
          `- ${insight.title}`
      )
      .join("\n")
  : "No active insights"}
`;
  };

/**
 * --------------------------------------------------
 * Update Conversation Activity
 * --------------------------------------------------
 *
 * Updates latest activity time.
 */

export const updateConversationActivity =
  async (
    conversationId
  ) => {

    await Conversation.findByIdAndUpdate(

      conversationId,

      {

        lastMessageAt:
          new Date(),
      }
    );
  };

/**
 * --------------------------------------------------
 * Archive Conversation
 * --------------------------------------------------
 *
 * Soft delete.
 */

export const archiveConversation =
  async (
    conversationId,
    userId
  ) => {

    const conversation =
      await getConversationById(

        conversationId,

        userId
      );

    conversation.isArchived =
      true;

    await conversation.save();

    return conversation;
  };    