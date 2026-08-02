import { CheckCircle2, CircleDashed } from "lucide-react";

import { PageHeader } from "./PageHeader";

export function PlaceholderPage({ eyebrow, title, description, readyItems = [], nextItems = [] }) {
  return (
    <section>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-line-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink-950">Foundation in place</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {readyItems.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-line-200 bg-cloud-50 p-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-mint-500" aria-hidden="true" size={18} />
                <span className="text-sm text-ink-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-ink-950">Reserved for later milestones</h2>
          <div className="mt-4 space-y-3">
            {nextItems.map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-line-200 p-3">
                <CircleDashed className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" size={18} />
                <span className="text-sm text-ink-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
