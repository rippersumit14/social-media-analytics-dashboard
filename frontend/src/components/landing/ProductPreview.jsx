import { useEffect, useState } from "react";
import { BarChart3, Bot, Camera, CheckCircle2, Gauge, MessageSquareText, TrendingUp } from "lucide-react";

import { aiDemoPrompts } from "../../config/landingContent";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function ProductPreview() {
  const [selectedPrompt, setSelectedPrompt] = useState(aiDemoPrompts[0]);
  const [typedResponse, setTypedResponse] = useState(aiDemoPrompts[0].response);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedResponse(selectedPrompt.response);
      return undefined;
    }

    setTypedResponse("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedResponse(selectedPrompt.response.slice(0, index));

      if (index >= selectedPrompt.response.length) {
        window.clearInterval(timer);
      }
    }, 14);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, selectedPrompt]);

  return (
    <div className="landing-card rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--landing-primary)]">Product preview</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--landing-text)]">Creator intelligence workspace</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-border)] bg-[var(--landing-soft)] px-3 py-1 text-xs font-semibold text-[var(--landing-text)]">
          <Camera aria-hidden="true" size={14} />
          Connected preview
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-elevated)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-[var(--landing-muted)]">Creator Score</p>
              <p className="mt-1 text-4xl font-semibold text-[var(--landing-text)]">82</p>
              <p className="text-sm text-[var(--landing-muted)]">Strong, with room to improve consistency</p>
            </div>
            <div className="relative grid h-24 w-24 place-items-center rounded-full bg-[conic-gradient(var(--landing-primary)_0_82%,var(--landing-border)_82%_100%)]">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--landing-card)] text-sm font-semibold text-[var(--landing-text)]">
                82/100
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Follower trend", value: "+12.4%", icon: TrendingUp },
              { label: "Engagement", value: "8.7%", icon: BarChart3 },
              { label: "Consistency", value: "Strong", icon: CheckCircle2 },
              { label: "Pattern", value: "Educational carousel", icon: Gauge },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-[var(--landing-border)] bg-[var(--landing-soft)] p-3">
                <metric.icon aria-hidden="true" className="text-[var(--landing-primary)]" size={17} />
                <p className="mt-2 text-xs text-[var(--landing-muted)]">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--landing-text)]">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-elevated)] p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--landing-soft)] text-[var(--landing-primary)]">
                <Bot aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--landing-text)]">AI insight</p>
                <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                  Your strongest recent posts combine practical tips with concise captions.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-elevated)] p-4">
            <p className="text-sm font-semibold text-[var(--landing-text)]">Suggested next action</p>
            <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
              Publish a follow-up post that expands your highest-performing topic.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-elevated)] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--landing-text)]">
              <MessageSquareText aria-hidden="true" size={17} />
              Local AI demo
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {aiDemoPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => setSelectedPrompt(prompt)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5",
                    selectedPrompt.label === prompt.label
                      ? "border-[var(--landing-primary)] bg-[var(--landing-soft)] text-[var(--landing-text)]"
                      : "border-[var(--landing-border)] text-[var(--landing-muted)] hover:text-[var(--landing-text)]",
                  ].join(" ")}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
            <p className="mt-3 min-h-20 text-sm leading-6 text-[var(--landing-muted)]">{typedResponse}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
