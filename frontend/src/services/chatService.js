import api from "./api.js";

/**
 * Send message to AI chat API.
 *
 * Supports:
 * - Text-only messages using JSON
 * - Image-only messages using FormData
 * - Text + image messages using FormData
 *
 * @param {string} accountId - Selected social account id
 * @param {string} message - User message text
 * @param {string} token - JWT token
 * @param {string|null} sessionId - Existing chat session id
 * @param {File|null} imageFile - Optional uploaded image
 */
export const chatWithAI = async (
  accountId,
  message,
  token,
  sessionId = null,
  imageFile = null
) => {
  /**
   * Image request:
   * FormData is required because files cannot be sent as normal JSON.
   */
  if (imageFile) {
    const formData = new FormData();

    formData.append("message", message || "");

    if (sessionId) {
      formData.append("sessionId", sessionId);
    }

    formData.append("image", imageFile);

    const response = await api.post(`/ai/chat/${accountId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Important:
        // Axios/browser will set the correct multipart boundary automatically.
        // If this causes issues, remove this Content-Type line.
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Text-only request:
   * Normal JSON body is enough.
   */
  const response = await api.post(
    `/ai/chat/${accountId}`,
    {
      message,
      sessionId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/**
 * Get all chat sessions for selected social account.
 *
 * Used by Chat History Sidebar.
 *
 * @param {string} socialAccountId - Selected social account id
 * @param {string} token - JWT token
 */
export const getChatSessions = async (socialAccountId, token) => {
  const response = await api.get(`/ai/chat/sessions/${socialAccountId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Get all messages of selected chat session.
 *
 * Used when user clicks an old chat from sidebar.
 *
 * @param {string} sessionId - Chat session id
 * @param {string} token - JWT token
 */
export const getSessionMessages = async (sessionId, token) => {
  const response = await api.get(`/ai/chat/session/${sessionId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Rename chat session title.
 *
 * @param {string} sessionId - Chat session id
 * @param {string} title - New session title
 * @param {string} token - JWT token
 */
export const renameChatSession = async (sessionId, title, token) => {
  const response = await api.patch(
    `/ai/chat/session/${sessionId}`,
    { title },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/**
 * Delete chat session and its messages.
 *
 * @param {string} sessionId - Chat session id
 * @param {string} token - JWT token
 */
export const deleteChatSession = async (sessionId, token) => {
  const response = await api.delete(`/ai/chat/session/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};