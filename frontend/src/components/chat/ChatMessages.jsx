import {
  memo,
  useEffect,
  useMemo,
  useRef,
} from "react";

import ChatMessage from "./ChatMessage.jsx";

/**
 * -------------------------------------------------------
 * Production-grade chat messages container.
 * -------------------------------------------------------
 *
 * Handles:
 * - SSE token rendering
 * - stream-safe auto-scroll
 * - near-bottom protection
 * - rendering optimization
 * - large history stabilization
 * - stale render prevention
 * - retry-safe streaming UX
 */
const ChatMessages = ({
  messages = [],

  chatLoading = false,

  emptyTitle =
    "Start a conversation",

  emptyDescription =
    "Ask AI about analytics, engagement, growth, OCR insights, or upload images for multimodal analysis.",
}) => {
  /**
   * -------------------------------------------------------
   * Scroll container.
   * -------------------------------------------------------
   */
  const containerRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Bottom scroll anchor.
   * -------------------------------------------------------
   */
  const messagesEndRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Previous message tracking.
   * -------------------------------------------------------
   */
  const previousMessageCountRef =
    useRef(messages.length);

  /**
   * -------------------------------------------------------
   * Animation frame synchronization.
   * -------------------------------------------------------
   */
  const animationFrameRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Mounted protection.
   * -------------------------------------------------------
   */
  const mountedRef =
    useRef(true);

  /**
   * -------------------------------------------------------
   * Cleanup lifecycle.
   * -------------------------------------------------------
   */
  useEffect(() => {
    return () => {
      mountedRef.current =
        false;

      cancelAnimationFrame(
        animationFrameRef.current
      );
    };
  }, []);

  /**
   * -------------------------------------------------------
   * Empty state lifecycle.
   * -------------------------------------------------------
   */
  const showEmptyState =
    useMemo(() => {
      return (
        messages.length ===
          0 &&
        !chatLoading
      );
    }, [
      messages.length,
      chatLoading,
    ]);

  /**
   * -------------------------------------------------------
   * Active streaming detection.
   * -------------------------------------------------------
   */
  const isStreaming =
    useMemo(() => {
      return messages.some(
        (message) =>
          message?.isStreaming
      );
    }, [messages]);

  /**
   * -------------------------------------------------------
   * Stable rendered messages.
   * -------------------------------------------------------
   *
   * IMPORTANT:
   * Prevent malformed/stale
   * message rendering.
   */
  const renderedMessages =
    useMemo(() => {
      const seenIds =
        new Set();

      return messages.filter(
        (message) => {
          /**
           * Ignore malformed entries.
           */
          if (
            !message ||
            typeof message !==
              "object"
          ) {
            return false;
          }

          /**
           * Stable message ID.
           */
          const messageId =
            message._id ||
            message.id;

          /**
           * Prevent duplicate render.
           */
          if (
            messageId &&
            seenIds.has(
              messageId
            )
          ) {
            return false;
          }

          if (messageId) {
            seenIds.add(
              messageId
            );
          }

          return true;
        }
      );
    }, [messages]);

  /**
   * -------------------------------------------------------
   * Stream-safe auto-scroll lifecycle.
   * -------------------------------------------------------
   */
  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    /**
     * Detect near-bottom safely.
     *
     * Prevent aggressive scrolling
     * when reading older messages.
     */
    const isNearBottom =
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      180;

    /**
     * Detect new message append.
     */
    const hasNewMessage =
      renderedMessages.length >
      previousMessageCountRef.current;

    /**
     * Scroll conditions.
     */
    const shouldScroll =
      hasNewMessage ||
      (isStreaming &&
        isNearBottom);

    if (
      shouldScroll
    ) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current =
        requestAnimationFrame(
          () => {
            if (
              !mountedRef.current
            ) {
              return;
            }

            messagesEndRef.current?.scrollIntoView(
              {
                behavior:
                  isStreaming
                    ? "auto"
                    : "smooth",

                block: "end",
              }
            );
          }
        );
    }

    previousMessageCountRef.current =
      renderedMessages.length;

    return () => {
      cancelAnimationFrame(
        animationFrameRef.current
      );
    };
  }, [
    renderedMessages,
    isStreaming,
    chatLoading,
  ]);

  return (
    <div
      ref={containerRef}
      data-testid="chat-messages-container"
      className="h-[600px] overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4"
    >
      {/* ------------------------------------------------ */}
      {/* Empty State */}
      {/* ------------------------------------------------ */}
      {showEmptyState ? (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-xl text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {emptyTitle}
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-500">
              {
                emptyDescription
              }
            </p>
          </div>
        </div>
      ) : (
        /**
         * ---------------------------------------------------
         * Stable message rendering.
         * ---------------------------------------------------
         */
        <div className="space-y-5">
          {renderedMessages.map(
            (
              message,
              index
            ) => (
              <ChatMessage
                key={
                  message._id ||
                  message.id ||
                  `${message.role}-${index}`
                }
                message={
                  message
                }
              />
            )
          )}

          {/* ------------------------------------------------ */}
          {/* Scroll Anchor */}
          {/* ------------------------------------------------ */}
          <div
            ref={
              messagesEndRef
            }
          />
        </div>
      )}
    </div>
  );
};

export default memo(
  ChatMessages
);