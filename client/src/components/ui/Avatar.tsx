import React from "react";
import type { User } from "../../types";
import { cn, generateAvatar, getInitials } from "../../lib/utils";

interface AvatarProps {
  user: User;
  size?: "sm" | "md" | "lg" | "xl";
  showOnlineStatus?: boolean;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  user,
  size = "md",
  showOnlineStatus = false,
  className,
}) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const onlineStatusSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.username}
          className={cn("rounded-full object-cover", sizes[size])}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-white font-medium",
            generateAvatar(user.username),
            sizes[size]
          )}
        >
          {getInitials(user.username)}
        </div>
      )}
      {showOnlineStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            user.isOnline ? "bg-green-500" : "bg-secondary-400",
            onlineStatusSizes[size]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
