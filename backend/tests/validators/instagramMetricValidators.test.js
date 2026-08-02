import { manualInstagramMetricsSchema } from "../../validators/instagramMetricValidators.js";

describe("manualInstagramMetricsSchema", () => {
  it("accepts non-negative integer manual metric estimates", () => {
    const result =
      manualInstagramMetricsSchema.safeParse({
        followersCount: 1200,
        followingCount: 100,
        mediaCount: 42,
        confirmedByUser: true,
        ignored: "removed",
      });

    expect(result.success).toBe(true);
    expect(result.data.ignored).toBeUndefined();
  });

  it("accepts null values for clearing manual estimates", () => {
    const result =
      manualInstagramMetricsSchema.safeParse({
        followersCount: null,
        mediaCount: null,
        confirmedByUser: true,
      });

    expect(result.success).toBe(true);
  });

  it("rejects strings, negative values, decimals, and missing confirmation", () => {
    const result =
      manualInstagramMetricsSchema.safeParse({
        followersCount: "100",
        followingCount: -1,
        mediaCount: 4.5,
        confirmedByUser: false,
      });

    expect(result.success).toBe(false);
    expect(
      result.error.issues.map((issue) => issue.path[0])
    ).toEqual(
      expect.arrayContaining([
        "followersCount",
        "followingCount",
        "mediaCount",
        "confirmedByUser",
      ])
    );
  });
});
