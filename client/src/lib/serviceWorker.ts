// Service Worker Registration and Management
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private onlineStatusCallbacks: Array<(isOnline: boolean) => void> = [];
  private isOnline = navigator.onLine;

  private constructor() {
    this.setupOnlineStatusListeners();
    this.setupServiceWorkerMessages();
  }

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  public async register(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register(
          "/service-worker.js"
        );

        // Handle updates
        this.registration.addEventListener("updatefound", () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available
                this.notifyUpdate();
              }
            });
          }
        });

        // Handle controlling service worker
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("Service Worker controller changed, reloading page");
          window.location.reload();
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  }

  public async unregister(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
    }
  }

  public async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  public async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  private setupOnlineStatusListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.notifyOnlineStatusChange(true);
      console.log("App is back online");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.notifyOnlineStatusChange(false);
      console.log("App is offline");
    });
  }

  private setupServiceWorkerMessages(): void {
    navigator.serviceWorker?.addEventListener("message", (event) => {
      const { type, action } = event.data;

      switch (type) {
        case "OFFLINE_ACTION_SYNCED":
          console.log("Offline action synced:", action);
          // You can dispatch events or update UI here
          this.notifyOfflineActionSynced(action);
          break;
        default:
          console.log("Unknown service worker message:", event.data);
      }
    });
  }

  private notifyUpdate(): void {
    // You can show a toast or notification here
    console.log("New version available");

    // Optional: Auto-update
    // this.skipWaiting();

    // Or show user prompt
    if (confirm("A new version is available. Reload to update?")) {
      this.skipWaiting();
    }
  }

  private notifyOnlineStatusChange(isOnline: boolean): void {
    this.onlineStatusCallbacks.forEach((callback) => callback(isOnline));
  }

  private notifyOfflineActionSynced(action: any): void {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(
      new CustomEvent("offline-action-synced", {
        detail: { action },
      })
    );
  }

  public onOnlineStatusChange(
    callback: (isOnline: boolean) => void
  ): () => void {
    this.onlineStatusCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.onlineStatusCallbacks.indexOf(callback);
      if (index > -1) {
        this.onlineStatusCallbacks.splice(index, 1);
      }
    };
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public async getOfflineQueueSize(): Promise<number> {
    try {
      const channel = new MessageChannel();

      return new Promise((resolve) => {
        channel.port1.onmessage = (event) => {
          resolve(event.data.queueSize || 0);
        };

        navigator.serviceWorker.controller?.postMessage(
          { type: "GET_OFFLINE_QUEUE_SIZE" },
          [channel.port2]
        );
      });
    } catch (error) {
      console.error("Error getting offline queue size:", error);
      return 0;
    }
  }
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();
