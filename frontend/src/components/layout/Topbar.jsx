import { Link } from "react-router-dom";
import { Bell, LogOut, Menu, Search, Sparkles } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { routePaths } from "../../routes/routePaths";

export function Topbar({ onMenuClick }) {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--app-border)] bg-[var(--app-paper)]/88 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={routePaths.dashboard} className="flex items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-primary)] text-white">
            <Sparkles aria-hidden="true" size={18} />
          </span>
          <span className="text-sm font-semibold text-[var(--app-text)]">CreatorIQ</span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-[var(--app-muted)] md:flex">
          <Search aria-hidden="true" size={17} />
          <span className="text-sm">Search will connect to content, notes, and conversations later</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[var(--app-text)]">{user?.name || "Creator"}</p>
            <p className="max-w-48 truncate text-xs text-[var(--app-muted)]">{user?.email || "Signed in"}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] text-[var(--app-text)] transition hover:bg-[var(--app-bg)]"
            aria-label="Open notifications"
          >
            <Bell aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] px-3 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-bg)]"
            aria-label="Log out"
          >
            <LogOut aria-hidden="true" size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] text-[var(--app-text)] transition hover:bg-[var(--app-bg)] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
