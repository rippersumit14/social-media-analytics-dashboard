import { Inbox } from "lucide-react";

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-line-200 bg-cloud-50 p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-white text-ink-500">
        <Inbox aria-hidden="true" size={20} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-ink-950">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
