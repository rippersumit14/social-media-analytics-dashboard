import { useMemo, useState } from "react";

import { ChatHeader } from "../features/chat/components/ChatHeader";
import { ChatInput } from "../features/chat/components/ChatInput";
import { ChatSidebar } from "../features/chat/components/ChatSidebar";
import { MessageList } from "../features/chat/components/MessageList";
import { useChatWorkspace } from "../features/chat/hooks/useChatWorkspace";

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
            />
          </div>

          <ChatInput
            disabled={!chat.activeConversationId || !chat.account}
            isSending={chat.isSendingMessage}
            onSend={chat.sendMessage}
          />
        </div>
      </div>
    </section>
  );
}
