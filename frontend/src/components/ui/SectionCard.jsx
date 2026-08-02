export function SectionCard({ title, description, action, children, className = "" }) {
  return (
    <section className={["rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm shadow-black/5", className].join(" ")}>
      {(title || description || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-semibold text-[var(--app-text)]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
