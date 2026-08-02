export function LoadingCard({ rows = 3 }) {
  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm shadow-black/5" aria-busy="true">
      <div className="h-4 w-32 animate-pulse rounded bg-[var(--app-bg)]" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-3 animate-pulse rounded bg-[var(--app-bg)]" />
        ))}
      </div>
    </div>
  );
}
