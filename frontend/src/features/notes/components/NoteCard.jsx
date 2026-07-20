import { Archive, ArchiveRestore, Edit3, Pin, PinOff, Trash2 } from "lucide-react";

import { StatusBadge } from "../../../components/ui/StatusBadge";
import { formatDateTime } from "../../../utils/formatters";
import { NoteCategoryBadge } from "./NoteCategoryBadge";

function previewContent(content) {
  const normalizedContent = String(content || "").trim();

  if (normalizedContent.length <= 260) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, 260).trim()}...`;
}

export function NoteCard({ note, actionLoading, onEdit, onTogglePin, onToggleArchive, onDelete }) {
  const noteTitle = note.title || "Untitled note";
  const isBusy = Boolean(actionLoading);

  return (
    <article className={["rounded-lg border bg-white p-5 shadow-sm", note.isArchived ? "border-amber-200" : "border-line-200"].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <NoteCategoryBadge category={note.category} />
            {note.isPinned ? <StatusBadge variant="warning">Pinned</StatusBadge> : null}
            {note.isArchived ? <StatusBadge variant="neutral">Archived</StatusBadge> : null}
          </div>
          <h2 className="mt-3 break-words text-base font-semibold text-ink-950">{noteTitle}</h2>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-ink-700">{previewContent(note.content) || "No note content."}</p>

      <p className="mt-4 text-xs text-ink-500">Updated {formatDateTime(note.updatedAt || note.createdAt)}</p>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line-200 pt-4">
        <button
          type="button"
          onClick={() => onEdit(note)}
          disabled={isBusy}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line-200 px-3 text-xs font-semibold text-ink-700 transition hover:bg-cloud-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Edit3 aria-hidden="true" size={15} />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onTogglePin(note)}
          disabled={isBusy || note.isArchived}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line-200 px-3 text-xs font-semibold text-ink-700 transition hover:bg-cloud-50 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={note.isPinned ? `Unpin ${noteTitle}` : `Pin ${noteTitle}`}
        >
          {note.isPinned ? <PinOff aria-hidden="true" size={15} /> : <Pin aria-hidden="true" size={15} />}
          {note.isPinned ? "Unpin" : "Pin"}
        </button>
        <button
          type="button"
          onClick={() => onToggleArchive(note)}
          disabled={isBusy}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line-200 px-3 text-xs font-semibold text-ink-700 transition hover:bg-cloud-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {note.isArchived ? <ArchiveRestore aria-hidden="true" size={15} /> : <Archive aria-hidden="true" size={15} />}
          {note.isArchived ? "Restore" : "Archive"}
        </button>
        <button
          type="button"
          onClick={() => onDelete(note)}
          disabled={isBusy}
          className="ml-auto inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 aria-hidden="true" size={15} />
          Delete
        </button>
      </div>
    </article>
  );
}
