import { useSectionReveal } from "../../hooks/useSectionReveal";

export function Reveal({ as: Component = "div", children, className = "" }) {
  const { ref, isVisible } = useSectionReveal();

  return (
    <Component ref={ref} className={["landing-reveal", isVisible ? "is-visible" : "", className].join(" ")}>
      {children}
    </Component>
  );
}
