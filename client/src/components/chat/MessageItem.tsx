import React from "react";
import type { Message, PendingMessage } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";
import { formatTime, isChatRoom } from "../../lib/utils";
import { cn } from "../../lib/utils";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";

interface MessageItemProps {
  message: Message | PendingMessage;
  showAvatar?: boolean;
  isDirectChat?: boolean;
  onRetry?: (tempId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  showAvatar = true,
  isDirectChat = false,
  onRetry,
}) => {
  const { user: currentUser } = useAuth();
  const { selectedConversation } = useChat();
  const isOwn = currentUser?.id === message.sender.id;

  // Check if this is a pending message
  const isPending = "status" in message;
  const pendingMessage = isPending ? (message as PendingMessage) : null;
  const isFailedMessage = pendingMessage?.status === "failed";
  const isPendingMessage = pendingMessage?.status === "pending";

  // Determine if we should show avatar - never in direct chats, only in group chats for others
  const actualIsDirectChat =
    isDirectChat ||
    (selectedConversation ? !isChatRoom(selectedConversation) : false);
  const shouldShowAvatar = !actualIsDirectChat && showAvatar && !isOwn;

  return (
    <div
      className={cn(
        "flex items-end mb-3",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {shouldShowAvatar && <Avatar user={message.sender} size="sm" />}

      <div
        className={cn(
          "flex flex-col max-w-[85%] sm:max-w-[70%]",
          shouldShowAvatar && "ml-2",
          isOwn && "items-end"
        )}
      >
        {!isOwn && shouldShowAvatar && (
          <span className="text-xs text-gray-500 mb-1 px-3">
            {message.sender.username}
          </span>
        )}

        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl max-w-full break-words relative",
            isOwn
              ? isPendingMessage
                ? "bg-blue-300 text-white rounded-br-md shadow-sm opacity-70"
                : isFailedMessage
                ? "bg-red-400 text-white rounded-br-md shadow-sm"
                : "bg-blue-500 text-white rounded-br-md shadow-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-md shadow-sm"
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>

          <div
            className={cn(
              "flex items-center justify-between mt-1 text-xs",
              isOwn
                ? isPendingMessage || isFailedMessage
                  ? "text-blue-100"
                  : "text-blue-100 opacity-70"
                : "text-gray-600 opacity-70"
            )}
          >
            {/* Message status indicators */}
            <div className="flex items-center space-x-1 ml-2">
              {isPendingMessage && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">Pending</span>
                </div>
              )}

              {isFailedMessage && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs">Failed</span>
                  {onRetry && pendingMessage && (
                    <button
                      onClick={() => onRetry(pendingMessage.id)}
                      className="ml-1 p-1 hover:bg-red-500 rounded transition-colors"
                      title="Retry sending"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
