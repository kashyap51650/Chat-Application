import React from "react";
import type { Message } from "../../types";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import { formatTime } from "../../lib/utils";
import { cn } from "../../lib/utils";

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  showAvatar = true,
}) => {
  const { user: currentUser } = useAuth();
  const isOwn = currentUser?.id === message.sender.id;

  return (
    <div
      className={cn(
        "flex items-end space-x-2 mb-4",
        isOwn && "flex-row-reverse space-x-reverse"
      )}
    >
      {showAvatar && !isOwn && <Avatar user={message.sender} size="sm" />}

      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-secondary-500 mb-1 px-3">
            {message.sender.username}
          </span>
        )}

        <div
          className={cn(
            "px-4 py-2 rounded-2xl shadow-sm",
            isOwn
              ? "bg-white border border-secondary-200 rounded-br-sm"
              : "bg-white border border-secondary-200 rounded-bl-sm"
          )}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>

          <div
            className={cn(
              "flex items-center mt-1 text-xs",
              isOwn ? "text-primary-100" : "text-secondary-400"
            )}
          >
            <span>{formatTime(message.createdAt)}</span>
            {message.isEdited && <span className="ml-2">(edited)</span>}
          </div>
        </div>
      </div>

      {showAvatar && isOwn && <Avatar user={message.sender} size="sm" />}
    </div>
  );
};

export default MessageItem;
