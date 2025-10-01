export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageStatus = "pending" | "sent" | "delivered";
export interface Message {
  id: string;
  content: string;
  sender: User;
  chatRoom?: ChatRoom;
  directChat?: DirectChat;
  messageType: MessageType;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  status?: MessageStatus; // Optional status for pending messages
}

export interface PendingMessage {
  id: string; // Temporary ID for pending messages
  content: string;
  sender: User;
  chatRoomId?: string;
  directChatId?: string;
  messageType: MessageType;
  createdAt: Date;
  updatedAt: Date;
  status: MessageStatus; // Should be "pending" initially
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  participants: User[];
  admins: User[];
  lastMessage?: Message;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface DirectChat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatConversation = ChatRoom | DirectChat;

export interface AuthPayload {
  token: string;
  user: User;
}

export const MessageType = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateChatRoomInput {
  name: string;
  description?: string;
  isPrivate?: boolean;
  participantIds: string[];
}

export interface SendMessageInput {
  content: string;
  chatRoomId?: string;
  directChatId?: string;
  messageType?: MessageType;
}

export interface SendDirectMessageInput {
  content: string;
  directChatId: string;
  messageType?: MessageType;
}

export interface EditMessageInput {
  messageId: string;
  content: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ChatContextType {
  selectedConversation: ChatConversation | null;
  setSelectedConversation: (conversation: ChatConversation | null) => void;
  selectedChatRoom: ChatRoom | null; // Keep for backward compatibility
  setSelectedChatRoom: (chatRoom: ChatRoom | null) => void;
  selectedDirectChat: DirectChat | null;
  setSelectedDirectChat: (directChat: DirectChat | null) => void;
  messages: (Message | PendingMessage)[];
  setMessages: React.Dispatch<
    React.SetStateAction<(Message | PendingMessage)[]>
  >;
  onlineUsers: Set<string>;
  setOnlineUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  conversations: ChatConversation[];
  setConversations: React.Dispatch<React.SetStateAction<ChatConversation[]>>;
}
