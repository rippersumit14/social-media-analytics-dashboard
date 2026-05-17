import api from "./api.js";

/**
 * Build multipart/form-data payload
 * for multimodal AI chat requests.
 *
 * Backend contract:
 * - message
 * - sessionId (optional)
 * - images[] (multiple)
 */
const buildChatFormData = ({
  message,
  sessionId,
  images = [],
}) => {
  const formData = new FormData();

  /**
   * Backend always expects message field.
   */
  formData.append(
    "message",
    message || ""
  );

  /**
   * Existing session support.
   */
  if (sessionId) {
    formData.append(
      "sessionId",
      sessionId
    );
  }

  /**
   * Multiple image uploads.
   */
  images.forEach(
    (imageFile) => {
      formData.append(
        "images",
        imageFile
      );
    }
  );

  return formData;
};

/**
 * Normalize backend AI response.
 *
 * Creates stable frontend-safe
 * contract layer.
 */
const normalizeAIResponse = (
  data = {}
) => {
  return {
    success:
      data.success || false,

    /**
     * Session metadata.
     */
    sessionId:
      data.sessionId || null,

    sessionTitle:
      data.sessionTitle || "",

    /**
     * Stable assistant message.
     */
    assistantMessage:
      data.assistantMessage ||
      null,

    /**
     * Stable user message.
     */
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
 * Stable non-streaming AI request.
 *
 * Used as:
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
        }
      );

    return normalizeAIResponse(
      response.data
    );
  };

/**
 * Production-grade SSE AI streaming.
 *
 * Handles:
 * - session events
 * - model events
 * - chunk streaming
 * - done lifecycle
 * - error lifecycle
 *
 * Backend SSE contract:
 * event: session
 * event: model
 * event: chunk
 * event: done
 * event: error
 */
export const streamAIChat =
  async ({
    accountId,
    token,

    message = "",
    sessionId = null,
    images = [],

    /**
     * SSE callbacks.
     */
    onSession,

    onModel,

    onChunk,

    onDone,

    onError,
  }) => {
    /**
     * Build form payload.
     */
    const formData =
      buildChatFormData({
        message,
        sessionId,
        images,
      });

    /**
     * API base URL.
     */
    const API_URL =
      import.meta.env
        .VITE_API_URL ||
      "http://localhost:5000/api";

    /**
     * Start SSE request.
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
        }
      );

    /**
     * SSE-safe error handling.
     */
    if (
      !response.ok ||
      !response.body
    ) {
      let errorMessage =
        "Streaming failed.";

      try {
        const errorData =
          await response.json();

        errorMessage =
          errorData?.message ||
          errorMessage;
      } catch {
        /**
         * Ignore JSON parsing failures.
         */
      }

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
      new TextDecoder(
        "utf-8"
      );

    let buffer = "";

    /**
     * Parse individual SSE block.
     */
    const processEventBlock =
      (block) => {
        const lines =
          block.split("\n");

        const eventLine =
          lines.find(
            (line) =>
              line.startsWith(
                "event:"
              )
          );

        const dataLine =
          lines.find(
            (line) =>
              line.startsWith(
                "data:"
              )
          );

        if (
          !eventLine ||
          !dataLine
        ) {
          return;
        }

        const event =
          eventLine
            .replace(
              "event:",
              ""
            )
            .trim();

        let parsedData =
          {};

        try {
          parsedData =
            JSON.parse(
              dataLine
                .replace(
                  "data:",
                  ""
                )
                .trim()
            );
        } catch (
          parseError
        ) {
          console.error(
            "SSE parse error:",
            parseError
          );

          return;
        }

        /**
         * Route SSE events.
         */
        switch (event) {
          case "session":
            onSession?.(
              parsedData
            );
            break;

          case "model":
            onModel?.(
              parsedData
            );
            break;

          case "chunk":
            onChunk?.(
              parsedData
            );
            break;

          case "done":
            onDone?.(
              normalizeAIResponse(
                parsedData
              )
            );
            break;

          case "error":
            onError?.(
              parsedData
            );
            break;

          default:
            break;
        }
      };

    /**
     * Continuous stream parsing.
     */
    while (true) {
      const {
        done,
        value,
      } =
        await reader.read();

      if (done) {
        break;
      }

      /**
       * Append incoming stream.
       */
      buffer +=
        decoder.decode(
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
       * Process complete blocks.
       */
      for (const block of blocks) {
        processEventBlock(
          block
        );
      }
    }

    /**
     * Flush remaining buffer.
     */
    if (buffer.trim()) {
      processEventBlock(
        buffer
      );
    }
  };