import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  _id: string;
  content: string;
  sender: string | IUser;
  chatRoom?: string | IChatRoom;
  directChat?: string | IDirectChat;
  messageType: "text" | "image" | "file";
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatRoom extends Document {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  isDirect: boolean;
  participants: string[] | IUser[];
  admins: string[] | IUser[];
  lastMessage?: string | IMessage;
  createdBy: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDirectChat extends Document {
  _id: string;
  participants: string[] | IUser[];
  lastMessage?: string | IMessage;
  createdBy: string | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  token: string;
  user: IUser;
}

export interface Context {
  user?: IUser;
  isAuth: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
