export function StatCard({ label, value, detail, icon: Icon, tone = "brand" }) {
  const tones = {
    brand: "bg-blue-50 text-brand-700",
    mint: "bg-teal-50 text-mint-500",
    amber: "bg-amber-50 text-amber-500",
    slate: "bg-cloud-100 text-ink-700",
  };

  return (
    <div className="rounded-lg border border-line-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink-950">{value}</p>
        </div>
        {Icon ? (
          <span className={["flex h-10 w-10 items-center justify-center rounded-lg", tones[tone]].join(" ")}>
            <Icon aria-hidden="true" size={19} />
          </span>
        ) : null}
      </div>
      {detail ? <p className="mt-3 text-sm text-ink-500">{detail}</p> : null}
    </div>
  );
}
