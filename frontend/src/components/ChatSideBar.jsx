import {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

/**
 * -------------------------------------------------------
 * Format session timestamp safely.
 * -------------------------------------------------------
 */
const formatSessionTime = (
  timestamp
) => {
  if (!timestamp) {
    return "";
  }

  try {
    return new Date(
      timestamp
    ).toLocaleDateString(
      [],
      {
        month: "short",
        day: "numeric",
      }
    );
  } catch {
    return "";
  }
};

/**
 * -------------------------------------------------------
 * Stable session renderer.
 * -------------------------------------------------------
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
     * -------------------------------------------------------
     * Stable backend session ID.
     * -------------------------------------------------------
     */
    const sessionId =
      session?._id;

    /**
     * -------------------------------------------------------
     * Prevent invalid rendering.
     * -------------------------------------------------------
     */
    if (!sessionId) {
      return null;
    }

    /**
     * -------------------------------------------------------
     * Session selection lifecycle.
     * -------------------------------------------------------
     */
    const handleSelect =
      useCallback(() => {
        if (
          disabled ||
          isEditing
        ) {
          return;
        }

        onSelect?.(
          sessionId
        );
      }, [
        disabled,
        isEditing,
        sessionId,
        onSelect,
      ]);

    /**
     * -------------------------------------------------------
     * Rename trigger lifecycle.
     * -------------------------------------------------------
     */
    const handleRenameClick =
      useCallback(
        (
          event
        ) => {
          event.stopPropagation();

          if (
            disabled
          ) {
            return;
          }

          onStartEdit?.(
            session
          );
        },
        [
          disabled,
          session,
          onStartEdit,
        ]
      );

    /**
     * -------------------------------------------------------
     * Delete lifecycle.
     * -------------------------------------------------------
     */
    const handleDeleteClick =
      useCallback(
        (
          event
        ) => {
          event.stopPropagation();

          if (
            disabled
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
          disabled,
          sessionId,
          onDelete,
        ]
      );

    /**
     * -------------------------------------------------------
     * Rename submit lifecycle.
     * -------------------------------------------------------
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
        className={`group rounded-2xl border p-3 transition-all duration-200 ${
          disabled
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer"
        } ${
          isActive
            ? "border-blue-500 bg-blue-50 shadow-sm"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        {/* ------------------------------------------------ */}
        {/* Rename Mode */}
        {/* ------------------------------------------------ */}
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
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"

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
            {/* ------------------------------------------------ */}
            {/* Header */}
            {/* ------------------------------------------------ */}
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

            {/* ------------------------------------------------ */}
            {/* Preview */}
            {/* ------------------------------------------------ */}
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
              {session?.latestMessage
                ?.slice(0, 120) ||
                "No messages yet"}
            </p>

            {/* ------------------------------------------------ */}
            {/* Footer */}
            {/* ------------------------------------------------ */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                {
                  session?.messageCount
                }{" "}
                messages
              </span>

              {/* ------------------------------------------------ */}
              {/* Actions */}
              {/* ------------------------------------------------ */}
              <div className="flex items-center gap-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={
                    handleRenameClick
                  }
                  disabled={
                    disabled
                  }
                  className="text-[11px] text-gray-600 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Rename
                </button>

                <button
                  type="button"
                  onClick={
                    handleDeleteClick
                  }
                  disabled={
                    disabled
                  }
                  className="text-[11px] text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
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
 * -------------------------------------------------------
 * Production-grade AI chat sidebar.
 * -------------------------------------------------------
 *
 * Handles:
 * - session rendering
 * - session synchronization
 * - optimistic CRUD UI
 * - rename lifecycle
 * - delete lifecycle
 * - loading-safe interactions
 * - backend-driven rendering
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
   * -------------------------------------------------------
   * Rename lifecycle.
   * -------------------------------------------------------
   */
  const [
    editingSessionId,
    setEditingSessionId,
  ] = useState(null);

  const [
    editTitle,
    setEditTitle,
  ] = useState("");

  /**
   * -------------------------------------------------------
   * Empty state.
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Stable sorted sessions.
   * -------------------------------------------------------
   */
  const sortedSessions =
    useMemo(() => {
      return [
        ...sessions,
      ].sort(
        (a, b) =>
          new Date(
            b.updatedAt
          ) -
          new Date(
            a.updatedAt
          )
      );
    }, [sessions]);

  /**
   * -------------------------------------------------------
   * Start rename lifecycle.
   * -------------------------------------------------------
   */
  const handleStartEdit =
    useCallback(
      (session) => {
        if (
          !session?._id
        ) {
          return;
        }

        setEditingSessionId(
          session._id
        );

        setEditTitle(
          session.title ||
            "New Chat"
        );
      },
      []
    );

  /**
   * -------------------------------------------------------
   * Cancel rename safely.
   * -------------------------------------------------------
   */
  const handleCancelEdit =
    useCallback(() => {
      setEditingSessionId(
        null
      );

      setEditTitle("");
    }, []);

  /**
   * -------------------------------------------------------
   * Submit rename safely.
   * -------------------------------------------------------
   */
  const handleSubmitEdit =
    useCallback(
      async (
        sessionId
      ) => {
        const cleanTitle =
          editTitle.trim();

        if (
          !sessionId
        ) {
          return;
        }

        /**
         * Prevent empty titles.
         */
        if (
          !cleanTitle
        ) {
          handleCancelEdit();

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
      className="flex h-full min-h-0 w-full min-w-[280px] max-w-[320px] flex-col border-r border-gray-200 bg-white"
    >
      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}
      <div className="border-b border-gray-200 p-4">
        <button
          data-testid="new-chat-button"
          type="button"
          onClick={
            onNewChat
          }
          disabled={
            isLoading
          }
          className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          + New Chat
        </button>
      </div>

      {/* ------------------------------------------------ */}
      {/* Sessions */}
      {/* ------------------------------------------------ */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({
              length: 5,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-24 animate-pulse rounded-2xl bg-gray-100"
                />
              )
            )}
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">
              No chat history yet
            </p>
          </div>
        )}

        {/* Sessions */}
        {!isLoading &&
          sortedSessions.map(
            (
              session
            ) => (
              <SessionCard
                key={
                  session._id
                }
                session={
                  session
                }
                isActive={
                  activeSessionId ===
                  session._id
                }
                isEditing={
                  editingSessionId ===
                  session._id
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
            )
          )}
      </div>
    </aside>
  );
};

export default memo(
  ChatSidebar
);