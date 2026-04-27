import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getSocialAccounts } from "../services/socialAnalyticsService.js";
import { chatWithAI } from "../services/chatService.js";

/**
 * AI Chat Page
 *
 * Features:
 * - account selector
 * - session-aware chat
 * - modern chat UI
 * - animated loading state
 * - auto scroll
 * - local message history
 * - mic input (speech-to-text)
 * - image upload preview (UI only for now)
 */
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

  const [sessionId, setSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState("");

  // Mic / voice state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  /**
   * Keep only recent messages in frontend state
   */
  const limitMessages = (messages, max = 100) => {
    if (messages.length <= max) return messages;
    return messages.slice(messages.length - max);
  };

  /**
   * Auto-scroll chat to latest message
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, chatLoading]);

  /**
   * Detect browser speech recognition support
   */
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
      const transcript = event.results?.[0]?.[0]?.transcript || "";

      if(transcript){
        //Put spoken text into input box 
        setInput(transcript);

        //Auto-send after speech recognition finishes 
        setTimeout(() => {
          handleSendFromMic(transcript);
        }, 300);
      }
    }





    recognitionRef.current = recognition;
  }, []);

  /**
   * Load connected accounts
   */
  useEffect(() => {
    const loadAccounts = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const data = await getSocialAccounts(token);
        const accounts = data.accounts || [];

        setSocialAccounts(accounts);

        if (accounts.length > 0) {
          setSelectedAccount(accounts[0]);
        } else {
          setSelectedAccount(null);
        }
      } catch (err) {
        console.error("AI Chat load error:", err);
        setError("Failed to load connected accounts");
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [token]);

  /**
   * Reset chat when account changes
   */
  const handleAccountChange = (e) => {
    const accountId = e.target.value;
    const account = socialAccounts.find((a) => a._id === accountId);

    if (!account) return;

    setSelectedAccount(account);
    setChatMessages([]);
    setRemainingUsage(null);
    setSessionId(null);
    setSessionTitle("");
    setInput("");
    setSelectedImage(null);
    setSelectedImagePreview("");
    setError("");
  };

  /**
   * Start / stop voice recognition
   */
  const handleMicClick = () => {
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

  /**
   * Handle image selection
   */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    setSelectedImage(file);
    setSelectedImagePreview(URL.createObjectURL(file));
    setError("");
  };

  /**
   * Remove selected image
   */
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Send message to backend
   *
   * Note:
   * For now image upload is UI-only.
   * Later we can send the image to backend / multimodal model.
   */
  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || !selectedAccount || !token || chatLoading) {
      return;
    }

  const handleSendFromMic = async (spokenText) => {
  if (!spokenText.trim() || !selectedAccount || !token || chatLoading) return;

  const userMessage = {
    id: Date.now(),
    role: "user",
    content: spokenText.trim(),
  };

  setChatMessages((prev) => limitMessages([...prev, userMessage]));
  setInput("");

  try {
    setChatLoading(true);
    setError("");

    const data = await chatWithAI(
      selectedAccount._id,
      spokenText.trim(),
      token,
      sessionId
    );

    if (data.sessionId) setSessionId(data.sessionId);
    if (data.sessionTitle) setSessionTitle(data.sessionTitle);

    const aiMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: data.reply || "No reply generated.",
    };

    setChatMessages((prev) => limitMessages([...prev, aiMessage]));
    setRemainingUsage(data.remainingUsage ?? null);
  } catch (err) {
    console.error("AI Chat mic error:", err);

    setError(err.response?.data?.message || "Failed to get AI response");

    setChatMessages((prev) =>
      limitMessages([
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, something went wrong while generating the response.",
        },
      ])
    );
  } finally {
    setChatLoading(false);
  }
};
  

    // Build what user sees in chat
    const currentInput = input.trim();
    const userVisibleContent =
      currentInput || (selectedImage ? "Uploaded an image for analysis." : "");

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: userVisibleContent,
      imagePreview: selectedImagePreview || "",
    };

    setChatMessages((prev) => limitMessages([...prev, userMessage]));
    setInput("");

    try {
      setChatLoading(true);
      setError("");

      // Temporary text prompt if image is uploaded
      let finalMessage = currentInput;

      if (selectedImage && currentInput) {
        finalMessage = `${currentInput}\n\nThe user has also uploaded an image. Image analysis is not connected yet, so respond based on the text and mention that image understanding will be added soon.`;
      } else if (selectedImage && !currentInput) {
        finalMessage =
          "The user uploaded an image and wants help. Image analysis is not connected yet, so acknowledge the upload and ask what they want analyzed.";
      }

      const data = await chatWithAI(
        selectedAccount._id,
        finalMessage,
        token,
        sessionId
      );

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      if (data.sessionTitle) {
        setSessionTitle(data.sessionTitle);
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply || "No reply generated.",
      };

      setChatMessages((prev) => limitMessages([...prev, aiMessage]));
      setRemainingUsage(data.remainingUsage ?? null);

      // Reset image after send
      setSelectedImage(null);
      setSelectedImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("AI Chat error:", err);

      setError(
        err.response?.data?.message || "Failed to get AI response"
      );

      const failMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, something went wrong while generating the response.",
      };

      setChatMessages((prev) => limitMessages([...prev, failMessage]));
    } finally {
      setChatLoading(false);
    }
  };

  /**
   * Render assistant message nicely
   */
  const renderMessageContent = (content) => {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const isHeading =
            !line.startsWith("-") &&
            line.length < 45 &&
            !line.includes(":");

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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">AI Chat</h1>
        <p className="mt-3 text-gray-600">
          Ask detailed questions about account performance, content strategy, and growth.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No connected accounts */}
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

      {/* Account + session info */}
      {selectedAccount && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Active Account
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Switch account to ask account-specific questions
              </p>

              {typeof remainingUsage === "number" && (
                <p className="mt-3 text-sm text-gray-500">
                  Remaining AI usage: {remainingUsage}
                </p>
              )}

              {sessionTitle && (
                <p className="mt-2 text-sm text-gray-500">
                  Current session: <span className="font-medium">{sessionTitle}</span>
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
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-700 outline-none focus:border-blue-500"
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

      {/* Chat window */}
      {selectedAccount && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-md">
          <div className="h-[500px] overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-4">
            {chatMessages.length === 0 && !chatLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-lg text-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Start a conversation
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Ask about followers, engagement, content ideas, growth strategy,
                    post performance, or general social media questions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-[80%]">
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === "user"
                            ? "rounded-br-md bg-blue-600 text-white"
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
                          <p className="text-sm leading-6">{message.content}</p>
                        ) : (
                          renderMessageContent(message.content)
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading bubble */}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]"></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Selected image preview before send */}
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
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3">
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
                placeholder="Ask AI about this account..."
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-gray-700 outline-none focus:border-blue-500"
              />

              <div className="flex items-center gap-2">
                {/* Image upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  title="Upload image"
                >
                  Image
                </button>

                {/* Mic button */}
                <button
                  type="button"
                  onClick={handleMicClick}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    isListening
                      ? "border-red-300 bg-red-50 text-red-600"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Voice input"
                >
                  {isListening ? "Listening..." : "Voice Ask"}
                </button>

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={chatLoading}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Send
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
      )}
    </div>
  );
};

export default AIChat;