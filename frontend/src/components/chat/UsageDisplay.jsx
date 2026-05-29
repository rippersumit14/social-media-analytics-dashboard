import {
  memo,
  useMemo,
} from "react";

/**
 * -------------------------------------------------------
 * Stable usage progress calculation.
 * -------------------------------------------------------
 */
const calculateUsagePercentage =
  (
    used = 0,
    limit = 0
  ) => {
    if (
      !limit ||
      limit <= 0
    ) {
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
 * -------------------------------------------------------
 * Stable usage warning helper.
 * -------------------------------------------------------
 */
const getUsageWarning =
  (
    remaining = 0
  ) => {
    if (
      remaining <= 0
    ) {
      return {
        message:
          "Daily limit reached",

        color:
          "text-red-600",
      };
    }

    if (
      remaining <= 3
    ) {
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
 * -------------------------------------------------------
 * Stable latency formatter.
 * -------------------------------------------------------
 */
const formatLatency =
  (
    latencyMs
  ) => {
    if (
      typeof latencyMs !==
        "number" ||
      latencyMs <= 0
    ) {
      return null;
    }

    return `${Math.round(
      latencyMs
    )}ms`;
  };

/**
 * -------------------------------------------------------
 * Stable remaining usage formatter.
 * -------------------------------------------------------
 */
const formatRemainingUsage =
  (
    remaining
  ) => {
    if (
      typeof remaining !==
      "number"
    ) {
      return null;
    }

    return Math.max(
      remaining,
      0
    );
  };

/**
 * -------------------------------------------------------
 * Production-grade AI usage display.
 * -------------------------------------------------------
 *
 * Handles:
 * - usage telemetry
 * - streaming-safe metadata
 * - AI provider metadata
 * - latency rendering
 * - session metadata
 * - usage-limit visualization
 * - retry-safe rendering
 */
const UsageDisplay = ({
  usageInfo,

  remainingUsage,

  modelName,

  latencyMs,

  sessionTitle,
}) => {
  /**
   * -------------------------------------------------------
   * Stable usage lifecycle.
   * -------------------------------------------------------
   */
  const normalizedUsage =
    useMemo(() => {
      if (
        !usageInfo ||
        typeof usageInfo !==
          "object"
      ) {
        return null;
      }

      return {
        used:
          Number(
            usageInfo.used
          ) || 0,

        limit:
          Number(
            usageInfo.limit
          ) || 0,

        remaining:
          Number(
            usageInfo.remaining
          ) || 0,

        plan:
          usageInfo.plan ||
          "Free",
      };
    }, [usageInfo]);

  /**
   * -------------------------------------------------------
   * Hide empty metadata state.
   * -------------------------------------------------------
   */
  const shouldRender =
    useMemo(() => {
      return Boolean(
        normalizedUsage ||
          typeof remainingUsage ===
            "number" ||
          sessionTitle ||
          modelName ||
          latencyMs
      );
    }, [
      normalizedUsage,
      remainingUsage,
      sessionTitle,
      modelName,
      latencyMs,
    ]);

  /**
   * -------------------------------------------------------
   * Stable usage percentage.
   * -------------------------------------------------------
   */
  const usagePercentage =
    useMemo(() => {
      return calculateUsagePercentage(
        normalizedUsage?.used,
        normalizedUsage?.limit
      );
    }, [
      normalizedUsage?.used,
      normalizedUsage?.limit,
    ]);

  /**
   * -------------------------------------------------------
   * Stable warning state.
   * -------------------------------------------------------
   */
  const usageWarning =
    useMemo(() => {
      return getUsageWarning(
        normalizedUsage?.remaining
      );
    }, [
      normalizedUsage?.remaining,
    ]);

  /**
   * -------------------------------------------------------
   * Stable latency rendering.
   * -------------------------------------------------------
   */
  const formattedLatency =
    useMemo(() => {
      return formatLatency(
        latencyMs
      );
    }, [latencyMs]);

  /**
   * -------------------------------------------------------
   * Stable remaining usage.
   * -------------------------------------------------------
   */
  const formattedRemainingUsage =
    useMemo(() => {
      return formatRemainingUsage(
        remainingUsage
      );
    }, [remainingUsage]);

  /**
   * -------------------------------------------------------
   * Stable metadata visibility.
   * -------------------------------------------------------
   */
  const showMetadata =
    useMemo(() => {
      return Boolean(
        modelName ||
          formattedLatency
      );
    }, [
      modelName,
      formattedLatency,
    ]);

  if (
    !shouldRender
  ) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------ */}
      {/* Usage Card */}
      {/* ------------------------------------------------ */}
      {normalizedUsage && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                AI Usage
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {
                  normalizedUsage.used
                }{" "}
                /{" "}
                {
                  normalizedUsage.limit
                }{" "}
                used
              </p>
            </div>

            {/* Plan */}
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {
                normalizedUsage.plan
              }
            </span>
          </div>

          {/* Progress */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage >=
                90
                  ? "bg-red-500"
                  : usagePercentage >=
                      70
                    ? "bg-amber-500"
                    : "bg-blue-600"
              }`}
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
                normalizedUsage.remaining
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

      {/* ------------------------------------------------ */}
      {/* Legacy Remaining Usage */}
      {/* ------------------------------------------------ */}
      {!normalizedUsage &&
        formattedRemainingUsage !==
          null && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-600">
              Remaining AI usage:{" "}
              {
                formattedRemainingUsage
              }
            </p>
          </div>
        )}

      {/* ------------------------------------------------ */}
      {/* Session Metadata */}
      {/* ------------------------------------------------ */}
      {(sessionTitle ||
        showMetadata) && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          {/* Session */}
          {sessionTitle && (
            <>
              <p className="text-sm text-gray-500">
                Current session:
              </p>

              <h3 className="mt-1 break-words font-semibold text-gray-800">
                {
                  sessionTitle
                }
              </h3>
            </>
          )}

          {/* ------------------------------------------------ */}
          {/* AI Metadata */}
          {/* ------------------------------------------------ */}
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

              {formattedLatency && (
                <span>
                  •{" "}
                  {
                    formattedLatency
                  }
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
 * -------------------------------------------------------
 * Prevent unnecessary rerenders.
 * -------------------------------------------------------
 */
export default memo(
  UsageDisplay
);