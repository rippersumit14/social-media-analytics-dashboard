import {
  useCallback,
  useState,
} from "react";

import {
  getChatSessions,
  getSessionMessages,
  renameChatSession,
  deleteChatSession,
} from "../services/aiChatService.js";

/**
 * -------------------------------------------------------
 * Normalize session safely.
 * -------------------------------------------------------
 */
const normalizeSession = (
  session = {}
) => {
  return {
    _id:
      session._id || "",

    title:
      session.title ||
      "New Chat",

    createdAt:
      session.createdAt ||
      new Date().toISOString(),

    updatedAt:
      session.updatedAt ||
      new Date().toISOString(),

    latestMessage:
      session.latestMessage ||
      "",

    messageCount:
      session.messageCount ||
      0,
  };
};

/**
 * -------------------------------------------------------
 * Normalize chat message safely.
 * -------------------------------------------------------
 */
const normalizeMessage = (
  message = {}
) => {
  return {
    id:
      message._id ||
      crypto.randomUUID(),

    role:
      message.role ||
      "assistant",

    content:
      message.content ||
      "",

    images:
      message.images ||
      [],

    createdAt:
      message.createdAt ||
      new Date().toISOString(),

    isStreaming: false,

    isLoading: false,

    isError: false,
  };
};

/**
 * -------------------------------------------------------
 * Production-grade chat session hook.
 * -------------------------------------------------------
 *
 * Handles:
 * - session loading
 * - session switching
 * - message hydration
 * - rename/delete lifecycle
 * - active session synchronization
 * - sidebar synchronization
 * - backend contract stability
 */
const useChatSessions = () => {
  /**
   * -------------------------------------------------------
   * Sessions lifecycle.
   * -------------------------------------------------------
   */
  const [sessions, setSessions] =
    useState([]);

  const [
    activeSessionId,
    setActiveSessionId,
  ] = useState(null);

  const [sessionTitle, setSessionTitle] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  /**
   * -------------------------------------------------------
   * UI lifecycle.
   * -------------------------------------------------------
   */
  const [
    sessionsLoading,
    setSessionsLoading,
  ] = useState(false);

  const [sessionError, setSessionError] =
    useState("");

  /**
   * -------------------------------------------------------
   * Load chat sessions.
   * -------------------------------------------------------
   */
  const loadSessions =
    useCallback(
      async (
        socialAccountId
      ) => {
        if (
          !socialAccountId
        ) {
          return;
        }

        try {
          setSessionsLoading(
            true
          );

          setSessionError("");

          const response =
            await getChatSessions(
              {
                socialAccountId,
              }
            );

          /**
           * Normalize sessions.
           */
          const normalizedSessions =
            (
              response.sessions ||
              []
            ).map(
              normalizeSession
            );

          setSessions(
            normalizedSessions
          );
        } catch (error) {
          console.error(
            "[LOAD SESSIONS ERROR]",
            error
          );

          setSessionError(
            error.message ||
              "Failed to load chat sessions."
          );
        } finally {
          setSessionsLoading(
            false
          );
        }
      },
      []
    );

  /**
   * -------------------------------------------------------
   * Load one session history.
   * -------------------------------------------------------
   */
  const selectSession =
    useCallback(
      async (
        sessionId
      ) => {
        if (!sessionId) {
          return;
        }

        try {
          setSessionsLoading(
            true
          );

          setSessionError("");

          /**
           * Synchronize active session.
           */
          setActiveSessionId(
            sessionId
          );

          const response =
            await getSessionMessages(
              {
                sessionId,
              }
            );

          /**
           * Normalize messages.
           */
          const normalizedMessages =
            (
              response.messages ||
              []
            ).map(
              normalizeMessage
            );

          setMessages(
            normalizedMessages
          );

          /**
           * Synchronize title.
           */
          const matchedSession =
            sessions.find(
              (
                session
              ) =>
                session._id ===
                sessionId
            );

          setSessionTitle(
            matchedSession?.title ||
              "New Chat"
          );
        } catch (error) {
          console.error(
            "[SELECT SESSION ERROR]",
            error
          );

          setSessionError(
            error.message ||
              "Failed to load session."
          );
        } finally {
          setSessionsLoading(
            false
          );
        }
      },
      [sessions]
    );

  /**
   * -------------------------------------------------------
   * Rename session lifecycle.
   * -------------------------------------------------------
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
          await renameChatSession(
            {
              sessionId,

              title:
                title.trim(),
            }
          );

          /**
           * Synchronize local sessions.
           */
          setSessions(
            (prev) =>
              prev.map(
                (
                  session
                ) =>
                  session._id ===
                  sessionId
                    ? {
                        ...session,

                        title:
                          title.trim(),
                      }
                    : session
              )
          );

          /**
           * Synchronize active session title.
           */
          if (
            activeSessionId ===
            sessionId
          ) {
            setSessionTitle(
              title.trim()
            );
          }
        } catch (error) {
          console.error(
            "[RENAME SESSION ERROR]",
            error
          );

          setSessionError(
            error.message ||
              "Failed to rename session."
          );
        }
      },
      [activeSessionId]
    );

  /**
   * -------------------------------------------------------
   * Delete session lifecycle.
   * -------------------------------------------------------
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
          await deleteChatSession(
            {
              sessionId,
            }
          );

          /**
           * Remove locally.
           */
          setSessions(
            (prev) =>
              prev.filter(
                (
                  session
                ) =>
                  session._id !==
                  sessionId
              )
          );

          /**
           * Reset active session.
           */
          if (
            activeSessionId ===
            sessionId
          ) {
            setActiveSessionId(
              null
            );

            setMessages([]);

            setSessionTitle(
              ""
            );
          }
        } catch (error) {
          console.error(
            "[DELETE SESSION ERROR]",
            error
          );

          setSessionError(
            error.message ||
              "Failed to delete session."
          );
        }
      },
      [activeSessionId]
    );

  /**
   * -------------------------------------------------------
   * Reset active session safely.
   * -------------------------------------------------------
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

  return {
    /**
     * -------------------------------------------------------
     * State.
     * -------------------------------------------------------
     */
    sessions,

    activeSessionId,

    sessionTitle,

    messages,

    sessionsLoading,

    sessionError,

    /**
     * -------------------------------------------------------
     * Setters.
     * -------------------------------------------------------
     */
    setMessages,

    setActiveSessionId,

    setSessionTitle,

    /**
     * -------------------------------------------------------
     * Actions.
     * -------------------------------------------------------
     */
    loadSessions,

    selectSession,

    handleRenameSession,

    handleDeleteSession,

    resetActiveSession,
  };
};

export default useChatSessions;