import { Loader2, Sparkles } from "lucide-react";

export function LoadingScreen({ message = "Checking your session" }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 text-[var(--app-text)]">
      <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-6 text-center shadow-sm shadow-black/5" aria-live="polite">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--app-primary)] text-white">
          <Sparkles aria-hidden="true" size={22} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-[var(--app-text)]">
          <Loader2 aria-hidden="true" className="animate-spin" size={18} />
          <span>{message}</span>
        </div>
      </div>
    </main>
  );
}
