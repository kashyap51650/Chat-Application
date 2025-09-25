import { gql } from "@apollo/client";

// Authentication
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        username
        email
        avatar
        isOnline
        lastSeen
        createdAt
        updatedAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        username
        email
        avatar
        isOnline
        lastSeen
        createdAt
        updatedAt
      }
    }
  }
`;

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      avatar
      isOnline
      lastSeen
      createdAt
      updatedAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      avatar
      isOnline
      lastSeen
      createdAt
      updatedAt
    }
  }
`;

// Chat Room Queries
export const GET_MY_CHAT_ROOMS = gql`
  query GetMyChatRooms {
    myChatRooms {
      id
      name
      description
      isPrivate
      participants {
        id
        username
        avatar
        isOnline
      }
      admins {
        id
        username
      }
      lastMessage {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      createdBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

// Direct Chat Queries
export const GET_MY_DIRECT_CHATS = gql`
  query GetMyDirectChats {
    myDirectChats {
      id
      participants {
        id
        username
        avatar
        isOnline
      }
      lastMessage {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      createdBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

// Unified Conversations Query
export const GET_MY_CONVERSATIONS = gql`
  query GetMyConversations {
    myConversations {
      ... on ChatRoom {
        id
        name
        description
        isPrivate
        participants {
          id
          username
          avatar
          isOnline
        }
        admins {
          id
          username
        }
        lastMessage {
          id
          content
          sender {
            id
            username
          }
          createdAt
        }
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
      ... on DirectChat {
        id
        participants {
          id
          username
          avatar
          isOnline
        }
        lastMessage {
          id
          content
          sender {
            id
            username
          }
          createdAt
        }
        createdBy {
          id
          username
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_CHAT_ROOM = gql`
  query GetChatRoom($id: ID!) {
    chatRoom(id: $id) {
      id
      name
      description
      isPrivate
      participants {
        id
        username
        avatar
        isOnline
      }
      admins {
        id
        username
      }
      createdBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_DIRECT_CHAT = gql`
  query GetDirectChat($id: ID!) {
    directChat(id: $id) {
      id
      participants {
        id
        username
        avatar
        isOnline
      }
      createdBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

// Message Queries
export const GET_MESSAGES = gql`
  query GetMessages($chatRoomId: ID!, $limit: Int, $offset: Int) {
    messages(chatRoomId: $chatRoomId, limit: $limit, offset: $offset) {
      id
      content
      sender {
        id
        username
        avatar
      }
      messageType
      isEdited
      editedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_DIRECT_MESSAGES = gql`
  query GetDirectMessages($directChatId: ID!, $limit: Int, $offset: Int) {
    directMessages(
      directChatId: $directChatId
      limit: $limit
      offset: $offset
    ) {
      id
      content
      sender {
        id
        username
        avatar
      }
      messageType
      isEdited
      editedAt
      createdAt
      updatedAt
    }
  }
`;

// Chat Room Mutations
export const CREATE_CHAT_ROOM = gql`
  mutation CreateChatRoom($input: CreateChatRoomInput!) {
    createChatRoom(input: $input) {
      id
      name
      description
      isPrivate
      participants {
        id
        username
        avatar
        isOnline
      }
      admins {
        id
        username
      }
      createdBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

export const JOIN_CHAT_ROOM = gql`
  mutation JoinChatRoom($chatRoomId: ID!) {
    joinChatRoom(chatRoomId: $chatRoomId) {
      id
      name
      participants {
        id
        username
        avatar
        isOnline
      }
    }
  }
`;

export const LEAVE_CHAT_ROOM = gql`
  mutation LeaveChatRoom($chatRoomId: ID!) {
    leaveChatRoom(chatRoomId: $chatRoomId)
  }
`;

export const CREATE_OR_GET_DIRECT_CHAT = gql`
  mutation CreateOrGetDirectChat($participantId: ID!) {
    createOrGetDirectChat(participantId: $participantId) {
      id
      participants {
        id
        username
        avatar
        isOnline
      }
      lastMessage {
        id
        content
        sender {
          id
          username
        }
        createdAt
      }
      createdBy {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

// Message Mutations
export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      sender {
        id
        username
        avatar
      }
      messageType
      isEdited
      editedAt
      createdAt
      updatedAt
    }
  }
`;

export const SEND_DIRECT_MESSAGE = gql`
  mutation SendDirectMessage($input: SendDirectMessageInput!) {
    sendDirectMessage(input: $input) {
      id
      content
      sender {
        id
        username
        avatar
      }
      messageType
      isEdited
      editedAt
      createdAt
      updatedAt
    }
  }
`;

export const EDIT_MESSAGE = gql`
  mutation EditMessage($input: EditMessageInput!) {
    editMessage(input: $input) {
      id
      content
      isEdited
      editedAt
      updatedAt
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId)
  }
`;

// User Status Mutation
export const UPDATE_ONLINE_STATUS = gql`
  mutation UpdateOnlineStatus($isOnline: Boolean!) {
    updateOnlineStatus(isOnline: $isOnline) {
      id
      isOnline
      lastSeen
    }
  }
`;

// Subscriptions
export const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription MessageAdded($chatRoomId: ID!) {
    messageAdded(chatRoomId: $chatRoomId) {
      id
      content
      sender {
        id
        username
        avatar
      }
      messageType
      isEdited
      editedAt
      createdAt
      updatedAt
    }
  }
`;

export const DIRECT_MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription DirectMessageAdded($directChatId: ID!) {
    directMessageAdded(directChatId: $directChatId) {
      id
      content
      sender {
        id
        username
        avatar
      }
      messageType
      isEdited
      editedAt
      createdAt
      updatedAt
    }
  }
`;

export const MESSAGE_EDITED_SUBSCRIPTION = gql`
  subscription MessageEdited($chatRoomId: ID!) {
    messageEdited(chatRoomId: $chatRoomId) {
      id
      content
      isEdited
      editedAt
      updatedAt
    }
  }
`;

export const DIRECT_MESSAGE_EDITED_SUBSCRIPTION = gql`
  subscription DirectMessageEdited($directChatId: ID!) {
    directMessageEdited(directChatId: $directChatId) {
      id
      content
      isEdited
      editedAt
      updatedAt
    }
  }
`;

export const MESSAGE_DELETED_SUBSCRIPTION = gql`
  subscription MessageDeleted($chatRoomId: ID!) {
    messageDeleted(chatRoomId: $chatRoomId)
  }
`;

export const DIRECT_MESSAGE_DELETED_SUBSCRIPTION = gql`
  subscription DirectMessageDeleted($directChatId: ID!) {
    directMessageDeleted(directChatId: $directChatId)
  }
`;

export const USER_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription UserStatusChanged {
    userStatusChanged {
      id
      username
      isOnline
      lastSeen
    }
  }
`;

export const CHAT_ROOM_UPDATED_SUBSCRIPTION = gql`
  subscription ChatRoomUpdated($chatRoomId: ID!) {
    chatRoomUpdated(chatRoomId: $chatRoomId) {
      id
      name
      participants {
        id
        username
        avatar
        isOnline
      }
      admins {
        id
        username
      }
      updatedAt
    }
  }
`;
