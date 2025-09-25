import mongoose, { Schema } from "mongoose";
import { IChatRoom } from "../types";

const chatRoomSchema = new Schema<IChatRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 200,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isDirect: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ isPrivate: 1 });
chatRoomSchema.index({ isDirect: 1 });
chatRoomSchema.index({ createdBy: 1 });
chatRoomSchema.index({ participants: 1, isDirect: 1 }); // For finding direct chats between users

export const ChatRoom = mongoose.model<IChatRoom>("ChatRoom", chatRoomSchema);
