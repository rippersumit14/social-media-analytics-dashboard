import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Square } from "lucide-react";

export function ChatInput({ disabled, isSending, onSend, onStop }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  function submit() {
    const message = value.trim();

    if (!message || disabled || isSending) {
      return;
    }

    onSend(message);
    setValue("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-[var(--app-border)] bg-[var(--app-paper)] p-3 sm:p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-2 shadow-sm shadow-black/5 focus-within:border-[var(--app-primary)] focus-within:ring-4 focus-within:ring-[var(--app-ring)]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          maxLength={50000}
          className="max-h-44 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] disabled:cursor-not-allowed"
          placeholder={disabled ? "Create or select a conversation first" : "Ask about your content, analytics, or growth plan..."}
        />
        {isSending ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] text-[var(--app-text)] transition hover:bg-[var(--app-elevated)]"
            aria-label="Stop streaming response"
          >
            <Square aria-hidden="true" size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary)] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <SendHorizontal aria-hidden="true" size={19} />
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 max-w-4xl text-xs text-[var(--app-muted)]">Enter to send, Shift + Enter for a new line.</p>
    </div>
  );
}
