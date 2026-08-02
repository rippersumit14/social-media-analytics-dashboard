import {
  buildAccountMetrics,
  getMetricValue,
  hasManualMetrics,
} from "../../utils/instagramMetricSources.js";

describe("instagramMetricSources", () => {
  it("prefers provider-confirmed values over manual estimates", () => {
    const metrics =
      buildAccountMetrics({
        followers: 500,
        metricsAvailability: {
          followers: true,
        },
        manualMetrics: {
          followers: {
            value: 300,
            confirmedByUser: true,
          },
        },
      });

    expect(metrics.followers).toMatchObject({
      value: 500,
      source: "meta",
    });
    expect(hasManualMetrics(metrics)).toBe(false);
  });

  it("uses manual estimates only when provider values are unavailable", () => {
    const metrics =
      buildAccountMetrics({
        metricsAvailability: {
          followers: false,
        },
        manualMetrics: {
          followers: {
            value: 300,
            confirmedByUser: true,
            updatedAt: new Date(),
          },
        },
      });

    expect(metrics.followers.source).toBe("manual");
    expect(getMetricValue(metrics, "followers")).toBe(300);
    expect(hasManualMetrics(metrics)).toBe(true);
  });

  it("marks missing provider and manual values as unavailable", () => {
    const metrics =
      buildAccountMetrics({
        metricsAvailability: {},
        manualMetrics: {},
      });

    expect(metrics.mediaCount).toMatchObject({
      value: null,
      source: "unavailable",
    });
  });
});
