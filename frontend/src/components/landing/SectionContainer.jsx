export function SectionContainer({ id, eyebrow, title, description, children, className = "" }) {
  return (
    <section id={id} className={["px-4 py-16 sm:px-6 lg:px-8 lg:py-24", className].join(" ")}>
      <div className="mx-auto max-w-7xl">
        {(eyebrow || title || description) && (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {eyebrow ? <p className="text-sm font-semibold uppercase text-[var(--landing-primary)]">{eyebrow}</p> : null}
            {title ? <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[var(--landing-text)] sm:text-4xl">{title}</h2> : null}
            {description ? <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">{description}</p> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
