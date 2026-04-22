import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getSocialAccounts } from "../services/socialAnalyticsService.js";
import { chatWithAI } from "../services/chatService.js";

/**
 * AI Chat Page
 * Modern chat UX improvements:
 * - auto scroll
 * - message bubbles
 * - loading bubble
 * - account selector
 * - limited in-memory history
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

  const messagesEndRef = useRef(null);

  // Keep only recent messages in memory
  const limitMessages = (messages, max = 1000) => {
    if (messages.length <= max) return messages;
    return messages.slice(messages.length - max);
  };

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, chatLoading]);

  // Load connected accounts
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
        setError("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [token]);

  // Switch account and clear chat
  const handleAccountChange = (e) => {
    const accountId = e.target.value;
    const account = socialAccounts.find((a) => a._id === accountId);

    if (!account) return;

    setSelectedAccount(account);
    setChatMessages([]);
    setRemainingUsage(null);
    setInput("");
    setError("");
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !selectedAccount || !token || chatLoading) return;

    const currentInput = input.trim();

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: currentInput,
    };

    setChatMessages((prev) => limitMessages([...prev, userMessage]));
    setInput("");

    try {
      setChatLoading(true);
      setError("");

      const data = await chatWithAI(selectedAccount._id, currentInput, token);

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply || "No reply generated.",
      };

      setChatMessages((prev) => limitMessages([...prev, aiMessage]));
      setRemainingUsage(data.remainingUsage ?? null);
    } catch (err) {
      console.error("AI Chat error:", err);
      setError(err.response?.data?.message || "Failed to get AI response");

      const failMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, something went wrong.",
      };

      setChatMessages((prev) => limitMessages([...prev, failMessage]));
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">AI Chat</h1>
        <p className="mt-3 text-gray-600">
          Ask questions about your account performance and analytics.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No connected accounts */}
      {!loading && socialAccounts.length === 0 && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            No Connected Social Account
          </h2>
          <p className="mt-2 text-gray-600">
            Connect a social account first to use AI chat.
          </p>
        </div>
      )}

      {/* Account Selector */}
      {selectedAccount && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Active Account
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Switch account to ask account-specific questions
              </p>
            </div>

            <div className="w-full md:w-72">
              <label className="mb-1 block text-sm text-gray-600">
                Select Account
              </label>

              <select
                value={selectedAccount._id}
                onChange={handleAccountChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 outline-none focus:border-blue-500"
              >
                {socialAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    @{account.username} ({account.platform})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {typeof remainingUsage === "number" && (
            <p className="mt-4 text-sm text-gray-500">
              Remaining AI usage: {remainingUsage}
            </p>
          )}
        </div>
      )}

      {/* Chat Window */}
      {selectedAccount && (
        <div className="mt-6 rounded-xl bg-white p-5 shadow-md">
          <div className="h-[430px] overflow-y-auto rounded-xl bg-gray-50 p-4">
            {chatMessages.length === 0 && !chatLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="max-w-md text-center text-sm text-gray-500">
                  Ask about follower growth, engagement changes, content
                  performance, or suggestions to improve your account.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        message.role === "user"
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-white text-gray-800"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                      Thinking...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="mt-4 flex gap-2">
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
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSend}
              disabled={chatLoading}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Send
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Press Enter to send. Press Shift + Enter for a new line.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIChat;