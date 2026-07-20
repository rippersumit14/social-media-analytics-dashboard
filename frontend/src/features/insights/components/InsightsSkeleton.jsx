import { LoadingCard } from "../../../components/ui/LoadingCard";

export function InsightsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <LoadingCard rows={5} />
      <LoadingCard rows={5} />
      <LoadingCard rows={5} />
      <LoadingCard rows={5} />
    </div>
  );
}
