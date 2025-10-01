import React from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_OR_GET_DIRECT_CHAT } from "../../graphql/operations";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types";

interface UserItemProps {
  user: User;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  const { setSelectedConversation, setSelectedDirectChat } = useChat();
  const { user: currentUser } = useAuth();
  const [createOrGetDirectChat, { loading }] = useMutation(
    CREATE_OR_GET_DIRECT_CHAT
  );

  const handleUserClick = async () => {
    if (loading || user.id === currentUser?.id) return;

    try {
      const { data } = await createOrGetDirectChat({
        variables: { participantId: user.id },
      });

      if ((data as any)?.createOrGetDirectChat) {
        const directChat = (data as any).createOrGetDirectChat;
        setSelectedDirectChat(directChat);
        setSelectedConversation(directChat);
      }
    } catch (error) {
      console.error("Error creating/getting direct chat:", error);
    }
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Don't show current user in the list
  if (user.id === currentUser?.id) {
    return null;
  }

  return (
    <div
      onClick={handleUserClick}
      className={`flex items-center p-4 cursor-pointer transition-colors border-b border-gray-200 ${
        loading
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-100 active:bg-gray-200"
      }`}
    >
      {/* Avatar */}
      <div className="relative mr-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {/* Online status indicator */}
        {/* <div
          className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
            user.isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        /> */}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.username}
          </p>
          {!user.isOnline && (
            <span className="text-xs text-gray-500">
              {formatLastSeen(user.lastSeen)}
            </span>
          )}
        </div>
        {/* <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              user.isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <p className="text-xs text-gray-600">
            {user.isOnline ? "Online" : "Offline"}
          </p>
        </div> */}
      </div>

      {loading && (
        <div className="ml-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default UserItem;
