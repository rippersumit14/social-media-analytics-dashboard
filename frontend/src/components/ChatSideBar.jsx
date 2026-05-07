import { useState } from "react";

const ChatSidebar = ({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  isLoading = false,
}) => {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (session) => {
    setEditingSessionId(session.sessionId);
    setEditTitle(session.title || "New Chat");
  };

  const handleSubmitEdit = async (sessionId) => {
    const cleanTitle = editTitle.trim();

    if (!cleanTitle) return;

    await onRenameSession(sessionId, cleanTitle);

    setEditingSessionId(null);
    setEditTitle("");
  };

  return (
    <aside className="w-72 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Loading chats...
          </p>
        )}

        {!isLoading && sessions.length === 0 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            No chat history yet
          </p>
        )}

        {!isLoading &&
          sessions.map((session) => {
            const isActive = activeSessionId === session.sessionId;

            return (
              <div
                key={session.sessionId}
                onClick={() => onSelectSession(session.sessionId)}
                className={`group cursor-pointer rounded-lg border p-3 transition ${
                  isActive
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {editingSessionId === session.sessionId ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => handleSubmitEdit(session.sessionId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmitEdit(session.sessionId);
                      }

                      if (e.key === "Escape") {
                        setEditingSessionId(null);
                        setEditTitle("");
                      }
                    }}
                    autoFocus
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {session.title || "New Chat"}
                      </h4>
                    </div>

                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {session.lastMessagePreview || "No messages yet"}
                    </p>

                    <div className="mt-2 flex gap-3 opacity-0 group-hover:opacity-100 transition">
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

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.sessionId);
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