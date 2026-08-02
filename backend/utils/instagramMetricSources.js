const isFiniteMetric = (value) => {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0;
};

const buildMetric = ({
  providerValue,
  providerAvailable,
  manualMetric,
}) => {
  if (
    providerAvailable &&
    isFiniteMetric(providerValue)
  ) {
    return {
      value: Number(providerValue),
      source: "meta",
      updatedAt: null,
      confirmedByUser: false,
    };
  }

  if (
    isFiniteMetric(manualMetric?.value) &&
    manualMetric?.confirmedByUser
  ) {
    return {
      value: Number(manualMetric.value),
      source: "manual",
      updatedAt: manualMetric.updatedAt || null,
      confirmedByUser: true,
    };
  }

  return {
    value: null,
    source: "unavailable",
    updatedAt: null,
    confirmedByUser: false,
  };
};

export const buildAccountMetrics = (account) => {
  return {
    followers: buildMetric({
      providerValue: account.followers,
      providerAvailable:
        account.metricsAvailability?.followers,
      manualMetric:
        account.manualMetrics?.followers,
    }),

    follows: buildMetric({
      providerValue: account.follows,
      providerAvailable:
        account.metricsAvailability?.follows,
      manualMetric:
        account.manualMetrics?.follows,
    }),

    mediaCount: buildMetric({
      providerValue: account.mediaCount,
      providerAvailable:
        account.metricsAvailability?.mediaCount,
      manualMetric:
        account.manualMetrics?.mediaCount,
    }),
  };
};

export const hasManualMetrics = (metrics) => {
  return Object.values(metrics).some(
    (metric) => metric.source === "manual"
  );
};

export const getMetricValue = (metrics, key) => {
  const value = metrics?.[key]?.value;

  return isFiniteMetric(value)
    ? Number(value)
    : null;
};
