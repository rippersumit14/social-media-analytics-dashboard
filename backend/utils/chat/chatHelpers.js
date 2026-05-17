/**
 * Daily AI usage reset interval.
 */
const ONE_DAY_IN_MS =
  24 * 60 * 60 * 1000;

/**
 * Generate session title
 * from first user message.
 */
export const buildSessionTitle = (
  message = ""
) => {
  const cleanMessage = message
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanMessage) {
    return "New Chat";
  }

  return cleanMessage.length > 60
    ? `${cleanMessage.slice(0, 60)}...`
    : cleanMessage;
};

/**
 * Normalize frontend-safe message.
 *
 * IMPORTANT:
 * Always guarantees:
 * images: []
 */
export const normalizeMessage = (
  message
) => {
  if (!message) return null;

  return {
    ...message.toJSON(),

    images: message.images || [],
  };
};

/**
 * Build frontend-safe usage object.
 */
export const buildUsageInfo = (
  user
) => {
  return {
    plan: user.plan,

    used: user.aiUsageCount,

    limit: user.aiUsageLimit,

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
 * Check whether daily AI usage
 * should reset.
 */
export const shouldResetAIUsage =
  (resetDate) => {
    if (!resetDate) {
      return true;
    }

    const lastReset =
      new Date(resetDate).getTime();

    return (
      Date.now() - lastReset >=
      ONE_DAY_IN_MS
    );
  };

/**
 * Format sidebar session response.
 *
 * Frontend contract-safe.
 */
export const formatSessionResponse =
  (session, lastMessage = "") => {
    return {
      sessionId:
        session.sessionId ||
        session._id?.toString(),

      title: session.title,

      lastMessagePreview:
        lastMessage.slice(0, 80),

      selectedModel:
        session.selectedModel || null,

      updatedAt:
        session.updatedAt,
    };
  };

/**
 * Build fallback user prompt.
 *
 * Useful for:
 * image-only uploads.
 */
export const buildUserMessageText =
  ({
    message,
    hasImages,
  }) => {
    const cleanMessage =
      message?.trim() || "";

    if (cleanMessage) {
      return cleanMessage;
    }

    if (hasImages) {
      return "The user uploaded images and wants analysis.";
    }

    return "";
  };