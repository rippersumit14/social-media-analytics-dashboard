import { Loader2, Sparkles } from "lucide-react";

export function LoadingScreen({ message = "Checking your session" }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cloud-50 px-4">
      <div className="rounded-lg border border-line-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Sparkles aria-hidden="true" size={22} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-ink-700">
          <Loader2 aria-hidden="true" className="animate-spin" size={18} />
          <span>{message}</span>
        </div>
      </div>
    </main>
  );
}
