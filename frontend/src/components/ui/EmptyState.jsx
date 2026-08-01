import { Inbox } from "lucide-react";

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--app-paper)] text-[var(--app-muted)]">
        <Inbox aria-hidden="true" size={20} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[var(--app-text)]">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--app-muted)]">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
