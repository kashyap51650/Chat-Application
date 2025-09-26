import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_MY_CONVERSATIONS } from "../../graphql/operations";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { isChatRoom } from "../../lib/utils";
import LoadingSpinner from "../ui/LoadingSpinner";
import { ArrowLeft } from "lucide-react";

const ChatApp: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedConversation,
    setSelectedConversation,
    conversations,
    setConversations,
  } = useChat();
  const { user } = useAuth();

  const { data, loading } = useQuery(GET_MY_CONVERSATIONS, {
    fetchPolicy: "cache-first",
  });

  // Update conversations when data loads
  useEffect(() => {
    if ((data as any)?.myConversations) {
      setConversations((data as any).myConversations);
    }
  }, [data, setConversations]);

  // Set selected conversation based on URL parameter
  useEffect(() => {
    if (id && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === id);
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        // Conversation not found, redirect to home
        navigate("/");
      }
    }
  }, [id, conversations, setSelectedConversation, navigate]);

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

  const handleBackToChats = () => {
    navigate("/");
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex relative">
      {/* Mobile Overlay - Remove this as we don't need sliding */}

      {/* Small Screen: Page-like layout - Show either sidebar OR chat */}
      <div className="w-full lg:hidden">
        {selectedConversation ? (
          // Chat Page - Full screen chat interface
          <div className="h-screen flex flex-col">
            {/* Mobile Header with Back Button */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToChats}
                  className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 ml-4">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {getConversationTitle()}
                </h1>
              </div>
            </div>

            <MessageList />
            <MessageInput />
          </div>
        ) : (
          // Chat List Page - Full screen sidebar
          <div className="h-screen">
            <ChatSidebar />
          </div>
        )}
      </div>

      {/* Large Screen: Side-by-side layout */}
      <div className="hidden lg:flex w-full">
        {/* Sidebar */}
        <div className="w-80 xl:w-96 border-r border-gray-100">
          <ChatSidebar />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <ChatHeader />
              <MessageList />
              <MessageInput />
            </>
          ) : (
            // Welcome screen for desktop when no chat is selected
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
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
                  Welcome to Chat App
                </h3>
                <p className="text-gray-600">
                  Select a chat to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
