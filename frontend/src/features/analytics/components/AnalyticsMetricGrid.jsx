import { BarChart3, Heart, Image, MessageCircle, MousePointerClick, Percent, UserPlus, Users } from "lucide-react";

import { StatCard } from "../../../components/ui/StatCard";
import { formatNumber, formatPercent } from "../../../utils/formatters";

export function AnalyticsMetricGrid({ account, snapshot, score }) {
  const cards = [
    {
      label: "Followers",
      value: formatNumber(snapshot?.followers ?? account?.followers),
      detail: `${formatNumber(snapshot?.followerGrowth)} follower growth`,
      icon: Users,
      tone: "brand",
    },
    {
      label: "Following",
      value: formatNumber(snapshot?.following),
      detail: "Audience context from latest snapshot",
      icon: UserPlus,
      tone: "slate",
    },
    {
      label: "Media Count",
      value: formatNumber(snapshot?.mediaCount ?? account?.mediaCount),
      detail: `${formatNumber(snapshot?.mediaGrowth)} media growth`,
      icon: Image,
      tone: "mint",
    },
    {
      label: "Total Likes",
      value: formatNumber(snapshot?.totalLikes),
      detail: "Across synced media",
      icon: Heart,
      tone: "amber",
    },
    {
      label: "Total Comments",
      value: formatNumber(snapshot?.totalComments),
      detail: "Conversation activity",
      icon: MessageCircle,
      tone: "brand",
    },
    {
      label: "Total Engagement",
      value: formatNumber(snapshot?.totalEngagement),
      detail: `${formatNumber(snapshot?.engagementGrowth)} engagement growth`,
      icon: MousePointerClick,
      tone: "mint",
    },
    {
      label: "Average Engagement",
      value: formatPercent(snapshot?.averageEngagement),
      detail: "Average engagement per post",
      icon: Percent,
      tone: "amber",
    },
    {
      label: "Creator Score",
      value: `${Math.round(score?.totalScore ?? snapshot?.creatorScore ?? 0)}/100`,
      detail: "Latest score engine result",
      icon: BarChart3,
      tone: "brand",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
