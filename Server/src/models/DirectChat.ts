import mongoose, { Schema } from "mongoose";
import { IDirectChat } from "../types";

const directChatSchema = new Schema<IDirectChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
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

// Ensure exactly 2 participants for direct chats
directChatSchema.pre<IDirectChat>("save", function (next) {
  if (this.participants.length !== 2) {
    next(new Error("Direct chat must have exactly 2 participants"));
  } else {
    next();
  }
});

// Indexes for better query performance
directChatSchema.index({ participants: 1 });
directChatSchema.index({ createdBy: 1 });
directChatSchema.index(
  {
    participants: 1,
  },
  {
    unique: true,
    // This ensures no duplicate direct chats between same users
    partialFilterExpression: { participants: { $size: 2 } },
  }
);

export const DirectChat = mongoose.model<IDirectChat>(
  "DirectChat",
  directChatSchema
);
