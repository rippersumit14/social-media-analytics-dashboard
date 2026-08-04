import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Gauge,
  Layers3,
  MessageSquareText,
  NotebookPen,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@mui/material";

import { PublicNavbar } from "../components/landing/PublicNavbar";
import { Reveal } from "../components/landing/Reveal";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { routePaths } from "../routes/routePaths";

const visualPanels = [
  {
    title: "Connected Analytics",
    subtitle: "Meta data when available, manual estimates when it is not.",
    metric: "82",
    label: "Creator Score",
    tone: "blue",
  },
  {
    title: "AI Strategy Workspace",
    subtitle: "Ask context-aware questions about content, consistency, and growth.",
    metric: "6",
    label: "Active insights",
    tone: "cyan",
  },
  {
    title: "Planning Memory",
    subtitle: "Notes, recommendations, and conversations stay organized together.",
    metric: "14",
    label: "Saved plans",
    tone: "amber",
  },
];

const storyBlocks = [
  {
    icon: BarChart3,
    title: "The dashboard starts with truth.",
    description:
      "CreatorIQ does not pretend missing platform data exists. If Meta returns profile and engagement metrics, the app labels them as provider-confirmed. If Meta does not return those numbers, the interface explains the limitation in plain English and gives creators a manual fallback so the workspace can still produce limited, honest estimates.",
  },
  {
    icon: Gauge,
    title: "The score engine stays understandable.",
    description:
      "The Creator Score is designed as an auditable signal rather than a mysterious ranking. It combines audience size, posting activity, engagement, consistency, and growth into a score that helps creators see whether they should focus on reach, content volume, or conversation quality.",
  },
  {
    icon: Bot,
    title: "The AI assistant works like a strategy partner.",
    description:
      "The chat workspace is built around conversations, message history, and a streaming-ready architecture. When account data is limited, the assistant is guided to be transparent, avoid fake precision, and help the creator with general strategy until richer data becomes available.",
  },
  {
    icon: NotebookPen,
    title: "Planning turns insight into action.",
    description:
      "Notes, recommendations, and insights keep the product from becoming another passive report. Creators can save ideas, pin priorities, archive completed work, and return to the same workspace whenever they need to choose the next content move.",
  },
];

const productStats = [
  ["Auth", "Google verified account flow"],
  ["OAuth", "Instagram connection workflow"],
  ["AI", "Chat, insights, recommendations"],
  ["Fallback", "Manual metrics for missing Meta data"],
];

function AnimatedFigure({ activePanel }) {
  const panel = visualPanels[activePanel];

  return (
    <div className="product-visual-shell" aria-label={`${panel.title} product preview`}>
      <div className="product-orbit-line" />
      <div className="product-figure-topbar">
        <span />
        <span />
        <span />
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="product-score-dial">
          <div className={`product-score-ring product-tone-${panel.tone}`}>
            <div>
              <strong>{panel.metric}</strong>
              <span>{panel.label}</span>
            </div>
          </div>
          <p>{panel.title}</p>
          <small>{panel.subtitle}</small>
        </div>
        <div className="space-y-3">
          {[
            ["Audience context", "Followers and account metrics"],
            ["Content activity", "Media sync and snapshot history"],
            ["AI guidance", "Chat, insights, recommendations"],
          ].map(([title, detail], index) => (
            <div key={title} className="product-flow-row" style={{ transitionDelay: `${index * 90}ms` }}>
              <div className="h-10 w-10 rounded-lg bg-[var(--landing-soft)]" />
              <div>
                <p>{title}</p>
                <span>{detail}</span>
              </div>
            </div>
          ))}
          <div className="product-chart">
            {[36, 58, 44, 72, 64, 88, 78].map((height, index) => (
              <span key={height + index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryTimeline() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase text-[var(--landing-primary)]">Product architecture</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--landing-text)] sm:text-4xl">
            Built as a complete creator operating system.
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--landing-muted)]">
            The product connects account data, AI interpretation, scoring, notes, and recommendations into a single flow. This makes it useful as a demo link, a resume project, and a deployable SaaS foundation.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {storyBlocks.map((block) => (
            <Reveal key={block.title}>
              <article className="product-story-card">
                <block.icon aria-hidden="true" size={24} />
                <h3>{block.title}</h3>
                <p>{block.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricsFallbackSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <p className="text-sm font-semibold uppercase text-[var(--landing-primary)]">When Meta data is limited</p>
          <h2 className="mt-3 text-3xl font-semibold text-[var(--landing-text)] sm:text-4xl">
            The app explains the limitation and keeps the creator moving.
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--landing-muted)]">
            Sometimes Meta does not return follower count, following count, media count, or engagement details. Instead of showing empty analytics without context, CreatorIQ tells the user what happened, why the product cannot claim complete accuracy, and how to continue with manually entered public numbers.
          </p>
          <p className="mt-4 text-base leading-8 text-[var(--landing-muted)]">
            Once the creator confirms the manual values, the dashboard, snapshots, Creator Score, and AI assistant can operate in a limited estimate mode. Every affected area keeps the language transparent so the user understands the difference between provider-confirmed data and manually entered estimates.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button component={Link} to={routePaths.instagram} variant="contained" endIcon={<ArrowRight size={17} />}>
              Open Instagram setup
            </Button>
            <Button component={Link} to={routePaths.creatorScore} variant="outlined">
              View score engine
            </Button>
          </div>
        </Reveal>

        <Reveal>
          <div className="product-fallback-panel">
            <div className="flex items-start gap-3">
              <ShieldAlert aria-hidden="true" className="mt-1 text-amber-500" size={23} />
              <div>
                <h3>Sorry for the inconvenience. Meta did not provide complete analytics for this account.</h3>
                <p>
                  You can still continue by entering your current public follower count, following count, and post count. CreatorIQ will mark these values as manual estimates and use them only for limited scoring and planning guidance.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Followers", "Following", "Posts"].map((label, index) => (
                <div key={label} className="product-manual-input">
                  <span>{label}</span>
                  <strong>{["12,400", "836", "214"][index]}</strong>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-[var(--landing-border)] bg-[var(--landing-card)] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--landing-text)]">
                <CheckCircle2 aria-hidden="true" size={17} />
                Limited estimate mode active
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                Score, insights, recommendations, and chat responses continue with transparent data labels.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function ProductStory() {
  const { isAuthenticated } = useAuth();
  const [activePanel, setActivePanel] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePanel((current) => (current + 1) % visualPanels.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const primaryPath = isAuthenticated ? routePaths.dashboard : routePaths.register;
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Start free";

  const activeDetails = useMemo(() => visualPanels[activePanel], [activePanel]);

  return (
    <div className="landing-page product-story-page">
      <PublicNavbar isAuthenticated={isAuthenticated} />
      <main>
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal className="text-center lg:text-left">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--landing-border)] bg-[var(--landing-card)] px-3 py-1.5 text-sm font-semibold text-[var(--landing-muted)] lg:mx-0">
                <Sparkles aria-hidden="true" size={15} />
                Resume-ready AI creator SaaS project
              </div>
              <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-tight text-[var(--landing-text)] sm:text-5xl lg:mx-0 lg:text-6xl">
                A dynamic product story for <span className="landing-gradient-text">CreatorIQ Analytics</span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--landing-muted)] lg:mx-0">
                This page presents the application as a polished, scrollable product experience: account connection, data honesty, manual fallback metrics, AI chat, score calculation, insights, recommendations, and planning all working together as a modern creator growth platform.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button component={Link} to={primaryPath} variant="contained" size="large" endIcon={<ArrowRight size={18} />}>
                  {primaryLabel}
                </Button>
                <Button component={Link} to="/" variant="outlined" size="large">
                  Back to main site
                </Button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {productStats.map(([label, value]) => (
                  <div key={label} className="product-mini-stat">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <AnimatedFigure activePanel={activePanel} />
              <div className="mt-4 flex justify-center gap-2">
                {visualPanels.map((panel, index) => (
                  <button
                    key={panel.title}
                    type="button"
                    onClick={() => setActivePanel(index)}
                    className={["h-2.5 rounded-full transition-all", activeDetails.title === panel.title ? "w-10 bg-[var(--landing-primary)]" : "w-2.5 bg-[var(--landing-border)]"].join(" ")}
                    aria-label={`Show ${panel.title}`}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <StoryTimeline />
        <MetricsFallbackSection />

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-4xl text-center">
            <Layers3 aria-hidden="true" className="mx-auto text-[var(--landing-primary)]" size={30} />
            <h2 className="mt-4 text-3xl font-semibold text-[var(--landing-text)] sm:text-4xl">
              Frontend polish and backend honesty are connected.
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--landing-muted)]">
              The project is intentionally built as a complete full-stack system. The UI is not just decoration: every visual state is tied to real backend conditions such as authentication, missing Meta metrics, manual estimates, connected accounts, conversation history, and scoring readiness.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button component={Link} to={routePaths.chat} variant="contained" startIcon={<MessageSquareText size={17} />}>
                Try AI chat
              </Button>
              <Button component={Link} to={routePaths.analytics} variant="outlined" startIcon={<TrendingUp size={17} />}>
                Open analytics
              </Button>
              <ThemeToggle />
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
