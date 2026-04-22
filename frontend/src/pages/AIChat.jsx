import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getSocialAccounts } from "../services/socialAnalyticsService.js";
import { chatWithAI } from "../services/chatService.js";

/**
 * AI Chat Page
 * - Account selector
 * - Chat history
 * - Message bubbles
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

  // Load accounts
  useEffect(() => {
    const loadAccounts = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const data = await getSocialAccounts(token);
        const accounts = data.accounts || [];

        setSocialAccounts(accounts);

        if (accounts.length > 0) {
          setSelectedAccount(accounts[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [token]);

  // Switch account
  const handleAccountChange = (e) => {
    const accountId = e.target.value;

    const account = socialAccounts.find((a) => a._id === accountId);

    if (!account) return;

    setSelectedAccount(account);
    setChatMessages([]); // reset chat
    setRemainingUsage(null);
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !selectedAccount) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setChatMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");

    try {
      setChatLoading(true);

      const data = await chatWithAI(
        selectedAccount._id,
        currentInput,
        token
      );

      const aiMessage = {
        role: "assistant",
        content: data.reply,
      };

      setChatMessages((prev) => [...prev, aiMessage]);
      setRemainingUsage(data.remainingUsage ?? null);
    } catch (err) {
      console.error(err);
      setError("AI failed");

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800">AI Chat</h1>

      {/* Error */}
      {error && (
        <div className="mt-4 text-red-600 text-sm">{error}</div>
      )}

      {/* Account Selector */}
      {selectedAccount && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <select
            value={selectedAccount._id}
            onChange={handleAccountChange}
            className="w-full border px-3 py-2 rounded"
          >
            {socialAccounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                @{acc.username}
              </option>
            ))}
          </select>

          {remainingUsage !== null && (
            <p className="mt-2 text-sm text-gray-500">
              Remaining usage: {remainingUsage}
            </p>
          )}
        </div>
      )}

      {/* Chat Box */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <div className="h-[400px] overflow-y-auto space-y-3 bg-gray-50 p-3 rounded">
          {chatMessages.length === 0 && (
            <p className="text-gray-500 text-sm">
              Ask anything about your analytics...
            </p>
          )}

          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {chatLoading && (
            <p className="text-sm text-gray-500">Thinking...</p>
          )}
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border px-3 py-2 rounded"
            placeholder="Ask something..."
          />

          <button
            onClick={handleSend}
            disabled={chatLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;