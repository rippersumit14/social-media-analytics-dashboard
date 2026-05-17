import { useState } from "react";

import {
  sendAIChat,
  streamAIChat,
} from "../services/aiChatService.js";

/**
 * Production-grade AI lifecycle hook.
 *
 * Architecture:
 *
 * TRY STREAM
 * → if fail
 * → fallback to normal endpoint
 *
 * Supports:
 * - live chunk streaming
 * - multimodal uploads
 * - usage tracking
 * - assistant replacement
 */
const useAIChat = ({
  token,

  selectedAccount,

  activeSessionId,

  setActiveSessionId,

  setSessionTitle,

  setMessages,

  loadSessions,
}) => {
  /**
   * User input state.
   */
  const [input, setInput] =
    useState("");

  /**
   * AI lifecycle state.
   */
  const [chatLoading, setChatLoading] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [chatError, setChatError] =
    useState("");

  /**
   * AI metadata.
   */
  const [modelName, setModelName] =
    useState("");

  const [latencyMs, setLatencyMs] =
    useState(null);

  /**
   * Usage tracking.
   */
  const [usageInfo, setUsageInfo] =
    useState(null);

  const [remainingUsage, setRemainingUsage] =
    useState(null);

  /**
   * Prevent excessive memory growth.
   */
  const limitMessages = (
    messages,
    max = 100
  ) => {
    if (
      messages.length <= max
    ) {
      return messages;
    }

    return messages.slice(
      messages.length - max
    );
  };

  /**
   * Send AI message.
   */
  const sendMessage =
    async ({
      message,

      selectedImages = [],

      clearImages,
    }) => {
      const trimmedMessage =
        message.trim();

      /**
       * Prevent invalid requests.
       */
      if (
        (!trimmedMessage &&
          selectedImages.length ===
            0) ||
        !selectedAccount ||
        !token ||
        chatLoading
      ) {
        return;
      }

      /**
       * User-visible content.
       */
      const userVisibleContent =
        trimmedMessage ||
        "Uploaded image(s) for analysis.";

      /**
       * Optimistic user message.
       */
      const optimisticUserMessage =
        {
          id: crypto.randomUUID(),

          role: "user",

          content:
            userVisibleContent,

          images:
            selectedImages.map(
              (image) => ({
                imageUrl:
                  image.preview,
              })
            ),
        };

      /**
       * Streaming assistant placeholder.
       */
      const assistantMessageId =
        crypto.randomUUID();

      const loadingAssistantMessage =
        {
          id: assistantMessageId,

          role: "assistant",

          content: "",

          images: [],

          isLoading: true,
        };

      /**
       * Instant UI update.
       */
      setMessages((prev) =>
        limitMessages([
          ...prev,
          optimisticUserMessage,
          loadingAssistantMessage,
        ])
      );

      /**
       * Reset lifecycle.
       */
      setInput("");

      setChatError("");

      setChatLoading(true);

      setIsUploading(true);

      /**
       * Shared helper:
       * replace assistant bubble.
       */
      const replaceAssistantMessage =
        (
          updater
        ) => {
          setMessages((prev) =>
            prev.map(
              (message) =>
                message.id ===
                assistantMessageId
                  ? updater(
                      message
                    )
                  : message
            )
          );
        };

      try {
        /**
         * =========================
         * TRY STREAMING FIRST
         * =========================
         */
        let streamedContent =
          "";

        await streamAIChat({
          accountId:
            selectedAccount._id,

          token,

          message:
            trimmedMessage,

          sessionId:
            activeSessionId,

          images:
            selectedImages.map(
              (image) =>
                image.file
            ),

          /**
           * Session events.
           */
          onSession: (
            data
          ) => {
            if (
              data.sessionId
            ) {
              setActiveSessionId(
                data.sessionId
              );
            }

            if (
              data.sessionTitle
            ) {
              setSessionTitle(
                data.sessionTitle
              );
            }
          },

          /**
           * Model events.
           */
          onModel: (
            data
          ) => {
            if (
              data.modelName
            ) {
              setModelName(
                data.modelName
              );
            }
          },

          /**
           * Live chunk streaming.
           */
          onChunk: (
            data
          ) => {
            streamedContent +=
              data.chunk || "";

            replaceAssistantMessage(
              (
                message
              ) => ({
                ...message,

                content:
                  streamedContent,

                isLoading: false,
              })
            );
          },

          /**
           * Final stream lifecycle.
           */
          onDone: async (
            data
          ) => {
            /**
             * Replace final assistant.
             */
            replaceAssistantMessage(
              () => ({
                ...(data.assistantMessage ||
                  {}),

                id:
                  assistantMessageId,

                content:
                  streamedContent,

                isLoading: false,
              })
            );

            /**
             * Sync sessions.
             */
            if (
              data.sessionId
            ) {
              setActiveSessionId(
                data.sessionId
              );
            }

            if (
              data.sessionTitle
            ) {
              setSessionTitle(
                data.sessionTitle
              );
            }

            /**
             * AI metadata.
             */
            setModelName(
              data.modelName ||
                ""
            );

            setLatencyMs(
              data.latencyMs ||
                null
            );

            /**
             * Usage tracking.
             */
            setUsageInfo(
              data.usage ||
                null
            );

            setRemainingUsage(
              data.remainingUsage ??
                null
            );

            /**
             * Refresh sidebar.
             */
            await loadSessions(
              selectedAccount._id
            );
          },

          /**
           * Stream event errors.
           */
          onError: (
            data
          ) => {
            throw new Error(
              data?.message ||
                "Streaming failed."
            );
          },
        });

        /**
         * Cleanup uploads.
         */
        clearImages?.();
      } catch (
        streamingError
      ) {
        console.error(
          "Streaming failed. Falling back:",
          streamingError
        );

        /**
         * =========================
         * FALLBACK MODE
         * =========================
         */
        try {
          const response =
            await sendAIChat({
              accountId:
                selectedAccount._id,

              token,

              message:
                trimmedMessage,

              sessionId:
                activeSessionId,

              images:
                selectedImages.map(
                  (
                    image
                  ) =>
                    image.file
                ),
            });

          /**
           * Replace assistant.
           */
          replaceAssistantMessage(
            () => ({
              ...(response.assistantMessage ||
                {}),

              id:
                assistantMessageId,

              isLoading: false,
            })
          );

          /**
           * Session sync.
           */
          if (
            response.sessionId
          ) {
            setActiveSessionId(
              response.sessionId
            );
          }

          if (
            response.sessionTitle
          ) {
            setSessionTitle(
              response.sessionTitle
            );
          }

          /**
           * AI metadata.
           */
          setModelName(
            response.modelName ||
              ""
          );

          setLatencyMs(
            response.latencyMs ||
              null
          );

          /**
           * Usage tracking.
           */
          setUsageInfo(
            response.usage ||
              null
          );

          setRemainingUsage(
            response.remainingUsage ??
              null
          );

          /**
           * Refresh sidebar.
           */
          await loadSessions(
            selectedAccount._id
          );

          /**
           * Cleanup uploads.
           */
          clearImages?.();
        } catch (
          fallbackError
        ) {
          console.error(
            "Fallback AI error:",
            fallbackError
          );

          const cleanError =
            fallbackError
              ?.response?.data
              ?.message ||
            fallbackError.message ||
            "Failed to generate AI response.";

          setChatError(
            cleanError
          );

          /**
           * Convert assistant bubble
           * into error state.
           */
          replaceAssistantMessage(
            (
              message
            ) => ({
              ...message,

              content:
                cleanError,

              isLoading: false,

              isError: true,
            })
          );
        }
      } finally {
        /**
         * Reset lifecycle.
         */
        setChatLoading(false);

        setIsUploading(false);
      }
    };

  return {
    /**
     * State.
     */
    input,

    setInput,

    chatLoading,

    isUploading,

    chatError,

    modelName,

    latencyMs,

    usageInfo,

    remainingUsage,

    /**
     * Actions.
     */
    sendMessage,
  };
};

export default useAIChat;