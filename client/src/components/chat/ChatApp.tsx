import React, { useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { isChatRoom } from "../../lib/utils";

const ChatApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectedConversation } = useChat();
  const { user } = useAuth();

  const getConversationTitle = () => {
    if (!selectedConversation) return "";

    if (isChatRoom(selectedConversation)) {
      return selectedConversation.name;
    } else {
      // DirectChat - show other participant's name
      return (
        selectedConversation.participants
          .filter((p) => p.id !== user?.id)
          .map((p) => p.username)
          .join(", ") || "Direct Chat"
      );
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:w-80 xl:w-96
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <ChatSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {selectedConversation && (
            <div className="flex-1 ml-4">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {getConversationTitle()}
              </h1>
            </div>
          )}
        </div>

        {/* Desktop/Tablet Chat Header */}
        <div className="hidden lg:block">
          <ChatHeader />
        </div>

        {selectedConversation ? (
          <>
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center px-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Chat
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                <span className="lg:hidden">
                  Tap the menu to start a conversation
                </span>
                <span className="hidden lg:inline">
                  Select a conversation to start chatting
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
