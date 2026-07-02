const variants = {
  success: "border-teal-200 bg-teal-50 text-teal-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-line-200 bg-cloud-50 text-ink-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ children, variant = "neutral" }) {
  return (
    <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", variants[variant]].join(" ")}>
      {children}
    </span>
  );
}
