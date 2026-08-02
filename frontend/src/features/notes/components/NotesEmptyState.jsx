import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";

const copy = {
  active: {
    title: "No active notes yet",
    description: "Capture creator strategy, content ideas, and action plans in your personal notebook.",
  },
  pinned: {
    title: "No pinned notes yet",
    description: "Pin your most important plans so they stay easy to find.",
  },
  archived: {
    title: "No archived notes",
    description: "Archived notes will appear here when you move old plans out of the active workspace.",
  },
  search: {
    title: "No notes match your filters",
    description: "Try a different search term, filter, or sort direction.",
  },
};

export function NotesEmptyState({ type = "active", onCreate }) {
  const state = copy[type] || copy.active;

  return (
    <EmptyState
      title={state.title}
      description={state.description}
      action={
        onCreate ? (
          <Button type="button" variant="secondary" onClick={onCreate}>
            Create Note
          </Button>
        ) : null
      }
    />
  );
}
