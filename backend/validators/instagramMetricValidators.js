import { z } from "zod";

const metricValue = z
  .number({
    error:
      "Metric value must be a number or null",
  })
  .int("Metric value must be a whole number")
  .min(0, "Metric value cannot be negative")
  .max(
    1_000_000_000,
    "Metric value is too large"
  )
  .nullable()
  .optional();

export const manualInstagramMetricsSchema =
  z
    .object({
      followersCount:
        metricValue,

      followingCount:
        metricValue,

      mediaCount:
        metricValue,

      confirmedByUser:
        z.literal(true, {
          error:
            "You must confirm these values are manually provided estimates",
        }),
    })
    .strip()
    .refine(
      (data) =>
        ["followersCount", "followingCount", "mediaCount"].some(
          (key) =>
            Object.hasOwn(
              data,
              key
            )
        ),
      {
        message:
          "At least one manual metric value is required",
      }
    );
