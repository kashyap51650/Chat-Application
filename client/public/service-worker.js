const CACHE_NAME = "chat-app-cache-v2";
const RUNTIME_CACHE = "chat-app-runtime-v2";
const OFFLINE_QUEUE_STORAGE = "offline-message-queue";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  // Add your built assets here
];

// GraphQL endpoint
const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

// Install Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      // Initialize offline message queue
      self.registration.sync?.register("background-sync"),
    ])
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME && name !== RUNTIME_CACHE) {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            }
          })
        )
      ),
      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event with caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle GraphQL requests
  if (url.href === GRAPHQL_ENDPOINT) {
    event.respondWith(handleGraphQLRequest(request));
    return;
  }

  // Handle static assets
  if (
    request.destination === "document" ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === "document") {
              return caches.match("/index.html");
            }
          });
      })
    );
    return;
  }

  // Default: try network first, then cache
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// Handle GraphQL requests with offline support
async function handleGraphQLRequest(request) {
  const networkRequest = request.clone();

  try {
    // Try network first
    const response = await fetch(networkRequest);

    if (response.ok) {
      // Cache successful GraphQL responses for queries
      const networkRequest = request.clone();
      const responseClone = response.clone();

      // Only cache queries, not mutations
      const body = await networkRequest.json();
      if (body.query && !body.query.includes("mutation")) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, responseClone);
      }
    }

    return response;
  } catch (error) {
    console.log("[SW] GraphQL request failed, trying cache:", error);

    // If network fails, try cache for queries
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // For mutations, queue them for later
    const requestClone = request.clone();
    const body = await requestClone.json();

    if (body.query && body.query.includes("mutation")) {
      await queueOfflineAction(body);

      // Return a success response for mutations to avoid UI errors
      return new Response(
        JSON.stringify({
          data: {
            sendMessage: {
              id: `offline-${Date.now()}`,
              content: body.variables?.input?.content || "",
              sender: { id: "current-user" },
              messageType: "text",
              isEdited: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return network error for queries
    return new Response(
      JSON.stringify({
        errors: [
          { message: "Network unavailable. Some data may be outdated." },
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Queue offline actions
async function queueOfflineAction(action) {
  const db = await openDB();
  const transaction = db.transaction(["actions"], "readwrite");
  const store = transaction.objectStore("actions");

  await store.add({
    id: Date.now(),
    action: action,
    timestamp: Date.now(),
    retries: 0,
  });
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync event:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(processOfflineActions());
  }
});

// Process queued offline actions
async function processOfflineActions() {
  try {
    const db = await openDB();
    const transaction = db.transaction(["actions"], "readwrite");
    const store = transaction.objectStore("actions");
    const actions = await store.getAll();

    for (const actionItem of actions) {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(actionItem.action),
        });

        if (response.ok) {
          // Action successful, remove from queue
          await store.delete(actionItem.id);
          console.log("[SW] Offline action synced:", actionItem.action);

          // Notify clients about successful sync
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: "OFFLINE_ACTION_SYNCED",
                action: actionItem.action,
              });
            });
          });
        } else if (actionItem.retries < 3) {
          // Increment retries
          await store.put({
            ...actionItem,
            retries: actionItem.retries + 1,
          });
        } else {
          // Too many retries, remove from queue
          await store.delete(actionItem.id);
          console.log(
            "[SW] Offline action failed after retries:",
            actionItem.action
          );
        }
      } catch (error) {
        console.log("[SW] Error processing offline action:", error);
        if (actionItem.retries < 3) {
          await store.put({
            ...actionItem,
            retries: actionItem.retries + 1,
          });
        } else {
          await store.delete(actionItem.id);
        }
      }
    }
  } catch (error) {
    console.error("[SW] Error in processOfflineActions:", error);
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_QUEUE_STORAGE, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("actions")) {
        const store = db.createObjectStore("actions", { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

// Handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_OFFLINE_STATUS") {
    event.ports[0].postMessage({
      isOnline: navigator.onLine,
    });
  }
});

// Network status change
self.addEventListener("online", () => {
  console.log("[SW] Back online, processing offline queue");
  self.registration.sync?.register("background-sync");
});

self.addEventListener("offline", () => {
  console.log("[SW] Gone offline");
});
