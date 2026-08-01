import { Bot, Copy, User } from "lucide-react";
import toast from "react-hot-toast";

import { formatDateTime } from "../../../utils/formatters";
import { MarkdownText } from "./MarkdownText";

export function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content || "");
    toast.success("Message copied.");
  }

  return (
    <article className={["flex gap-3", isUser ? "justify-end" : "justify-start"].join(" ")}>
      {!isUser ? (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-text)] text-[var(--app-paper)]">
          <Bot aria-hidden="true" size={18} />
        </div>
      ) : null}

      <div className={["group max-w-[min(46rem,100%)]", isUser ? "items-end" : "items-start"].join(" ")}>
        <div
          className={[
            "rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
            isUser ? "rounded-br-md bg-[var(--app-primary)] text-white" : "rounded-bl-md border border-[var(--app-border)] bg-[var(--app-paper)] text-[var(--app-text)]",
          ].join(" ")}
        >
          {isAssistant ? <MarkdownText content={message.content} /> : <p className="whitespace-pre-wrap">{message.content}</p>}
        </div>
        <div className={["mt-2 flex items-center gap-2 text-xs text-[var(--app-muted)]", isUser ? "justify-end" : "justify-start"].join(" ")}>
          <span>{formatDateTime(message.createdAt)}</span>
          <button
            type="button"
            onClick={copyMessage}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg opacity-100 hover:bg-[var(--app-bg)] sm:opacity-0 sm:transition sm:group-hover:opacity-100"
            aria-label="Copy message"
          >
            <Copy aria-hidden="true" size={14} />
          </button>
        </div>
        {isAssistant && (message.model || message.provider) ? (
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            {[message.provider, message.model].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      {isUser ? (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-paper)] text-[var(--app-primary)]">
          <User aria-hidden="true" size={18} />
        </div>
      ) : null}
    </article>
  );
}
