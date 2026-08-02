import { useState } from "react";
import { Check, MessageSquare, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";

import { formatDateTime } from "../../../utils/formatters";

export function ConversationItem({ conversation, isActive, onSelect, onRename, onDelete, isRenaming }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title || "New Chat");

  function submitRename(event) {
    event.preventDefault();

    const nextTitle = title.trim();

    if (!nextTitle || nextTitle === conversation.title) {
      setIsEditing(false);
      setTitle(conversation.title || "New Chat");
      return;
    }

    onRename({ conversationId: conversation._id, title: nextTitle });
    setIsEditing(false);
  }

  return (
    <div
      className={[
        "group rounded-lg border p-3 transition",
        isActive ? "border-[var(--app-primary)] bg-[var(--app-bg)]" : "border-transparent hover:border-[var(--app-border)] hover:bg-[var(--app-bg)]",
      ].join(" ")}
    >
      {isEditing ? (
        <form onSubmit={submitRename} className="space-y-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] px-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
            maxLength={120}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-[var(--app-primary)] text-xs font-semibold text-white"
              disabled={isRenaming}
            >
              <Check aria-hidden="true" size={14} />
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle(conversation.title || "New Chat");
                setIsEditing(false);
              }}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)]"
            >
              <X aria-hidden="true" size={14} />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={onSelect} className="block w-full text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-paper)] text-[var(--app-primary)]">
              <MessageSquare aria-hidden="true" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--app-text)]">{conversation.title || "New Chat"}</p>
              <p className="mt-1 truncate text-xs text-[var(--app-muted)]">{formatDateTime(conversation.lastMessageAt || conversation.updatedAt)}</p>
            </div>
          </div>
        </button>
      )}

      {!isEditing ? (
        <div className="mt-3 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <span className="mr-auto flex items-center gap-1 text-xs text-[var(--app-muted)]">
            <MoreHorizontal aria-hidden="true" size={14} />
            Manage
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-muted)] hover:bg-[var(--app-paper)] hover:text-[var(--app-text)]"
            aria-label={`Rename ${conversation.title || "conversation"}`}
          >
            <Pencil aria-hidden="true" size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(conversation._id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-muted)] hover:bg-red-500/10 hover:text-red-700"
            aria-label={`Delete ${conversation.title || "conversation"}`}
          >
            <Trash2 aria-hidden="true" size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
