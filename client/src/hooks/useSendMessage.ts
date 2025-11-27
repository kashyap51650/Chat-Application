import { SEND_MESSAGE } from "../graphql/operations";
import type { ChatConversation, Message, SendMessageInput } from "../types";
import { apolloClient } from "../lib/apollo";
import { useAuth } from "../context/AuthContext";
import { isChatRoom } from "../lib/utils";

/**
 * Send message hook
 * - Sends message to server via GraphQL mutation
 */
export function useSendMessage(selectedChat: ChatConversation) {
  const { user } = useAuth();

  const isGroupChat = isChatRoom(selectedChat);

  const sendMessage = async (content: string) => {
    if (!selectedChat || !user) return null;

    try {
      const input: SendMessageInput = {
        content,
        ...(isGroupChat
          ? { chatRoomId: selectedChat.id }
          : { directChatId: selectedChat.id }),
        messageType: "text",
      };

      const { data } = await apolloClient.mutate<{ sendMessage: Message }>({
        mutation: SEND_MESSAGE,
        variables: { input },
      });

      const serverMsg = data?.sendMessage;
      if (serverMsg) {
        console.log("[useSendMessage] Message sent:", serverMsg.id);
        return serverMsg;
      }

      console.warn("[useSendMessage] No response from server");
      return null;
    } catch (err) {
      console.error("[useSendMessage] Failed to send message", err);
      throw err;
    }
  };

  return { sendMessage };
}
