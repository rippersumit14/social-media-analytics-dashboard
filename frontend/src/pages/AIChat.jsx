import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getSocialAccounts } from "../services/socialAnalyticsService.js";
import ChatSidebar from "../components/ChatSideBar.jsx";

import {
  chatWithAI,
  getChatSessions,
  getSessionMessages,
  renameChatSession,
  deleteChatSession,
} from "../services/chatService.js";

const AIChat = () => {
  const { token } = useAuth();

  const [socialAccounts, setSocialAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  const [remainingUsage, setRemainingUsage] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);

  const [sessionId, setSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState("");

  const [chatSessions, setChatSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [pendingVoiceText, setPendingVoiceText] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const isUsageLimitReached = usageInfo && usageInfo.remaining <= 0;

  const limitMessages = (messages, max = 100) => {
    if (messages.length <= max) return messages;
    return messages.slice(messages.length - max);
  };

  const getUsagePercentage = () => {
    if (!usageInfo || !usageInfo.limit) return 0;

    const percentage = (usageInfo.used / usageInfo.limit) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearSelectedImage = () => {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    setSelectedImage(null);
    setSelectedImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatBackendMessages = (messages = []) => {
    return messages.map((message) => ({
      id: message._id,
      role: message.role,
      content: message.content,
      imagePreview: message.imageUrl || "",
    }));
  };

  const loadChatSessions = async (accountId = selectedAccount?._id) => {
    if (!accountId || !token) return;

    try {
      setSessionsLoading(true);

      const data = await getChatSessions(accountId, token);

      setChatSessions(data.sessions || []);
    } catch (err) {
      console.error("Load chat sessions error:", err);
      setError("Failed to load chat sessions.");
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setError("Voice input failed. Please try again.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";

      if (!transcript) return;

      setInput(transcript);
      setPendingVoiceText(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    const loadAccounts = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const data = await getSocialAccounts(token);
        const accounts = data.accounts || [];

        setSocialAccounts(accounts);
        setSelectedAccount(accounts.length > 0 ? accounts[0] : null);
      } catch (err) {
        console.error("AI Chat load error:", err);
        setError("Failed to load connected accounts.");
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [token]);

  useEffect(() => {
    if (!selectedAccount?._id || !token) return;

    loadChatSessions(selectedAccount._id);
  }, [selectedAccount?._id, token]);

  useEffect(() => {
    if (!pendingVoiceText) return;
    if (!selectedAccount || !token || chatLoading || isUsageLimitReached) return;

    const timer = setTimeout(() => {
      handleSend(pendingVoiceText);
      setPendingVoiceText("");
    }, 300);

    return () => clearTimeout(timer);
  }, [
    pendingVoiceText,
    selectedAccount,
    token,
    chatLoading,
    sessionId,
    isUsageLimitReached,
  ]);

  const handleAccountChange = (e) => {
    const accountId = e.target.value;
    const account = socialAccounts.find((a) => a._id === accountId);

    if (!account) return;

    setSelectedAccount(account);
    setChatMessages([]);
    setChatSessions([]);
    setRemainingUsage(null);
    setUsageInfo(null);
    setSessionId(null);
    setSessionTitle("");
    setInput("");
    setPendingVoiceText("");
    clearSelectedImage();
    setError("");
  };

  const handleMicClick = () => {
    if (chatLoading || isUsageLimitReached) return;

    if (!speechSupported || !recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error("Mic toggle error:", err);
      setError("Could not start voice input.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }

    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveImage = () => {
    clearSelectedImage();
  };

  const handleSelectSession = async (selectedSessionId) => {
    if (!selectedSessionId || !token || chatLoading) return;

    try {
      setError("");
      setSessionId(selectedSessionId);

      const data = await getSessionMessages(selectedSessionId, token);

      setChatMessages(formatBackendMessages(data.messages || []));

      const selectedSession = chatSessions.find(
        (session) => session.sessionId === selectedSessionId
      );

      setSessionTitle(selectedSession?.title || "");
      clearSelectedImage();
      setInput("");
    } catch (err) {
      console.error("Load session messages error:", err);
      setError("Failed to load chat messages.");
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setSessionTitle("");
    setChatMessages([]);
    setInput("");
    setPendingVoiceText("");
    clearSelectedImage();
    setError("");
  };

  const handleRenameSession = async (selectedSessionId, newTitle) => {
    if (!selectedSessionId || !newTitle || !token) return;

    try {
      const data = await renameChatSession(selectedSessionId, newTitle, token);

      setChatSessions((prev) =>
        prev.map((session) =>
          session.sessionId === selectedSessionId
            ? { ...session, title: data.session.title }
            : session
        )
      );

      if (sessionId === selectedSessionId) {
        setSessionTitle(data.session.title);
      }
    } catch (err) {
      console.error("Rename session error:", err);
      setError("Failed to rename chat session.");
    }
  };

  const handleDeleteSession = async (selectedSessionId) => {
    if (!selectedSessionId || !token) return;

    const confirmDelete = window.confirm("Delete this chat session?");

    if (!confirmDelete) return;

    try {
      await deleteChatSession(selectedSessionId, token);

      setChatSessions((prev) =>
        prev.filter((session) => session.sessionId !== selectedSessionId)
      );

      if (sessionId === selectedSessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Delete session error:", err);
      setError("Failed to delete chat session.");
    }
  };

  const handleSend = async (messageText = input) => {
    const currentInput = messageText.trim();

    if (
      (!currentInput && !selectedImage) ||
      !selectedAccount ||
      !token ||
      chatLoading ||
      isUsageLimitReached
    ) {
      return;
    }

    const userVisibleContent =
      currentInput || "Uploaded an image for analysis.";

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: userVisibleContent,
      imagePreview: selectedImagePreview || "",
    };

    setChatMessages((prev) => limitMessages([...prev, userMessage]));
    setInput("");
    setError("");

    try {
      setChatLoading(true);

      const data = await chatWithAI(
        selectedAccount._id,
        currentInput,
        token,
        sessionId,
        selectedImage
      );

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      if (data.sessionTitle) {
        setSessionTitle(data.sessionTitle);
      }

      if (data.usage) {
        setUsageInfo(data.usage);
      }

      setRemainingUsage(data.remainingUsage ?? null);

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply || "AI is currently busy, please try again.",
      };

      setChatMessages((prev) => limitMessages([...prev, aiMessage]));

      clearSelectedImage();

      await loadChatSessions(selectedAccount._id);
    } catch (err) {
      console.error("AI Chat error:", err);

      const cleanError =
        err.response?.data?.message || "AI is currently busy, please try again.";

      if (err.response?.data?.usage) {
        setUsageInfo(err.response.data.usage);
      }

      setError(cleanError);

      const failMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: cleanError,
        isError: true,
      };

      setChatMessages((prev) => limitMessages([...prev, failMessage]));
    } finally {
      setChatLoading(false);
    }
  };

  const renderMessageContent = (content) => {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const isHeading =
            !line.startsWith("-") && line.length < 45 && !line.includes(":");

          if (isHeading) {
            return (
              <p key={index} className="font-semibold text-gray-900">
                {line}
              </p>
            );
          }

          return (
            <p key={index} className="text-sm leading-6">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-gray-800">AI Chat</h1>
        <p className="mt-3 text-gray-600">
          Ask detailed questions about account performance, content strategy,
          and growth.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && socialAccounts.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            No Connected Social Account
          </h2>
          <p className="mt-2 text-gray-600">
            Connect a social account first to use AI chat.
          </p>
        </div>
      )}

      {selectedAccount && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="w-full">
              <h2 className="text-lg font-semibold text-gray-700">
                Active Account
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Switch account to ask account-specific questions.
              </p>

              {usageInfo && (
                <div className="mt-4 max-w-md rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        AI Usage
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {usageInfo.used} / {usageInfo.limit} used
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {usageInfo.plan}
                    </span>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${getUsagePercentage()}%`,
                      }}
                    ></div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Remaining: {usageInfo.remaining}
                    </p>

                    {usageInfo.remaining <= 3 && usageInfo.remaining > 0 && (
                      <p className="text-xs font-medium text-amber-600">
                        Low usage remaining
                      </p>
                    )}

                    {usageInfo.remaining <= 0 && (
                      <p className="text-xs font-medium text-red-600">
                        Limit reached
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!usageInfo && typeof remainingUsage === "number" && (
                <p className="mt-3 text-sm text-gray-500">
                  Remaining AI usage: {remainingUsage}
                </p>
              )}

              {sessionTitle && (
                <p className="mt-3 text-sm text-gray-500">
                  Current session:{" "}
                  <span className="font-medium">{sessionTitle}</span>
                </p>
              )}
            </div>

            <div className="w-full md:w-80">
              <label className="mb-1 block text-sm text-gray-600">
                Select Account
              </label>

              <select
                value={selectedAccount._id}
                onChange={handleAccountChange}
                disabled={chatLoading}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {socialAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    @{account.username} ({account.platform})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedAccount && (
        <div className="mt-6 flex overflow-hidden rounded-2xl bg-white shadow-md">
          <ChatSidebar
            sessions={chatSessions}
            activeSessionId={sessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onRenameSession={handleRenameSession}
            onDeleteSession={handleDeleteSession}
            isLoading={sessionsLoading}
          />

          <div className="flex-1 p-5">
            <div className="h-[500px] overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-4">
              {chatMessages.length === 0 && !chatLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-lg text-center">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Start a conversation
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Ask about followers, engagement, content ideas, growth
                      strategy, post performance, or upload an image for
                      analysis.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="max-w-[80%]">
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === "user"
                              ? "rounded-br-md bg-blue-600 text-white"
                              : message.isError
                              ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                              : "rounded-bl-md bg-white text-gray-800"
                          }`}
                        >
                          {message.imagePreview && (
                            <img
                              src={message.imagePreview}
                              alt="Uploaded preview"
                              className="mb-3 max-h-52 rounded-xl border object-cover"
                            />
                          )}

                          {message.role === "user" ? (
                            <p className="text-sm leading-6">
                              {message.content}
                            </p>
                          ) : (
                            renderMessageContent(message.content)
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]"></span>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]"></span>
                          </div>
                          <span className="text-sm text-gray-500">
                            AI is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {selectedImagePreview && (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Selected image
                    </p>
                    <img
                      src={selectedImagePreview}
                      alt="Selected preview"
                      className="max-h-44 rounded-xl border object-cover"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={chatLoading}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3">
              {isUsageLimitReached && (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Daily AI usage limit reached. Please try again after reset or
                  upgrade your plan.
                </div>
              )}

              <div className="flex flex-col gap-3 md:flex-row">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={chatLoading || isUsageLimitReached}
                  placeholder={
                    isUsageLimitReached
                      ? "Daily AI limit reached"
                      : "Ask AI about this account..."
                  }
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-gray-700 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                />

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={chatLoading || isUsageLimitReached}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={chatLoading || isUsageLimitReached}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Upload image"
                  >
                    Image
                  </button>

                  <button
                    type="button"
                    onClick={handleMicClick}
                    disabled={chatLoading || isUsageLimitReached}
                    className={`rounded-xl border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                      isListening
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    title="Voice input"
                  >
                    {isListening ? "Listening..." : "Voice Ask"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={
                      chatLoading ||
                      (!input.trim() && !selectedImage) ||
                      isUsageLimitReached
                    }
                    className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {chatLoading ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Press Enter to send. Press Shift + Enter for a new line.
              </p>

              {!speechSupported && (
                <p className="mt-1 text-xs text-amber-600">
                  Voice input is not supported in this browser.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;