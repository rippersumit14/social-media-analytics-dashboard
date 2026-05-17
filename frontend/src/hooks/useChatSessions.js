import { useCallback, useState } from "react";

import {
  getChatSessions,
  getSessionMessages,
  renameSession,
  deleteSession,
} from "../services/sessionService.js";

/**
 * Production-grade chat session hook.
 *
 * Handles:
 * - session lifecycle
 * - active session state
 * - message loading
 * - CRUD synchronization
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
   * Active session state.
   */
  const [activeSessionId, setActiveSessionId] =
    useState(null);

  /**
   * Current session title.
   */
  const [sessionTitle, setSessionTitle] =
    useState("");

  /**
   * Current session messages.
   */
  const [messages, setMessages] =
    useState([]);

  /**
   * Loading states.
   */
  const [sessionsLoading, setSessionsLoading] =
    useState(false);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  /**
   * Global session error.
   */
  const [sessionError, setSessionError] =
    useState("");

  /**
   * Load all sessions.
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

          const fetchedSessions =
            await getChatSessions({
              socialAccountId,
              token,
            });

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
   * Load selected session messages.
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

        try {
          setMessagesLoading(true);

          setActiveSessionId(
            sessionId
          );

          const sessionMessages =
            await getSessionMessages({
              sessionId,
              token,
            });

          setMessages(
            sessionMessages
          );

          /**
           * Sync title.
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
              ""
          );

          setSessionError("");
        } catch (error) {
          console.error(
            "Load session messages error:",
            error
          );

          setSessionError(
            "Failed to load chat messages."
          );
        } finally {
          setMessagesLoading(false);
        }
      },
      [sessions, token]
    );

  /**
   * Start fresh chat.
   */
  const resetActiveSession =
    () => {
      setActiveSessionId(
        null
      );

      setSessionTitle("");

      setMessages([]);
    };

  /**
   * Rename session.
   */
  const handleRenameSession =
    async (
      sessionId,
      title
    ) => {
      if (
        !sessionId ||
        !title
      ) {
        return;
      }

      try {
        const updatedSession =
          await renameSession({
            sessionId,
            title,
            token,
          });

        /**
         * Sync sidebar.
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
         * Sync active session title.
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
    };

  /**
   * Delete session.
   */
  const handleDeleteSession =
    async (
      sessionId
    ) => {
      if (!sessionId) {
        return;
      }

      try {
        await deleteSession({
          sessionId,
          token,
        });

        /**
         * Remove locally.
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
         * Reset active session if deleted.
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
    };

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