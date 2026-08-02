import { AlertCircle } from "lucide-react";

import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingCard } from "../../../components/ui/LoadingCard";
import { getApiErrorMessage } from "../../../utils/apiError";
import { ConversationItem } from "./ConversationItem";

export function ConversationList({
  activeConversationId,
  conversations,
  error,
  isLoading,
  isRenaming,
  onDelete,
  onRename,
  onSelect,
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingCard rows={2} />
        <LoadingCard rows={2} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <div className="flex gap-2">
          <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
          <span>{getApiErrorMessage(error, "Unable to load conversations.")}</span>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Start a chat once your Instagram account is connected."
      />
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation._id}
          conversation={conversation}
          isActive={conversation._id === activeConversationId}
          isRenaming={isRenaming}
          onDelete={onDelete}
          onRename={onRename}
          onSelect={() => onSelect(conversation._id)}
        />
      ))}
    </div>
  );
}
