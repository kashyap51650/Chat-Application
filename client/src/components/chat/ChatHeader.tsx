import React from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import type { ChatRoom, DirectChat } from "../../types";

// Helper function to check if conversation is a DirectChat
const isDirectChat = (conversation: any): conversation is DirectChat => {
  return !("name" in conversation);
};

// Helper function to check if conversation is a ChatRoom
const isChatRoom = (conversation: any): conversation is ChatRoom => {
  return "name" in conversation;
};

const ChatHeader: React.FC = () => {
  const { selectedConversation } = useChat();
  const { user: currentUser } = useAuth();

  if (!selectedConversation) {
    return null;
  }

  // Handle DirectChat
  if (isDirectChat(selectedConversation)) {
    const otherUser = selectedConversation.participants.find(
      (participant) => participant.id !== currentUser?.id
    );

    if (!otherUser) return null;

    return (
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar user={otherUser} size="md" showOnlineStatus />
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {otherUser.username}
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <span className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      otherUser.isOnline ? "bg-green-400" : "bg-gray-300"
                    }`}
                  />
                  {otherUser.isOnline ? "Online" : "Last seen recently"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Chat info button */}
            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle ChatRoom
  if (isChatRoom(selectedConversation)) {
    const chatRoom = selectedConversation as ChatRoom;
    const onlineParticipants = chatRoom.participants.filter((p) => p.isOnline);

    return (
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Group chat - show group avatar */}
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>

            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {chatRoom.name}
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <span>
                  {onlineParticipants.length} of {chatRoom.participants.length}{" "}
                  online
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Chat info button */}
            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* More options */}
            <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200">
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChatHeader;
