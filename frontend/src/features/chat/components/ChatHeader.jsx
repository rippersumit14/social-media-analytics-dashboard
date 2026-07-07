import { Menu, MessageSquarePlus, PanelLeftOpen } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";

export function ChatHeader({ account, conversation, isCreating, onCreateConversation, onOpenSidebar }) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-line-200 bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line-200 text-ink-700 lg:hidden"
          aria-label="Open conversations"
        >
          <Menu aria-hidden="true" size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-ink-950">{conversation?.title || "AI Chat"}</h1>
          <p className="truncate text-sm text-ink-500">
            {account?.username ? `Context: @${account.username}` : "Connect Instagram for creator context"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge variant={account ? "success" : "warning"}>{account ? "Context ready" : "No context"}</StatusBadge>
        <Button type="button" variant="secondary" className="hidden sm:inline-flex" onClick={() => onCreateConversation()} disabled={!account || isCreating}>
          <MessageSquarePlus aria-hidden="true" size={18} />
          New
        </Button>
        <span className="hidden text-ink-500 xl:inline-flex">
          <PanelLeftOpen aria-hidden="true" size={18} />
        </span>
      </div>
    </header>
  );
}
