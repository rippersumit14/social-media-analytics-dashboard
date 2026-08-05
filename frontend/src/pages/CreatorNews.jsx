import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  ArrowBigUp,
  Bell,
  Bookmark,
  CalendarDays,
  Flame,
  Layers,
  MessageCircle,
  Newspaper,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorPanel } from "../components/ui/ErrorPanel";
import { LoadingCard } from "../components/ui/LoadingCard";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { creatorNewsService } from "../services/creatorNewsService";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDateTime } from "../utils/formatters";

const fallbackCategoryLabels = {
  "creator-economy": "Creator Economy",
  instagram: "Instagram",
  "influencer-marketing": "Influencer Marketing",
  "ai-tools": "AI Tools",
  "platform-updates": "Platform Updates",
};

function getCategoryLabel(category) {
  return fallbackCategoryLabels[category] || category || "Creator News";
}

function getSourceInitial(sourceName = "N") {
  return sourceName
    .trim()
    .charAt(0)
    .toUpperCase() || "N";
}

function NewsThumbnail({ item }) {
  if (item.imageUrl) {
    return (
      <div className="app-image-zoom h-24 w-28 shrink-0 overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] sm:h-28 sm:w-36">
        <img
          src={item.imageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="news-cover-fallback grid h-24 w-28 shrink-0 place-items-center rounded-lg border border-[var(--app-border)] text-white sm:h-28 sm:w-36">
      <div className="text-center">
        <Newspaper aria-hidden="true" className="mx-auto" size={24} />
        <p className="mt-2 px-2 text-xs font-semibold">{getCategoryLabel(item.category)}</p>
      </div>
    </div>
  );
}

function NewsPost({ item, rank }) {
  const sourceName =
    item.sourceName || "Creator news";

  return (
    <article className="app-lift-card group rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] shadow-sm shadow-black/5">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="hidden w-12 shrink-0 flex-col items-center rounded-lg bg-[var(--app-bg)] py-3 text-[var(--app-muted)] sm:flex">
          <button type="button" className="rounded-md p-1 transition hover:bg-[var(--app-paper)] hover:text-[var(--app-primary)]" aria-label="Mark as useful">
            <ArrowBigUp aria-hidden="true" size={18} />
          </button>
          <span className="mt-1 text-sm font-bold text-[var(--app-text)]">{Math.max(1, 120 - rank * 3)}</span>
          <span className="text-[10px] font-semibold uppercase">Pulse</span>
        </div>

        <NewsThumbnail item={item} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--app-muted)]">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-primary)] text-[11px] font-bold text-white">
              {getSourceInitial(sourceName)}
            </span>
            <span className="font-semibold text-[var(--app-text)]">{sourceName}</span>
            <span aria-hidden="true">.</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays aria-hidden="true" size={13} />
              {formatDateTime(item.publishedAt || item.fetchedAt)}
            </span>
          </div>

          <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-[var(--app-text)] sm:text-lg">
            {item.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--app-muted)]">
            {item.summary || "Creator-market update from the public news index."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge variant="neutral">{getCategoryLabel(item.category)}</StatusBadge>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] px-2.5 py-1 text-xs font-semibold text-[var(--app-muted)]">
              <MessageCircle aria-hidden="true" size={13} />
              Brief
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] px-2.5 py-1 text-xs font-semibold text-[var(--app-muted)]">
              <Bookmark aria-hidden="true" size={13} />
              Save idea
            </span>
            {item.imageUrl ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] px-2.5 py-1 text-xs font-semibold text-[var(--app-muted)]">
                <Newspaper aria-hidden="true" size={13} />
                Cover
              </span>
            ) : null}
          </div>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)] transition hover:border-[var(--app-primary)] hover:text-[var(--app-primary)] sm:inline-flex"
          aria-label={`Open ${item.title}`}
        >
          <ArrowUpRight aria-hidden="true" size={18} />
        </a>
      </div>
    </article>
  );
}

function FeaturedNewsLead({ item }) {
  if (!item) {
    return null;
  }

  return (
    <section className="app-reveal overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] shadow-sm shadow-black/5">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="app-image-zoom min-h-72 overflow-hidden bg-[var(--app-bg)]"
          aria-label={`Open featured story: ${item.title}`}
        >
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="h-full min-h-72 w-full object-cover" loading="lazy" />
          ) : (
            <div className="news-cover-fallback grid h-full min-h-72 place-items-center text-white">
              <div className="text-center">
                <Newspaper aria-hidden="true" className="mx-auto" size={42} />
                <p className="mt-3 text-sm font-semibold uppercase">{getCategoryLabel(item.category)}</p>
              </div>
            </div>
          )}
        </a>

        <div className="flex flex-col justify-center p-6 sm:p-8">
          <StatusBadge variant="success">Featured update</StatusBadge>
          <p className="mt-5 text-sm font-semibold uppercase text-[var(--app-primary)]">
            {item.sourceName || "Creator news"}
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-[var(--app-text)] sm:text-3xl">
            {item.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--app-muted)]">
            {item.summary || "A current creator-market story from the public news index."}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button as="a" href={item.url} target="_blank" rel="noopener noreferrer">
              Read source
              <ArrowUpRight aria-hidden="true" size={18} />
            </Button>
            <StatusBadge variant="neutral">{getCategoryLabel(item.category)}</StatusBadge>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryNewsSection({ category, items }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <SectionCard
      title={category.label}
      description={`${category.count || items.length} cached update${(category.count || items.length) === 1 ? "" : "s"} from public creator-market sources.`}
    >
      <div className="space-y-3">
        {items.slice(0, 8).map((item, index) => (
          <NewsPost key={item._id || item.url} item={item} rank={index + 1} />
        ))}
      </div>
    </SectionCard>
  );
}

function NewsSidebar({ categories, sourceCount, lastRefreshedAt }) {
  const topCategories =
    categories.filter((category) => category.id !== "all");

  return (
    <aside className="space-y-4 xl:sticky xl:top-6">
      <SectionCard title="Source engine" description="Public news monitoring for creators.">
        <div className="grid gap-3">
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--app-primary)] text-white">
                <Layers aria-hidden="true" size={19} />
              </div>
              <div>
                <p className="text-xl font-semibold text-[var(--app-text)]">{sourceCount || "50+"}</p>
                <p className="text-xs font-semibold uppercase text-[var(--app-muted)]">No-key sources</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-500 text-white">
                <Flame aria-hidden="true" size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--app-text)]">Daily refresh</p>
                <p className="text-xs text-[var(--app-muted)]">{formatDateTime(lastRefreshedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Trending sections" description="Quick scan by creator category.">
        <div className="space-y-2">
          {topCategories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-text)]">
                <TrendingUp aria-hidden="true" size={15} />
                {category.label}
              </span>
              <span className="text-xs font-semibold text-[var(--app-muted)]">{category.count || 0}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </aside>
  );
}

export default function CreatorNews() {
  const [activeCategory, setActiveCategory] = useState("all");
  const queryClient = useQueryClient();

  const newsQuery = useQuery({
    queryKey: ["creator-news", activeCategory],
    queryFn: () =>
      creatorNewsService.list({
        category: activeCategory,
        limit: activeCategory === "all" ? 100 : 36,
      }),
    retry: false,
  });

  const refreshNews = useMutation({
    mutationFn: creatorNewsService.refresh,
    onSuccess: () => {
      toast.success("Creator market updates refreshed.");
      queryClient.invalidateQueries({
        queryKey: ["creator-news"],
      });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Creator market updates could not be refreshed right now."
        )
      );
    },
  });

  const categories = useMemo(
    () => [
      {
        id: "all",
        label: "All",
      },
      ...(newsQuery.data?.categories || []),
    ],
    [newsQuery.data?.categories]
  );

  const items =
    newsQuery.data?.items || [];
  const notifications =
    newsQuery.data?.notifications || [];
  const categorySections =
    categories
      .filter((category) => category.id !== "all")
      .map((category) => ({
        ...category,
        items:
          items.filter((item) => item.category === category.id),
      }));

  return (
    <section className="space-y-6 text-[var(--app-text)]">
      <PageHeader
        eyebrow="Creator News"
        title="Daily creator market updates"
        description={`Track creator economy, Instagram, influencer marketing, AI tools, and platform-update stories from ${newsQuery.data?.sourceCount || "50+"} public no-key sources.`}
        actions={
          <Button
            type="button"
            onClick={() => refreshNews.mutate()}
            disabled={refreshNews.isPending}
          >
            <RefreshCw aria-hidden="true" size={18} />
            {refreshNews.isPending ? "Refreshing..." : "Refresh news"}
          </Button>
        }
      />

      {notifications.map((notification) => (
        <section
          key={notification.type}
          className="rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-4 shadow-sm"
          aria-live="polite"
        >
          <div className="flex gap-3">
            <Bell aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--app-primary)]" size={19} />
            <div>
              <h2 className="text-sm font-semibold text-[var(--app-text)]">{notification.title}</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--app-muted)]">{notification.message}</p>
            </div>
          </div>
        </section>
      ))}

      <SectionCard
        title="Categories"
        description={`Last refreshed ${formatDateTime(newsQuery.data?.lastRefreshedAt)}. Daily automation refreshes this feed from the backend scheduler.`}
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={[
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                activeCategory === category.id
                  ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white"
                  : "border-[var(--app-border)] bg-[var(--app-paper)] text-[var(--app-muted)] hover:bg-[var(--app-bg)] hover:text-[var(--app-text)]",
              ].join(" ")}
            >
              {category.label}
              {category.count ? ` (${category.count})` : ""}
            </button>
          ))}
        </div>
      </SectionCard>

      {newsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <LoadingCard rows={5} />
          <LoadingCard rows={5} />
          <LoadingCard rows={5} />
        </div>
      ) : null}

      {!newsQuery.isLoading && newsQuery.error ? (
        <ErrorPanel
          title="Creator news is not available"
          message={getApiErrorMessage(newsQuery.error, "The creator news API is unavailable right now. Try refreshing later.")}
          action={
            <Button type="button" variant="secondary" onClick={() => newsQuery.refetch()} disabled={newsQuery.isFetching}>
              <RefreshCw aria-hidden="true" size={18} />
              Retry
            </Button>
          }
        />
      ) : null}

      {!newsQuery.isLoading && !newsQuery.error && items.length === 0 ? (
        <EmptyState
          title="No creator-market updates cached yet"
          description="Use refresh to fetch the latest public creator-market stories, or wait for the daily backend automation."
          action={
            <Button type="button" onClick={() => refreshNews.mutate()} disabled={refreshNews.isPending}>
              <Sparkles aria-hidden="true" size={18} />
              Refresh now
            </Button>
          }
        />
      ) : null}

      {items.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <FeaturedNewsLead item={items[0]} />

            {activeCategory === "all" ? (
              categorySections.map((section) => (
                <CategoryNewsSection
                  key={section.id}
                  category={section}
                  items={section.items}
                />
              ))
            ) : (
              <SectionCard
                title={getCategoryLabel(activeCategory)}
                description="A focused scrolling feed for this creator-market section."
              >
                <div className="app-scroll-strip max-h-[72vh] space-y-3 overflow-y-auto pr-1">
                  {items.slice(1).map((item, index) => (
                    <NewsPost key={item._id || item.url} item={item} rank={index + 1} />
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          <NewsSidebar
            categories={categories}
            sourceCount={newsQuery.data?.sourceCount}
            lastRefreshedAt={newsQuery.data?.lastRefreshedAt}
          />
        </div>
      ) : null}
    </section>
  );
}
