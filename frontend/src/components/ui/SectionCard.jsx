export function SectionCard({ title, description, action, children, className = "" }) {
  return (
    <section className={["rounded-lg border border-line-200 bg-white p-5 shadow-sm", className].join(" ")}>
      {(title || description || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-base font-semibold text-ink-950">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-ink-500">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
