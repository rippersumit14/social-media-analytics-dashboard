import { Link } from "react-router-dom";

import { Button } from "@mui/material";

export default function Terms() {
  return (
    <main className="landing-page min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <section className="landing-card mx-auto max-w-3xl rounded-2xl p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase text-[var(--landing-primary)]">Legal draft</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--landing-text)]">Terms of Service</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--landing-muted)]">
          This is starter informational content for development review. It should be formally reviewed before production use.
        </p>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--landing-muted)]">
          <p>CreatorIQ is a decision-support product for creator analytics, planning and AI-assisted workflows.</p>
          <p>The product does not guarantee follower growth, engagement, revenue, sponsorships, virality or business outcomes.</p>
          <p>Plan details, feature availability and production policies may change as the product develops.</p>
        </div>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 4 }}>
          Back to homepage
        </Button>
      </section>
    </main>
  );
}
