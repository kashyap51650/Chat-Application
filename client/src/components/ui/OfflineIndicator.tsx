import React, { useState, useEffect } from "react";
import { serviceWorkerManager } from "../../lib/serviceWorker";

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueSize, setOfflineQueueSize] = useState(0);

  useEffect(() => {
    // Subscribe to online status changes
    const unsubscribe = serviceWorkerManager.onOnlineStatusChange(setIsOnline);

    // Listen for offline actions being synced
    const handleOfflineActionSynced = () => {
      updateOfflineQueueSize();
    };

    window.addEventListener("offline-action-synced", handleOfflineActionSynced);

    // Update queue size periodically when offline
    const updateOfflineQueueSize = async () => {
      if (!isOnline) {
        const size = await serviceWorkerManager.getOfflineQueueSize();
        setOfflineQueueSize(size);
      }
    };

    const interval = setInterval(updateOfflineQueueSize, 5000);

    return () => {
      unsubscribe();
      window.removeEventListener(
        "offline-action-synced",
        handleOfflineActionSynced
      );
      clearInterval(interval);
    };
  }, [isOnline]);

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center text-sm shadow-lg">
      <div className="flex items-center justify-center space-x-2">
        <svg
          className="w-4 h-4 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75c0-1.104-.183-2.167-.512-3.155.146-.955.512-1.907.512-2.595a6.75 6.75 0 00-9.75-6.75z"
          />
        </svg>
        <span>You're offline</span>
        {offlineQueueSize > 0 && (
          <span className="bg-orange-600 px-2 py-1 rounded-full text-xs">
            {offlineQueueSize} message{offlineQueueSize !== 1 ? "s" : ""}{" "}
            pending
          </span>
        )}
      </div>
      <div className="text-xs mt-1 opacity-90">
        Messages will be sent when connection is restored
      </div>
    </div>
  );
};

export default OfflineIndicator;
