import { Link } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { routePaths } from "../routes/routePaths";

export default function NotFound() {
  return (
    <section className="rounded-lg border border-line-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase text-brand-700">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink-950">Page not found</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink-500">
        The requested route is not part of the Day 1 frontend foundation.
      </p>
      <Button as={Link} to={routePaths.dashboard} className="mt-6">
        Return to dashboard
      </Button>
    </section>
  );
}
