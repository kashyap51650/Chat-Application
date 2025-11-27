// ChatContext.tsx
import React, { createContext, useContext, useState } from "react";
import type {
  ChatContextType,
  ChatConversation,
  ChatRoom,
  DirectChat,
  Message,
  User,
} from "../types/index";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedConversation, setSelectedConversation] =
    useState<ChatConversation | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(
    null
  );
  const [selectedDirectChat, setSelectedDirectChat] =
    useState<DirectChat | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  return (
    <ChatContext.Provider
      value={{
        selectedConversation,
        setSelectedConversation,
        selectedChatRoom,
        setSelectedChatRoom,
        selectedDirectChat,
        setSelectedDirectChat,
        messages,
        setMessages,
        onlineUsers,
        setOnlineUsers,
        users,
        setUsers,
        conversations,
        setConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
