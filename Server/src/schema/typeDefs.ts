import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    isOnline: Boolean!
    lastSeen: Date!
    createdAt: Date!
    updatedAt: Date!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    chatRoom: ChatRoom
    directChat: DirectChat
    messageType: MessageType!
    isEdited: Boolean!
    editedAt: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type ChatRoom {
    id: ID!
    name: String!
    description: String
    isPrivate: Boolean!
    participants: [User!]!
    admins: [User!]!
    lastMessage: Message
    createdBy: User!
    createdAt: Date!
    updatedAt: Date!
  }

  type DirectChat {
    id: ID!
    participants: [User!]!
    lastMessage: Message
    createdBy: User!
    createdAt: Date!
    updatedAt: Date!
  }

  union ChatConversation = ChatRoom | DirectChat

  type AuthPayload {
    token: String!
    user: User!
  }

  enum MessageType {
    text
    image
    file
    audio
    video
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateChatRoomInput {
    name: String!
    description: String
    isPrivate: Boolean = false
    participantIds: [ID!]!
  }

  input SendMessageInput {
    content: String!
    chatRoomId: ID
    directChatId: ID
    messageType: MessageType = text
  }

  input SendDirectMessageInput {
    content: String!
    directChatId: ID!
    messageType: MessageType = text
  }

  input EditMessageInput {
    messageId: ID!
    content: String!
  }

  type Query {
    # Auth
    me: User

    # Users
    users: [User!]!
    user(id: ID!): User

    # Chat Rooms
    myChatRooms: [ChatRoom!]!
    myDirectChats: [DirectChat!]!
    myConversations: [ChatConversation!]!
    chatRoom(id: ID!): ChatRoom
    directChat(id: ID!): DirectChat

    # Messages
    messages(chatRoomId: ID!, limit: Int = 50, offset: Int = 0): [Message!]!
    directMessages(
      directChatId: ID!
      limit: Int = 50
      offset: Int = 0
    ): [Message!]!
  }

  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Chat Rooms
    createChatRoom(input: CreateChatRoomInput!): ChatRoom!
    joinChatRoom(chatRoomId: ID!): ChatRoom!
    leaveChatRoom(chatRoomId: ID!): Boolean!

    # Direct Chats
    createOrGetDirectChat(participantId: ID!): DirectChat!

    # Messages
    sendMessage(input: SendMessageInput!): Message!
    sendDirectMessage(input: SendDirectMessageInput!): Message!
    editMessage(input: EditMessageInput!): Message!
    deleteMessage(messageId: ID!): Boolean!

    # User Status
    updateOnlineStatus(isOnline: Boolean!): User!
  }

  type Subscription {
    # Real-time messaging
    messageAdded(chatRoomId: ID!): Message!
    directMessageAdded(directChatId: ID!): Message!
    messageEdited(chatRoomId: ID!): Message!
    directMessageEdited(directChatId: ID!): Message!
    messageDeleted(chatRoomId: ID!): ID!
    directMessageDeleted(directChatId: ID!): ID!

    # User status updates
    userStatusChanged: User!

    # Chat room updates
    chatRoomUpdated(chatRoomId: ID!): ChatRoom!
    directChatUpdated(directChatId: ID!): DirectChat!
  }
`;
