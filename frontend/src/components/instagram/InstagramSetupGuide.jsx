import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ChevronDown, LockKeyhole, ShieldCheck } from "lucide-react";

const steps = [
  "Click Connect Instagram.",
  "CreatorIQ requests an authorization URL from its backend.",
  "Your browser opens the official Instagram or Meta authorization screen.",
  "Choose a supported professional account and approve permissions.",
  "The authorization returns to CreatorIQ through the configured callback.",
  "CreatorIQ stores the approved connection securely on the backend.",
  "Synchronize available creator data for analytics and insights.",
];

export function InstagramSetupGuide({ guideRef }) {
  return (
    <section ref={guideRef} id="instagram-setup-guide" className="rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
      <div className="max-w-3xl">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">How Instagram connection works</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">
          CreatorIQ uses the backend-managed OAuth flow configured for this project. Sensitive provider tokens stay on the backend and are never displayed in the frontend.
        </p>
      </div>
      <ol className="mt-5 grid gap-3 lg:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4 text-sm leading-6 text-[var(--app-muted)]">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--app-primary)] text-xs font-semibold text-white">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="flex gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4">
          <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--app-secondary)]" size={20} />
          <p className="text-sm leading-6 text-[var(--app-muted)]">
            CreatorIQ should not request your Instagram password through its own custom form. Authorization should happen through the official provider flow.
          </p>
        </div>
        <div className="flex gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-elevated)] p-4">
          <LockKeyhole aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--app-secondary)]" size={20} />
          <p className="text-sm leading-6 text-[var(--app-muted)]">
            CreatorIQ currently works with supported Instagram professional accounts connected through the configured Meta application.
          </p>
        </div>
      </div>
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ChevronDown size={18} />}>
          <span className="font-semibold">Troubleshooting connection issues</span>
        </AccordionSummary>
        <AccordionDetails>
          <ul className="space-y-2 text-sm leading-6 text-[var(--app-muted)]">
            <li>Use a verified account whose email is already confirmed in CreatorIQ.</li>
            <li>Make sure the backend has valid Instagram app credentials and redirect URI configuration.</li>
            <li>If authorization expires or permissions are denied, start the connection again from this page.</li>
            <li>If media sync fails, confirm the connected Instagram account has provider permissions and available media.</li>
          </ul>
        </AccordionDetails>
      </Accordion>
    </section>
  );
}
