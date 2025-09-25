import { useEffect } from "react";
import { useMutation, useSubscription } from "@apollo/client/react";
import {
  UPDATE_ONLINE_STATUS,
  USER_STATUS_CHANGED_SUBSCRIPTION,
} from "../graphql/operations";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export const useUserStatus = () => {
  const { isAuthenticated } = useAuth();
  const { setOnlineUsers } = useChat();

  const [updateOnlineStatus] = useMutation(UPDATE_ONLINE_STATUS);

  // Subscribe to user status changes
  useSubscription(USER_STATUS_CHANGED_SUBSCRIPTION, {
    skip: !isAuthenticated,
    onData: ({ data }: { data: any }) => {
      if (data?.data?.userStatusChanged) {
        const user = data.data.userStatusChanged;
        setOnlineUsers((prev: Set<string>) => {
          const newSet = new Set(prev);
          if (user.isOnline) {
            newSet.add(user.id);
          } else {
            newSet.delete(user.id);
          }
          return newSet;
        });
      }
    },
  });

  // Set user online when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      updateOnlineStatus({ variables: { isOnline: true } });
    }
  }, [isAuthenticated, updateOnlineStatus]);

  // Set user offline when component unmounts or page is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated) {
        updateOnlineStatus({ variables: { isOnline: false } });
      }
    };

    const handleVisibilityChange = () => {
      if (isAuthenticated) {
        updateOnlineStatus({
          variables: { isOnline: !document.hidden },
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (isAuthenticated) {
        updateOnlineStatus({ variables: { isOnline: false } });
      }
    };
  }, [isAuthenticated, updateOnlineStatus]);
};
