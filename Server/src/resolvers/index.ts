import { userResolvers } from "./userResolvers";
import { chatRoomResolvers } from "./chatRoomResolvers";
import { messageResolvers } from "./messageResolvers";
import { directChatResolvers } from "./directChatResolvers";
import { DateScalar } from "./scalarResolvers";

export const resolvers = {
  Date: DateScalar,

  Query: {
    ...userResolvers.Query,
    ...chatRoomResolvers.Query,
    ...directChatResolvers.Query,
    ...messageResolvers.Query,
  },

  Mutation: {
    ...userResolvers.Mutation,
    ...chatRoomResolvers.Mutation,
    ...directChatResolvers.Mutation,
    ...messageResolvers.Mutation,
  },

  Subscription: {
    ...messageResolvers.Subscription,
  },

  ChatRoom: chatRoomResolvers.ChatRoom,
  DirectChat: directChatResolvers.DirectChat,
  ChatConversation: directChatResolvers.ChatConversation,
  Message: messageResolvers.Message,
};
