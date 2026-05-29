import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  deleteChatSession,
  getChatSessions,
  getSessionMessages,
  renameChatSession,
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
      Number(
        session.messageCount
      ) || 0,
  };
};

/**
 * -------------------------------------------------------
 * Normalize message safely.
 * -------------------------------------------------------
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
      Array.isArray(
        message.images
      )
        ? message.images
        : [],

    createdAt:
      message.createdAt ||
      new Date().toISOString(),

    isStreaming:
      Boolean(
        message.isStreaming
      ),

    isError:
      Boolean(
        message.isError
      ),
  };
};

/**
 * -------------------------------------------------------
 * Production-grade chat sessions hook.
 * -------------------------------------------------------
 *
 * Handles:
 * - session loading
 * - sidebar synchronization
 * - active session lifecycle
 * - optimistic CRUD
 * - backend alignment
 * - stale request protection
 * - retry-safe synchronization
 */
const useChatSessions = () => {
  /**
   * -------------------------------------------------------
   * Core state.
   * -------------------------------------------------------
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

  /**
   * -------------------------------------------------------
   * UI lifecycle.
   * -------------------------------------------------------
   */
  const [
    sessionsLoading,
    setSessionsLoading,
  ] = useState(false);

  const [
    sessionError,
    setSessionError,
  ] = useState("");

  /**
   * -------------------------------------------------------
   * Prevent stale requests.
   * -------------------------------------------------------
   */
  const latestLoadRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Active session object.
   * -------------------------------------------------------
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
   * -------------------------------------------------------
   * Load all sessions safely.
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
          return [];
        }

        const requestId =
          crypto.randomUUID();

        latestLoadRef.current =
          requestId;

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
           * Ignore stale responses.
           */
          if (
            latestLoadRef.current !==
            requestId
          ) {
            return [];
          }

          const normalizedSessions =
            (
              response.sessions ||
              []
            )
              .map(
                normalizeSession
              )
              .sort(
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
           * Recover active session safely.
           */
          if (
            activeSessionId
          ) {
            const stillExists =
              normalizedSessions.some(
                (
                  session
                ) =>
                  session._id ===
                  activeSessionId
              );

            if (
              !stillExists
            ) {
              setActiveSessionId(
                null
              );

              setSessionTitle(
                ""
              );

              setMessages([]);
            }
          }

          return normalizedSessions;
        } catch (error) {
          console.error(
            "[LOAD SESSIONS ERROR]",
            error
          );

          setSessionError(
            error.message ||
              "Failed to load sessions."
          );

          return [];
        } finally {
          /**
           * Prevent stale cleanup.
           */
          if (
            latestLoadRef.current ===
            requestId
          ) {
            setSessionsLoading(
              false
            );
          }
        }
      },
      [activeSessionId]
    );

  /**
   * -------------------------------------------------------
   * Select session safely.
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
              "Failed to load chat."
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
   * Rename session safely.
   * -------------------------------------------------------
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

        const cleanTitle =
          newTitle.trim();

        /**
         * Store previous state
         * for rollback.
         */
        const previousSessions =
          [...sessions];

        /**
         * Optimistic update.
         */
        setSessions(
          (previous) =>
            previous.map(
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

        try {
          setSessionError("");

          await renameChatSession(
            {
              sessionId,

              title:
                cleanTitle,
            }
          );
        } catch (error) {
          console.error(
            "[RENAME SESSION ERROR]",
            error
          );

          /**
           * Rollback optimistic update.
           */
          setSessions(
            previousSessions
          );

          setSessionError(
            error.message ||
              "Failed to rename session."
          );
        }
      },
      [
        sessions,
        activeSessionId,
      ]
    );

  /**
   * -------------------------------------------------------
   * Delete session safely.
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

        /**
         * Store previous state
         * for rollback.
         */
        const previousSessions =
          [...sessions];

        /**
         * Optimistic removal.
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

        try {
          setSessionError("");

          await deleteChatSession(
            {
              sessionId,
            }
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

          /**
           * Rollback optimistic update.
           */
          setSessions(
            previousSessions
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
   * -------------------------------------------------------
   * Create temporary new session.
   * -------------------------------------------------------
   *
   * IMPORTANT:
   * Backend creates actual session
   * after first AI message.
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
   * -------------------------------------------------------
   * Reset everything safely.
   * -------------------------------------------------------
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
     * -------------------------------------------------------
     * State.
     * -------------------------------------------------------
     */
    sessions,

    activeSession,

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

    setSessions,

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

    createNewSession,

    resetSessions,
  };
};

export default useChatSessions;