/**
 * Production-grade AI usage display.
 *
 * Handles:
 * - usage progress
 * - plan info
 * - warnings
 * - limit states
 */
const UsageDisplay = ({
  usageInfo,

  remainingUsage,

  modelName,

  latencyMs,

  sessionTitle,
}) => {
  /**
   * No usage available.
   */
  if (
    !usageInfo &&
    remainingUsage === null &&
    !sessionTitle
  ) {
    return null;
  }

  /**
   * Safe progress calculation.
   */
  const usagePercentage =
    usageInfo?.limit
      ? Math.min(
          Math.max(
            (usageInfo.used /
              usageInfo.limit) *
              100,
            0
          ),
          100
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Usage Card */}
      {usageInfo && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
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
          <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${usagePercentage}%`,
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Remaining:{" "}
              {
                usageInfo.remaining
              }
            </p>

            {/* Warnings */}
            {usageInfo.remaining >
              0 &&
              usageInfo.remaining <=
                3 && (
                <p className="text-xs font-medium text-amber-600">
                  Low usage remaining
                </p>
              )}

            {usageInfo.remaining <=
              0 && (
              <p className="text-xs font-medium text-red-600">
                Daily limit reached
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

      {/* Active Session Info */}
      {sessionTitle && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">
            Current session:
          </p>

          <h3 className="mt-1 font-semibold text-gray-800">
            {sessionTitle}
          </h3>

          {(modelName ||
            latencyMs) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {modelName && (
                <span>
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

export default UsageDisplay;