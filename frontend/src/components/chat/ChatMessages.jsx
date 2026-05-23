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
 * - empty states
 * - streaming-safe rendering
 * - responsive overflow handling
 */
const ChatMessages = ({
  messages = [],

  chatLoading = false,

  emptyTitle = "Start a conversation",

  emptyDescription = "Ask about analytics, growth, engagement, strategy, or upload images for AI analysis.",
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
   * Smart auto-scroll behavior.
   *
   * Prevents excessive scrolling
   * during rapid chunk updates.
   */
  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    /**
     * Detect if user is near bottom.
     */
    const isNearBottom =
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      120;

    /**
     * Only auto-scroll when:
     * - new messages arrive
     * - user already near bottom
     */
    const hasNewMessage =
      messages.length >
      previousMessageCountRef.current;

    if (
      hasNewMessage ||
      isNearBottom
    ) {
      messagesEndRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "end",
        }
      );
    }

    previousMessageCountRef.current =
      messages.length;
  }, [
    messages.length,
    chatLoading,
  ]);

  return (
    <div
      ref={containerRef}
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