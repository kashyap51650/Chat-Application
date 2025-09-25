import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { SEND_MESSAGE, SEND_DIRECT_MESSAGE } from "../../graphql/operations";
import { useChat } from "../../context/ChatContext";
import Button from "../ui/Button";
import type {
  SendMessageInput,
  SendDirectMessageInput,
  MessageType,
  Message,
} from "../../types";
import { isChatRoom } from "../../lib/utils";

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { selectedConversation, setMessages } = useChat();

  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE);
  const [sendDirectMessage, { loading: sendingDirectMessage }] =
    useMutation(SEND_DIRECT_MESSAGE);

  const loading = sendingMessage || sendingDirectMessage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedConversation) return;

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately for better UX

    try {
      if (isChatRoom(selectedConversation)) {
        // Send to chat room
        const input: SendMessageInput = {
          content: messageContent,
          chatRoomId: selectedConversation.id,
          messageType: "text" as MessageType,
        };

        const { data } = await sendMessage({
          variables: { input },
        });

        // Add the message to the local state immediately
        if ((data as any)?.sendMessage) {
          setMessages((prev) => {
            const newMessage = (data as any).sendMessage;
            // Avoid duplicates
            if (prev.some((msg: Message) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      } else {
        // Send to direct chat
        const input: SendDirectMessageInput = {
          content: messageContent,
          directChatId: selectedConversation.id,
          messageType: "text" as MessageType,
        };

        const { data } = await sendDirectMessage({
          variables: { input },
        });

        // Add the message to the local state immediately
        if ((data as any)?.sendDirectMessage) {
          setMessages((prev) => {
            const newMessage = (data as any).sendDirectMessage;
            // Avoid duplicates
            if (prev.some((msg: Message) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      }
    } catch (error) {
      console.error("Send message error:", error);
      // Restore message on error
      setMessage(messageContent);
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
    <div className="p-3 sm:p-4 border-t border-secondary-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* Media buttons - hidden on very small screens */}

        {/* Message input */}
        <div className="flex-1 relative">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 max-h-32 text-sm sm:text-base"
            style={{
              minHeight: "44px",
              height: "auto",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />

          {/* Emoji button - inside input on mobile */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 sm:hidden"
            title="Add emoji"
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Additional buttons for larger screens */}
        <div className="hidden sm:flex items-center space-x-1">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Add emoji"
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Attach file"
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

          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Voice message"
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
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        </div>

        {/* Send button */}
        <Button
          type="submit"
          disabled={!message.trim() || loading}
          loading={loading}
          className="p-2.5 sm:p-3 rounded-2xl min-w-[44px] flex items-center justify-center"
          title="Send message"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
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
  );
};

export default MessageInput;
