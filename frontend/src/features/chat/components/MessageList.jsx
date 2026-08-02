import { useEffect, useRef } from "react";

import { ErrorPanel } from "../../../components/ui/ErrorPanel";
import { LoadingCard } from "../../../components/ui/LoadingCard";
import { getApiErrorMessage } from "../../../utils/apiError";
import { EmptyChatState } from "./EmptyChatState";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export function MessageList({
  account,
  activeConversationId,
  error,
  isCreatingConversation,
  isLoading,
  isSending,
  messages,
  onCreateConversation,
  streamError,
  streamModel,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
        <LoadingCard rows={4} />
        <LoadingCard rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <ErrorPanel title="Unable to load messages" message={getApiErrorMessage(error, "Message history could not be loaded.")} />
      </div>
    );
  }

  if (!activeConversationId || messages.length === 0) {
    return (
      <EmptyChatState
        hasAccount={Boolean(account)}
        hasConversation={Boolean(activeConversationId)}
        isCreating={isCreatingConversation}
        onCreateConversation={onCreateConversation}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      {messages.map((message) => (
        <MessageBubble key={message._id} message={message} />
      ))}
      {streamModel && isSending ? (
        <p className="text-center text-xs text-[var(--app-muted)]">
          Streaming with {streamModel}
        </p>
      ) : null}
      {streamError ? (
        <ErrorPanel title="AI response failed" message={streamError} />
      ) : null}
      {isSending ? <TypingIndicator /> : null}
      <div ref={bottomRef} />
    </div>
  );
}
