import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ChatHeader } from "../features/chat/components/ChatHeader";
import { ChatInput } from "../features/chat/components/ChatInput";
import { ChatSidebar } from "../features/chat/components/ChatSidebar";
import { MessageList } from "../features/chat/components/MessageList";
import { useChatWorkspace } from "../features/chat/hooks/useChatWorkspace";
import { hasManualMetrics, hasUnavailableMetrics } from "../utils/metricSources";
import { routePaths } from "../routes/routePaths";

export default function AIChat() {
  const [isConversationDrawerOpen, setIsConversationDrawerOpen] = useState(false);
  const chat = useChatWorkspace();

  const activeConversation = useMemo(
    () => chat.conversations.find((conversation) => conversation._id === chat.activeConversationId),
    [chat.activeConversationId, chat.conversations],
  );

  return (
    <section className="h-[calc(100vh-7rem)] min-h-[42rem] overflow-hidden rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] shadow-sm shadow-black/5">
      <div className="flex h-full min-h-0">
        <ChatSidebar
          account={chat.account}
          activeConversationId={chat.activeConversationId}
          conversations={chat.filteredConversations}
          error={chat.conversationsError}
          isCreating={chat.isCreatingConversation}
          isLoading={chat.isLoadingConversations}
          isMobileOpen={isConversationDrawerOpen}
          isRenaming={chat.isRenamingConversation}
          isRestoring={chat.isRestoringConversation}
          lastDeletedConversationId={chat.lastDeletedConversationId}
          onCloseMobile={() => setIsConversationDrawerOpen(false)}
          onCreateConversation={chat.createConversation}
          onDelete={chat.deleteConversation}
          onRename={chat.renameConversation}
          onRestore={chat.restoreConversation}
          onSelect={chat.setActiveConversationId}
          searchTerm={chat.searchTerm}
          setSearchTerm={chat.setSearchTerm}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-[var(--app-bg)]">
          <ChatHeader
            account={chat.account}
            conversation={activeConversation}
            isCreating={chat.isCreatingConversation}
            onCreateConversation={chat.createConversation}
            onOpenSidebar={() => setIsConversationDrawerOpen(true)}
          />

          {chat.account && (hasUnavailableMetrics(chat.account) || hasManualMetrics(chat.account)) ? (
            <div className="border-b border-[var(--app-border)] bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-500/10 dark:text-amber-100" role="status">
              <strong>Sorry for the inconvenience. Meta did not return complete account data.</strong>{" "}
              The assistant can still help with creator strategy, but it will avoid fake precision and clearly label manual estimates. Add your public follower, following, and post counts to unlock more useful limited scoring and planning guidance.{" "}
              <Link to={routePaths.instagram} className="font-semibold underline">
                Add manual metrics
              </Link>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <MessageList
              account={chat.account}
              activeConversationId={chat.activeConversationId}
              error={chat.messageError}
              isCreatingConversation={chat.isCreatingConversation}
              isLoading={chat.isLoadingMessages}
              isSending={chat.isSendingMessage}
              messages={chat.messages}
              onCreateConversation={chat.createConversation}
              streamError={chat.streamError}
              streamModel={chat.streamModel}
            />
          </div>

          <ChatInput
            disabled={!chat.activeConversationId || !chat.account}
            isSending={chat.isSendingMessage}
            onSend={chat.sendMessage}
            onStop={chat.stopStreaming}
          />
        </div>
      </div>
    </section>
  );
}
