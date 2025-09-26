import React from "react";
import type { ChatConversation } from "../../types";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import {
  formatDate,
  truncateText,
  cn,
  isChatRoom,
  getConversationName,
  getConversationAvatar,
} from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { Users2Icon } from "lucide-react";

interface ConversationItemProps {
  conversation: ChatConversation;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
}) => {
  const {
    selectedConversation,
    setSelectedConversation,
    setSelectedChatRoom,
    setSelectedDirectChat,
  } = useChat();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const isSelected = selectedConversation?.id === conversation.id;

  const handleSelect = () => {
    setSelectedConversation(conversation);

    if (isChatRoom(conversation)) {
      setSelectedChatRoom(conversation);
      setSelectedDirectChat(null);
    } else {
      setSelectedDirectChat(conversation);
      setSelectedChatRoom(null);
    }

    navigate(`/chat/${conversation.id}`);
  };

  const conversationName = getConversationName(
    conversation,
    currentUser?.id || ""
  );
  const avatarUser = getConversationAvatar(conversation, currentUser?.id || "");

  const isGroupChat = isChatRoom(conversation);

  return (
    <div
      onClick={handleSelect}
      className={cn(
        "flex items-center p-4 cursor-pointer transition-colors border-b border-gray-200",
        "hover:bg-secondary-50",
        isSelected && "bg-blue-50 "
      )}
    >
      <div className="relative">
        {isChatRoom(conversation) ? (
          // Group chat - show group indicator
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center bg-gray-300">
            <Users2Icon />
          </div>
        ) : (
          // Direct chat - show other user's avatar
          avatarUser && <Avatar user={avatarUser} size="md" showOnlineStatus />
        )}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-secondary-900 truncate">
            {conversationName}
          </h3>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500">
              {formatDate(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {conversation.lastMessage ? (
            <p className="text-xs text-gray-600 truncate">
              {isGroupChat && (
                <span className="font-medium text-xs">
                  {conversation.lastMessage.sender.username}:
                </span>
              )}
              {truncateText(conversation.lastMessage.content, 30)}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
