import { v4 as uuidv4 } from "uuid";
import { SEND_MESSAGE } from "../graphql/operations";
import { useConnectivity } from "./useConnectivity";
import type {
  ChatConversation,
  Message,
  PendingMessage,
  SendMessageInput,
} from "../types";
import { ChatStorage } from "../lib/chatStorage";
import { apolloClient } from "../lib/apollo";
import { useAuth } from "../context/AuthContext";
import { isChatRoom } from "../lib/utils";

/**
 * Offline-first send message hook
 * - Stores message optimistically in IndexedDB
 * - Queues pending messages if offline or failed
 * - Reconciles later via usePendingSync
 */
export function useSendMessage(selectedChat: ChatConversation) {
  const online = useConnectivity();
  const { user } = useAuth();

  const isGroupChat = isChatRoom(selectedChat);

  const sendMessage = async (content: string) => {
    if (!selectedChat || !user) return null;

    const clientMessageId = uuidv4();
    const now = new Date();

    // 🟡 Optimistic message object (UI shows instantly)
    const optimisticMsg: PendingMessage = {
      id: clientMessageId,
      sender: user,
      content,
      status: online ? "delivered" : "pending",
      createdAt: now,
      updatedAt: now,
      messageType: "text",
      ...(isGroupChat
        ? { chatRoomId: selectedChat.id }
        : { directChatId: selectedChat.id }),
    };
    // 🗄️ Always store locally (for immediate UI update)
    await ChatStorage.addMessage({
      ...optimisticMsg,
      isEdited: false,
      ...(isGroupChat
        ? { chatRoom: selectedChat }
        : { directChat: selectedChat }),
    });

    // 🌐 If offline → store as pending
    if (!online) {
      await ChatStorage.addPendingMessage({
        ...optimisticMsg,
        ...(isGroupChat
          ? { chatRoom: selectedChat }
          : { directChat: selectedChat }),
      });

      console.log(
        "[useSendMessage] Stored offline pending message:",
        optimisticMsg.id
      );
      return optimisticMsg;
    }

    // 🌐 If online → attempt immediate send
    try {
      const input: SendMessageInput = {
        content: optimisticMsg.content,
        ...(isGroupChat
          ? { chatRoomId: selectedChat.id }
          : { directChatId: selectedChat.id }),
        messageType: optimisticMsg.messageType,
      };

      const { data } = await apolloClient.mutate<{ sendMessage: Message }>({
        mutation: SEND_MESSAGE,
        variables: { input },
      });

      const serverMsg = data?.sendMessage;
      if (serverMsg) {
        // ✅ Replace optimistic message with server-confirmed message
        await ChatStorage.deleteMessage(clientMessageId);
        await ChatStorage.addMessage({
          ...serverMsg,
          ...(isGroupChat
            ? { chatRoom: selectedChat }
            : { directChat: selectedChat }),
        });

        console.log(
          "[useSendMessage] Sent & stored confirmed message:",
          serverMsg.id
        );
        return serverMsg;
      }

      // ⚠️ If mutation succeeded but no response — fallback
      await ChatStorage.addPendingMessage({
        ...optimisticMsg,
        status: "pending",
      });

      console.warn(
        "[useSendMessage] Missing server response, message requeued"
      );
      return optimisticMsg;
    } catch (err) {
      // ❌ On network or GraphQL failure → fallback to pending queue
      await ChatStorage.addPendingMessage({
        ...optimisticMsg,
        status: "pending",
      });

      console.error("[useSendMessage] Failed to send, message queued", err);
      return optimisticMsg;
    }
  };

  return { sendMessage };
}
