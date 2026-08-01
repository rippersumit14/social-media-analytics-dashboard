import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  TextField,
} from "@mui/material";
import { ArrowRight, CheckCircle2, ChevronDown, Mail, Send, Sparkles } from "lucide-react";

import {
  comparisonColumns,
  contactCategories,
  faqs,
  features,
  footerGroups,
  pricingPlans,
  problems,
  reassuranceItems,
  showcaseTabs,
  tutorialSteps,
  workflowStages,
} from "../../config/landingContent";
import { env } from "../../config/env";
import { routePaths } from "../../routes/routePaths";
import { ProductPreview } from "./ProductPreview";
import { Reveal } from "./Reveal";
import { SectionContainer } from "./SectionContainer";

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getActionPath(action, isAuthenticated) {
  const loggedOutPath = action === "instagram" ? routePaths.login : routePaths.register;

  if (!isAuthenticated) {
    return loggedOutPath;
  }

  const paths = {
    analytics: routePaths.analytics,
    chat: routePaths.chat,
    creatorScore: routePaths.creatorScore,
    insights: routePaths.insights,
    instagram: routePaths.instagram,
    notes: routePaths.notes,
  };

  return paths[action] || routePaths.dashboard;
}

function HeroSection({ isAuthenticated }) {
  return (
    <section id="overview" className="px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
        <Reveal>
          <Chip label="AI-powered creator intelligence for smarter growth decisions" color="primary" variant="outlined" />
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-[var(--landing-text)] sm:text-5xl lg:text-6xl">
            Turn creator data into <span className="landing-gradient-text">clear growth decisions.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--landing-muted)]">
            CreatorIQ brings your Instagram analytics, Creator Score, AI insights, conversations, recommendations and planning notes into one simple workspace. Instead of only showing you numbers, it helps you understand what those numbers mean and what you can work on next.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--landing-muted)]">
            Whether you are trying to improve consistency, understand engagement, repeat stronger content ideas or organize your weekly strategy, CreatorIQ gives you one place to review performance and plan your next move.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button component={Link} to={isAuthenticated ? routePaths.dashboard : routePaths.register} variant="contained" size="large" endIcon={<ArrowRight size={18} />}>
              {isAuthenticated ? "Open your dashboard" : "Start analyzing for free"}
            </Button>
            <Button type="button" variant="outlined" size="large" onClick={() => scrollToSection("workflow")}>
              See how it works
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {reassuranceItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[var(--landing-border)] bg-[var(--landing-card)] px-3 py-1.5 text-sm font-semibold text-[var(--landing-muted)]">
                <CheckCircle2 aria-hidden="true" size={15} className="text-[var(--landing-secondary)]" />
                {item}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <ProductPreview />
        </Reveal>
      </div>
    </section>
  );
}

function IntroSection() {
  return (
    <SectionContainer
      id="intro"
      eyebrow="Why it matters"
      title="Creator growth should not require guessing."
      description="Social platforms provide a large amount of information, but creators are often left to interpret that information alone. Views, reach, engagement, follower changes and posting activity may describe performance, but they do not automatically explain what should happen next."
      className="pt-8"
    >
      <Reveal className="mx-auto max-w-4xl">
        <p className="mb-8 text-center text-base leading-7 text-[var(--landing-muted)]">
          CreatorIQ organizes this information into a simpler workflow. It gives creators a clearer view of their account, highlights meaningful patterns, generates AI-powered observations and keeps strategic notes and recommendations in one place.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {comparisonColumns.map((column) => (
            <div key={column.title} className="landing-card rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-[var(--landing-text)]">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--landing-muted)]">
                    <CheckCircle2 aria-hidden="true" className="mt-1 shrink-0 text-[var(--landing-secondary)]" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </SectionContainer>
  );
}

function ProblemSection() {
  return (
    <SectionContainer
      id="problems"
      eyebrow="Creator problems"
      title="Analytics show the past. Creators still need help deciding what comes next."
      description="A creator can have access to dozens of metrics and still feel unsure about the next post, campaign or content format. CreatorIQ is designed to reduce that uncertainty by combining analysis, explanation and planning."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {problems.map((problem) => (
          <Reveal key={problem.title}>
            <article className="landing-card h-full rounded-2xl p-5 transition hover:-translate-y-1">
              <problem.icon aria-hidden="true" className="text-[var(--landing-primary)]" size={24} />
              <h3 className="mt-4 text-lg font-semibold text-[var(--landing-text)]">{problem.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">{problem.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionContainer>
  );
}

function SolutionSection() {
  return (
    <SectionContainer
      id="workflow"
      eyebrow="How it works"
      title="One workspace for analytics, AI guidance and creator planning."
      description="CreatorIQ connects different parts of the creator workflow so creators can move from observation to action without switching between unrelated tools."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {workflowStages.map((stage) => (
          <Reveal key={stage.title}>
            <article className="landing-card h-full rounded-2xl p-5">
              <stage.icon aria-hidden="true" className="text-[var(--landing-primary)]" size={24} />
              <h3 className="mt-4 text-lg font-semibold text-[var(--landing-text)]">{stage.title}</h3>
              <ul className="mt-4 space-y-2">
                {stage.items.map((item) => (
                  <li key={item} className="text-sm leading-6 text-[var(--landing-muted)]">{item}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionContainer>
  );
}

function FeaturesSection({ isAuthenticated }) {
  return (
    <SectionContainer
      id="features"
      eyebrow="Features"
      title="A creator intelligence system, not another static report."
      description="Each feature is designed to help a creator understand context, choose next steps and keep strategy organized."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => (
          <Reveal key={feature.title}>
            <article tabIndex={0} className="landing-card flex h-full flex-col rounded-2xl p-5 transition hover:-translate-y-1 focus-visible:-translate-y-1">
              <feature.icon aria-hidden="true" className="text-[var(--landing-primary)]" size={24} />
              <p className="mt-4 text-xs font-semibold uppercase text-[var(--landing-secondary)]">{feature.label}</p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--landing-text)]">{feature.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--landing-muted)]">{feature.description}</p>
              {feature.cta ? (
                <Button component={Link} to={getActionPath(feature.action, isAuthenticated)} variant="text" sx={{ mt: 2, justifyContent: "flex-start" }}>
                  {feature.cta}
                </Button>
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>
    </SectionContainer>
  );
}

function ShowcaseSection() {
  const [activeTab, setActiveTab] = useState(showcaseTabs[0]);

  return (
    <SectionContainer
      id="showcase"
      eyebrow="Product showcase"
      title="See how the core workspace connects."
      description="This preview uses demonstration data only. It does not call the backend or represent a real connected account."
    >
      <Reveal className="landing-card mx-auto max-w-5xl rounded-2xl p-5">
        <div className="flex flex-wrap gap-2">
          {showcaseTabs.map((tab) => (
            <Button key={tab.id} type="button" variant={activeTab.id === tab.id ? "contained" : "outlined"} onClick={() => setActiveTab(tab)}>
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-soft)] p-5">
            <p className="text-sm font-semibold uppercase text-[var(--landing-primary)]">{activeTab.label}</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--landing-text)]">{activeTab.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">
              CreatorIQ groups related product areas so metrics, score, AI recommendations and notes can support the same planning workflow.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {activeTab.details.map((detail) => (
              <div key={detail} className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-elevated)] p-4">
                <p className="text-sm font-semibold text-[var(--landing-text)]">{detail}</p>
                <div className="mt-4 h-2 rounded-full bg-[var(--landing-soft)]">
                  <div className="h-2 w-3/4 rounded-full bg-[var(--landing-primary)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </SectionContainer>
  );
}

function TutorialSection({ isAuthenticated }) {
  return (
    <SectionContainer
      id="tutorial"
      eyebrow="Beginner tutorial"
      title="A simple path from sign-up to strategy."
      description="Use this workflow when testing the product locally or introducing a new creator to the system."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {tutorialSteps.map((step, index) => (
          <Reveal key={step.title}>
            <article className="landing-card h-full rounded-2xl p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--landing-soft)] text-sm font-semibold text-[var(--landing-primary)]">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[var(--landing-text)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">{step.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button component={Link} to={isAuthenticated ? routePaths.dashboard : routePaths.register} variant="contained">
          Explore the product workflow
        </Button>
      </div>
    </SectionContainer>
  );
}

function CreatorScoreSection({ isAuthenticated }) {
  return (
    <SectionContainer
      id="creator-score"
      eyebrow="Creator Score"
      title="A clearer summary of creator health."
      description="Creator Score gives creators a quick way to inspect overall account momentum, while the breakdown keeps the score understandable."
    >
      <Reveal className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="landing-card rounded-2xl p-6">
          <div className="mx-auto grid h-40 w-40 place-items-center rounded-full bg-[conic-gradient(var(--landing-primary)_0_82%,var(--landing-border)_82%_100%)]">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-[var(--landing-card)] text-center">
              <span className="text-3xl font-semibold text-[var(--landing-text)]">82</span>
              <span className="text-xs text-[var(--landing-muted)]">out of 100</span>
            </div>
          </div>
          <Button component={Link} to={getActionPath("creatorScore", isAuthenticated)} variant="contained" fullWidth sx={{ mt: 4 }}>
            View Creator Score
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {["Engagement", "Growth", "Consistency", "Activity"].map((label) => (
            <div key={label} className="landing-soft-card rounded-xl p-5">
              <p className="text-lg font-semibold text-[var(--landing-text)]">{label}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--landing-muted)]">
                A score input that helps explain which area may deserve attention before the next planning cycle.
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </SectionContainer>
  );
}

function AIAssistantSection({ isAuthenticated }) {
  return (
    <SectionContainer
      id="assistant"
      eyebrow="AI Assistant"
      title="Ask follow-up questions instead of staring at static reports."
      description="The AI workspace is designed for ongoing creator strategy conversations, with message history and a sidebar for returning to previous planning threads."
    >
      <Reveal className="landing-card mx-auto max-w-4xl rounded-2xl p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-soft)] p-5">
            <Sparkles aria-hidden="true" className="text-[var(--landing-primary)]" size={26} />
            <h3 className="mt-4 text-xl font-semibold text-[var(--landing-text)]">Strategy conversation</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">
              Ask about content patterns, consistency, engagement shifts or how to turn an insight into a practical plan.
            </p>
          </div>
          <div className="space-y-3">
            {["What changed since my last snapshot?", "Which pattern should I repeat?", "How do I turn this into a weekly plan?"].map((message) => (
              <div key={message} className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-elevated)] p-4 text-sm text-[var(--landing-text)]">
                {message}
              </div>
            ))}
            <Button component={Link} to={getActionPath("chat", isAuthenticated)} variant="contained">
              Start an AI conversation
            </Button>
          </div>
        </div>
      </Reveal>
    </SectionContainer>
  );
}

function PricingSection({ onWaitlist }) {
  return (
    <SectionContainer
      id="pricing"
      eyebrow="Plan preview"
      title="Simple plan structure while the product develops."
      description="Plan features and availability may change as the product develops. This section is informational only and does not start a payment flow."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Reveal key={plan.name}>
            <article className={["landing-card h-full rounded-2xl p-6", plan.highlighted ? "ring-2 ring-[var(--landing-primary)]" : ""].join(" ")}>
              <p className="text-lg font-semibold text-[var(--landing-text)]">{plan.name}</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--landing-text)]">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">{plan.description}</p>
              <ul className="mt-5 space-y-3">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-[var(--landing-muted)]">
                    <CheckCircle2 aria-hidden="true" className="shrink-0 text-[var(--landing-secondary)]" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <Button type="button" variant={plan.highlighted ? "contained" : "outlined"} fullWidth sx={{ mt: 4 }} onClick={onWaitlist}>
                Join waitlist
              </Button>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionContainer>
  );
}

function FAQSection() {
  return (
    <SectionContainer id="faq" eyebrow="FAQ" title="Common questions" description="Clear answers for creators evaluating the current product.">
      <Reveal className="mx-auto max-w-4xl space-y-3">
        {faqs.map((faq) => (
          <Accordion key={faq.question} disableGutters>
            <AccordionSummary expandIcon={<ChevronDown size={18} />} aria-controls={`${faq.question}-content`}>
              <span className="font-semibold">{faq.question}</span>
            </AccordionSummary>
            <AccordionDetails>
              <p className="text-sm leading-6 text-[var(--landing-muted)]">{faq.answer}</p>
            </AccordionDetails>
          </Accordion>
        ))}
      </Reveal>
    </SectionContainer>
  );
}

function validateContact(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Name is required.";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email.";
  if (!values.category) errors.category = "Choose a category.";
  if (!values.message.trim()) errors.message = "Message is required.";
  if (values.name.length > 80) errors.name = "Name must be 80 characters or less.";
  if (values.message.length > 1200) errors.message = "Message must be 1,200 characters or less.";

  return errors;
}

function createMailto(values) {
  const subject = encodeURIComponent(`CreatorIQ contact - ${values.category}`);
  const body = encodeURIComponent(`Name: ${values.name}\nEmail: ${values.email}\nCategory: ${values.category}\n\nMessage:\n${values.message}`);

  return `mailto:${env.contactEmail}?subject=${subject}&body=${body}`;
}

export function ContactSection({ initialCategory = "Product question", onCategoryConsumed }) {
  const [values, setValues] = useState({ name: "", email: "", category: initialCategory, message: "" });
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const lastAppliedCategory = useRef(initialCategory);

  useEffect(() => {
    if (initialCategory && initialCategory !== lastAppliedCategory.current) {
      setValues((current) => ({ ...current, category: initialCategory }));
      lastAppliedCategory.current = initialCategory;
      onCategoryConsumed?.();
    }
  }, [initialCategory, onCategoryConsumed]);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submitContact(event) {
    event.preventDefault();
    const nextErrors = validateContact(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    window.location.href = createMailto(values);
    setSnackbarOpen(true);
  }

  const copyText = `Name: ${values.name}\nEmail: ${values.email}\nCategory: ${values.category}\n\nMessage:\n${values.message}`;

  return (
    <SectionContainer
      id="contact"
      eyebrow="Contact"
      title="Have a question, suggestion or partnership idea?"
      description="Tell us what you would like help with. You can contact the CreatorIQ team about the product, technical support, feedback, partnerships or future plan access."
    >
      <Reveal className="landing-card mx-auto max-w-3xl rounded-2xl p-5 sm:p-6">
        <form onSubmit={submitContact} className="grid gap-4">
          <TextField label="Name" value={values.name} onChange={(event) => updateField("name", event.target.value)} error={Boolean(errors.name)} helperText={errors.name} slotProps={{ htmlInput: { maxLength: 80 } }} required />
          <TextField label="Email" type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} error={Boolean(errors.email)} helperText={errors.email} required />
          <TextField select label="Category" value={values.category} onChange={(event) => updateField("category", event.target.value)} error={Boolean(errors.category)} helperText={errors.category} required>
            {contactCategories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </TextField>
          <TextField label="Message" value={values.message} onChange={(event) => updateField("message", event.target.value)} error={Boolean(errors.message)} helperText={errors.message} slotProps={{ htmlInput: { maxLength: 1200 } }} required multiline minRows={5} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--landing-muted)]">Public support email: {env.contactEmail}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outlined" onClick={() => navigator.clipboard?.writeText(copyText)}>
                Copy message
              </Button>
              <Button type="submit" variant="contained" endIcon={<Send size={16} />}>
                Send contact message
              </Button>
            </div>
          </div>
        </form>
      </Reveal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5500}
        onClose={() => setSnackbarOpen(false)}
        message="Opening your email app. If it does not open, copy the message and use the public support email shown above."
      />
    </SectionContainer>
  );
}

function PublicFooter({ isAuthenticated }) {
  function renderLink(link) {
    if (link.sectionId) {
      return (
        <button key={link.label} type="button" onClick={() => scrollToSection(link.sectionId)} className="text-left text-sm text-[var(--landing-muted)] hover:text-[var(--landing-text)]">
          {link.label}
        </button>
      );
    }

    return (
      <Link key={link.label} to={link.action ? getActionPath(link.action, isAuthenticated) : link.to} className="text-sm text-[var(--landing-muted)] hover:text-[var(--landing-text)]">
        {link.label}
      </Link>
    );
  }

  return (
    <footer className="border-t border-[var(--landing-border)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--landing-primary)] text-white">
              <Sparkles aria-hidden="true" size={18} />
            </span>
            <span className="font-semibold text-[var(--landing-text)]">CreatorIQ</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-[var(--landing-muted)]">
            AI-powered creator intelligence for clearer performance analysis, better planning and more informed growth decisions.
          </p>
          <a href={`mailto:${env.contactEmail}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--landing-primary)]">
            <Mail aria-hidden="true" size={16} />
            Email
          </a>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-[var(--landing-text)]">{group.title}</h3>
              <div className="mt-3 grid gap-2">{group.links.map(renderLink)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-[var(--landing-border)] pt-5 text-sm text-[var(--landing-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>(c) 2026 CreatorIQ. All rights reserved.</p>
        <p>Built to help creators understand data and plan with more clarity.</p>
      </div>
    </footer>
  );
}

export function LandingSections({ isAuthenticated }) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [contactCategory, setContactCategory] = useState("Product question");

  function openWaitlist() {
    setContactCategory("Plan or waitlist");
    setWaitlistOpen(true);
  }

  return (
    <>
      <HeroSection isAuthenticated={isAuthenticated} />
      <IntroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection isAuthenticated={isAuthenticated} />
      <ShowcaseSection />
      <TutorialSection isAuthenticated={isAuthenticated} />
      <CreatorScoreSection isAuthenticated={isAuthenticated} />
      <AIAssistantSection isAuthenticated={isAuthenticated} />
      <PricingSection onWaitlist={openWaitlist} />
      <FAQSection />
      <ContactSection initialCategory={contactCategory} onCategoryConsumed={() => {}} />
      <PublicFooter isAuthenticated={isAuthenticated} />

      <Dialog open={waitlistOpen} onClose={() => setWaitlistOpen(false)} aria-labelledby="waitlist-dialog-title">
        <DialogTitle id="waitlist-dialog-title">Join the plan or waitlist conversation</DialogTitle>
        <DialogContent>
          <p className="text-sm leading-6 text-[var(--landing-muted)]">
            Pricing is informational right now. Use the contact form with the Plan or waitlist category selected to ask about future access.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWaitlistOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setWaitlistOpen(false);
              scrollToSection("contact");
            }}
          >
            Open contact form
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
