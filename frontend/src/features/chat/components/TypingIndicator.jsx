import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--app-text)] text-[var(--app-paper)]">
        <Bot aria-hidden="true" size={18} />
      </div>
      <div className="rounded-2xl rounded-bl-md border border-[var(--app-border)] bg-[var(--app-paper)] px-4 py-3 shadow-sm shadow-black/5" aria-label="Assistant is thinking">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--app-muted)]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--app-muted)] [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--app-muted)] [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}
