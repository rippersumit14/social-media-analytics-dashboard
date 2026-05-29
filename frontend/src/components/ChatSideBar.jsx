import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

/**
 * Format session timestamp safely.
 */
const formatSessionTime = (
  timestamp
) => {
  if (!timestamp) {
    return "";
  }

  const date =
    new Date(timestamp);

  return date.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
    }
  );
};

/**
 * Stable session card renderer.
 */
const SessionCard = memo(
  ({
    session,

    isActive,

    isEditing,

    editTitle,

    setEditTitle,

    onSelect,

    onStartEdit,

    onSubmitEdit,

    onCancelEdit,

    onDelete,

    disabled,
  }) => {
    /**
     * Stable session ID.
     */
    const sessionId =
      session?.sessionId ||
      session?._id;

    /**
     * Stable click lifecycle.
     */
    const handleSelect =
      useCallback(() => {
        if (
          !sessionId ||
          disabled
        ) {
          return;
        }

        onSelect?.(
          sessionId
        );
      }, [
        sessionId,
        disabled,
        onSelect,
      ]);

    /**
     * Stable rename trigger.
     */
    const handleRenameClick =
      useCallback(
        (
          event
        ) => {
          event.stopPropagation();

          onStartEdit?.(
            session
          );
        },
        [
          session,
          onStartEdit,
        ]
      );

    /**
     * Stable delete lifecycle.
     */
    const handleDeleteClick =
      useCallback(
        (
          event
        ) => {
          event.stopPropagation();

          if (
            !sessionId
          ) {
            return;
          }

          const confirmed =
            window.confirm(
              "Delete this chat session?"
            );

          if (
            !confirmed
          ) {
            return;
          }

          onDelete?.(
            sessionId
          );
        },
        [
          sessionId,
          onDelete,
        ]
      );

    /**
     * Stable rename submit.
     */
    const handleSubmit =
      useCallback(() => {
        if (
          !sessionId
        ) {
          return;
        }

        onSubmitEdit?.(
          sessionId
        );
      }, [
        sessionId,
        onSubmitEdit,
      ]);

    return (
      <div
        data-testid="chat-session-card"
        onClick={
          handleSelect
        }
        className={`group rounded-xl border p-3 transition-all duration-200 ${
          disabled
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer"
        } ${
          isActive
            ? "border-blue-500 bg-blue-50 shadow-sm"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        {/* Rename Mode */}
        {isEditing ? (
          <input
            value={
              editTitle
            }
            onChange={(
              event
            ) =>
              setEditTitle(
                event.target
                  .value
              )
            }
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            autoFocus
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"

            onBlur={
              handleSubmit
            }

            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                "Enter"
              ) {
                handleSubmit();
              }

              if (
                event.key ===
                "Escape"
              ) {
                onCancelEdit?.();
              }
            }}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="truncate text-sm font-semibold text-gray-900">
                {session?.title ||
                  "New Chat"}
              </h4>

              {session?.updatedAt && (
                <span className="shrink-0 text-[10px] text-gray-400">
                  {formatSessionTime(
                    session.updatedAt
                  )}
                </span>
              )}
            </div>

            {/* Preview */}
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">
              {session?.lastMessagePreview ||
                "No messages yet"}
            </p>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
              <button
                type="button"
                onClick={
                  handleRenameClick
                }
                className="text-xs text-gray-600 transition hover:text-blue-600"
              >
                Rename
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteClick
                }
                className="text-xs text-red-500 transition hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
);

SessionCard.displayName =
  "SessionCard";

/**
 * Production-grade AI chat sidebar.
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
  /**
   * Current editing lifecycle.
   */
  const [
    editingSessionId,
    setEditingSessionId,
  ] = useState(null);

  /**
   * Rename state.
   */
  const [
    editTitle,
    setEditTitle,
  ] = useState("");

  /**
   * Stable empty state.
   */
  const isEmpty =
    useMemo(() => {
      return (
        !isLoading &&
        sessions.length ===
          0
      );
    }, [
      isLoading,
      sessions.length,
    ]);

  /**
   * Start rename lifecycle.
   */
  const handleStartEdit =
    useCallback(
      (session) => {
        if (
          !session?.sessionId
        ) {
          return;
        }

        setEditingSessionId(
          session.sessionId
        );

        setEditTitle(
          session.title ||
            "New Chat"
        );
      },
      []
    );

  /**
   * Cancel rename safely.
   */
  const handleCancelEdit =
    useCallback(() => {
      setEditingSessionId(
        null
      );

      setEditTitle("");
    }, []);

  /**
   * Submit rename safely.
   */
  const handleSubmitEdit =
    useCallback(
      async (
        sessionId
      ) => {
        const cleanTitle =
          editTitle.trim();

        if (
          !sessionId ||
          !cleanTitle
        ) {
          return;
        }

        try {
          await onRenameSession?.(
            sessionId,
            cleanTitle
          );
        } finally {
          handleCancelEdit();
        }
      },
      [
        editTitle,
        onRenameSession,
        handleCancelEdit,
      ]
    );

  return (
    <aside
      data-testid="chat-sidebar"
      className="flex h-full w-full min-w-[260px] max-w-[320px] flex-col border-r border-gray-200 bg-white"
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <button
          data-testid="new-chat-button"
          type="button"
          onClick={onNewChat}
          disabled={isLoading}
          className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          + New Chat
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({
              length: 5,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-gray-100"
                />
              )
            )}
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <p className="mt-4 text-center text-sm text-gray-500">
            No chat history yet
          </p>
        )}

        {/* Sessions */}
        {!isLoading &&
          sessions.map(
            (session) => {
              const sessionId =
                session?.sessionId ||
                session?._id;

              return (
                <SessionCard
                  key={
                    sessionId
                  }
                  session={
                    session
                  }
                  isActive={
                    activeSessionId ===
                    sessionId
                  }
                  isEditing={
                    editingSessionId ===
                    sessionId
                  }
                  editTitle={
                    editTitle
                  }
                  setEditTitle={
                    setEditTitle
                  }
                  onSelect={
                    onSelectSession
                  }
                  onStartEdit={
                    handleStartEdit
                  }
                  onSubmitEdit={
                    handleSubmitEdit
                  }
                  onCancelEdit={
                    handleCancelEdit
                  }
                  onDelete={
                    onDeleteSession
                  }
                  disabled={
                    isLoading
                  }
                />
              );
            }
          )}
      </div>
    </aside>
  );
};

export default memo(
  ChatSidebar
);