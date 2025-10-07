import React, { useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { Wifi, WifiOff } from "lucide-react";
import { useSendMessage } from "../../hooks/useSendMessage";
import { useConnectivity } from "../../hooks/useConnectivity";

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { selectedConversation } = useChat();
  const { user } = useAuth();
  const isOnline = useConnectivity();
  const { sendMessage } = useSendMessage(selectedConversation!);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedConversation || !user) return;

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately for better UX
    setIsLoading(true);

    try {
      await sendMessage(messageContent);
    } catch (error) {
      console.error("Send message error:", error);
      // Restore message on error
      setMessage(messageContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100 text-center">
          <div className="flex items-center justify-center space-x-2 text-yellow-700">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm">
              You're offline. Messages will be sent when you're back online.
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Message input */}
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                isOnline
                  ? "Type a message..."
                  : "Type a message (will send when online)..."
              }
              className={`w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all ${
                isOnline
                  ? "bg-gray-50 focus:ring-blue-500 focus:bg-white"
                  : "bg-yellow-50 focus:ring-yellow-500 focus:bg-yellow-100"
              }`}
              style={{
                minHeight: "48px",
                height: "auto",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />

            {/* Connection status indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isOnline ? (
                <div title="Online">
                  <Wifi className="w-4 h-4 text-green-500" />
                </div>
              ) : (
                <div title="Offline">
                  <WifiOff className="w-4 h-4 text-yellow-500" />
                </div>
              )}
            </div>
          </div>

          {/* Minimal action buttons */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              title="Add attachment"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
          </div>

          {/* Send button */}
          <Button
            type="submit"
            disabled={!message.trim() || isLoading}
            loading={isLoading}
            className={`p-3 rounded-full min-w-[48px] h-12 flex items-center justify-center transition-all duration-200 ${
              isOnline
                ? "bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                : "bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300"
            }`}
            title={isOnline ? "Send message" : "Queue message for sending"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
