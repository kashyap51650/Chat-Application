import { useEffect, useRef, useState } from "react";
import { SEND_MESSAGE } from "../graphql/operations";
import { useConnectivity } from "./useConnectivity";
import type { Message, SendMessageInput } from "../types";
import { ChatStorage } from "../lib/chatStorage";
import { apolloClient } from "../lib/apollo";

export function usePendingSync(chatId: string) {
  const online = useConnectivity();
  const [loading, setLoading] = useState(false);
  const syncingIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!online || !chatId) return;

    let cancelled = false;

    async function sync() {
      setLoading(true);

      try {
        const pendings = await ChatStorage.getPendingMessagesByChat(chatId);

        for (const pending of pendings) {
          if (cancelled) break;
          if (syncingIds.current.has(pending.id)) continue; // prevent duplicate send
          syncingIds.current.add(pending.id);

          try {
            const input: SendMessageInput = {
              content: pending.content,
              ...(pending.chatRoomId
                ? { chatRoomId: pending.chatRoomId }
                : { directChatId: pending.directChatId! }),
              messageType: pending.messageType,
            };

            const { data } = await apolloClient.mutate<{
              sendMessage: Message;
            }>({
              mutation: SEND_MESSAGE,
              variables: { input },
            });

            const sent = data?.sendMessage;
            if (sent) {
              // Replace pending with confirmed message
              await ChatStorage.deletePendingMessage(pending.id);
              await ChatStorage.addMessage({
                ...sent,
              });
              console.log("[usePendingSync] Message synced:", pending.id);
            }
          } catch (err) {
            console.error("[usePendingSync] Retry failed:", pending.id, err);
          } finally {
            syncingIds.current.delete(pending.id);
          }
        }

        console.log("[usePendingSync] Sync complete");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    sync();

    return () => {
      cancelled = true;
    };
  }, [online, chatId]);

  return { loading };
}
