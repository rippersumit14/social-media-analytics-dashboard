import {
  memo,
  useEffect,
  useMemo,
  useRef,
} from "react";

import ChatMessage from "./ChatMessage.jsx";

/**
 * Production-grade chat messages container.
 *
 * Responsibilities:
 * - stable auto-scroll
 * - stream synchronization
 * - chunk-safe rendering
 * - empty states
 * - responsive overflow handling
 * - streaming UX stabilization
 */
const ChatMessages = ({
  messages = [],

  chatLoading = false,

  emptyTitle =
    "Start a conversation",

  emptyDescription =
    "Ask about analytics, growth, engagement, strategy, or upload images for AI analysis.",
}) => {
  /**
   * Scroll container reference.
   */
  const containerRef =
    useRef(null);

  /**
   * Bottom scroll anchor.
   */
  const messagesEndRef =
    useRef(null);

  /**
   * Track previous message count.
   */
  const previousMessageCountRef =
    useRef(messages.length);

  /**
   * Animation frame synchronization.
   */
  const scrollFrameRef =
    useRef(null);

  /**
   * Prevent stale animation frames.
   */
  const mountedRef =
    useRef(true);

  /**
   * Empty chat state.
   */
  const showEmptyState =
    useMemo(() => {
      return (
        messages.length === 0 &&
        !chatLoading
      );
    }, [
      messages.length,
      chatLoading,
    ]);

  /**
   * Detect active streaming state.
   */
  const isStreaming =
    useMemo(() => {
      return messages.some(
        (message) =>
          message.isStreaming
      );
    }, [messages]);

  /**
   * Cleanup lifecycle.
   */
  useEffect(() => {
    return () => {
      mountedRef.current =
        false;

      cancelAnimationFrame(
        scrollFrameRef.current
      );
    };
  }, []);

  /**
   * Stream-aware auto-scroll lifecycle.
   *
   * Handles:
   * - new messages
   * - SSE chunk rendering
   * - streaming synchronization
   * - near-bottom protection
   */
  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    /**
     * Detect if user remains near bottom.
     *
     * Prevents aggressive scrolling
     * when user reads older messages.
     */
    const isNearBottom =
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      140;

    /**
     * Detect newly added messages.
     */
    const hasNewMessage =
      messages.length >
      previousMessageCountRef.current;

    /**
     * Auto-scroll conditions.
     */
    const shouldAutoScroll =
      hasNewMessage ||
      (isStreaming &&
        isNearBottom);

    if (
      shouldAutoScroll
    ) {
      /**
       * Prevent excessive scroll
       * thrashing during rapid
       * stream chunk updates.
       */
      cancelAnimationFrame(
        scrollFrameRef.current
      );

      scrollFrameRef.current =
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
      messages.length;
  }, [
    messages.length,
    isStreaming,
    chatLoading,
  ]);

  return (
    <div
      ref={containerRef}
      data-testid="chat-messages-container"
      className="h-[550px] overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-4"
    >
      {showEmptyState ? (
        /**
         * Empty chat state.
         */
        <div className="flex h-full items-center justify-center">
          <div className="max-w-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              {emptyTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {
                emptyDescription
              }
            </p>
          </div>
        </div>
      ) : (
        /**
         * Stable messages list.
         */
        <div className="space-y-5">
          {messages.map(
            (message) => (
              <ChatMessage
                key={
                  message.id
                }
                message={
                  message
                }
              />
            )
          )}

          {/* Scroll Anchor */}
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

/**
 * Prevent unnecessary rerenders.
 */
export default memo(
  ChatMessages
);