import {
  memo,
  useMemo,
} from "react";

/**
 * -------------------------------------------------------
 * Stable insight formatter.
 * -------------------------------------------------------
 */
const formatInsights = (
  insights = ""
) => {
  return insights
    .split("\n")
    .map((line) =>
      line.trim()
    )
    .filter(
      (line) =>
        line.length > 0
    );
};

/**
 * -------------------------------------------------------
 * Stable loading skeleton.
 * -------------------------------------------------------
 */
const LoadingSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="h-4 animate-pulse rounded bg-gray-200"
        />
      ))}
    </div>
  );
};

/**
 * -------------------------------------------------------
 * Production-grade AI insights card.
 * -------------------------------------------------------
 *
 * Handles:
 * - AI insight rendering
 * - loading lifecycle
 * - usage lifecycle
 * - empty states
 * - multiline formatting
 */
const AIInsightsCard = ({
  insights = "",

  loading = false,

  onGenerate,

  remainingUsage =
    null,
}) => {
  /**
   * -------------------------------------------------------
   * Stable formatted insights.
   * -------------------------------------------------------
   */
  const insightLines =
    useMemo(() => {
      return formatInsights(
        insights
      );
    }, [insights]);

  /**
   * -------------------------------------------------------
   * Usage limit lifecycle.
   * -------------------------------------------------------
   */
  const isUsageLimitReached =
    useMemo(() => {
      return (
        typeof remainingUsage ===
          "number" &&
        remainingUsage <= 0
      );
    }, [remainingUsage]);

  return (
    <section
      data-testid="ai-insights-card"
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            AI Insights
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Generate AI-powered
            engagement analysis,
            growth opportunities,
            content strategy, and
            audience insights.
          </p>

          {/* Usage */}
          {typeof remainingUsage ===
            "number" && (
            <p
              className={`mt-3 text-sm font-medium ${
                isUsageLimitReached
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              Remaining AI
              usage:{" "}
              {
                remainingUsage
              }
            </p>
          )}
        </div>

        {/* Generate */}
        <button
          type="button"
          onClick={
            onGenerate
          }
          disabled={
            loading ||
            isUsageLimitReached
          }
          className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Generating..."
            : "Generate Insights"}
        </button>
      </div>

      {/* ------------------------------------------------ */}
      {/* Usage Limit */}
      {/* ------------------------------------------------ */}
      {isUsageLimitReached && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Daily AI usage limit
          reached.
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* Content */}
      {/* ------------------------------------------------ */}
      <div className="mt-6">
        {/* Loading */}
        {loading ? (
          <LoadingSkeleton />
        ) : insightLines.length >
          0 ? (
          /**
           * Insights
           */
          <div className="space-y-4">
            {insightLines.map(
              (
                line,
                index
              ) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-purple-500" />

                  <p className="text-sm leading-7 text-gray-700">
                    {line.replace(
                      /^[-•]\s*/,
                      ""
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          /**
           * Empty State
           */
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
            <h3 className="text-lg font-medium text-gray-700">
              No AI insights yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Generate AI-powered
              insights to analyze
              engagement, growth,
              audience behavior,
              and content strategy.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(
  AIInsightsCard
);