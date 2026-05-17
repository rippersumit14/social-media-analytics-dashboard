import { useState } from "react";

/**
 * ChatSidebar
 * - Displays chat sessions list
 * - Handles rename/delete/select
 * - Fully defensive against backend inconsistencies
 */
const ChatSidebar = ({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  isLoading = false,
}) => {
  // Currently editing session tracking
  const [editingSessionId, setEditingSessionId] = useState(null);

  // Input state for rename
  const [editTitle, setEditTitle] = useState("");

  /**
   * Start renaming session
   */
  const handleStartEdit = (session) => {
    if (!session?.sessionId) return;

    setEditingSessionId(session.sessionId);
    setEditTitle(session.title || "New Chat");
  };

  /**
   * Submit rename request
   */
  const handleSubmitEdit = async (sessionId) => {
    const cleanTitle = editTitle.trim();

    if (!sessionId || !cleanTitle) return;

    try {
      await onRenameSession?.(sessionId, cleanTitle);
    } finally {
      // Always reset UI state even if API fails
      setEditingSessionId(null);
      setEditTitle("");
    }
  };

  /**
   * Cancel editing safely
   */
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + New Chat
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {/* Loading state */}
        {isLoading && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Loading chats...
          </p>
        )}

        {/* Empty state */}
        {!isLoading && sessions.length === 0 && (
          <p className="mt-4 text-center text-sm text-gray-500">
            No chat history yet
          </p>
        )}

        {/* Sessions */}
        {!isLoading &&
          sessions.map((session, index) => {
            // Defensive sessionId handling
            const sessionId = session?.sessionId || session?._id || index;

            const isActive = activeSessionId === session?.sessionId;
            const isEditing = editingSessionId === session?.sessionId;

            return (
              <div
                key={sessionId}
                onClick={() =>
                  session?.sessionId && onSelectSession?.(session.sessionId)
                }
                className={`group cursor-pointer rounded-lg border p-3 transition ${
                  isActive
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {/* Rename Mode */}
                {isEditing ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
                    onBlur={() =>
                      handleSubmitEdit(session?.sessionId)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmitEdit(session?.sessionId);
                      }

                      if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                  />
                ) : (
                  <>
                    {/* Title */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="truncate text-sm font-semibold text-gray-900">
                        {session?.title || "New Chat"}
                      </h4>
                    </div>

                    {/* Preview */}
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {session?.lastMessagePreview || "No messages yet"}
                    </p>

                    {/* Actions */}
                    <div className="mt-2 flex gap-3 opacity-0 transition group-hover:opacity-100">
                      {/* Rename */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(session);
                        }}
                        className="text-xs text-gray-600 hover:text-blue-600"
                      >
                        Rename
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (session?.sessionId) {
                            onDeleteSession?.(session.sessionId);
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </aside>
  );
};

export default ChatSidebar;