import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-950 text-white">
        <Bot aria-hidden="true" size={18} />
      </div>
      <div className="rounded-2xl rounded-bl-md border border-line-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-ink-500 [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}
