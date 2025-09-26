import React from "react";
import type { Message } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";
import { formatTime, isChatRoom } from "../../lib/utils";
import { cn } from "../../lib/utils";

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
  isDirectChat?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  showAvatar = true,
  isDirectChat = false,
}) => {
  const { user: currentUser } = useAuth();
  const { selectedConversation } = useChat();
  const isOwn = currentUser?.id === message.sender.id;

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
            "px-4 py-2.5 rounded-2xl max-w-full break-words",
            isOwn
              ? "bg-blue-500 text-white rounded-br-md shadow-sm"
              : "bg-gray-100 text-gray-900 rounded-bl-md shadow-sm"
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>

          <div
            className={cn(
              "flex items-center justify-end mt-1 text-xs opacity-70",
              isOwn ? "text-blue-100" : "text-gray-600"
            )}
          >
            <span>{formatTime(message.createdAt)}</span>
            {message.isEdited && <span className="ml-1">·edited</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
