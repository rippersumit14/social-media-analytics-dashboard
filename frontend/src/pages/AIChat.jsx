import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getSocialAccounts,
} from "../services/socialAnalyticsService.js";

import useAIChat from "../hooks/useAIChat.js";
import useImageUploads from "../hooks/useImageUploads.js";
import useChatSessions from "../hooks/useChatSessions.js";

import ChatSidebar from "../components/ChatSideBar.jsx";

import ChatLayout from "../components/chat/ChatLayout.jsx";
import ChatMessages from "../components/chat/ChatMessages.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";
import UploadPreviewGrid from "../components/chat/UploadPreviewGrid.jsx";
import UsageDisplay from "../components/chat/UsageDisplay.jsx";

/**
 * -------------------------------------------------------
 * Normalize social account safely.
 * -------------------------------------------------------
 */
const normalizeAccount = (
  account = {}
) => {
  return {
    _id:
      account._id || "",

    username:
      account.username ||
      "unknown",

    platform:
      account.platform ||
      "social",

    profileImage:
      account.profileImage ||
      "",
  };
};

/**
 * -------------------------------------------------------
 * Production-grade AI workspace page.
 * -------------------------------------------------------
 *
 * Handles:
 * - SSE AI streaming
 * - multimodal uploads
 * - AI session orchestration
 * - session sidebar
 * - account switching
 * - voice input
 * - upload previews
 * - usage rendering
 */
const AIChat = () => {
  /**
   * -------------------------------------------------------
   * Social accounts lifecycle.
   * -------------------------------------------------------
   */
  const [
    socialAccounts,
    setSocialAccounts,
  ] = useState([]);

  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState(null);

  /**
   * -------------------------------------------------------
   * Global page lifecycle.
   * -------------------------------------------------------
   */
  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  /**
   * -------------------------------------------------------
   * Voice lifecycle.
   * -------------------------------------------------------
   */
  const [isListening, setIsListening] =
    useState(false);

  const [
    speechSupported,
    setSpeechSupported,
  ] = useState(true);

  const recognitionRef =
    useRef(null);

  /**
   * -------------------------------------------------------
   * Upload lifecycle.
   * -------------------------------------------------------
   */
  const {
    selectedImages,

    uploadError,

    addImages,

    removeImage,

    clearImages,
  } = useImageUploads();

  /**
   * -------------------------------------------------------
   * Chat sessions lifecycle.
   * -------------------------------------------------------
   */
  const {
    sessions,

    activeSessionId,

    sessionTitle,

    messages,

    sessionsLoading,

    sessionError,

    setMessages,

    setActiveSessionId,

    setSessionTitle,

    loadSessions,

    selectSession,

    handleRenameSession,

    handleDeleteSession,

    resetActiveSession,
  } = useChatSessions();

  /**
   * -------------------------------------------------------
   * AI orchestration lifecycle.
   * -------------------------------------------------------
   */
  const {
    input,

    setInput,

    chatLoading,

    isUploading,

    chatError,

    modelName,

    latencyMs,

    usageInfo,

    remainingUsage,

    sendMessage,

    cancelStream,
  } = useAIChat({
    activeSessionId,

    setActiveSessionId,

    setSessionTitle,

    setMessages,

    loadSessions,
  });

  /**
   * -------------------------------------------------------
   * Usage protection.
   * -------------------------------------------------------
   */
  const isUsageLimitReached =
    useMemo(() => {
      return (
        usageInfo?.remaining <=
        0
      );
    }, [usageInfo]);

  /**
   * -------------------------------------------------------
   * Unified error layer.
   * -------------------------------------------------------
   */
  const combinedError =
    useMemo(() => {
      return (
        pageError ||
        uploadError ||
        sessionError ||
        chatError
      );
    }, [
      pageError,
      uploadError,
      sessionError,
      chatError,
    ]);

  /**
   * -------------------------------------------------------
   * Interaction lock.
   * -------------------------------------------------------
   */
  const isInteractionDisabled =
    useMemo(() => {
      return (
        loading ||
        chatLoading ||
        sessionsLoading ||
        isUploading
      );
    }, [
      loading,
      chatLoading,
      sessionsLoading,
      isUploading,
    ]);

  /**
   * -------------------------------------------------------
   * Initialize speech recognition.
   * -------------------------------------------------------
   */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults =
      false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);

      setPageError("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);

      setPageError(
        "Voice recognition failed."
      );
    };

    recognition.onresult = (
      event
    ) => {
      const transcript =
        event.results?.[0]?.[0]
          ?.transcript?.trim() ||
        "";

      if (!transcript) {
        return;
      }

      setInput(
        transcript
      );
    };

    recognitionRef.current =
      recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        //
      }
    };
  }, [setInput]);

  /**
   * -------------------------------------------------------
   * Load social accounts.
   * -------------------------------------------------------
   */
  useEffect(() => {
    const initializeAccounts =
      async () => {
        try {
          setLoading(true);

          setPageError("");

          const response =
            await getSocialAccounts();

          const normalizedAccounts =
            (
              response.accounts ||
              response.data
                ?.accounts ||
              []
            ).map(
              normalizeAccount
            );

          setSocialAccounts(
            normalizedAccounts
          );

          /**
           * Select first account.
           */
          if (
            normalizedAccounts.length >
            0
          ) {
            setSelectedAccount(
              normalizedAccounts[0]
            );
          }
        } catch (error) {
          console.error(
            "[LOAD ACCOUNTS ERROR]",
            error
          );

          setPageError(
            error.message ||
              "Failed to load social accounts."
          );
        } finally {
          setLoading(false);
        }
      };

    initializeAccounts();
  }, []);

  /**
   * -------------------------------------------------------
   * Synchronize sessions
   * with active account.
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (
      !selectedAccount?._id
    ) {
      return;
    }

    loadSessions(
      selectedAccount._id
    );
  }, [
    selectedAccount?._id,
    loadSessions,
  ]);

  /**
   * -------------------------------------------------------
   * Cleanup active streams.
   * -------------------------------------------------------
   */
  useEffect(() => {
    return () => {
      cancelStream?.();
    };
  }, [cancelStream]);

  /**
   * -------------------------------------------------------
   * Account switching lifecycle.
   * -------------------------------------------------------
   */
  const handleAccountChange =
    useCallback(
      (event) => {
        const nextAccountId =
          event.target.value;

        const matchedAccount =
          socialAccounts.find(
            (account) =>
              account._id ===
              nextAccountId
          );

        if (
          !matchedAccount
        ) {
          return;
        }

        /**
         * Cancel active AI stream.
         */
        cancelStream();

        /**
         * Reset previous workspace.
         */
        setMessages([]);

        resetActiveSession();

        clearImages();

        setPageError("");

        /**
         * Activate account.
         */
        setSelectedAccount(
          matchedAccount
        );
      },
      [
        socialAccounts,

        cancelStream,

        clearImages,

        resetActiveSession,

        setMessages,
      ]
    );

  /**
   * -------------------------------------------------------
   * Voice interaction lifecycle.
   * -------------------------------------------------------
   */
  const handleVoiceClick =
    useCallback(() => {
      if (
        isInteractionDisabled ||
        isUsageLimitReached
      ) {
        return;
      }

      if (
        !speechSupported ||
        !recognitionRef.current
      ) {
        setPageError(
          "Voice input not supported."
        );

        return;
      }

      try {
        if (isListening) {
          recognitionRef.current.stop();
        } else {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error(
          "[VOICE ERROR]",
          error
        );

        setPageError(
          "Failed to initialize voice input."
        );
      }
    }, [
      isInteractionDisabled,
      isUsageLimitReached,
      speechSupported,
      isListening,
    ]);

  /**
   * -------------------------------------------------------
   * Image upload lifecycle.
   * -------------------------------------------------------
   */
  const handleImageChange =
    useCallback(
      (event) => {
        addImages(
          event.target.files
        );

        /**
         * Allow re-upload.
         */
        event.target.value = "";
      },
      [addImages]
    );

  /**
   * -------------------------------------------------------
   * Send AI message lifecycle.
   * -------------------------------------------------------
   */
  const handleSendMessage =
    useCallback(() => {
      if (
        !selectedAccount?._id
      ) {
        return;
      }

      sendMessage({
        socialAccountId:
          selectedAccount._id,

        message: input,

        selectedImages,

        clearImages,
      });
    }, [
      selectedAccount,

      input,

      selectedImages,

      clearImages,

      sendMessage,
    ]);

  /**
   * -------------------------------------------------------
   * Session switching lifecycle.
   * -------------------------------------------------------
   */
  const handleSelectSession =
    useCallback(
      (sessionId) => {
        if (
          !selectedAccount?._id
        ) {
          return;
        }

        selectSession(
          sessionId
        );
      },
      [
        selectedAccount,
        selectSession,
      ]
    );

  return (
    <div
      data-testid="ai-chat-page"
      className="space-y-6"
    >
      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          AI Chat
        </h1>

        <p className="mt-2 text-gray-600">
          Ask AI about analytics,
          engagement, growth,
          content strategy,
          OCR insights, and
          multimodal analysis.
        </p>
      </div>

      {/* ------------------------------------------------ */}
      {/* Errors */}
      {/* ------------------------------------------------ */}
      {combinedError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {combinedError}
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* No Accounts */}
      {/* ------------------------------------------------ */}
      {!loading &&
        socialAccounts.length ===
          0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              No Connected Accounts
            </h2>

            <p className="mt-2 text-gray-500">
              Connect a social
              account first to use
              AI analytics.
            </p>
          </div>
        )}

      {/* ------------------------------------------------ */}
      {/* Loading */}
      {/* ------------------------------------------------ */}
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">
            Loading AI workspace...
          </p>
        </div>
      ) : (
        selectedAccount && (
          <>
            {/* ------------------------------------------------ */}
            {/* Account Selector */}
            {/* ------------------------------------------------ */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Active Account
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Switch accounts
                    for account-specific
                    AI conversations.
                  </p>
                </div>

                <div className="w-full md:w-80">
                  <label className="mb-1 block text-sm text-gray-600">
                    Select Account
                  </label>

                  <select
                    value={
                      selectedAccount._id
                    }
                    onChange={
                      handleAccountChange
                    }
                    disabled={
                      isInteractionDisabled
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
                  >
                    {socialAccounts.map(
                      (
                        account
                      ) => (
                        <option
                          key={
                            account._id
                          }
                          value={
                            account._id
                          }
                        >
                          @
                          {
                            account.username
                          }{" "}
                          (
                          {
                            account.platform
                          }
                          )
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------ */}
            {/* Main AI Layout */}
            {/* ------------------------------------------------ */}
            <ChatLayout
              sidebar={
                <ChatSidebar
                  sessions={
                    sessions
                  }
                  activeSessionId={
                    activeSessionId
                  }
                  onSelectSession={
                    handleSelectSession
                  }
                  onNewChat={
                    resetActiveSession
                  }
                  onRenameSession={
                    handleRenameSession
                  }
                  onDeleteSession={
                    handleDeleteSession
                  }
                  isLoading={
                    sessionsLoading
                  }
                />
              }
              usagePanel={
                <UsageDisplay
                  usageInfo={
                    usageInfo
                  }
                  remainingUsage={
                    remainingUsage
                  }
                  modelName={
                    modelName
                  }
                  latencyMs={
                    latencyMs
                  }
                  sessionTitle={
                    sessionTitle
                  }
                />
              }
              messages={
                <ChatMessages
                  messages={
                    messages
                  }
                  chatLoading={
                    chatLoading
                  }
                />
              }
              uploadPreview={
                <UploadPreviewGrid
                  selectedImages={
                    selectedImages
                  }
                  onRemoveImage={
                    removeImage
                  }
                  onClearImages={
                    clearImages
                  }
                  disabled={
                    isInteractionDisabled
                  }
                />
              }
              input={
                <ChatInput
                  input={input}
                  setInput={
                    setInput
                  }
                  onSend={
                    handleSendMessage
                  }
                  onCancel={
                    cancelStream
                  }
                  onImageChange={
                    handleImageChange
                  }
                  onVoiceClick={
                    handleVoiceClick
                  }
                  disabled={
                    isInteractionDisabled
                  }
                  chatLoading={
                    chatLoading
                  }
                  isListening={
                    isListening
                  }
                  isUsageLimitReached={
                    isUsageLimitReached
                  }
                  selectedImages={
                    selectedImages
                  }
                />
              }
            />

            {/* ------------------------------------------------ */}
            {/* Voice Unsupported */}
            {/* ------------------------------------------------ */}
            {!speechSupported && (
              <p className="text-xs text-amber-600">
                Voice input is not
                supported in this
                browser.
              </p>
            )}
          </>
        )
      )}
    </div>
  );
};

export default AIChat;