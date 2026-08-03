import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Drawer, IconButton } from "@mui/material";
import { Menu, Sparkles, X } from "lucide-react";

import { publicNavItems } from "../../config/landingContent";
import { routePaths } from "../../routes/routePaths";
import { ThemeToggle } from "../theme/ThemeToggle";

function scrollToSection(sectionId) {
  const node = document.getElementById(sectionId);

  if (node) {
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function BrandButton() {
  return (
    <Link
      to="/"
      onClick={(event) => {
        if (window.location.pathname === "/") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className="inline-flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-primary)]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--landing-primary)] text-white">
        <Sparkles aria-hidden="true" size={19} />
      </span>
      <span className="text-base font-semibold text-[var(--landing-text)]">CreatorIQ</span>
    </Link>
  );
}

export function PublicNavbar({ isAuthenticated }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Start free";
  const primaryPath = isAuthenticated ? routePaths.dashboard : routePaths.register;

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSectionClick(sectionId) {
    if (location.pathname !== "/") {
      return;
    }

    scrollToSection(sectionId);
    setIsDrawerOpen(false);
  }

  const navLinkClass = "rounded-lg px-2 py-2 text-sm font-semibold text-[var(--landing-muted)] transition hover:text-[var(--landing-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--landing-primary)]";

  return (
    <header className={["sticky top-0 z-40 transition", isScrolled ? "border-b border-[var(--landing-border)] bg-[var(--landing-card)]/88 shadow-sm backdrop-blur-xl" : "bg-transparent"].join(" ")}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Public navigation">
        <BrandButton />

        <div className="hidden items-center gap-1 lg:flex">
          {publicNavItems.map((item) => (
            <button key={item.sectionId} type="button" onClick={() => handleSectionClick(item.sectionId)} className={navLinkClass}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Button component={Link} to={routePaths.product} variant="outlined">
            Product story
          </Button>
          {!isAuthenticated ? (
            <Button component={Link} to={routePaths.login} variant="text" sx={{ color: "var(--landing-text)" }}>
              Log in
            </Button>
          ) : null}
          <Button component={Link} to={primaryPath} variant="contained">
            {primaryLabel}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <IconButton
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
            sx={{ color: "var(--landing-text)", border: "1px solid var(--landing-border)" }}
          >
            <Menu aria-hidden="true" size={20} />
          </IconButton>
        </div>
      </nav>

      <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <div className="flex h-full w-[min(22rem,100vw)] flex-col bg-[var(--landing-card)] p-5 text-[var(--landing-text)]">
          <div className="flex items-center justify-between gap-4">
            <BrandButton />
            <IconButton type="button" aria-label="Close navigation menu" onClick={() => setIsDrawerOpen(false)} sx={{ color: "var(--landing-text)" }}>
              <X aria-hidden="true" size={20} />
            </IconButton>
          </div>

          <div className="mt-8 grid gap-2">
            {publicNavItems.map((item) => (
              <button
                key={item.sectionId}
                type="button"
                onClick={() => handleSectionClick(item.sectionId)}
                className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-[var(--landing-muted)] hover:bg-[var(--landing-soft)] hover:text-[var(--landing-text)]"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto grid gap-3 border-t border-[var(--landing-border)] pt-5">
            <ThemeToggle />
            <Button component={Link} to={routePaths.product} variant="outlined" onClick={() => setIsDrawerOpen(false)}>
              Product story
            </Button>
            {!isAuthenticated ? (
              <Button component={Link} to={routePaths.login} variant="outlined" onClick={() => setIsDrawerOpen(false)}>
                Log in
              </Button>
            ) : null}
            <Button component={Link} to={primaryPath} variant="contained" onClick={() => setIsDrawerOpen(false)}>
              {primaryLabel}
            </Button>
          </div>
        </div>
      </Drawer>
    </header>
  );
}
