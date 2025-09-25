import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { GET_MY_CONVERSATIONS } from "../../graphql/operations";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import type { ChatConversation } from "../../types";
import LoadingSpinner from "../ui/LoadingSpinner";
import ConversationItem from "./ConversationItem";
import CreateChatModal from "./CreateChatModal";
import { MessageCircle, Plus, Search } from "lucide-react";

const RecentChats: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { setConversations, selectedConversation } = useChat();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<
    ChatConversation[]
  >([]);

  const { data, loading, error } = useQuery(GET_MY_CONVERSATIONS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const conversations: ChatConversation[] =
    (data as any)?.myConversations || [];

  useEffect(() => {
    if (conversations.length > 0) {
      setConversations(conversations);
    }
  }, [conversations, setConversations]);

  useEffect(() => {
    if (conversations.length > 0) {
      const filtered = conversations.filter((conversation) => {
        if ("name" in conversation) {
          // ChatRoom
          return conversation.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        } else {
          // DirectChat
          const otherUser = conversation.participants.find(
            (p) => p.id !== user?.id
          );
          return (
            otherUser?.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) || false
          );
        }
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations([]);
    }
  }, [conversations, searchTerm, user?.id]);

  // Navigate to chat when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      navigate(`/chat/${selectedConversation.id}`);
    }
  }, [selectedConversation, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-2">Error loading conversations</div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side - App title and user info */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
                </div>

                {/* User info */}
                <div className="hidden sm:flex items-center p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-md"
                  title="Logout"
                >
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No conversations found" : "No conversations yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? `Try searching for something else`
                  : `Start your first conversation with someone`}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Chat
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="p-4 space-y-1">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
};

export default RecentChats;
