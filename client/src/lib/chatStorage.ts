// chatStorage.ts
import { chatDB } from "./db";
import type { User, ChatConversation, Message, PendingMessage } from "../types";

export const ChatStorage = {
  // ---------------- USERS ----------------
  async addUser(user: User) {
    const db = await chatDB;
    return db.put("users", user);
  },

  async getUser(id: string) {
    const db = await chatDB;
    return db.get("users", id);
  },

  async getAllUsers() {
    const db = await chatDB;
    return db.getAll("users");
  },

  // ---------------- CHATS ----------------
  async addChat(chat: ChatConversation) {
    const db = await chatDB;
    return db.put("chats", chat);
  },

  async getChat(id: string) {
    const db = await chatDB;
    return db.get("chats", id);
  },

  async getAllChats() {
    const db = await chatDB;
    return db.getAll("chats");
  },

  // ---------------- MESSAGES ----------------
  async addMessage(message: Message) {
    const db = await chatDB;
    return db.put("messages", message);
  },

  async getMessage(id: string) {
    const db = await chatDB;
    return db.get("messages", id);
  },

  async getMessagesByConversation(conversationId: string) {
    const db = await chatDB;
    return db.getAllFromIndex("messages", "by-conversation", conversationId);
  },

  async getMessagesByDirectChat(directChatId: string) {
    const db = await chatDB;
    return db.getAllFromIndex("messages", "by-direct", directChatId);
  },

  async deleteMessage(id: string) {
    const db = await chatDB;
    return db.delete("messages", id);
  },

  // ---------------- PENDING MESSAGES ----------------
  async addPendingMessage(pending: PendingMessage) {
    const db = await chatDB;
    return db.put("pendingMessages", pending);
  },

  async getPendingMessage(tempId: string) {
    const db = await chatDB;
    return db.get("pendingMessages", tempId);
  },

  async getPendingByStatus(status: string) {
    const db = await chatDB;
    return db.getAllFromIndex("pendingMessages", "by-status", status);
  },

  async getAllPendingMessages() {
    const db = await chatDB;
    return db.getAll("pendingMessages");
  },

  async deletePendingMessage(tempId: string) {
    const db = await chatDB;
    return db.delete("pendingMessages", tempId);
  },
};
