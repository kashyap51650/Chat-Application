import { UserInputError, ForbiddenError } from "apollo-server-express";
import { Context } from "../types";
import { DirectChat, User, Message } from "../models";
import { requireAuth } from "../middleware/auth";

export const directChatResolvers = {
  Query: {
    myDirectChats: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      return await DirectChat.find({
        participants: user._id,
      })
        .populate("participants", "-password")
        .populate("createdBy", "-password")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
    },

    directChat: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);

      const directChat = await DirectChat.findById(id)
        .populate("participants", "-password")
        .populate("createdBy", "-password")
        .populate("lastMessage");

      if (!directChat) {
        throw new UserInputError("Direct chat not found");
      }

      // Check if user is a participant
      const isParticipant = directChat.participants.some(
        (participant: any) => participant._id.toString() === user._id.toString()
      );

      if (!isParticipant) {
        throw new ForbiddenError(
          "You are not a participant of this direct chat"
        );
      }

      return directChat;
    },

    directMessages: async (
      _: any,
      {
        directChatId,
        limit = 50,
        offset = 0,
      }: { directChatId: string; limit?: number; offset?: number },
      context: Context
    ) => {
      const user = requireAuth(context);

      // Verify user has access to this direct chat
      const directChat = await DirectChat.findById(directChatId);
      if (!directChat) {
        throw new UserInputError("Direct chat not found");
      }

      const isParticipant = directChat.participants.some(
        (participantId: any) => participantId.toString() === user._id.toString()
      );

      if (!isParticipant) {
        throw new ForbiddenError(
          "You are not a participant of this direct chat"
        );
      }

      return await Message.find({ directChat: directChatId })
        .populate("sender", "-password")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .exec();
    },

    myConversations: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);

      // Get both chat rooms and direct chats
      const [chatRooms, directChats] = await Promise.all([
        require("./chatRoomResolvers").chatRoomResolvers.Query.myChatRooms(
          _,
          __,
          context
        ),
        DirectChat.find({ participants: user._id })
          .populate("participants", "-password")
          .populate("createdBy", "-password")
          .populate("lastMessage")
          .sort({ updatedAt: -1 }),
      ]);

      // Combine and sort by last activity
      const allConversations = [...chatRooms, ...directChats];
      return allConversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt;
        const bTime = b.lastMessage?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    },
  },

  Mutation: {
    createOrGetDirectChat: async (
      _: any,
      { participantId }: { participantId: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      // Validate that the participant exists
      const participant = await User.findById(participantId);
      if (!participant) {
        throw new UserInputError("Participant not found");
      }

      // Don't allow creating a chat with yourself
      if (user._id.toString() === participantId) {
        throw new UserInputError("Cannot create a direct chat with yourself");
      }

      // Check if a direct chat already exists between these two users
      const existingChat = await DirectChat.findOne({
        participants: {
          $all: [user._id, participantId],
          $size: 2,
        },
      })
        .populate("participants", "-password")
        .populate("createdBy", "-password")
        .populate("lastMessage");

      if (existingChat) {
        return existingChat;
      }

      // Create a new direct chat
      const directChat = new DirectChat({
        participants: [user._id, participantId],
        createdBy: user._id,
      });

      await directChat.save();

      return await DirectChat.findById(directChat._id)
        .populate("participants", "-password")
        .populate("createdBy", "-password");
    },

    sendDirectMessage: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);
      const { content, directChatId, messageType = "text" } = input;

      // Verify direct chat exists and user has access
      const directChat = await DirectChat.findById(directChatId);
      if (!directChat) {
        throw new UserInputError("Direct chat not found");
      }

      const isParticipant = directChat.participants.some(
        (participantId: any) => participantId.toString() === user._id.toString()
      );

      if (!isParticipant) {
        throw new ForbiddenError(
          "You are not a participant of this direct chat"
        );
      }

      // Create the message
      const message = new Message({
        content,
        sender: user._id,
        directChat: directChatId,
        messageType,
      });

      await message.save();

      // Update last message in direct chat
      directChat.lastMessage = message._id as any;
      await directChat.save();

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "-password")
        .populate("directChat");

      return populatedMessage;
    },
  },

  DirectChat: {
    participants: async (parent: any) => {
      return await User.find({ _id: { $in: parent.participants } }).select(
        "-password"
      );
    },
    createdBy: async (parent: any) => {
      return await User.findById(parent.createdBy).select("-password");
    },
  },

  ChatConversation: {
    __resolveType(obj: any) {
      // If it has a name property, it's a ChatRoom
      if (obj.name !== undefined) {
        return "ChatRoom";
      }
      // Otherwise it's a DirectChat
      return "DirectChat";
    },
  },
};
