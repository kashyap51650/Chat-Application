import { useEffect, useState, useCallback } from "react";
import {
  GET_MY_CONVERSATIONS,
  MESSAGE_RECEIVED_SUBSCRIPTION,
} from "../graphql/operations";
import { useConnectivity } from "./useConnectivity";
import type { ChatConversation } from "../types";
import { apolloClient } from "../lib/apollo";
import { ChatStorage } from "../lib/chatStorage";
import { useChat } from "../context/ChatContext";

export function useChats() {
  const { selectedConversation } = useChat();
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const online = useConnectivity();

  // 🔹 Normalize timestamps for consistent sorting
  const normalizeChat = (chat: ChatConversation) => ({
    ...chat,
    updatedAt: new Date(chat.updatedAt).getTime(),
  });

  // 🔹 Load and sync chats
  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Load from local DB
      const localChats = await ChatStorage.getAllChats();
      setChats(localChats);

      // 2️⃣ Sync from server if online
      if (online) {
        const { data } = await apolloClient.query({
          query: GET_MY_CONVERSATIONS,
          fetchPolicy: "network-only",
        });

        const serverChats: ChatConversation[] = (
          data as any
        ).myConversations.map(normalizeChat);

        // Merge local + server
        const merged = mergeChats(localChats, serverChats);

        // Save to DB
        for (const chat of merged) {
          await ChatStorage.addChat(chat);
        }

        setChats(merged);
      }
    } catch (err) {
      console.error("[useChats] Sync failed", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [online]);

  // 🔁 Merge helper (keeps latest update)
  const mergeChats = (
    local: ChatConversation[],
    remote: ChatConversation[]
  ) => {
    const map = new Map<string, ChatConversation>();
    [...local, ...remote].forEach((chat) => {
      const existing = map.get(chat.id);
      if (
        !existing ||
        new Date(chat.updatedAt) > new Date(existing.updatedAt)
      ) {
        map.set(chat.id, chat);
      }
    });
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  // Load initially
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // 🔄 Auto-resync when going online
  useEffect(() => {
    if (online) {
      loadChats();
    }
  }, [online]);

  useEffect(() => {
    if (!online) {
      return;
    }

    const sub = apolloClient
      .subscribe({
        query: MESSAGE_RECEIVED_SUBSCRIPTION,
      })
      .subscribe({
        next: async ({ data }: { data: any }) => {
          const newMessage = data.messageReceived;
          console.log("New message received via subscription", newMessage);
          // Update chat's last message & timestamp
          setChats((prev) => {
            const updated = prev.map((chat) =>
              chat.id === newMessage.id
                ? {
                    ...chat,
                    lastMessage: newMessage.content,
                    updatedAt: new Date(newMessage.createdAt),
                    unreadCount:
                      selectedConversation?.id === newMessage.id
                        ? chat.unreadCount
                        : (chat.unreadCount || 0) + 1,
                  }
                : chat
            );

            // Resort chats
            return updated.sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
          });

          // Update in IndexedDB
          const chat = await ChatStorage.getChat(newMessage.id);
          if (chat) {
            await ChatStorage.addChat({
              ...chat,
              lastMessage: newMessage.content,
              updatedAt: new Date(newMessage.createdAt),
            });
          }
        },
      });

    return () => sub.unsubscribe();
  }, [online]);

  // 🟢 Mark chat as read
  // const markChatAsRead = useCallback(async (chatId: string) => {
  //   setChats((prev) =>
  //     prev.map((chat) =>
  //       chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
  //     )
  //   );
  //   await ChatStorage.updateChat(chatId, { unreadCount: 0 });
  // }, []);

  return { chats, loading, error };
}
