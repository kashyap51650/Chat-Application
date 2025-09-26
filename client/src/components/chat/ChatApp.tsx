import React, { useState, useEffect } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedConversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Chat not found</p>
          <button
            onClick={handleBackToChats}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex relative">
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
        {/* Mobile Header with Back Button */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToChats}
              className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
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
          </div>

          <div className="flex-1 ml-4">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {getConversationTitle()}
            </h1>
          </div>
        </div>

        {/* Desktop/Tablet Chat Header */}
        <div className="hidden lg:block">
          <ChatHeader />
        </div>

        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatApp;
