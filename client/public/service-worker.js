const CACHE_NAME = "chat-app-cache-v2";
const RUNTIME_CACHE = "chat-app-runtime-v2";
const OFFLINE_QUEUE_DB = "offline-message-queue";
const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
];

// ---------------- INSTALL ----------------
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ---------------- ACTIVATE ----------------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== RUNTIME_CACHE) {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// ---------------- FETCH ----------------
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle GraphQL requests separately
  if (url.href === GRAPHQL_ENDPOINT) {
    event.respondWith(handleGraphQLRequest(request));
    return;
  }

  // Static asset caching
  if (["document", "script", "style", "image"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (response.ok && request.url.startsWith("http")) {
              const clone = response.clone();
              caches
                .open(RUNTIME_CACHE)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(
            () =>
              request.destination === "document" && caches.match("/index.html")
          );
      })
    );
  }
});

// ---------------- GRAPHQL HANDLER ----------------
async function handleGraphQLRequest(request) {
  const body = await request.clone().json();

  // Queries (cache)
  if (body.query && !body.query.includes("mutation")) {
    try {
      const response = await fetch(request.clone());
      if (response.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        const key = makeCacheKey(body);
        cache.put(key, response.clone());
      }
      return response;
    } catch {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(makeCacheKey(body));
      if (cached) return cached;
      return offlineErrorResponse();
    }
  }

  // Mutations (queue)
  if (body.query && body.query.includes("mutation")) {
    try {
      return await fetch(request.clone());
    } catch {
      console.log("[SW] Offline - queueing mutation...");
      await queueOfflineAction(body);
      return fakeSendMessageResponse(body);
    }
  }

  return fetch(request);
}

// ---------------- HELPERS ----------------
function makeCacheKey(body) {
  return new Request(
    `/graphql-cache?query=${encodeURIComponent(
      body.query
    )}&variables=${encodeURIComponent(JSON.stringify(body.variables || {}))}`,
    { method: "GET" }
  );
}

function offlineErrorResponse() {
  return new Response(
    JSON.stringify({
      errors: [{ message: "Offline: cached data unavailable." }],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function fakeSendMessageResponse(body) {
  const content = body.variables?.input?.content || "";
  return new Response(
    JSON.stringify({
      data: {
        sendMessage: {
          id: `offline-${Date.now()}`,
          content,
          sender: { id: "current-user" },
          messageType: "text",
          isEdited: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function notifyClients(type, action) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((c) => c.postMessage({ type, action }));
  });
}
