export function TextField({ id, label, error, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink-700">
        {label}
      </label>
      <input
        id={id}
        className={[
          "h-11 w-full rounded-lg border bg-white px-3 text-sm text-ink-950 outline-none transition",
          "placeholder:text-ink-500 focus:border-brand-600 focus:ring-4 focus:ring-blue-100",
          error ? "border-red-300" : "border-line-200",
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
