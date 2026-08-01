import { Button, CircularProgress } from "@mui/material";
import { ArrowDown, Camera, CheckCircle2, ShieldCheck } from "lucide-react";

const benefits = [
  "Review account and media information",
  "Track analytics over time",
  "Generate Creator Score",
  "Receive data-based insights",
  "Ask more relevant AI questions",
  "Organize actions using performance context",
];

export function InstagramConnectEmptyState({ onConnect, onLearn, isConnecting }) {
  return (
    <section className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-paper)] p-6 shadow-sm">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-[var(--app-elevated)] text-[var(--app-primary)]">
          <Camera aria-hidden="true" size={26} />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-[var(--app-text)]">Connect Instagram to unlock creator intelligence</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
          CreatorIQ uses available data from a supported Instagram professional account to build analytics snapshots, calculate Creator Score, generate creator insights, and provide more relevant AI guidance.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="contained" size="large" onClick={onConnect} disabled={isConnecting} startIcon={isConnecting ? <CircularProgress color="inherit" size={18} /> : <Camera size={18} />}>
            {isConnecting ? "Redirecting you to Instagram..." : "Connect Instagram"}
          </Button>
          <Button variant="outlined" size="large" onClick={onLearn} startIcon={<ArrowDown size={18} />}>
            Learn how connection works
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit) => (
          <div key={benefit} className="rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4 text-sm font-medium text-[var(--app-text)]">
            <CheckCircle2 aria-hidden="true" className="mb-3 text-[var(--app-secondary)]" size={18} />
            {benefit}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4 text-left">
        <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--app-primary)]" size={20} />
        <p className="text-sm leading-6 text-[var(--app-muted)]">
          CreatorIQ should never ask you to enter your Instagram password into a custom form. Authorization should happen through the official Instagram or Meta flow.
        </p>
      </div>
    </section>
  );
}
