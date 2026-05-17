import {
  useEffect,
  useRef,
} from "react";

import ChatMessage from "./ChatMessage.jsx";

/**
 * Production-grade chat messages container.
 *
 * Handles:
 * - auto-scroll
 * - empty states
 * - message rendering
 * - loading synchronization
 */
const ChatMessages = ({
  messages = [],

  chatLoading = false,

  emptyTitle = "Start a conversation",

  emptyDescription = "Ask about analytics, growth, engagement, strategy, or upload images for AI analysis.",
}) => {
  /**
   * Bottom scroll anchor.
   */
  const messagesEndRef =
    useRef(null);

  /**
   * Auto-scroll on new messages.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
      }
    );
  }, [
    messages,
    chatLoading,
  ]);

  /**
   * Empty state.
   */
  const showEmptyState =
    messages.length === 0 &&
    !chatLoading;

  return (
    <div className="h-[550px] overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-4">
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
         * Messages list.
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

export default ChatMessages;