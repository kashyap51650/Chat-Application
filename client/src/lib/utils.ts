import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ChatRoom, DirectChat, ChatConversation } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Chat type utilities
export function isChatRoom(
  conversation: ChatConversation
): conversation is ChatRoom {
  return "name" in conversation;
}

export function isDirectChat(
  conversation: ChatConversation
): conversation is DirectChat {
  return !("name" in conversation);
}

export function getConversationName(
  conversation: ChatConversation,
  currentUserId: string
): string {
  if (isChatRoom(conversation)) {
    return conversation.name;
  } else {
    // For direct chats, show the other user's name
    const otherUser = conversation.participants.find(
      (p) => p.id !== currentUserId
    );
    return otherUser?.username || "Unknown User";
  }
}

export function getConversationAvatar(
  conversation: ChatConversation,
  currentUserId: string
) {
  if (isChatRoom(conversation)) {
    return null; // Group chats will use a group icon
  } else {
    // For direct chats, show the other user's avatar
    const otherUser = conversation.participants.find(
      (p) => p.id !== currentUserId
    );
    return otherUser;
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return d.toLocaleDateString();
  }
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function generateAvatar(username: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const colorIndex = username.length % colors.length;
  return colors[colorIndex];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}
