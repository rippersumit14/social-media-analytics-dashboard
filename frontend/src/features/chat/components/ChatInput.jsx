import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";

export function ChatInput({ disabled, isSending, onSend }) {
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
    <div className="border-t border-line-200 bg-white p-3 sm:p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-line-200 bg-cloud-50 p-2 shadow-sm focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-blue-100">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          maxLength={50000}
          className="max-h-44 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-ink-950 outline-none placeholder:text-ink-500 disabled:cursor-not-allowed"
          placeholder={disabled ? "Create or select a conversation first" : "Ask about your content, analytics, or growth plan..."}
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || isSending || !value.trim()}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <SendHorizontal aria-hidden="true" size={19} />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-4xl text-xs text-ink-500">Enter to send, Shift + Enter for a new line.</p>
    </div>
  );
}
