import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { BrainCircuit, Plus } from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { SectionCard } from "../components/ui/SectionCard";
import { ConfirmDialog } from "../features/notes/components/ConfirmDialog";
import { NoteEditorModal } from "../features/notes/components/NoteEditorModal";
import { NotesEmptyState } from "../features/notes/components/NotesEmptyState";
import { NotesGrid } from "../features/notes/components/NotesGrid";
import { NotesSkeleton } from "../features/notes/components/NotesSkeleton";
import { NotesToolbar } from "../features/notes/components/NotesToolbar";
import { routePaths } from "../routes/routePaths";
import { notesService } from "../services/notesService";
import { getApiErrorMessage } from "../utils/apiError";

const EMPTY_NOTES = [];

function noteMatchesSearch(note, search) {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [note.title, note.content, note.category]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}

function noteMatchesView(note, view) {
  if (view === "archived") {
    return Boolean(note.isArchived);
  }

  if (view === "pinned") {
    return Boolean(note.isPinned) && !note.isArchived;
  }

  return !note.isArchived;
}

function sortNotes(notes, sort) {
  return [...notes].sort((firstNote, secondNote) => {
    if (firstNote.isPinned !== secondNote.isPinned) {
      return firstNote.isPinned ? -1 : 1;
    }

    const firstDate = new Date(firstNote.updatedAt || firstNote.createdAt || 0).getTime();
    const secondDate = new Date(secondNote.updatedAt || secondNote.createdAt || 0).getTime();

    return sort === "oldest" ? firstDate - secondDate : secondDate - firstDate;
  });
}

export default function Notes() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("active");
  const [sort, setSort] = useState("newest");
  const [editingNote, setEditingNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ["notes", "list"],
    queryFn: notesService.list,
    retry: false,
  });

  function invalidateNotes() {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  }

  const createNote = useMutation({
    mutationFn: notesService.create,
    onSuccess: () => {
      toast.success("Note created.");
      invalidateNotes();
      setIsEditorOpen(false);
      setEditingNote(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to create note."));
    },
  });

  const updateNote = useMutation({
    mutationFn: notesService.update,
    onSuccess: () => {
      toast.success("Note updated.");
      invalidateNotes();
      setIsEditorOpen(false);
      setEditingNote(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update note."));
    },
  });

  const togglePin = useMutation({
    mutationFn: (note) => (note.isPinned ? notesService.unpin(note._id) : notesService.pin(note._id)),
    onSuccess: (_, note) => {
      toast.success(note.isPinned ? "Note unpinned." : "Note pinned.");
      invalidateNotes();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update pin state."));
    },
  });

  const toggleArchive = useMutation({
    mutationFn: (note) => (note.isArchived ? notesService.unarchive(note._id) : notesService.archive(note._id)),
    onSuccess: (_, note) => {
      toast.success(note.isArchived ? "Note restored from archive." : "Note archived.");
      invalidateNotes();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to update archive state."));
    },
  });

  const deleteNote = useMutation({
    mutationFn: (note) => notesService.delete(note._id),
    onSuccess: () => {
      toast.success("Note deleted.");
      invalidateNotes();
      setNoteToDelete(null);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to delete note."));
    },
  });

  const notes = notesQuery.data || EMPTY_NOTES;
  const filteredNotes = useMemo(
    () => sortNotes(notes.filter((note) => noteMatchesView(note, view) && noteMatchesSearch(note, search)), sort),
    [notes, search, sort, view],
  );

  const activeCount = notes.filter((note) => !note.isArchived).length;
  const pinnedCount = notes.filter((note) => note.isPinned && !note.isArchived).length;
  const archivedCount = notes.filter((note) => note.isArchived).length;

  function openCreateEditor() {
    setEditingNote(null);
    setIsEditorOpen(true);
  }

  function openEditEditor(note) {
    setEditingNote(note);
    setIsEditorOpen(true);
  }

  function submitNote(values) {
    if (editingNote) {
      updateNote.mutate({ noteId: editingNote._id, ...values });
      return;
    }

    createNote.mutate(values);
  }

  function getActionLoading(note) {
    return (
      (togglePin.isPending && togglePin.variables?._id === note._id) ||
      (toggleArchive.isPending && toggleArchive.variables?._id === note._id) ||
      (deleteNote.isPending && deleteNote.variables?._id === note._id)
    );
  }

  const hasSearchOrFilterResults = filteredNotes.length > 0;
  const emptyType = search.trim() || (view === "pinned" && pinnedCount > 0) ? "search" : view;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Personal Notes"
        title="Creator strategy notebook"
        description="Save strategy, content ideas, campaign notes, and action plans beside the insights that inspired them."
        actions={
          <>
            <Button as={Link} to={routePaths.insights} variant="secondary">
              <BrainCircuit aria-hidden="true" size={18} />
              Insights
            </Button>
            <Button type="button" onClick={openCreateEditor}>
              <Plus aria-hidden="true" size={18} />
              Create Note
            </Button>
          </>
        }
      />

      <SectionCard title="Notebook overview" description="Pinned notes stay first in active views. Deleted notes are soft-deleted by the backend.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line-200 bg-cloud-50 p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">Active notes</p>
            <p className="mt-2 text-2xl font-semibold text-ink-950">{activeCount}</p>
          </div>
          <div className="rounded-lg border border-line-200 bg-cloud-50 p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">Pinned</p>
            <p className="mt-2 text-2xl font-semibold text-ink-950">{pinnedCount}</p>
          </div>
          <div className="rounded-lg border border-line-200 bg-cloud-50 p-4">
            <p className="text-xs font-semibold uppercase text-ink-500">Archived</p>
            <p className="mt-2 text-2xl font-semibold text-ink-950">{archivedCount}</p>
          </div>
        </div>
      </SectionCard>

      <NotesToolbar search={search} view={view} sort={sort} onSearchChange={setSearch} onViewChange={setView} onSortChange={setSort} />

      {notesQuery.isLoading ? <NotesSkeleton /> : null}

      {!notesQuery.isLoading && notesQuery.error ? (
        <ErrorPanel title="Unable to load notes" message={getApiErrorMessage(notesQuery.error, "Check that the backend is running and try again.")} />
      ) : null}

      {!notesQuery.isLoading && !notesQuery.error && hasSearchOrFilterResults ? (
        <NotesGrid
          notes={filteredNotes}
          actionLoading={getActionLoading}
          onEdit={openEditEditor}
          onTogglePin={(note) => togglePin.mutate(note)}
          onToggleArchive={(note) => toggleArchive.mutate(note)}
          onDelete={setNoteToDelete}
        />
      ) : null}

      {!notesQuery.isLoading && !notesQuery.error && !hasSearchOrFilterResults ? (
        <NotesEmptyState type={emptyType} onCreate={view === "active" ? openCreateEditor : undefined} />
      ) : null}

      <NoteEditorModal
        note={editingNote}
        isOpen={isEditorOpen}
        isSubmitting={createNote.isPending || updateNote.isPending}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        onSubmit={submitNote}
      />

      <ConfirmDialog
        isOpen={Boolean(noteToDelete)}
        title="Delete note?"
        description={`"${noteToDelete?.title || "This note"}" will be removed from the active notes list. The backend uses soft delete behavior, but deleted notes are not exposed in the current list endpoint.`}
        confirmLabel="Delete note"
        isLoading={deleteNote.isPending}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote.mutate(noteToDelete);
          }
        }}
      />
    </section>
  );
}
