import { useMemo, useState } from "react";
import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { Save, Trash2 } from "lucide-react";

import { formatDateTime } from "../../utils/formatters";
import { getMetricSourceLabel } from "../../utils/metricSources";

const fieldConfig = [
  {
    key: "followersCount",
    metricKey: "followers",
    label: "Followers",
    helper: "Your current public follower count.",
  },
  {
    key: "followingCount",
    metricKey: "follows",
    label: "Following",
    helper: "Your current public following count.",
  },
  {
    key: "mediaCount",
    metricKey: "mediaCount",
    label: "Published posts",
    helper: "Your current public post or media count.",
  },
];

function toInputValue(metric) {
  return metric?.source === "manual" && Number.isFinite(Number(metric.value))
    ? String(metric.value)
    : "";
}

function validate(values, confirmed) {
  const errors = {};
  const hasValue = Object.values(values).some((value) => value !== "");

  if (!hasValue) {
    errors.form = "Enter at least one manual estimate.";
  }

  Object.entries(values).forEach(([key, value]) => {
    if (value === "") return;

    const number = Number(value);

    if (!Number.isInteger(number) || number < 0) {
      errors[key] = "Use a non-negative whole number.";
    }

    if (number > 1_000_000_000) {
      errors[key] = "Value is too large.";
    }
  });

  if (!confirmed) {
    errors.confirmed = "Confirm that these are manual estimates.";
  }

  return errors;
}

export function ManualMetricsForm({ account, isSaving, onSave }) {
  const [values, setValues] = useState(() => ({
    followersCount: toInputValue(account?.metrics?.followers),
    followingCount: toInputValue(account?.metrics?.follows),
    mediaCount: toInputValue(account?.metrics?.mediaCount),
  }));
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  const manualUpdatedAt = useMemo(() => {
    const dates = Object.values(account?.metrics || {})
      .filter((metric) => metric?.source === "manual" && metric.updatedAt)
      .map((metric) => new Date(metric.updatedAt).getTime());

    return dates.length ? new Date(Math.max(...dates)) : null;
  }, [account?.metrics]);

  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value.replace(/[^\d]/g, "") }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(values, confirmed);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSave({
      followersCount: values.followersCount === "" ? undefined : Number(values.followersCount),
      followingCount: values.followingCount === "" ? undefined : Number(values.followingCount),
      mediaCount: values.mediaCount === "" ? undefined : Number(values.mediaCount),
      confirmedByUser: true,
    });
  }

  async function resetManualValues() {
    await onSave({
      followersCount: null,
      followingCount: null,
      mediaCount: null,
      confirmedByUser: true,
    });

    setValues({
      followersCount: "",
      followingCount: "",
      mediaCount: "",
    });
    setConfirmed(false);
  }

  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-sm">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase text-[var(--app-primary)]">Manual fallback</p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">Add your current account numbers manually</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
          Sorry for the inconvenience. Meta did not return every account metric for this connection. This can happen because
          of account type, app review status, permissions, newly converted creator accounts, or unavailable activity. Enter
          your current public counts here so CreatorIQ can keep the dashboard, Creator Score, recommendations, and AI chat
          usable in a clearly labeled limited estimate mode.
        </p>
        {manualUpdatedAt ? (
          <p className="mt-2 text-xs font-medium text-[var(--app-muted)]">Manual values last updated {formatDateTime(manualUpdatedAt)}.</p>
        ) : null}
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          {fieldConfig.map((field) => {
            const metric = account?.metrics?.[field.metricKey];
            const isMeta = metric?.source === "meta";

            return (
              <TextField
                key={field.key}
                label={field.label}
                value={values[field.key]}
                onChange={(event) => updateValue(field.key, event.target.value)}
                disabled={isSaving || isMeta}
                error={Boolean(errors[field.key])}
                helperText={errors[field.key] || `${field.helper} Source: ${getMetricSourceLabel(metric?.source)}.`}
                slotProps={{ htmlInput: { inputMode: "numeric", min: 0 } }}
              />
            );
          })}
        </div>

        {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}
        <FormControlLabel
          control={<Checkbox checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />}
          label="I understand these values are manually provided and may reduce analysis accuracy."
        />
        {errors.confirmed ? <p className="-mt-3 text-sm text-red-600">{errors.confirmed}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="contained" disabled={isSaving} startIcon={<Save size={16} />}>
            {isSaving ? "Saving..." : "Save manual estimates"}
          </Button>
          <Button type="button" variant="outlined" color="warning" disabled={isSaving} onClick={resetManualValues} startIcon={<Trash2 size={16} />}>
            Remove manual values
          </Button>
        </div>
      </form>
    </section>
  );
}
