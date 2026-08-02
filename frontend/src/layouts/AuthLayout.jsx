import { Link, Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { routePaths } from "../routes/routePaths";

export function AuthLayout() {
  return (
    <main className="app-shell grid min-h-screen px-4 py-8 text-[var(--app-text)] md:grid-cols-[1fr_1.1fr] md:px-8">
      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)]/96 p-6 shadow-sm shadow-black/5 backdrop-blur-xl">
          <Link to={routePaths.dashboard} className="mb-8 inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-primary)] text-white shadow-sm shadow-blue-500/20">
              <Sparkles aria-hidden="true" size={19} />
            </span>
            <span className="font-semibold text-[var(--app-text)]">CreatorIQ</span>
          </Link>
          <Outlet />
        </div>
      </section>

      <section className="hidden items-center justify-center pl-8 md:flex">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase text-[var(--app-primary)]">AI-powered creator analytics</p>
          <h1 className="text-4xl font-semibold leading-tight text-[var(--app-text)]">
            Connect Instagram, learn from performance, and plan content with context.
          </h1>
          <p className="mt-5 text-base leading-7 text-[var(--app-muted)]">
            Authentication is now connected to the backend. After sign-in, the protected workspace stays ready for upcoming feature milestones.
          </p>
        </div>
      </section>
    </main>
  );
}
