import api from "./api.js";

/**
 * Send normal non-streaming AI chat request.
 */
export const chatWithAI = async (
  accountId,
  message,
  token,
  sessionId = null,
  imageFile = null
) => {
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
      },
    });

    return response.data;
  }

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
 */
export const deleteChatSession = async (sessionId, token) => {
  const response = await api.delete(`/ai/chat/session/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/**
 * Stream AI chat response.
 *
 * Uses fetch because browser streaming works better with fetch than Axios.
 */
export const streamChatWithAI = async ({
  accountId,
  message,
  token,
  sessionId = null,
  imageFile = null,
  onSession,
  onModel,
  onChunk,
  onDone,
  onError,
}) => {
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const formData = new FormData();

  formData.append("message", message || "");

  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await fetch(`${API_URL}/ai/chat/${accountId}/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok || !response.body) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Streaming request failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  const handleEventBlock = (block) => {
    const eventLine = block
      .split("\n")
      .find((line) => line.startsWith("event:"));

    const dataLine = block
      .split("\n")
      .find((line) => line.startsWith("data:"));

    if (!eventLine || !dataLine) return;

    const event = eventLine.replace("event:", "").trim();
    const data = JSON.parse(dataLine.replace("data:", "").trim());

    if (event === "session") onSession?.(data);
    if (event === "model") onModel?.(data);
    if (event === "chunk") onChunk?.(data.chunk);
    if (event === "done") onDone?.(data);
    if (event === "error") onError?.(data);
  };

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() || "";

    for (const block of blocks) {
      handleEventBlock(block);
    }
  }

  if (buffer.trim()) {
    handleEventBlock(buffer);
  }
};