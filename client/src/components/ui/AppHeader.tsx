import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  MessageCircle,
  Plus,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";

interface AppHeaderProps {
  onNewChatClick: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onNewChatClick }) => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNewChatClick = () => {
    setShowUserDropdown(false);
    onNewChatClick();
  };

  const handleProfileClick = () => {
    setShowUserDropdown(false);
    // Add profile functionality here
    console.log("Profile clicked");
  };

  const handleSettingsClick = () => {
    setShowUserDropdown(false);
    // Add settings functionality here
    console.log("Settings clicked");
  };

  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    logout();
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - App title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Ping Me</h1>
          </div>

          {/* Right side - User Avatar Dropdown */}
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={user?.username}
              >
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {/* New Chat Option */}
                    <button
                      onClick={handleNewChatClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-3 text-gray-400" />
                      New Chat
                    </button>

                    <hr className="my-1 border-gray-100" />

                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Profile
                    </button>

                    <button
                      onClick={handleSettingsClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </button>

                    <hr className="my-1 border-gray-100" />

                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
