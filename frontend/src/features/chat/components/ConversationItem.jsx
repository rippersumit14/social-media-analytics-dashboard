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
        isActive ? "border-brand-600 bg-blue-50" : "border-transparent hover:border-line-200 hover:bg-cloud-50",
      ].join(" ")}
    >
      {isEditing ? (
        <form onSubmit={submitRename} className="space-y-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-9 w-full rounded-lg border border-line-200 bg-white px-3 text-sm text-ink-950 outline-none focus:border-brand-600"
            maxLength={120}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-brand-600 text-xs font-semibold text-white"
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
              className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-line-200 text-xs font-semibold text-ink-700"
            >
              <X aria-hidden="true" size={14} />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={onSelect} className="block w-full text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700">
              <MessageSquare aria-hidden="true" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-950">{conversation.title || "New Chat"}</p>
              <p className="mt-1 truncate text-xs text-ink-500">{formatDateTime(conversation.lastMessageAt || conversation.updatedAt)}</p>
            </div>
          </div>
        </button>
      )}

      {!isEditing ? (
        <div className="mt-3 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <span className="mr-auto flex items-center gap-1 text-xs text-ink-500">
            <MoreHorizontal aria-hidden="true" size={14} />
            Manage
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-white hover:text-ink-950"
            aria-label={`Rename ${conversation.title || "conversation"}`}
          >
            <Pencil aria-hidden="true" size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(conversation._id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-700"
            aria-label={`Delete ${conversation.title || "conversation"}`}
          >
            <Trash2 aria-hidden="true" size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
