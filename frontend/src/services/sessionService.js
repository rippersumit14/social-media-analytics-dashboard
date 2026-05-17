import api from "./api.js";

/**
 * Normalize chat session object.
 *
 * Backend contract:
 * {
 *   sessionId,
 *   title,
 *   lastMessagePreview,
 *   selectedModel,
 *   updatedAt
 * }
 */
const normalizeSession = (
  session = {}
) => {
  return {
    sessionId:
      session.sessionId || "",

    title:
      session.title || "New Chat",

    lastMessagePreview:
      session.lastMessagePreview ||
      "",

    selectedModel:
      session.selectedModel || "",

    updatedAt:
      session.updatedAt || null,
  };
};

/**
 * Normalize backend chat message.
 *
 * Backend ALWAYS returns:
 * images: []
 */
const normalizeMessage = (
  message = {}
) => {
  return {
    id:
      message._id ||
      crypto.randomUUID(),

    role:
      message.role || "assistant",

    content:
      message.content || "",

    /**
     * Stable image array.
     */
    images: Array.isArray(
      message.images
    )
      ? message.images
      : [],

    /**
     * AI metadata.
     */
    model:
      message.model || "",

    latencyMs:
      message.latencyMs || null,

    createdAt:
      message.createdAt || null,
  };
};

/**
 * Get all chat sessions
 * for selected social account.
 */
export const getChatSessions =
  async ({
    socialAccountId,
    token,
  }) => {
    const response = await api.get(
      `/ai/chat/sessions/${socialAccountId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const sessions =
      response.data?.sessions || [];

    return sessions.map(
      normalizeSession
    );
  };

/**
 * Get all messages
 * for selected session.
 */
export const getSessionMessages =
  async ({
    sessionId,
    token,
  }) => {
    const response = await api.get(
      `/ai/chat/session/${sessionId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const messages =
      response.data?.messages || [];

    return messages.map(
      normalizeMessage
    );
  };

/**
 * Rename session title.
 */
export const renameSession =
  async ({
    sessionId,
    title,
    token,
  }) => {
    const response = await api.patch(
      `/ai/chat/session/${sessionId}`,
      { title },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return normalizeSession(
      response.data?.session || {}
    );
  };

/**
 * Delete chat session.
 *
 * Backend also removes:
 * - cloud images
 * - old assets
 */
export const deleteSession =
  async ({
    sessionId,
    token,
  }) => {
    const response = await api.delete(
      `/ai/chat/session/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };