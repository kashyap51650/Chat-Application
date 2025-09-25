import React from "react";
import type { ChatRoom } from "../../types";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";
import { formatDate, truncateText } from "../../lib/utils";
import { cn } from "../../lib/utils";

interface ChatRoomItemProps {
  chatRoom: ChatRoom;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ chatRoom }) => {
  const { selectedChatRoom, setSelectedChatRoom } = useChat();
  const isSelected = selectedChatRoom?.id === chatRoom.id;

  const handleSelect = () => {
    setSelectedChatRoom(chatRoom);
  };

  const onlineParticipantsCount = chatRoom.participants.filter(
    (p) => p.isOnline
  ).length;

  return (
    <div
      onClick={handleSelect}
      className={cn(
        "flex items-center p-3 rounded-lg cursor-pointer transition-colors",
        "hover:bg-secondary-50",
        isSelected && "bg-primary-50 border border-primary-200"
      )}
    >
      <div className="relative">
        {chatRoom.participants.length === 2 ? (
          // Direct message - show other user's avatar
          <Avatar user={chatRoom.participants[0]} size="md" showOnlineStatus />
        ) : (
          // Group chat - show group indicator
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
        )}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-secondary-900 truncate">
            {chatRoom.name}
          </h3>
          {chatRoom.lastMessage && (
            <span className="text-xs text-secondary-500">
              {formatDate(chatRoom.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {chatRoom.lastMessage ? (
            <p className="text-sm text-secondary-600 truncate">
              <span className="font-medium">
                {chatRoom.lastMessage.sender.username}:
              </span>{" "}
              {truncateText(chatRoom.lastMessage.content, 30)}
            </p>
          ) : (
            <p className="text-sm text-secondary-400 italic">No messages yet</p>
          )}

          {chatRoom.participants.length > 2 && (
            <div className="flex items-center text-xs text-secondary-500">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {onlineParticipantsCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomItem;
