import { NoteCard } from "./NoteCard";

export function NotesGrid({ notes, actionLoading, onEdit, onTogglePin, onToggleArchive, onDelete }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note._id || note.id}
          note={note}
          actionLoading={actionLoading(note)}
          onEdit={onEdit}
          onTogglePin={onTogglePin}
          onToggleArchive={onToggleArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
