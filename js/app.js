/**
 * AS Computer - app.js
 * Main Application Bootstrap & Service Worker Registration
 */
const App = {
  init: async function() {
    const startTime = performance.now();
    console.log("Starting AS Computer PWA...");

    // 1. Initialize IndexedDB
    try {
      await DB.init();
    } catch(e) {
      console.warn("IndexedDB init error:", e);
    }

    // 2. Initialize router & auth
    AuthView.checkSession();
    Sync.init();
    Router.init();

    // 3. Register Service Worker for offline PWA caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log("Service Worker registered successfully:", reg.scope))
        .catch(err => console.warn("Service Worker registration failed:", err));
    }

    // 4. Background Bootstrap Data Fetch
    API.bootstrap();

    const loadTimeMs = (performance.now() - startTime).toFixed(2);
    console.log(`AS Computer Application Shell loaded in ${loadTimeMs} ms`);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});\n