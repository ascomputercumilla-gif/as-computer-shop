/**
 * AS Computer - service-worker.js
 * Offline-first PWA caching strategy
 */
const CACHE_NAME = "as-computer-v2.0.0";
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/print.css",
  "./js/utils.js",
  "./js/ui.js",
  "./js/db.js",
  "./js/cache.js",
  "./js/state.js",
  "./js/offline.js",
  "./js/sync.js",
  "./js/api.js",
  "./js/auth.js",
  "./js/dashboard.js",
  "./js/sales.js",
  "./js/products.js",
  "./js/customers.js",
  "./js/payments.js",
  "./js/purchases.js",
  "./js/expenses.js",
  "./js/cash-closing.js",
  "./js/reports.js",
  "./js/router.js",
  "./js/app.js"
];

// Install: Cache entire application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell");
      return cache.addAll(SHELL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first for shell assets, network-first for external API
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // If request is to Google Apps Script or external API, let network handle or fail gracefully
  if (url.origin !== location.origin || url.search.includes("script.google.com")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ success: false, offline: true, message: "Network unavailable" }), {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // Shell assets: Cache-First with background revalidation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to update cache for next time
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Ignore background fetch failure when offline */});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
