import { LoadingCard } from "../../../components/ui/LoadingCard";

export function NotesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      <LoadingCard rows={5} />
      <LoadingCard rows={5} />
      <LoadingCard rows={5} />
    </div>
  );
}
