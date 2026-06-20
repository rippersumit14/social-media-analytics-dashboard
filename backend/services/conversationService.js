import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import InstagramAccount from "../models/InstagramAccount.js";
import AnalyticsSnapshot from "../models/AnalyticsSnapshot.js";
import CreatorScore from "../models/CreatorScore.js";
import CreatorInsight from "../models/CreatorInsight.js";
import AppError from "../utils/AppError.js";

/**
 * --------------------------------------------------
 * Create Conversation
 * --------------------------------------------------
 *
 * Creates a new chat session
 * for a specific user.
 */

export const createConversation = async ({
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
 * --------------------------------------------------
 * Get User Conversations
 * --------------------------------------------------
 *
 * Returns active conversations
 * sorted by latest activity.
 */

export const getUserConversations = async (userId) => {
  return Conversation.find({
    user: userId,
    isArchived: false,
    isDeleted: false,
  })
    .sort({
      lastMessageAt: -1,
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

export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    user: userId,
    isArchived: false,
    isDeleted: false,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  return conversation;
};

/**
 * --------------------------------------------------
 * Save User Message
 * --------------------------------------------------
 */

export const saveUserMessage = async ({
  conversationId,
  userId,
  content,
  attachments = [],
}) => {
  return Message.create({
    conversation: conversationId,
    user: userId,
    role: "user",
    content,
    attachments,
  });
};

/**
 * --------------------------------------------------
 * Save Assistant Message
 * --------------------------------------------------
 */

export const saveAssistantMessage = async ({
  conversationId,
  userId,
  content,
  provider,
  model,
  tokensUsed = 0,
  latencyMs = 0,
}) => {
  return Message.create({
    conversation: conversationId,
    user: userId,
    role: "assistant",
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

export const getConversationMessages = async (conversationId) => {
  return Message.find({
    conversation: conversationId,
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

export const buildHistoryMessages = async (conversationId) => {
  const messages = await Message.find({
    conversation: conversationId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(20)
    .lean();

  return messages
    .reverse()
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
};

/**
 * --------------------------------------------------
 * Build Creator Context
 * --------------------------------------------------
 *
 * Builds analytics context
 * for AI chat.
 */

/**
 * --------------------------------------------------
 * Build Creator Context
 * --------------------------------------------------
 *
 * Builds rich creator analytics context
 * for AI chat responses.
 */

export const buildCreatorContext = async (instagramAccountId) => {
  const [account, latestSnapshot, latestScore, insights] = await Promise.all([
    InstagramAccount.findById(instagramAccountId).lean(),

    AnalyticsSnapshot.findOne({
      account: instagramAccountId,
    })
      .sort({
        createdAt: -1,
      })
      .lean(),

    CreatorScore.findOne({
      instagramAccount: instagramAccountId,
    })
      .sort({
        createdAt: -1,
      })
      .lean(),

    CreatorInsight.find({
      instagramAccount: instagramAccountId,
      isActive: true,
    }).lean(),
  ]);

  /**
   * Account validation
   */

  if (!account) {
    throw new AppError("Instagram account not found", 404);
  }

  /**
   * Build Active Insights Section
   */

  const insightsSection =
    insights.length > 0
      ? insights
          .map(
            (insight, index) => `
Insight ${index + 1}

Type:
${insight.type}

Priority:
${insight.priority}

Title:
${insight.title}

Description:
${insight.description}

Recommendation:
${insight.recommendation || "No recommendation available"}
`
          )
          .join("\n")
      : "No active insights available.";

  const context = `
Creator Username:
${account.username || "Unknown"}

Followers:
${latestSnapshot?.followers || 0}

Media Count:
${latestSnapshot?.mediaCount || 0}

Creator Score:
${latestScore?.totalScore || 0}

Insights:
${
  insights.length > 0
    ? insights.map((insight) => `- ${insight.title}`).join("\n")
    : "No active insights"
}
`;

  console.log("\n========== CREATOR CONTEXT ==========");
  console.log(context);
  console.log("=====================================\n");

  return context;
};

/**
 * --------------------------------------------------
 * Update Conversation Activity
 * --------------------------------------------------
 *
 * Updates latest activity time.
 */

export const updateConversationActivity = async (conversationId) => {
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessageAt: new Date(),
  });
};

/**
 * --------------------------------------------------
 * Archive Conversation
 * --------------------------------------------------
 *
 * Soft delete.
 */

export const archiveConversation = async (conversationId, userId) => {
  const conversation = await getConversationById(conversationId, userId);

  conversation.isArchived = true;

  await conversation.save();

  return conversation;
};


/**
 * --------------------------------------------------
 * Rename Conversation
 * --------------------------------------------------
 *
 * Allows user to rename
 * a conversation.
 */

export const renameConversation =
  async ({

    conversationId,

    userId,

    title,
  }) => {

    if (!title?.trim()) {

      throw new AppError(
        "Conversation title is required",
        400
      );
    }

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {

      throw new AppError(
        "Conversation not found",
        404
      );
    }

    if (
      conversation.user.toString() !==
      userId.toString()
    ) {

      throw new AppError(
        "Not authorized to modify this conversation",
        403
      );
    }

    conversation.title =
      title.trim();

    await conversation.save();

    return conversation;
  };

/**
 * --------------------------------------------------
 * Delete Conversation
 * --------------------------------------------------
 *
 * Soft delete.
 */

export const deleteConversation =
  async ({

    conversationId,

    userId,
  }) => {

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {

      throw new AppError(
        "Conversation not found",
        404
      );
    }

    if (
      conversation.user.toString() !==
      userId.toString()
    ) {

      throw new AppError(
        "Not authorized to delete this conversation",
        403
      );
    }

    conversation.isDeleted =
      true;

    await conversation.save();

    return conversation;
  };



  /**
 * --------------------------------------------------
 * Restore Conversation
 * --------------------------------------------------
 *
 * Restores a deleted
 * conversation.
 */

export const restoreConversation =
  async ({

    conversationId,

    userId,
  }) => {

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {

      throw new AppError(
        "Conversation not found",
        404
      );
    }

    if (
      conversation.user.toString() !==
      userId.toString()
    ) {

      throw new AppError(
        "Not authorized to restore this conversation",
        403
      );
    }

    conversation.isDeleted =
      false;

    await conversation.save();

    return conversation;
  };

