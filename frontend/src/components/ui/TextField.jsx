export function TextField({ id, label, error, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--app-text)]">
        {label}
      </label>
      <input
        id={id}
        className={[
          "h-11 w-full rounded-lg border bg-[var(--app-paper)] px-3 text-sm text-[var(--app-text)] outline-none transition",
          "placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-ring)]",
          error ? "border-red-300" : "border-[var(--app-border)]",
        ].join(" ")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
