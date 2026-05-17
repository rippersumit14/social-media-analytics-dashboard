import { useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";

import { getSocialAccounts } from "../services/socialAnalyticsService.js";

import useImageUploads from "../hooks/useImageUploads.js";
import useChatSessions from "../hooks/useChatSessions.js";
import useAIChat from "../hooks/useAIChat.js";

import ChatSidebar from "../components/ChatSideBar.jsx";

import ChatLayout from "../components/chat/ChatLayout.jsx";
import ChatMessages from "../components/chat/ChatMessages.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";
import UploadPreviewGrid from "../components/chat/UploadPreviewGrid.jsx";
import UsageDisplay from "../components/chat/UsageDisplay.jsx";

/**
 * Production-grade AI Chat page.
 *
 * Responsibilities:
 * - account selection
 * - voice lifecycle
 * - orchestration only
 *
 * Business logic lives in hooks/services.
 */
const AIChat = () => {
  const { token } = useAuth();

  /**
   * Social accounts.
   */
  const [socialAccounts, setSocialAccounts] =
    useState([]);

  const [selectedAccount, setSelectedAccount] =
    useState(null);

  /**
   * Global page state.
   */
  const [loading, setLoading] =
    useState(true);

  const [pageError, setPageError] =
    useState("");

  /**
   * Voice input state.
   */
  const [isListening, setIsListening] =
    useState(false);

  const [speechSupported, setSpeechSupported] =
    useState(true);

  const recognitionRef = useRef(null);

  /**
   * Upload lifecycle.
   */
  const {
    selectedImages,
    uploadError,

    handleImageChange,

    removeImage,

    clearImages,
  } = useImageUploads();

  /**
   * Session lifecycle.
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
  } = useChatSessions({
    token,
  });

  /**
   * AI lifecycle.
   */
  const {
    input,

    setInput,

    chatLoading,

    chatError,

    modelName,

    latencyMs,

    usageInfo,

    remainingUsage,

    sendMessage,
  } = useAIChat({
    token,

    selectedAccount,

    activeSessionId,

    setActiveSessionId,

    setSessionTitle,

    setMessages,

    loadSessions,
  });

  /**
   * Usage limit helper.
   */
  const isUsageLimitReached =
    usageInfo &&
    usageInfo.remaining <= 0;

  /**
   * Initialize speech recognition.
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

    recognition.interimResults = false;

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
        "Voice input failed."
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

      setInput(transcript);
    };

    recognitionRef.current =
      recognition;
  }, [setInput]);

  /**
   * Load connected accounts.
   */
  useEffect(() => {
    const loadAccounts =
      async () => {
        if (!token) {
          return;
        }

        try {
          setLoading(true);

          setPageError("");

          const data =
            await getSocialAccounts(
              token
            );

          const accounts =
            data.accounts || [];

          setSocialAccounts(
            accounts
          );

          if (accounts.length > 0) {
            setSelectedAccount(
              accounts[0]
            );
          }
        } catch (error) {
          console.error(
            "Load accounts error:",
            error
          );

          setPageError(
            "Failed to load social accounts."
          );
        } finally {
          setLoading(false);
        }
      };

    loadAccounts();
  }, [token]);

  /**
   * Load sessions on account change.
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
    selectedAccount,
    loadSessions,
  ]);

  /**
   * Account switching.
   */
  const handleAccountChange =
    (event) => {
      const accountId =
        event.target.value;

      const account =
        socialAccounts.find(
          (item) =>
            item._id ===
            accountId
        );

      if (!account) {
        return;
      }

      setSelectedAccount(
        account
      );

      /**
       * Reset chat lifecycle.
       */
      resetActiveSession();

      clearImages();

      setPageError("");
    };

  /**
   * Voice trigger.
   */
  const handleVoiceClick =
    () => {
      if (
        chatLoading ||
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
          "Voice input error:",
          error
        );

        setPageError(
          "Failed to start voice input."
        );
      }
    };

  /**
   * Unified error display.
   */
  const combinedError =
    pageError ||
    uploadError ||
    sessionError ||
    chatError;

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          AI Chat
        </h1>

        <p className="mt-3 text-gray-600">
          Ask AI about analytics,
          growth, engagement,
          content strategy, and
          multimodal insights.
        </p>
      </div>

      {/* Errors */}
      {combinedError && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {combinedError}
        </div>
      )}

      {/* No Accounts */}
      {!loading &&
        socialAccounts.length ===
          0 && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700">
              No Connected Accounts
            </h2>

            <p className="mt-2 text-gray-500">
              Connect a social
              account first to use
              AI chat.
            </p>
          </div>
        )}

      {/* Main Chat */}
      {selectedAccount && (
        <>
          {/* Account Selector */}
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Active Account
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Switch account to
                  ask account-specific
                  AI questions.
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
                    chatLoading
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {socialAccounts.map(
                    (account) => (
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

          {/* Chat Layout */}
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
                  selectSession
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
                  chatLoading
                }
              />
            }
            input={
              <ChatInput
                input={input}
                setInput={
                  setInput
                }
                onSend={() =>
                  sendMessage({
                    message:
                      input,

                    selectedImages,

                    clearImages,
                  })
                }
                onImageChange={
                  handleImageChange
                }
                onVoiceClick={
                  handleVoiceClick
                }
                disabled={
                  loading
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

          {/* Speech Support */}
          {!speechSupported && (
            <p className="mt-3 text-xs text-amber-600">
              Voice input is not
              supported in this
              browser.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AIChat;