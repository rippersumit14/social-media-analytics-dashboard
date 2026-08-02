import { AlertTriangle, Database, RefreshCw, ShieldQuestion } from "lucide-react";

const noticeContent = {
  noProviderMetric: {
    icon: ShieldQuestion,
    title: "This metric is not available from Meta right now",
    description:
      "Meta did not return this value for the connected account. This may depend on account type, permissions, app review status, or available profile activity.",
  },
  noPosts: {
    icon: Database,
    title: "No published posts were found",
    description:
      "This account may not have any published media, or Meta may not have returned media access for the current connection. Publish content or review the account permissions, then synchronize again.",
  },
  lowData: {
    icon: AlertTriangle,
    title: "More activity is needed for a reliable analysis",
    description:
      "CreatorIQ can connect your account, but there is not enough recent content or engagement information to calculate a reliable Creator Score or detailed account-aware AI analysis.",
  },
  manualActive: {
    icon: AlertTriangle,
    title: "Analysis is using manually entered values",
    description:
      "Some account metrics were entered manually because Meta did not return them. Creator Score and AI analysis should be treated as estimates until provider-confirmed data becomes available.",
  },
  syncRequired: {
    icon: RefreshCw,
    title: "Synchronize your latest creator data",
    description:
      "Your Instagram account is connected, but CreatorIQ needs a fresh synchronization before it can update analytics and AI context.",
  },
};

export function DataAvailabilityNotice({ type = "noProviderMetric", actions }) {
  const content = noticeContent[type] || noticeContent.noProviderMetric;
  const Icon = content.icon;

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex gap-3">
        <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{content.title}</h2>
          <p className="mt-2 text-sm leading-6 opacity-90">{content.description}</p>
          {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
