import {
  memo,
  useMemo,
} from "react";

/**
 * Stable usage progress calculation.
 */
const calculateUsagePercentage =
  (used = 0, limit = 0) => {
    if (!limit) {
      return 0;
    }

    return Math.min(
      Math.max(
        (used / limit) * 100,
        0
      ),
      100
    );
  };

/**
 * Stable usage warning helper.
 */
const getUsageWarning =
  (remaining = 0) => {
    if (remaining <= 0) {
      return {
        message:
          "Daily limit reached",

        color:
          "text-red-600",
      };
    }

    if (remaining <= 3) {
      return {
        message:
          "Low usage remaining",

        color:
          "text-amber-600",
      };
    }

    return null;
  };

/**
 * Production-grade AI usage display.
 *
 * Handles:
 * - usage telemetry
 * - plan information
 * - AI metadata
 * - session metadata
 */
const UsageDisplay = ({
  usageInfo,

  remainingUsage,

  modelName,

  latencyMs,

  sessionTitle,
}) => {
  /**
   * Hide empty metadata state.
   */
  const shouldRender =
    useMemo(() => {
      return (
        usageInfo ||
        remainingUsage !==
          null ||
        sessionTitle
      );
    }, [
      usageInfo,
      remainingUsage,
      sessionTitle,
    ]);

  /**
   * Stable usage percentage.
   */
  const usagePercentage =
    useMemo(() => {
      return calculateUsagePercentage(
        usageInfo?.used,
        usageInfo?.limit
      );
    }, [
      usageInfo?.used,
      usageInfo?.limit,
    ]);

  /**
   * Stable usage warning state.
   */
  const usageWarning =
    useMemo(() => {
      return getUsageWarning(
        usageInfo?.remaining
      );
    }, [
      usageInfo?.remaining,
    ]);

  /**
   * Stable metadata visibility.
   */
  const showMetadata =
    useMemo(() => {
      return (
        modelName ||
        latencyMs
      );
    }, [
      modelName,
      latencyMs,
    ]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Usage Card */}
      {usageInfo && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                AI Usage
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {
                  usageInfo.used
                }{" "}
                /{" "}
                {
                  usageInfo.limit
                }{" "}
                used
              </p>
            </div>

            {/* Plan */}
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {
                usageInfo.plan
              }
            </span>
          </div>

          {/* Progress */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${usagePercentage}%`,
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              Remaining:{" "}
              {
                usageInfo.remaining
              }
            </p>

            {/* Warning */}
            {usageWarning && (
              <p
                className={`text-xs font-medium ${usageWarning.color}`}
              >
                {
                  usageWarning.message
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legacy Remaining Usage */}
      {!usageInfo &&
        typeof remainingUsage ===
          "number" && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-600">
              Remaining AI usage:{" "}
              {remainingUsage}
            </p>
          </div>
        )}

      {/* Session Metadata */}
      {sessionTitle && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">
            Current session:
          </p>

          <h3 className="mt-1 break-words font-semibold text-gray-800">
            {sessionTitle}
          </h3>

          {/* AI Metadata */}
          {showMetadata && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              {modelName && (
                <span className="break-all">
                  Model:{" "}
                  <span className="font-medium text-gray-700">
                    {
                      modelName
                    }
                  </span>
                </span>
              )}

              {latencyMs && (
                <span>
                  •{" "}
                  {latencyMs}
                  ms
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Prevent unnecessary rerenders.
 */
export default memo(
  UsageDisplay
);