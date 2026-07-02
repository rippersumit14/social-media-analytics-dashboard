export function LoadingCard({ rows = 3 }) {
  return (
    <div className="rounded-lg border border-line-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-32 animate-pulse rounded bg-cloud-100" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-3 animate-pulse rounded bg-cloud-100" />
        ))}
      </div>
    </div>
  );
}
