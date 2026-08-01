import { useEffect, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { ArrowUp } from "lucide-react";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 640);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Tooltip title="Back to top">
      <IconButton
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 30,
          color: "white",
          backgroundColor: "var(--landing-primary)",
          boxShadow: "var(--landing-shadow)",
          "&:hover": {
            backgroundColor: "var(--landing-primary)",
          },
        }}
      >
        <ArrowUp aria-hidden="true" size={20} />
      </IconButton>
    </Tooltip>
  );
}
