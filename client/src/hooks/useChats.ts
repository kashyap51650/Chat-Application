import { useEffect, useState, useCallback } from "react";
import { GET_MY_CONVERSATIONS } from "../graphql/operations";
import { useConnectivity } from "./useConnectivity";
import type { ChatConversation } from "../types";
import { apolloClient } from "../lib/apollo";
import { ChatStorage } from "../lib/chatStorage";

export function useChats() {
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const online = useConnectivity();

  // Load chats from local DB + network
  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Load from local DB
      const localChats = await ChatStorage.getAllChats();
      setChats(localChats);

      // 2️⃣ Fetch from server if online
      if (online && localChats.length === 0) {
        const { data } = await apolloClient.query({
          query: GET_MY_CONVERSATIONS,
          fetchPolicy: "network-only",
        });

        const serverChats: ChatConversation[] = (data as any).myConversations;

        // Save/update local DB
        for (const chat of serverChats) {
          await ChatStorage.addChat(chat);
        }

        setChats(serverChats);
      }
    } catch (err) {
      console.error("[useChats] Sync failed", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [online]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Subscribe to new messages
  //   useEffect(() => {
  //     if (!online) return;

  //     const sub = apolloClient
  //       .subscribe({ query: MESSAGE_ADDED_SUBSCRIPTION })
  //       .subscribe({
  //         next: async ({ data }) => {
  //           const newMsg: Message = data?.newMessage;

  //           if (!newMsg) return;

  //           // Update local messages DB
  //           await ChatStorage.addMessage(newMsg);

  //           // Update chats list with latest message on top + unread count
  //           setChats((prev) => {
  //             return (
  //               prev
  //                 .map((chat) => {
  //                   if (chat.id === newMsg.chatId) {
  //                     const unread = chat.unreadCount ?? 0;
  //                     return {
  //                       ...chat,
  //                       lastMessage: newMsg,
  //                       updatedAt: newMsg.createdAt,
  //                       unreadCount: unread + 1,
  //                     };
  //                   }
  //                   return chat;
  //                 })
  //                 // Sort chats by updatedAt descending
  //                 .sort((a, b) => b.updatedAt - a.updatedAt)
  //             );
  //           });
  //         },
  //         error: (err) => console.error("[useChats] Subscription error:", err),
  //       });

  //     return () => sub.unsubscribe();
  //   }, [online]);

  // Mark messages as read (reset unread count) helper
  const markChatAsRead = useCallback(
    async (chatId: string) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
      // Optionally, also update server/read status here
    },
    [setChats]
  );

  return { chats, loading, error, markChatAsRead };
}
