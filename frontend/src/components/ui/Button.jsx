const variants = {
  primary: "bg-[var(--app-primary)] text-white shadow-sm shadow-blue-500/15 hover:brightness-95",
  secondary: "border border-[var(--app-border)] bg-[var(--app-paper)] text-[var(--app-text)] hover:bg-[var(--app-bg)]",
  ghost: "text-[var(--app-text)] hover:bg-[var(--app-bg)]",
};

export function Button({ as: Component = "button", variant = "primary", className = "", ...props }) {
  return (
    <Component
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
