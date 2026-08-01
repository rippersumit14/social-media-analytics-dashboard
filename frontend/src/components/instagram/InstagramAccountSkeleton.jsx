import { Skeleton } from "@mui/material";

export function InstagramAccountSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton variant="rounded" width={64} height={64} />
          <div className="flex-1">
            <Skeleton width="45%" height={24} />
            <Skeleton width="30%" height={18} />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Skeleton variant="rounded" height={76} />
          <Skeleton variant="rounded" height={76} />
          <Skeleton variant="rounded" height={76} />
        </div>
      </section>
      <section className="rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
        <Skeleton width="40%" height={24} />
        <Skeleton width="90%" height={18} />
        <Skeleton variant="rounded" height={48} sx={{ mt: 4 }} />
      </section>
    </div>
  );
}
