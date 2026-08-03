export function TextField({ id, label, error, className = "", rightSlot, ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[var(--app-text)]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={[
            "h-11 w-full rounded-lg border bg-[var(--app-paper)] px-3 text-sm text-[var(--app-text)] outline-none transition",
            rightSlot ? "pr-12" : "",
            "placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-ring)]",
            error ? "border-red-300" : "border-[var(--app-border)]",
          ].join(" ")}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {rightSlot ? <div className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</div> : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
