const variants = {
  success: "border-teal-500/30 bg-teal-500/10 text-teal-700",
  warning: "border-amber-500/35 bg-amber-500/10 text-amber-700",
  neutral: "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)]",
  danger: "border-red-500/30 bg-red-500/10 text-red-700",
};

export function StatusBadge({ children, variant = "neutral" }) {
  return (
    <span className={["inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", variants[variant]].join(" ")}>
      {children}
    </span>
  );
}
