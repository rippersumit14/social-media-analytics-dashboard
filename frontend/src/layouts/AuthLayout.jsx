import { Link, Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { routePaths } from "../routes/routePaths";

export function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-cloud-50 px-4 py-8 md:grid-cols-[1fr_1.1fr] md:px-8">
      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-line-200 bg-white p-6 shadow-sm">
          <Link to={routePaths.dashboard} className="mb-8 inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Sparkles aria-hidden="true" size={19} />
            </span>
            <span className="font-semibold text-ink-950">CreatorIQ</span>
          </Link>
          <Outlet />
        </div>
      </section>

      <section className="hidden items-center justify-center pl-8 md:flex">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase text-brand-700">AI-powered creator analytics</p>
          <h1 className="text-4xl font-semibold leading-tight text-ink-950">
            Connect Instagram, learn from performance, and plan content with context.
          </h1>
          <p className="mt-5 text-base leading-7 text-ink-500">
            Authentication is now connected to the backend. After sign-in, the protected workspace stays ready for upcoming feature milestones.
          </p>
        </div>
      </section>
    </main>
  );
}
