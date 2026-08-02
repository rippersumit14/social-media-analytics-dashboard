import { Link } from "react-router-dom";

import { Button } from "@mui/material";

export default function Privacy() {
  return (
    <main className="landing-page min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <section className="landing-card mx-auto max-w-3xl rounded-2xl p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase text-[var(--landing-primary)]">Legal draft</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--landing-text)]">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--landing-muted)]">
          This is starter informational content for development review. It should be formally reviewed before production use.
        </p>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--landing-muted)]">
          <p>CreatorIQ is designed to help users manage supported creator analytics, AI conversations, insights and personal notes.</p>
          <p>Account, analytics and note data should be handled according to the final production privacy policy, connected platform requirements and applicable law.</p>
          <p>Users should not enter Instagram passwords into CreatorIQ. Connected account access should use the official Instagram or Meta authorization flow.</p>
        </div>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 4 }}>
          Back to homepage
        </Button>
      </section>
    </main>
  );
}
