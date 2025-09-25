import { UserInputError, ForbiddenError } from "apollo-server-express";
import { PubSub } from "graphql-subscriptions";
import { Context } from "../types";
import { Message, ChatRoom, DirectChat, User } from "../models";
import { requireAuth } from "../middleware/auth";

const pubsub = new PubSub();

// Subscription constants
const MESSAGE_ADDED = "MESSAGE_ADDED";
const DIRECT_MESSAGE_ADDED = "DIRECT_MESSAGE_ADDED";
const MESSAGE_EDITED = "MESSAGE_EDITED";
const DIRECT_MESSAGE_EDITED = "DIRECT_MESSAGE_EDITED";
const MESSAGE_DELETED = "MESSAGE_DELETED";
const DIRECT_MESSAGE_DELETED = "DIRECT_MESSAGE_DELETED";

export const messageResolvers = {
  Query: {
    messages: async (
      _: any,
      {
        chatRoomId,
        limit = 50,
        offset = 0,
      }: { chatRoomId: string; limit?: number; offset?: number },
      context: Context
    ) => {
      const user = requireAuth(context);

      // Verify user is a participant of the chat room
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        throw new UserInputError("Chat room not found");
      }

      const isParticipant = chatRoom.participants.some(
        (participantId: any) => participantId.toString() === user._id.toString()
      );

      if (!isParticipant) {
        throw new ForbiddenError("You are not a participant of this chat room");
      }

      return await Message.find({ chatRoom: chatRoomId })
        .populate("sender", "-password")
        .populate("chatRoom")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);
    },
  },

  Mutation: {
    sendMessage: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);
      const { content, chatRoomId, directChatId, messageType = "text" } = input;

      // Validate that exactly one of chatRoomId or directChatId is provided
      if ((!chatRoomId && !directChatId) || (chatRoomId && directChatId)) {
        throw new UserInputError(
          "Must provide either chatRoomId or directChatId, but not both"
        );
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        throw new UserInputError("Message content cannot be empty");
      }

      let message;

      if (chatRoomId) {
        // Handle chat room message
        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
          throw new UserInputError("Chat room not found");
        }

        const isParticipant = chatRoom.participants.some(
          (participantId: any) =>
            participantId.toString() === user._id.toString()
        );

        if (!isParticipant) {
          throw new ForbiddenError(
            "You are not a participant of this chat room"
          );
        }

        // Create message
        message = new Message({
          content: content.trim(),
          sender: user._id,
          chatRoom: chatRoomId,
          messageType,
        });

        await message.save();

        // Update chat room's last message
        chatRoom.lastMessage = message._id;
        await chatRoom.save();

        // Populate the message for return
        await message.populate("sender", "-password");
        await message.populate("chatRoom");

        // Publish to subscribers
        pubsub.publish(MESSAGE_ADDED, {
          messageAdded: message,
          chatRoomId,
        });
      } else if (directChatId) {
        // Handle direct chat message
        const directChat = await DirectChat.findById(directChatId);
        if (!directChat) {
          throw new UserInputError("Direct chat not found");
        }

        const isParticipant = directChat.participants.some(
          (participantId: any) =>
            participantId.toString() === user._id.toString()
        );

        if (!isParticipant) {
          throw new ForbiddenError(
            "You are not a participant of this direct chat"
          );
        }

        // Create message
        message = new Message({
          content: content.trim(),
          sender: user._id,
          directChat: directChatId,
          messageType,
        });

        await message.save();

        // Update direct chat's last message
        directChat.lastMessage = message._id;
        await directChat.save();

        // Populate the message for return
        await message.populate("sender", "-password");
        await message.populate("directChat");

        // Publish to subscribers
        pubsub.publish(DIRECT_MESSAGE_ADDED, {
          directMessageAdded: message,
          directChatId,
        });
      }

      return message;
    },

    editMessage: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);
      const { messageId, content } = input;

      // Validate content
      if (!content || content.trim().length === 0) {
        throw new UserInputError("Message content cannot be empty");
      }

      // Find message
      const message = await Message.findById(messageId)
        .populate("sender", "-password")
        .populate("chatRoom");

      if (!message) {
        throw new UserInputError("Message not found");
      }

      // Check if user is the sender
      const senderId =
        typeof message.sender === "string"
          ? message.sender
          : message.sender._id;
      if (senderId.toString() !== user._id.toString()) {
        throw new ForbiddenError("You can only edit your own messages");
      }

      // Update message
      message.content = content.trim();
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      // Publish to subscribers
      if (message.chatRoom) {
        const chatRoomId =
          typeof message.chatRoom === "string"
            ? message.chatRoom
            : message.chatRoom._id;
        pubsub.publish(MESSAGE_EDITED, {
          messageEdited: message,
          chatRoomId: chatRoomId.toString(),
        });
      } else if (message.directChat) {
        const directChatId =
          typeof message.directChat === "string"
            ? message.directChat
            : message.directChat._id;
        pubsub.publish(DIRECT_MESSAGE_EDITED, {
          directMessageEdited: message,
          directChatId: directChatId.toString(),
        });
      }

      return message;
    },

    deleteMessage: async (
      _: any,
      { messageId }: { messageId: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      // Find message
      const message = await Message.findById(messageId)
        .populate("chatRoom")
        .populate("directChat");
      if (!message) {
        throw new UserInputError("Message not found");
      }

      // Check if user is the sender or admin
      const isSender = message.sender.toString() === user._id.toString();

      if (message.chatRoom) {
        const chatRoomId =
          typeof message.chatRoom === "string"
            ? message.chatRoom
            : message.chatRoom._id;
        const chatRoom = await ChatRoom.findById(chatRoomId);
        const isAdmin = chatRoom?.admins.some(
          (adminId: any) => adminId.toString() === user._id.toString()
        );

        if (!isSender && !isAdmin) {
          throw new ForbiddenError(
            "You can only delete your own messages or you must be an admin"
          );
        }

        // Delete message
        await Message.findByIdAndDelete(messageId);

        // Publish to subscribers
        pubsub.publish(MESSAGE_DELETED, {
          messageDeleted: messageId,
          chatRoomId: chatRoomId.toString(),
        });
      } else if (message.directChat) {
        const directChatId =
          typeof message.directChat === "string"
            ? message.directChat
            : message.directChat._id;
        const directChat = await DirectChat.findById(directChatId);
        const isParticipant = directChat?.participants.some(
          (participantId: any) =>
            participantId.toString() === user._id.toString()
        );

        if (!isSender || !isParticipant) {
          throw new ForbiddenError(
            "You can only delete your own messages in direct chats"
          );
        }

        // Delete message
        await Message.findByIdAndDelete(messageId);

        // Publish to subscribers
        pubsub.publish(DIRECT_MESSAGE_DELETED, {
          directMessageDeleted: messageId,
          directChatId: directChatId.toString(),
        });
      }

      return true;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: (
        _: any,
        { chatRoomId }: { chatRoomId: string },
        context: Context
      ) => {
        // Note: In a real application, you should verify the user has access to this chat room
        return pubsub.asyncIterator(MESSAGE_ADDED);
      },
      resolve: (payload: any, { chatRoomId }: { chatRoomId: string }) => {
        // Only return messages for the specific chat room
        if (payload.chatRoomId === chatRoomId) {
          return payload.messageAdded;
        }
        return null;
      },
    },

    messageEdited: {
      subscribe: (
        _: any,
        { chatRoomId }: { chatRoomId: string },
        context: Context
      ) => {
        return pubsub.asyncIterator(MESSAGE_EDITED);
      },
      resolve: (payload: any, { chatRoomId }: { chatRoomId: string }) => {
        if (payload.chatRoomId === chatRoomId) {
          return payload.messageEdited;
        }
        return null;
      },
    },

    messageDeleted: {
      subscribe: (
        _: any,
        { chatRoomId }: { chatRoomId: string },
        context: Context
      ) => {
        return pubsub.asyncIterator(MESSAGE_DELETED);
      },
      resolve: (payload: any, { chatRoomId }: { chatRoomId: string }) => {
        if (payload.chatRoomId === chatRoomId) {
          return payload.messageDeleted;
        }
        return null;
      },
    },

    // Direct Chat Subscriptions
    directMessageAdded: {
      subscribe: (
        _: any,
        { directChatId }: { directChatId: string },
        context: Context
      ) => {
        // Note: In a real application, you should verify the user has access to this direct chat
        return pubsub.asyncIterator(DIRECT_MESSAGE_ADDED);
      },
      resolve: (payload: any, { directChatId }: { directChatId: string }) => {
        // Only return messages for the specific direct chat
        if (payload.directChatId === directChatId) {
          return payload.directMessageAdded;
        }
        return null;
      },
    },

    directMessageEdited: {
      subscribe: (
        _: any,
        { directChatId }: { directChatId: string },
        context: Context
      ) => {
        return pubsub.asyncIterator(DIRECT_MESSAGE_EDITED);
      },
      resolve: (payload: any, { directChatId }: { directChatId: string }) => {
        if (payload.directChatId === directChatId) {
          return payload.directMessageEdited;
        }
        return null;
      },
    },

    directMessageDeleted: {
      subscribe: (
        _: any,
        { directChatId }: { directChatId: string },
        context: Context
      ) => {
        return pubsub.asyncIterator(DIRECT_MESSAGE_DELETED);
      },
      resolve: (payload: any, { directChatId }: { directChatId: string }) => {
        if (payload.directChatId === directChatId) {
          return payload.directMessageDeleted;
        }
        return null;
      },
    },
  },

  Message: {
    sender: async (parent: any) => {
      return await User.findById(parent.sender).select("-password");
    },
    chatRoom: async (parent: any) => {
      if (parent.chatRoom) {
        return await ChatRoom.findById(parent.chatRoom);
      }
      return null;
    },
    directChat: async (parent: any) => {
      if (parent.directChat) {
        return await DirectChat.findById(parent.directChat);
      }
      return null;
    },
  },
};

export { pubsub };
