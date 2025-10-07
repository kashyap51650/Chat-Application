import { useCallback, useEffect, useState } from "react";
import {
  DIRECT_MESSAGE_ADDED_SUBSCRIPTION,
  GET_DIRECT_MESSAGES,
} from "../graphql/operations";
import { useConnectivity } from "./useConnectivity";
import type { ChatConversation, Message } from "../types";
import { ChatStorage } from "../lib/chatStorage";
import { apolloClient } from "../lib/apollo";
import { useSubscription } from "@apollo/client/react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

export function useMessages(selectedChat: ChatConversation | null) {
  const { messages, setMessages } = useChat();

  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const online = useConnectivity();

  const chatId = selectedChat?.id;

  /**
   * Subscribe for live updates when online
   */
  useSubscription(DIRECT_MESSAGE_ADDED_SUBSCRIPTION, {
    skip: !chatId || !online,
    variables: { directChatId: chatId },
    onData: async ({ data }: { data: any }) => {
      const newMessage = data?.data?.directMessageAdded as Message | undefined;
      if (!newMessage || !user) return;

      // Reconcile with pending message (clientMessageId)
      setMessages((prev) => {
        const pendingIndex = prev.findIndex(
          (m) =>
            m.id &&
            m.sender.id === user.id &&
            m.status === "pending" &&
            m.content === newMessage.content
        );

        if (pendingIndex !== -1) {
          const updated = [...prev];
          updated[pendingIndex] = { ...newMessage, status: "sent" };
          return updated;
        }

        // If not duplicate
        const exists = prev.some((m) => m.id === newMessage.id);
        if (!exists) return [...prev, newMessage];
        return prev;
      });

      if (selectedChat) {
        await ChatStorage.addMessage({
          ...newMessage,
          directChat: selectedChat,
        });
      }
    },
  });

  /**
   * Merge or replace messages in state and DB
   */
  const mergeMessages = useCallback(
    async (incoming: Message[]) => {
      setMessages((prev) => {
        const map = new Map(prev.map((m) => [m.id ?? m.id, m]));

        for (const msg of incoming) {
          const key = msg.id ?? msg.id;
          map.set(key, { ...map.get(key), ...msg });
        }

        return Array.from(map.values()).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // Persist to IndexedDB
      if (selectedChat) {
        for (const msg of incoming) {
          await ChatStorage.addMessage({
            ...msg,
            directChat: selectedChat,
          });
        }
      }
    },
    [selectedChat, setMessages]
  );

  /**
   * Load from IndexedDB first (instant UI)
   */
  useEffect(() => {
    if (!selectedChat) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const local = await ChatStorage.getMessagesByDirectChat(
          selectedChat!.id
        );
        if (!cancelled) setMessages(local);

        // If online, fetch newer messages
        if (online) {
          const lastCreatedAt =
            local.length > 0 ? local[local.length - 1].createdAt : null;

          const { data } = await apolloClient.query<{
            directMessages: Message[];
          }>({
            query: GET_DIRECT_MESSAGES,
            variables: {
              directChatId: selectedChat!.id,
              since: lastCreatedAt, // server supports delta fetch
              limit: 50,
              offset: 0,
            },
            fetchPolicy: "network-only",
          });

          if (data?.directMessages?.length) {
            await mergeMessages(data.directMessages);
          }
        }
      } catch (err) {
        console.error("[useMessages] Load error", err);
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [chatId, online, mergeMessages]);

  return { messages, error, loading };
}
