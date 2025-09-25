import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type {
  ChatRoom,
  DirectChat,
  ChatConversation,
  Message,
  ChatContextType,
  User,
} from "../types";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
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

  const value: ChatContextType = {
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
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
