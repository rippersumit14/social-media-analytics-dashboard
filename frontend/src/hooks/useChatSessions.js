import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  getChatSessions,
  getSessionMessages,
  renameChatSession,
  deleteChatSession,
} from "../services/aiChatService.js";

/**
 * ---------------------------------------------------
 * Normalize session safely.
 * ---------------------------------------------------
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
 * ---------------------------------------------------
 * Normalize chat message safely.
 * ---------------------------------------------------
 */
const normalizeMessage = (
  message = {}
) => {
  return {
    _id:
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

    isStreaming:
      message.isStreaming ||
      false,

    isError:
      message.isError ||
      false,
  };
};

/**
 * ---------------------------------------------------
 * Production-grade session hook.
 * ---------------------------------------------------
 */
const useChatSessions = () => {
  /**
   * ---------------------------------------------------
   * State
   * ---------------------------------------------------
   */
  const [sessions, setSessions] =
    useState([]);

  const [
    activeSessionId,
    setActiveSessionId,
  ] = useState(null);

  const [messages, setMessages] =
    useState([]);

  const [sessionTitle, setSessionTitle] =
    useState("");

  const [
    sessionsLoading,
    setSessionsLoading,
  ] = useState(false);

  const [sessionError, setSessionError] =
    useState("");

  /**
   * ---------------------------------------------------
   * Active session object.
   * ---------------------------------------------------
   */
  const activeSession =
    useMemo(() => {
      return sessions.find(
        (session) =>
          session._id ===
          activeSessionId
      );
    }, [
      sessions,
      activeSessionId,
    ]);

  /**
   * ---------------------------------------------------
   * Load all sessions.
   * ---------------------------------------------------
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

          const normalizedSessions =
            (
              response.sessions ||
              []
            ).map(
              normalizeSession
            );

          /**
           * Sort latest updated first.
           */
          normalizedSessions.sort(
            (a, b) =>
              new Date(
                b.updatedAt
              ) -
              new Date(
                a.updatedAt
              )
          );

          setSessions(
            normalizedSessions
          );

          /**
           * Auto-select latest session.
           */
          if (
            normalizedSessions.length >
              0 &&
            !activeSessionId
          ) {
            const latestSession =
              normalizedSessions[0];

            setActiveSessionId(
              latestSession._id
            );

            setSessionTitle(
              latestSession.title
            );
          }
        } catch (error) {
          console.error(
            "[LOAD SESSIONS ERROR]",
            error
          );

          setSessionError(
            error.message ||
              "Failed to load sessions."
          );
        } finally {
          setSessionsLoading(
            false
          );
        }
      },
      [activeSessionId]
    );

  /**
   * ---------------------------------------------------
   * Load one session messages.
   * ---------------------------------------------------
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

          setActiveSessionId(
            sessionId
          );

          const response =
            await getSessionMessages(
              {
                sessionId,
              }
            );

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
           * Sync title.
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
   * ---------------------------------------------------
   * Rename session.
   * ---------------------------------------------------
   */
  const handleRenameSession =
    useCallback(
      async (
        sessionId,
        newTitle
      ) => {
        if (
          !sessionId ||
          !newTitle?.trim()
        ) {
          return;
        }

        try {
          setSessionError("");

          const cleanTitle =
            newTitle.trim();

          await renameChatSession(
            {
              sessionId,

              title:
                cleanTitle,
            }
          );

          /**
           * Optimistic update.
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
                          cleanTitle,
                      }
                    : session
              )
          );

          /**
           * Sync active title.
           */
          if (
            activeSessionId ===
            sessionId
          ) {
            setSessionTitle(
              cleanTitle
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
   * ---------------------------------------------------
   * Delete session.
   * ---------------------------------------------------
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

          await deleteChatSession(
            {
              sessionId,
            }
          );

          /**
           * Remove locally.
           */
          const updatedSessions =
            sessions.filter(
              (session) =>
                session._id !==
                sessionId
            );

          setSessions(
            updatedSessions
          );

          /**
           * Reset active session.
           */
          if (
            activeSessionId ===
            sessionId
          ) {
            const nextSession =
              updatedSessions[0];

            if (
              nextSession
            ) {
              setActiveSessionId(
                nextSession._id
              );

              setSessionTitle(
                nextSession.title
              );
            } else {
              setActiveSessionId(
                null
              );

              setSessionTitle(
                ""
              );

              setMessages([]);
            }
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
      [
        sessions,
        activeSessionId,
      ]
    );

  /**
   * ---------------------------------------------------
   * Create temporary new session.
   * ---------------------------------------------------
   */
  const createNewSession =
    useCallback(() => {
      setActiveSessionId(
        null
      );

      setSessionTitle(
        "New Chat"
      );

      setMessages([]);

      setSessionError("");
    }, []);

  /**
   * ---------------------------------------------------
   * Reset everything.
   * ---------------------------------------------------
   */
  const resetSessions =
    useCallback(() => {
      setSessions([]);

      setMessages([]);

      setActiveSessionId(
        null
      );

      setSessionTitle("");

      setSessionError("");
    }, []);

  return {
    /**
     * State
     */
    sessions,

    activeSession,

    activeSessionId,

    sessionTitle,

    messages,

    sessionsLoading,

    sessionError,

    /**
     * Setters
     */
    setMessages,

    setSessions,

    setActiveSessionId,

    setSessionTitle,

    /**
     * Actions
     */
    loadSessions,

    selectSession,

    handleRenameSession,

    handleDeleteSession,

    createNewSession,

    resetSessions,
  };
};

export default useChatSessions;