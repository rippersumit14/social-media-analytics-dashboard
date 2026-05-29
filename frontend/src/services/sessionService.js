import api from "./api.js";

/**
 * -------------------------------------------------------
 * Normalize session safely.
 * -------------------------------------------------------
 */
const normalizeSession = (
  session = {}
) => {
  return {
    _id:
      session._id || "",

    title:
      session.title ||
      "New Chat",

    socialAccount:
      session.socialAccount ||
      null,

    latestMessage:
      session.latestMessage ||
      "",

    messageCount:
      Number(
        session.messageCount || 0
      ),

    createdAt:
      session.createdAt ||
      null,

    updatedAt:
      session.updatedAt ||
      null,
  };
};

/**
 * -------------------------------------------------------
 * Normalize backend response safely.
 * -------------------------------------------------------
 */
const normalizeResponse = (
  responseData = {}
) => {
  return {
    success:
      responseData.success ??
      true,

    message:
      responseData.message ||
      "",

    /**
     * Sessions payload.
     */
    sessions:
      (
        responseData.sessions ||
        responseData.data
          ?.sessions ||
        []
      ).map(
        normalizeSession
      ),

    /**
     * Single session.
     */
    session:
      responseData.session ||
      responseData.data
        ?.session ||
      null,

    /**
     * Raw payload.
     */
    data:
      responseData.data ||
      responseData,
  };
};

/**
 * -------------------------------------------------------
 * Get AI chat sessions.
 * -------------------------------------------------------
 */
export const getChatSessions =
  async ({
    socialAccountId,
    signal,
  }) => {
    if (!socialAccountId) {
      throw new Error(
        "Social account ID is required."
      );
    }

    const response =
      await api.get(
        `/ai/chat/sessions/${socialAccountId}`,
        {
          signal,
        }
      );

    return normalizeResponse(
      response.data
    );
  };

/**
 * -------------------------------------------------------
 * Rename AI chat session.
 * -------------------------------------------------------
 */
export const renameChatSession =
  async ({
    sessionId,
    title,
    signal,
  }) => {
    if (!sessionId) {
      throw new Error(
        "Session ID is required."
      );
    }

    const response =
      await api.patch(
        `/ai/chat/session/${sessionId}`,
        {
          title,
        },
        {
          signal,
        }
      );

    return normalizeResponse(
      response.data
    );
  };

/**
 * -------------------------------------------------------
 * Delete AI chat session.
 * -------------------------------------------------------
 */
export const deleteChatSession =
  async ({
    sessionId,
    signal,
  }) => {
    if (!sessionId) {
      throw new Error(
        "Session ID is required."
      );
    }

    const response =
      await api.delete(
        `/ai/chat/session/${sessionId}`,
        {
          signal,
        }
      );

    return normalizeResponse(
      response.data
    );
  };