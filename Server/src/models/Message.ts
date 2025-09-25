import mongoose, { Schema } from "mongoose";
import { IMessage } from "../types";

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: false,
    },
    directChat: {
      type: Schema.Types.ObjectId,
      ref: "DirectChat",
      required: false,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video"],
      default: "text",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: message must belong to either a chatRoom OR directChat, but not both
messageSchema.pre<IMessage>("save", function (next) {
  const hasChatRoom = !!this.chatRoom;
  const hasDirectChat = !!this.directChat;

  if ((!hasChatRoom && !hasDirectChat) || (hasChatRoom && hasDirectChat)) {
    next(
      new Error(
        "Message must belong to either a chatRoom or directChat, but not both"
      )
    );
  } else {
    next();
  }
});

// Indexes for better query performance
messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ directChat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
