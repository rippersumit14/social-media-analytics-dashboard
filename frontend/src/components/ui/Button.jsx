const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-line-200 bg-white text-ink-700 hover:bg-cloud-100",
  ghost: "text-ink-700 hover:bg-cloud-100",
};

export function Button({ as: Component = "button", variant = "primary", className = "", ...props }) {
  return (
    <Component
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
