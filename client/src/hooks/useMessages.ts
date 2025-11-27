import { useEffect, useState } from "react";
import {
  DIRECT_MESSAGE_ADDED_SUBSCRIPTION,
  GET_DIRECT_MESSAGES,
} from "../graphql/operations";
import type { ChatConversation, Message } from "../types";
import { apolloClient } from "../lib/apollo";
import { useSubscription } from "@apollo/client/react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

export function useMessages(selectedChat: ChatConversation | null) {
  const { messages, setMessages } = useChat();

  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const chatId = selectedChat?.id;

  /**
   * Subscribe for live updates
   */
  useSubscription<{ directMessageAdded: Message }>(
    DIRECT_MESSAGE_ADDED_SUBSCRIPTION,
    {
      skip: !chatId,
      variables: { directChatId: chatId },
      onData: ({ data }) => {
        const newMessage = data?.data?.directMessageAdded;
        if (!newMessage || !user) return;

        setMessages((prev) => {
          // If not duplicate
          const exists = prev.some((m) => m.id === newMessage.id);
          if (!exists) return [...prev, newMessage];
          return prev;
        });
      },
    }
  );

  /**
   * Load messages from server
   */
  useEffect(() => {
    if (!selectedChat) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const { data } = await apolloClient.query<{
          directMessages: Message[];
        }>({
          query: GET_DIRECT_MESSAGES,
          variables: {
            directChatId: selectedChat!.id,
            limit: 50,
            offset: 0,
          },
          fetchPolicy: "network-only",
        });

        if (!cancelled && data?.directMessages) {
          setMessages(
            [...data.directMessages].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
          );
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
  }, [chatId, setMessages, selectedChat]);

  return { messages, error, loading };
}
