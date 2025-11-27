import React, { useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { useSendMessage } from "../../hooks/useSendMessage";

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { selectedConversation } = useChat();
  const { user } = useAuth();
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
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Message input */}
          <div className="flex-1 relative">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:border-transparent focus:ring-blue-500 focus:bg-white bg-gray-50 text-sm sm:text-base transition-all"
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
            className="p-3 rounded-full min-w-[48px] h-12 flex items-center justify-center transition-all duration-200 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
            title="Send message"
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
