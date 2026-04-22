/**
 * AI Insights Card
 * Shows AI-generated insights plus remaining usage count
 */
const AIInsightsCard = ({
  insights,
  loading,
  onGenerate,
  remainingUsage,
}) => {
  // Convert AI text into bullet-like lines
  const insightLines = insights
    ? insights
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    : [];

  return (
    <div className="mt-10 rounded-xl bg-white p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            AI Insights
          </h2>

          {typeof remainingUsage === "number" && (
            <p className="mt-1 text-sm text-gray-500">
              Remaining AI usage: {remainingUsage}
            </p>
          )}
        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Insights"}
        </button>
      </div>

      <div className="mt-4 text-gray-600">
        {insightLines.length > 0 ? (
          <ul className="list-disc space-y-2 pl-5">
            {insightLines.map((line, index) => (
              <li key={index}>{line.replace(/^-+\s*/, "")}</li>
            ))}
          </ul>
        ) : (
          <p>Click the button to generate insights.</p>
        )}
      </div>
    </div>
  );
};

export default AIInsightsCard;