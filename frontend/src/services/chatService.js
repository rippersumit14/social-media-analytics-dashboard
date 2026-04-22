import api from "./api";

/**
 * Send message to backend AI chat API
 */
export const chatWithAI = async (accountId, message, token) => {
  const response = await api.post(
    `/ai/chat/${accountId}`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};