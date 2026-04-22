const AIInsightsCard = ({ insights, loading, onGenerate }) => {
  return (
    <div className="mt-10 rounded-xl bg-white p-6 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">
            AI Insights
        </h2>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Insights"}
        </button>
      </div>

      <div className="mt-4 whitespace-pre-line text-gray-600">
        {insights || "Click the button to generate insights."}
      </div>
    </div>
  );
};

export default AIInsightsCard;