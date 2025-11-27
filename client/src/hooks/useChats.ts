import { useEffect, useState, useCallback } from "react";
import {
  GET_MY_CONVERSATIONS,
  MESSAGE_RECEIVED_SUBSCRIPTION,
} from "../graphql/operations";
import type { ChatConversation, Message } from "../types";
import { apolloClient } from "../lib/apollo";
import { useChat } from "../context/ChatContext";

export function useChats() {
  const { selectedConversation } = useChat();
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load chats from server
  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await apolloClient.query<{
        myConversations: ChatConversation[];
      }>({
        query: GET_MY_CONVERSATIONS,
        fetchPolicy: "network-only",
      });
      const serverChats: ChatConversation[] = [
        ...(data?.myConversations || []),
      ].sort(
        (a: ChatConversation, b: ChatConversation) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setChats(serverChats);
    } catch (err) {
      console.error("[useChats] Failed to load chats", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initially
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    const sub = apolloClient
      .subscribe<{
        messageReceived: Message;
      }>({
        query: MESSAGE_RECEIVED_SUBSCRIPTION,
      })
      .subscribe({
        next: ({ data }) => {
          if (!data?.messageReceived) return;

          const newMessage = data.messageReceived;
          console.log("New message received via subscription", newMessage);

          // Determine which chat this message belongs to
          const chatId = newMessage.directChat?.id || newMessage.chatRoom?.id;
          if (!chatId) return;

          // Update chat's last message & timestamp
          setChats((prev) => {
            const updated = prev.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    lastMessage: newMessage,
                    updatedAt: new Date(newMessage.createdAt),
                    unreadCount:
                      selectedConversation?.id === chatId
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
        },
      });

    return () => sub.unsubscribe();
  }, [selectedConversation]);

  return { chats, loading, error };
}
