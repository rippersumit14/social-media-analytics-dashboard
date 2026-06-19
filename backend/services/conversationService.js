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

  /**
   * Return AI Context
   */

  return `
==================================================
CREATOR PROFILE
==================================================

Username:
${account.username || "Unknown"}

Account Type:
${account.accountType || "Unknown"}

==================================================
ANALYTICS SNAPSHOT
==================================================

Followers:
${latestSnapshot?.followers || 0}

Following:
${latestSnapshot?.following || 0}

Posts:
${latestSnapshot?.mediaCount || 0}

Total Likes:
${latestSnapshot?.totalLikes || 0}

Total Comments:
${latestSnapshot?.totalComments || 0}

Total Engagement:
${latestSnapshot?.totalEngagement || 0}

Average Likes:
${latestSnapshot?.averageLikes || 0}

Average Comments:
${latestSnapshot?.averageComments || 0}

Average Engagement:
${latestSnapshot?.averageEngagement || 0}

==================================================
GROWTH METRICS
==================================================

Follower Growth:
${latestSnapshot?.followerGrowth || 0}

Engagement Growth:
${latestSnapshot?.engagementGrowth || 0}

Media Growth:
${latestSnapshot?.mediaGrowth || 0}

==================================================
CREATOR SCORE
==================================================

Overall Score:
${latestScore?.totalScore || 0}

Engagement Score:
${latestScore?.engagementScore || 0}

Growth Score:
${latestScore?.growthScore || 0}

Consistency Score:
${latestScore?.consistencyScore || 0}

Activity Score:
${latestScore?.activityScore || 0}

==================================================
ACTIVE INSIGHTS
==================================================

${insightsSection}

==================================================
AI INSTRUCTIONS
==================================================

You are an Instagram Creator Growth Assistant.

Use the analytics data, creator score,
growth metrics, and active insights above.

Always provide:

1. Data-driven analysis
2. Growth opportunities
3. Actionable recommendations
4. Content suggestions
5. Engagement improvements

Reference the creator score and insights
whenever possible.

Avoid generic advice when analytics data
is available.
`;
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