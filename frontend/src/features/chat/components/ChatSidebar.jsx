import { Link } from "react-router-dom";
import { MessageCirclePlus, Search, X } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { routePaths } from "../../../routes/routePaths";
import { ConversationList } from "./ConversationList";

export function ChatSidebar({
  account,
  activeConversationId,
  conversations,
  error,
  isCreating,
  isLoading,
  isMobileOpen,
  isRenaming,
  isRestoring,
  lastDeletedConversationId,
  onCloseMobile,
  onCreateConversation,
  onDelete,
  onRename,
  onRestore,
  onSelect,
  searchTerm,
  setSearchTerm,
}) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--app-border)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--app-text)]">AI Workspace</p>
            <p className="mt-1 text-xs text-[var(--app-muted)]">Memory-aware creator guidance</p>
          </div>
          {onCloseMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-text)] transition hover:bg-[var(--app-bg)] lg:hidden"
              aria-label="Close conversations"
            >
              <X aria-hidden="true" size={18} />
            </button>
          ) : null}
        </div>

        <div className="mt-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase text-[var(--app-muted)]">Account</span>
            <StatusBadge variant={account ? "success" : "warning"}>{account ? "Connected" : "Needed"}</StatusBadge>
          </div>
          <p className="mt-2 truncate text-sm font-semibold text-[var(--app-text)]">{account?.username ? `@${account.username}` : "No Instagram account"}</p>
          {!account ? (
            <Link to={routePaths.instagram} className="mt-2 inline-flex text-xs font-semibold text-[var(--app-primary)]">
              Connect account
            </Link>
          ) : null}
        </div>

        <Button type="button" className="mt-4 w-full" onClick={() => onCreateConversation()} disabled={!account || isCreating}>
          <MessageCirclePlus aria-hidden="true" size={18} />
          {isCreating ? "Creating..." : "New conversation"}
        </Button>
        {lastDeletedConversationId ? (
          <Button
            type="button"
            variant="secondary"
            className="mt-2 w-full"
            onClick={() => onRestore(lastDeletedConversationId)}
            disabled={isRestoring}
          >
            {isRestoring ? "Restoring..." : "Restore last deleted"}
          </Button>
        ) : null}

        <div className="mt-4 flex h-10 items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] px-3 text-[var(--app-muted)]">
          <Search aria-hidden="true" size={17} />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)]"
            placeholder="Search conversations"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <ConversationList
          activeConversationId={activeConversationId}
          conversations={conversations}
          error={error}
          isLoading={isLoading}
          isRenaming={isRenaming}
          onDelete={onDelete}
          onRename={onRename}
          onSelect={(conversationId) => {
            onSelect(conversationId);
            onCloseMobile?.();
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-full w-80 shrink-0 border-r border-[var(--app-border)] bg-[var(--app-paper)] lg:block">{content}</aside>
      {isMobileOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden" role="dialog" aria-modal="true" aria-label="Conversations">
          <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label="Close conversations" onClick={onCloseMobile} />
          <aside className="relative h-full w-[min(22rem,calc(100vw-2rem))] bg-[var(--app-paper)] shadow-xl">{content}</aside>
        </div>
      ) : null}
    </>
  );
}
