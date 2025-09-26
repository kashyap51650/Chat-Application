import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_USERS } from "../../graphql/operations";
import { useAuth } from "../../context/AuthContext";
import type { ChatConversation, User, Message } from "../../types";
import { Search, Users, MessageSquare, Clock } from "lucide-react";

interface SearchResult {
  id: string;
  type: "conversation" | "message" | "user";
  title: string;
  subtitle?: string;
  conversation?: ChatConversation;
  user?: User;
  message?: Message;
  messageContent?: string;
  timestamp?: string;
}

interface SearchBarProps {
  conversations: ChatConversation[];
  onResultSelect: (result: SearchResult) => void;
  onNewChatWithUser?: (user: User) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  conversations,
  onResultSelect,
  onNewChatWithUser,
  placeholder = "Search conversations, messages, or users...",
}) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "conversations" | "messages" | "users"
  >("all");
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch system users
  const { data: usersData } = useQuery(GET_USERS, {
    skip: !searchTerm,
    fetchPolicy: "cache-first",
  });

  const systemUsers: User[] = (usersData as any)?.users || [];

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Perform search whenever search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results: SearchResult[] = [];
    const searchLower = searchTerm.toLowerCase();

    // Search conversations
    conversations.forEach((conversation) => {
      let matchFound = false;
      let conversationTitle = "";

      if ("name" in conversation) {
        // ChatRoom
        conversationTitle = conversation.name;
        if (conversation.name.toLowerCase().includes(searchLower)) {
          matchFound = true;
        }
      } else {
        // DirectChat
        const otherUser = conversation.participants.find(
          (p) => p.id !== currentUser?.id
        );
        conversationTitle = otherUser?.username || "Direct Chat";
        if (otherUser?.username?.toLowerCase().includes(searchLower)) {
          matchFound = true;
        }
      }

      if (matchFound) {
        results.push({
          id: `conversation-${conversation.id}`,
          type: "conversation",
          title: conversationTitle,
          subtitle: `${
            "name" in conversation ? "Group chat" : "Direct message"
          } • ${conversation.participants.length} participants`,
          conversation,
        });
      }

      // Search within conversation messages
      if (conversation.lastMessage) {
        const message = conversation.lastMessage;
        if (message.content.toLowerCase().includes(searchLower)) {
          results.push({
            id: `message-${message.id}`,
            type: "message",
            title: `Message in ${conversationTitle}`,
            subtitle: message.sender.username,
            messageContent: message.content,
            timestamp: new Date(message.createdAt).toLocaleDateString(),
            conversation,
            message,
          });
        }
      }
    });

    // Search system users
    systemUsers
      .filter((user) => user.id !== currentUser?.id) // Exclude current user
      .forEach((user) => {
        if (
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        ) {
          results.push({
            id: `user-${user.id}`,
            type: "user",
            title: user.username,
            subtitle: user.email,
            user,
          });
        }
      });

    setSearchResults(results);
    setShowResults(results.length > 0);
  }, [searchTerm, conversations, systemUsers, currentUser?.id]);

  // Filter results based on active tab
  const filteredResults = searchResults.filter((result) => {
    if (activeTab === "all") return true;
    if (activeTab === "conversations") return result.type === "conversation";
    if (activeTab === "messages") return result.type === "message";
    if (activeTab === "users") return result.type === "user";
    return true;
  });

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "user" && result.user && onNewChatWithUser) {
      onNewChatWithUser(result.user);
    } else {
      onResultSelect(result);
    }
    setShowResults(false);
    setSearchTerm("");
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "message":
        return <Search className="w-4 h-4 text-green-500" />;
      case "user":
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm && setShowResults(true)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder={placeholder}
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { key: "all", label: "All", count: searchResults.length },
              {
                key: "conversations",
                label: "Chats",
                count: searchResults.filter((r) => r.type === "conversation")
                  .length,
              },
              {
                key: "messages",
                label: "Messages",
                count: searchResults.filter((r) => r.type === "message").length,
              },
              {
                key: "users",
                label: "Users",
                count: searchResults.filter((r) => r.type === "user").length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No results found for "{searchTerm}"</p>
              </div>
            ) : (
              filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </p>
                      )}
                      {result.messageContent && (
                        <p
                          className="text-xs text-gray-600 mt-1 overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: "1.4em",
                            maxHeight: "2.8em",
                          }}
                        >
                          "{result.messageContent}"
                        </p>
                      )}
                      {result.timestamp && (
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {result.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
