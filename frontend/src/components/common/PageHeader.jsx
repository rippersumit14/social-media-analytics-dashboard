export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="app-reveal mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase text-[var(--app-primary)]">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold text-[var(--app-text)] sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
