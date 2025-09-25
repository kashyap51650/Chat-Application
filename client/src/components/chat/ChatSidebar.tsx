import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MY_CONVERSATIONS, GET_USERS } from "../../graphql/operations";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import UserItem from "./UserItem";
import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";
import type { ChatConversation, User } from "../../types";
import CreateChatModal from "./CreateChatModal";
import { cn } from "../../lib/utils";
import ConversationItem from "./ConversationItem";

interface ChatSidebarProps {
  onClose?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { setUsers, setConversations } = useChat();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"conversations" | "users">(
    "conversations"
  );

  const { data, loading, error } = useQuery(GET_MY_CONVERSATIONS, {
    // pollInterval: 30000, // Poll every 30 seconds for new chats
  });

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(GET_USERS);

  const conversations: ChatConversation[] =
    (data as any)?.myConversations || [];
  const users: User[] = (usersData as any)?.users || [];

  // Update users in context when data changes
  useEffect(() => {
    if (users.length > 0) {
      setUsers(users);
    }
  }, [users, setUsers]);

  // Update conversations in context when data changes
  useEffect(() => {
    if (conversations.length > 0) {
      setConversations(conversations);
    }
  }, [conversations, setConversations]);

  if (loading) {
    return (
      <div className="w-full h-full bg-white border-r border-gray-200 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white border-r border-gray-200 p-4">
        <div className="text-center text-red-600">
          <p>Failed to load chats</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Current User */}
            <div className="flex items-center p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Close button for mobile */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                  title="Close"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              <Button
                onClick={() => setShowCreateModal(true)}
                size="sm"
                className="p-2"
                title="New Group Chat"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Button>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="p-2"
                title="Logout"
              >
                <svg
                  className="w-4 h-4"
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
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 h-12">
          <button
            onClick={() => setActiveTab("conversations")}
            className={cn(
              activeTab === "conversations"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                : "text-secondary-600 hover:text-secondary-900",
              "flex-1 px-3 py-2  text-sm font-medium transition-colors"
            )}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Users
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto space-y-2 chat-scrollbar">
          {activeTab === "conversations" ? (
            // Conversations Tab
            conversations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Start chatting with someone or create a group!
                </p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                />
              ))
            )
          ) : // Users Tab
          usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : usersError ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">Failed to load users</p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-700 mt-2 text-xs"
              >
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No users found</p>
            </div>
          ) : (
            users.map((user) => <UserItem key={user.id} user={user} />)
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

export default ChatSidebar;
