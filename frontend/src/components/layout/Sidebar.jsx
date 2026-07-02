import { NavLink } from "react-router-dom";
import { X, Sparkles } from "lucide-react";

import { navigationItems } from "./navigationItems";

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Sparkles aria-hidden="true" size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-950">CreatorIQ</p>
          <p className="text-xs text-ink-500">Analytics SaaS</p>
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
                  ? "bg-brand-600 text-white"
                  : "text-ink-700 hover:bg-cloud-100 hover:text-ink-950",
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
      <aside className="hidden min-h-screen w-72 shrink-0 border-r border-line-200 bg-white px-4 py-5 lg:block">
        <SidebarContent />
      </aside>

      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 bg-ink-950/30"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
          />
          <aside className="relative min-h-screen w-[min(20rem,calc(100vw-2rem))] border-r border-line-200 bg-white px-4 py-5 shadow-xl">
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line-200 text-ink-700"
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
