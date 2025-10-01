// db.ts
import { openDB } from "idb";
import type { DBSchema } from "idb";
import type { ChatConversation, Message, PendingMessage, User } from "../types";

interface ChatDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: { "by-id": string };
  };
  chats: {
    key: string; // chatRoom.id or directChat.id
    value: ChatConversation;
    indexes: { "by-id": string };
  };
  messages: {
    key: string; // message.id
    value: Message;
    indexes: { "by-conversation": string; "by-direct": string };
  };
  pendingMessages: {
    key: string; // tempId
    value: PendingMessage;
    indexes: { "by-status": string };
  };
}

export const chatDB = openDB<ChatDB>("chat-db", 4, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("users")) {
      const userStore = db.createObjectStore("users", { keyPath: "id" });
      userStore.createIndex("by-id", "id");
    }
    if (!db.objectStoreNames.contains("chats")) {
      const chatStore = db.createObjectStore("chats", { keyPath: "id" });
      chatStore.createIndex("by-id", "id");
    }
    if (!db.objectStoreNames.contains("messages")) {
      const messageStore = db.createObjectStore("messages", { keyPath: "id" });
      messageStore.createIndex("by-conversation", "chatRoom.id");
      messageStore.createIndex("by-direct", "directChat.id");
    }
    if (!db.objectStoreNames.contains("pendingMessages")) {
      const pendingStore = db.createObjectStore("pendingMessages", {
        keyPath: "id",
      });
      pendingStore.createIndex("by-status", "status");
    }
  },
});
