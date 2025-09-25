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
  };

  const conversationName = getConversationName(
    conversation,
    currentUser?.id || ""
  );
  const avatarUser = getConversationAvatar(conversation, currentUser?.id || "");

  // For group chats, count online participants
  const onlineParticipantsCount = conversation.participants.filter(
    (p) => p.isOnline
  ).length;

  // For direct chats, check if the other user is online
  const isOtherUserOnline = isChatRoom(conversation)
    ? false
    : conversation.participants.find((p) => p.id !== currentUser?.id)
        ?.isOnline || false;

  return (
    <div
      onClick={handleSelect}
      className={cn(
        "flex items-center p-3 rounded-lg cursor-pointer transition-colors",
        "hover:bg-secondary-50",
        isSelected && "bg-blue-50 border-r-4  border-blue-500 "
      )}
    >
      <div className="relative">
        {isChatRoom(conversation) ? (
          // Group chat - show group indicator
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-primary-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
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
            <span className="text-xs text-secondary-500">
              {formatDate(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {conversation.lastMessage ? (
            <p className="text-sm text-secondary-600 truncate">
              <span className="font-medium">
                {conversation.lastMessage.sender.username}:
              </span>{" "}
              {truncateText(conversation.lastMessage.content, 30)}
            </p>
          ) : (
            <p className="text-sm text-secondary-400 italic">No messages yet</p>
          )}

          {isChatRoom(conversation) ? (
            // Group chat - show participant count
            conversation.participants.length > 2 && (
              <div className="flex items-center text-xs text-secondary-500">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {onlineParticipantsCount}/{conversation.participants.length}
              </div>
            )
          ) : (
            // Direct chat - show online status
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isOtherUserOnline ? "bg-green-500" : "bg-gray-300"
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
