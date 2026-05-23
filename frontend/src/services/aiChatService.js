import api from "./api.js";

/**
 * Stable SSE event registry.
 * Prevents magic strings across app.
 */
export const SSE_EVENTS = {
  SESSION: "session",
  USER_MESSAGE: "userMessage",
  MODEL: "model",
  CHUNK: "chunk",
  DONE: "done",
  ERROR: "error",
};

/**
 * Build multipart AI payload.
 */
const buildChatFormData = ({
  message,
  sessionId,
  images = [],
}) => {
  const formData = new FormData();

  formData.append(
    "message",
    message || ""
  );

  if (sessionId) {
    formData.append(
      "sessionId",
      sessionId
    );
  }

  /**
   * Multiple image uploads.
   */
  images.forEach((imageFile) => {
    formData.append(
      "images",
      imageFile
    );
  });

  return formData;
};

/**
 * Stable backend response adapter.
 * Protects frontend from backend shape drift.
 */
const normalizeAIResponse = (
  data = {}
) => {
  return {
    success:
      Boolean(data.success),

    /**
     * Session metadata.
     */
    sessionId:
      data.sessionId || null,

    sessionTitle:
      data.sessionTitle || "",

    /**
     * Messages.
     */
    assistantMessage:
      data.assistantMessage ||
      null,

    userMessage:
      data.userMessage || null,

    /**
     * AI metadata.
     */
    modelUsed:
      data.modelUsed || "",

    modelName:
      data.modelName || "",

    latencyMs:
      data.latencyMs || null,

    /**
     * Usage tracking.
     */
    usage:
      data.usage || null,

    remainingUsage:
      data.remainingUsage ??
      null,
  };
};

/**
 * Extract safe API error message.
 */
const extractErrorMessage = async (
  response
) => {
  try {
    const errorData =
      await response.json();

    return (
      errorData?.message ||
      "Request failed."
    );
  } catch {
    return "Request failed.";
  }
};

/**
 * Production-safe non-streaming AI request.
 *
 * Used for:
 * - fallback mode
 * - backup lifecycle
 */
export const sendAIChat =
  async ({
    accountId,
    token,
    message = "",
    sessionId = null,
    images = [],
  }) => {
    const formData =
      buildChatFormData({
        message,
        sessionId,
        images,
      });

    const response =
      await api.post(
        `/ai/chat/${accountId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          timeout: 120000,
        }
      );

    return normalizeAIResponse(
      response.data
    );
  };

/**
 * Parse raw SSE block safely.
 */
const parseSSEBlock = (block) => {
  const lines =
    block.split("\n");

  const eventLine =
    lines.find((line) =>
      line.startsWith("event:")
    );

  const dataLine =
    lines.find((line) =>
      line.startsWith("data:")
    );

  if (!eventLine || !dataLine) {
    return null;
  }

  const event =
    eventLine
      .replace("event:", "")
      .trim();

  try {
    const parsedData = JSON.parse(
      dataLine
        .replace("data:", "")
        .trim()
    );

    return {
      event,
      data: parsedData,
    };
  } catch (error) {
    console.error(
      "SSE JSON parse failed:",
      error
    );

    return null;
  }
};

/**
 * Route SSE events safely.
 */
const handleSSEEvent = ({
  event,
  data,
  handlers,
}) => {
  switch (event) {
    case SSE_EVENTS.SESSION:
      handlers.onSession?.(data);
      break;

    case SSE_EVENTS.MODEL:
      handlers.onModel?.(data);
      break;

    case SSE_EVENTS.CHUNK:
      handlers.onChunk?.(data);
      break;

    case SSE_EVENTS.DONE:
      handlers.onDone?.(
        normalizeAIResponse(data)
      );
      break;

    case SSE_EVENTS.ERROR:
      handlers.onError?.(data);
      break;

    default:
      break;
  }
};

/**
 * Production-grade SSE streaming lifecycle.
 */
export const streamAIChat =
  async ({
    accountId,
    token,

    message = "",
    sessionId = null,
    images = [],

    /**
     * Abort support.
     */
    signal,

    /**
     * SSE callbacks.
     */
    onSession,
    onModel,
    onChunk,
    onDone,
    onError,
  }) => {
    const formData =
      buildChatFormData({
        message,
        sessionId,
        images,
      });

    /**
     * Stable API base URL.
     */
    const API_URL =
      import.meta.env
        .VITE_API_URL ||
      "http://localhost:5000/api";

    /**
     * Start streaming request.
     */
    const response =
      await fetch(
        `${API_URL}/ai/chat/${accountId}/stream`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,

          signal,
        }
      );

    /**
     * Transport-level validation.
     */
    if (
      !response.ok ||
      !response.body
    ) {
      const errorMessage =
        await extractErrorMessage(
          response
        );

      throw new Error(
        errorMessage
      );
    }

    /**
     * Readable stream parser.
     */
    const reader =
      response.body.getReader();

    const decoder =
      new TextDecoder("utf-8");

    let buffer = "";

    /**
     * Centralized event handlers.
     */
    const handlers = {
      onSession,
      onModel,
      onChunk,
      onDone,
      onError,
    };

    try {
      /**
       * Continuous stream lifecycle.
       */
      while (true) {
        const {
          done,
          value,
        } =
          await reader.read();

        /**
         * Stream completed.
         */
        if (done) {
          break;
        }

        /**
         * Decode incoming chunks.
         */
        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        /**
         * Split SSE blocks.
         */
        const blocks =
          buffer.split("\n\n");

        /**
         * Preserve incomplete block.
         */
        buffer =
          blocks.pop() || "";

        /**
         * Process completed blocks.
         */
        for (const block of blocks) {
          const parsedBlock =
            parseSSEBlock(block);

          if (!parsedBlock) {
            continue;
          }

          handleSSEEvent({
            ...parsedBlock,
            handlers,
          });
        }
      }

      /**
       * Flush remaining buffer safely.
       */
      if (buffer.trim()) {
        const parsedBlock =
          parseSSEBlock(buffer);

        if (parsedBlock) {
          handleSSEEvent({
            ...parsedBlock,
            handlers,
          });
        }
      }
    } finally {
      /**
       * Prevent stream reader leaks.
       */
      reader.releaseLock();
    }
  };