import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  GET_MY_CONVERSATIONS,
  CREATE_OR_GET_DIRECT_CHAT,
} from "../../graphql/operations";
import { useChat } from "../../context/ChatContext";
import type { ChatConversation, User } from "../../types";
import LoadingSpinner from "../ui/LoadingSpinner";
import AppHeader from "../ui/AppHeader";
import SearchBar from "../ui/SearchBar";
import ConversationItem from "./ConversationItem";
import CreateChatModal from "./CreateChatModal";
import { MessageCircle, Plus } from "lucide-react";

const RecentChats: React.FC = () => {
  const navigate = useNavigate();
  const { setConversations, selectedConversation, setSelectedConversation } =
    useChat();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<
    ChatConversation[]
  >([]);

  const { data, loading, error } = useQuery(GET_MY_CONVERSATIONS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const [createOrGetDirectChat] = useMutation(CREATE_OR_GET_DIRECT_CHAT, {
    refetchQueries: [{ query: GET_MY_CONVERSATIONS }],
  });

  const conversations: ChatConversation[] =
    (data as any)?.myConversations || [];

  useEffect(() => {
    if (conversations.length > 0) {
      setConversations(conversations);
      setFilteredConversations(conversations);
    }
  }, [conversations, setConversations]);

  // Navigate to chat when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      navigate(`/chat/${selectedConversation.id}`);
    }
  }, [selectedConversation, navigate]);

  const handleSearchResult = (result: any) => {
    if (result.type === "conversation" && result.conversation) {
      setSelectedConversation(result.conversation);
    } else if (result.type === "message" && result.conversation) {
      // Navigate to conversation and potentially scroll to message
      setSelectedConversation(result.conversation);
    }
  };

  const handleNewChatWithUser = async (user: User) => {
    try {
      const { data } = await createOrGetDirectChat({
        variables: {
          participantId: user.id,
        },
      });

      if ((data as any)?.createOrGetDirectChat) {
        const directChat = (data as any).createOrGetDirectChat;
        setSelectedConversation(directChat);
      }
    } catch (error) {
      console.error("Error creating/getting direct chat:", error);
      // Fallback to direct navigation
      navigate(`/chat/${user.id}`);
    }
  };

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
        <AppHeader onNewChatClick={() => setShowCreateModal(true)} />

        {/* Search Bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar
            conversations={conversations}
            onResultSelect={handleSearchResult}
            onNewChatWithUser={handleNewChatWithUser}
            placeholder="Search conversations, messages, or users..."
          />
        </div>

        {/* Conversations List */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your first conversation with someone
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start New Chat
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-100">
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
