import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  getChatSessions,
  getSessionMessages,
  renameSession,
  deleteSession,
} from "../services/sessionService.js";

/**
 * Production-grade chat session lifecycle hook.
 *
 * Responsibilities:
 * - session synchronization
 * - active session lifecycle
 * - message synchronization
 * - CRUD operations
 * - stale request protection
 */
const useChatSessions = ({
  token,
}) => {
  /**
   * Sidebar sessions.
   */
  const [sessions, setSessions] =
    useState([]);

  /**
   * Active session lifecycle.
   */
  const [
    activeSessionId,
    setActiveSessionId,
  ] = useState(null);

  /**
   * Active session title.
   */
  const [sessionTitle, setSessionTitle] =
    useState("");

  /**
   * Active session messages.
   */
  const [messages, setMessages] =
    useState([]);

  /**
   * Loading lifecycle.
   */
  const [sessionsLoading, setSessionsLoading] =
    useState(false);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  /**
   * Session-level errors.
   */
  const [sessionError, setSessionError] =
    useState("");

  /**
   * Active request protection.
   *
   * Prevent stale session overwrites.
   */
  const activeRequestRef =
    useRef(null);

  /**
   * Stable session reset lifecycle.
   */
  const resetActiveSession =
    useCallback(() => {
      setActiveSessionId(
        null
      );

      setSessionTitle("");

      setMessages([]);

      setSessionError("");
    }, []);

  /**
   * Load all sessions safely.
   */
  const loadSessions =
    useCallback(
      async (
        socialAccountId
      ) => {
        if (
          !socialAccountId ||
          !token
        ) {
          return;
        }

        try {
          setSessionsLoading(true);

          setSessionError("");

          const fetchedSessions =
            await getChatSessions({
              socialAccountId,
              token,
            });

          /**
           * Stable sidebar sync.
           */
          setSessions(
            fetchedSessions
          );
        } catch (error) {
          console.error(
            "Load sessions error:",
            error
          );

          setSessionError(
            "Failed to load chat sessions."
          );
        } finally {
          setSessionsLoading(false);
        }
      },
      [token]
    );

  /**
   * Load selected session safely.
   *
   * Prevents stale request overwrites.
   */
  const selectSession =
    useCallback(
      async (
        sessionId
      ) => {
        if (
          !sessionId ||
          !token
        ) {
          return;
        }

        /**
         * Track current request.
         */
        const requestId =
          crypto.randomUUID();

        activeRequestRef.current =
          requestId;

        try {
          setMessagesLoading(
            true
          );

          setSessionError("");

          /**
           * Sync active session immediately.
           */
          setActiveSessionId(
            sessionId
          );

          const sessionMessages =
            await getSessionMessages({
              sessionId,
              token,
            });

          /**
           * Ignore stale responses.
           */
          if (
            activeRequestRef.current !==
            requestId
          ) {
            return;
          }

          /**
           * Stable message synchronization.
           */
          setMessages(
            sessionMessages
          );

          /**
           * Synchronize title safely.
           */
          const selectedSession =
            sessions.find(
              (
                session
              ) =>
                session.sessionId ===
                sessionId
            );

          setSessionTitle(
            selectedSession?.title ||
              "New Chat"
          );
        } catch (error) {
          console.error(
            "Load session messages error:",
            error
          );

          /**
           * Ignore stale failures.
           */
          if (
            activeRequestRef.current !==
            requestId
          ) {
            return;
          }

          setSessionError(
            "Failed to load chat messages."
          );
        } finally {
          /**
           * Prevent stale loading updates.
           */
          if (
            activeRequestRef.current ===
            requestId
          ) {
            setMessagesLoading(
              false
            );
          }
        }
      },
      [sessions, token]
    );

  /**
   * Rename session safely.
   */
  const handleRenameSession =
    useCallback(
      async (
        sessionId,
        title
      ) => {
        if (
          !sessionId ||
          !title?.trim()
        ) {
          return;
        }

        try {
          setSessionError("");

          const updatedSession =
            await renameSession({
              sessionId,
              title:
                title.trim(),
              token,
            });

          /**
           * Stable sidebar synchronization.
           */
          setSessions((prev) =>
            prev.map(
              (
                session
              ) =>
                session.sessionId ===
                sessionId
                  ? updatedSession
                  : session
            )
          );

          /**
           * Sync active title safely.
           */
          if (
            activeSessionId ===
            sessionId
          ) {
            setSessionTitle(
              updatedSession.title
            );
          }
        } catch (error) {
          console.error(
            "Rename session error:",
            error
          );

          setSessionError(
            "Failed to rename session."
          );
        }
      },
      [
        activeSessionId,
        token,
      ]
    );

  /**
   * Delete session safely.
   */
  const handleDeleteSession =
    useCallback(
      async (
        sessionId
      ) => {
        if (!sessionId) {
          return;
        }

        try {
          setSessionError("");

          await deleteSession({
            sessionId,
            token,
          });

          /**
           * Remove locally first.
           */
          setSessions((prev) =>
            prev.filter(
              (
                session
              ) =>
                session.sessionId !==
                sessionId
            )
          );

          /**
           * Reset active lifecycle safely.
           */
          if (
            activeSessionId ===
            sessionId
          ) {
            resetActiveSession();
          }
        } catch (error) {
          console.error(
            "Delete session error:",
            error
          );

          setSessionError(
            "Failed to delete session."
          );
        }
      },
      [
        activeSessionId,
        resetActiveSession,
        token,
      ]
    );

  return {
    /**
     * State.
     */
    sessions,

    activeSessionId,

    sessionTitle,

    messages,

    sessionsLoading,

    messagesLoading,

    sessionError,

    /**
     * State setters.
     */
    setMessages,

    setSessions,

    setActiveSessionId,

    setSessionTitle,

    /**
     * Actions.
     */
    loadSessions,

    selectSession,

    handleRenameSession,

    handleDeleteSession,

    resetActiveSession,
  };
};

export default useChatSessions;