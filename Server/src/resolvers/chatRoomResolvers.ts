import { UserInputError, ForbiddenError } from "apollo-server-express";
import { Context } from "../types";
import { ChatRoom, User } from "../models";
import { requireAuth } from "../middleware/auth";

export const chatRoomResolvers = {
  Query: {
    myChatRooms: async (_: any, __: any, context: Context) => {
      const user = requireAuth(context);
      return await ChatRoom.find({
        participants: user._id,
      })
        .populate("participants", "-password")
        .populate("admins", "-password")
        .populate("createdBy", "-password")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
    },

    chatRoom: async (_: any, { id }: { id: string }, context: Context) => {
      const user = requireAuth(context);

      const chatRoom = await ChatRoom.findById(id)
        .populate("participants", "-password")
        .populate("admins", "-password")
        .populate("createdBy", "-password")
        .populate("lastMessage");

      if (!chatRoom) {
        throw new UserInputError("Chat room not found");
      }

      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(
        (participant: any) => participant._id.toString() === user._id.toString()
      );

      if (!isParticipant) {
        throw new ForbiddenError("You are not a participant of this chat room");
      }

      return chatRoom;
    },
  },

  Mutation: {
    createChatRoom: async (
      _: any,
      { input }: { input: any },
      context: Context
    ) => {
      const user = requireAuth(context);
      const { name, description, isPrivate, participantIds } = input;

      // Validate participants
      if (!participantIds || participantIds.length === 0) {
        throw new UserInputError("At least one participant is required");
      }

      // Ensure creator is in participants
      const allParticipantIds = [
        ...new Set([...participantIds, user._id.toString()]),
      ];

      // Validate all participants exist
      const participants = await User.find({ _id: { $in: allParticipantIds } });
      if (participants.length !== allParticipantIds.length) {
        throw new UserInputError("One or more participants not found");
      }

      // Create chat room
      const chatRoom = new ChatRoom({
        name,
        description,
        isPrivate,
        isDirect: false, // Regular group chats are not direct
        participants: allParticipantIds,
        admins: [user._id],
        createdBy: user._id,
      });

      await chatRoom.save();

      return await ChatRoom.findById(chatRoom._id)
        .populate("participants", "-password")
        .populate("admins", "-password")
        .populate("createdBy", "-password");
    },

    joinChatRoom: async (
      _: any,
      { chatRoomId }: { chatRoomId: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        throw new UserInputError("Chat room not found");
      }

      // Check if it's a direct chat
      if (chatRoom.isDirect) {
        throw new ForbiddenError("Cannot join direct chats manually");
      }

      // Check if it's a private room
      if (chatRoom.isPrivate) {
        throw new ForbiddenError("Cannot join private chat room");
      }

      // Check if already a participant
      const userIdString = user._id.toString();
      const participantIds = chatRoom.participants.map((p: any) =>
        p.toString()
      );
      if (participantIds.includes(userIdString)) {
        throw new UserInputError("You are already a participant");
      }

      // Add user to participants
      chatRoom.participants.push(user._id as any);
      await chatRoom.save();

      return await ChatRoom.findById(chatRoom._id)
        .populate("participants", "-password")
        .populate("admins", "-password")
        .populate("createdBy", "-password");
    },

    leaveChatRoom: async (
      _: any,
      { chatRoomId }: { chatRoomId: string },
      context: Context
    ) => {
      const user = requireAuth(context);

      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        throw new UserInputError("Chat room not found");
      }

      // Check if it's a direct chat
      if (chatRoom.isDirect) {
        throw new ForbiddenError("Cannot leave direct chats manually");
      }

      // Check if user is a participant
      const userIdString = user._id.toString();
      const participantIds = chatRoom.participants.map((p: any) =>
        p.toString()
      );
      if (!participantIds.includes(userIdString)) {
        throw new UserInputError("You are not a participant of this chat room");
      }

      // Remove user from participants and admins
      chatRoom.participants = chatRoom.participants.filter(
        (id: any) => id.toString() !== userIdString
      ) as any;
      chatRoom.admins = chatRoom.admins.filter(
        (id: any) => id.toString() !== userIdString
      ) as any;

      await chatRoom.save();
      return true;
    },
  },

  ChatRoom: {
    participants: async (parent: any) => {
      return await User.find({ _id: { $in: parent.participants } }).select(
        "-password"
      );
    },
    admins: async (parent: any) => {
      return await User.find({ _id: { $in: parent.admins } }).select(
        "-password"
      );
    },
    createdBy: async (parent: any) => {
      return await User.findById(parent.createdBy).select("-password");
    },
  },
};
