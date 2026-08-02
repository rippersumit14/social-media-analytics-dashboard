import { NavLink } from "react-router-dom";
import { X, Sparkles } from "lucide-react";

import { navigationItems } from "./navigationItems";

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--app-primary)] text-white shadow-sm shadow-blue-500/20">
          <Sparkles aria-hidden="true" size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--app-text)]">CreatorIQ</p>
          <p className="text-xs text-[var(--app-muted)]">Analytics SaaS</p>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--app-primary)] text-white shadow-sm shadow-blue-500/15"
                  : "text-[var(--app-muted)] hover:bg-[var(--app-bg)] hover:text-[var(--app-text)]",
              ].join(" ")
            }
          >
            <item.icon aria-hidden="true" size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export function Sidebar({ isMobileOpen = false, onMobileClose }) {
  return (
    <>
      <aside className="hidden min-h-screen w-72 shrink-0 border-r border-[var(--app-border)] bg-[var(--app-paper)]/92 px-4 py-5 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
          />
          <aside className="relative min-h-screen w-[min(20rem,calc(100vw-2rem))] border-r border-[var(--app-border)] bg-[var(--app-paper)] px-4 py-5 shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-bg)]"
              aria-label="Close navigation menu"
              onClick={onMobileClose}
            >
              <X aria-hidden="true" size={18} />
            </button>
            <SidebarContent onNavigate={onMobileClose} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
