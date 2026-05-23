import api from "./api.js";

/**
 * Shared request configuration.
 */
const createAuthConfig = (
  token,
  signal
) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },

  /**
   * Prevent hanging requests.
   */
  timeout: 30000,

  /**
   * Abort-safe requests.
   */
  signal,
});

/**
 * Normalize stable chat session.
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
 * Normalize stable backend message.
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
 * Safely normalize array responses.
 */
const normalizeArrayResponse = (
  data,
  normalizer
) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizer);
};

/**
 * Stable session sorting.
 *
 * Most recently updated first.
 */
const sortSessionsByRecent = (
  sessions
) => {
  return [...sessions].sort(
    (a, b) => {
      return (
        new Date(
          b.updatedAt || 0
        ) -
        new Date(
          a.updatedAt || 0
        )
      );
    }
  );
};

/**
 * Get all chat sessions
 * for selected social account.
 */
export const getChatSessions =
  async ({
    socialAccountId,
    token,
    signal,
  }) => {
    const response = await api.get(
      `/ai/chat/sessions/${socialAccountId}`,
      createAuthConfig(
        token,
        signal
      )
    );

    /**
     * Stable backend extraction.
     */
    const sessions =
      normalizeArrayResponse(
        response.data?.sessions,
        normalizeSession
      );

    /**
     * Stable sidebar ordering.
     */
    return sortSessionsByRecent(
      sessions
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
    signal,
  }) => {
    const response = await api.get(
      `/ai/chat/session/${sessionId}/messages`,
      createAuthConfig(
        token,
        signal
      )
    );

    return normalizeArrayResponse(
      response.data?.messages,
      normalizeMessage
    );
  };

/**
 * Rename existing session.
 */
export const renameSession =
  async ({
    sessionId,
    title,
    token,
    signal,
  }) => {
    const response = await api.patch(
      `/ai/chat/session/${sessionId}`,
      { title },
      createAuthConfig(
        token,
        signal
      )
    );

    return normalizeSession(
      response.data?.session || {}
    );
  };

/**
 * Delete existing chat session.
 *
 * Backend cleanup includes:
 * - cloud images
 * - old uploads
 * - related assets
 */
export const deleteSession =
  async ({
    sessionId,
    token,
    signal,
  }) => {
    const response = await api.delete(
      `/ai/chat/session/${sessionId}`,
      createAuthConfig(
        token,
        signal
      )
    );

    return {
      success:
        Boolean(
          response.data?.success
        ),

      message:
        response.data?.message ||
        "Session deleted.",
    };
  };