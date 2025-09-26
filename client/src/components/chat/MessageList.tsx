import React, { useEffect, useRef } from "react";
import { useQuery, useSubscription } from "@apollo/client/react";
import {
  GET_MESSAGES,
  GET_DIRECT_MESSAGES,
  MESSAGE_ADDED_SUBSCRIPTION,
  DIRECT_MESSAGE_ADDED_SUBSCRIPTION,
} from "../../graphql/operations";
import { useChat } from "../../context/ChatContext";
import MessageItem from "./MessageItem";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { Message } from "../../types";
import { isChatRoom } from "../../lib/utils";

const MessageList: React.FC = () => {
  const { selectedConversation, messages, setMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRoomSelected =
    selectedConversation && isChatRoom(selectedConversation);
  const isDirectChatSelected =
    selectedConversation && !isChatRoom(selectedConversation);

  // Query for chat room messages
  const { data: roomMessages, loading: roomLoading } = useQuery(GET_MESSAGES, {
    variables: {
      chatRoomId: selectedConversation?.id,
      limit: 50,
      offset: 0,
    },
    skip: !isRoomSelected,
  });

  // Query for direct chat messages
  const { data: directMessages, loading: directLoading } = useQuery(
    GET_DIRECT_MESSAGES,
    {
      variables: {
        directChatId: selectedConversation?.id,
        limit: 50,
        offset: 0,
      },
      skip: !isDirectChatSelected,
    }
  );

  const loading = roomLoading || directLoading;

  // Update messages when data changes
  React.useEffect(() => {
    if (roomMessages && (roomMessages as any).messages) {
      setMessages((roomMessages as any).messages);
    } else if (directMessages && (directMessages as any).directMessages) {
      setMessages((directMessages as any).directMessages);
    }
  }, [roomMessages, directMessages, setMessages]);

  // Subscribe to new chat room messages
  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { chatRoomId: selectedConversation?.id },
    skip: !isRoomSelected,
    onData: ({ data }: { data: any }) => {
      if (data?.data?.messageAdded) {
        const newMessage = data.data.messageAdded;
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((msg: Message) => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    },
  });

  // Subscribe to new direct messages
  useSubscription(DIRECT_MESSAGE_ADDED_SUBSCRIPTION, {
    variables: { directChatId: selectedConversation?.id },
    skip: !isDirectChatSelected,
    onData: ({ data }: { data: any }) => {
      if (data?.data?.directMessageAdded) {
        const newMessage = data.data.directMessageAdded;
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((msg: Message) => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to Chat App
          </h3>
          <p className="text-gray-600">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const shouldShowAvatar = (message: Message, index: number): boolean => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return prevMessage.sender.id !== message.sender.id;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-white">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              No messages yet
            </p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Be the first to send a message!
            </p>
          </div>
        </div>
      ) : (
        <div>
          {messages
            .slice() // create a copy to avoid mutating state
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                showAvatar={shouldShowAvatar(message, index)}
                isDirectChat={!isChatRoom(selectedConversation)}
              />
            ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
