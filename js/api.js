/**
 * AS Computer - api.js
 * Backend communication layer with offline fallback
 */
const API = {
  // Configured Apps Script Web App URL (empty = same origin or google.script.run)
  apiUrl: localStorage.getItem("as_computer_api_url") || "",

  call: async function(action, payload = {}) {
    // 1. If running inside Google Apps Script HTML Service directly
    if (typeof google !== "undefined" && google.script && google.script.run) {
      return new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(res => resolve(res))
          .withFailureHandler(err => reject(err))
          .doPost({ action: action, payload: payload, user: State.currentUser });
      });
    }

    // 2. If running standalone PWA and offline
    if (!navigator.onLine) {
      return Offline.handleAction(action, payload);
    }

    // 3. If running standalone PWA and online
    if (this.apiUrl) {
      try {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: action, payload: payload, user: State.currentUser })
        });
        const json = await response.json();
        return json;
      } catch (err) {
        console.warn("Network call failed, falling back to offline handler:", err);
        return Offline.handleAction(action, payload);
      }
    }

    // 4. Fallback if no remote API URL configured yet (Local Standalone Demo / Offline mode)
    return Offline.handleAction(action, payload);
  },

  bootstrap: async function() {
    // Try to load cached data from IndexedDB immediately
    const cachedProducts = await DB.getAll("products");
    const cachedServices = await DB.getAll("services");
    const cachedCustomers = await DB.getAll("customers");
    
    if (cachedProducts.length > 0) {
      State.products = cachedProducts;
      State.services = cachedServices;
      State.customers = cachedCustomers;
      State.notify("data_loaded", { source: "indexeddb" });
    }

    // Refresh from remote if online
    if (navigator.onLine && (this.apiUrl || (typeof google !== "undefined" && google.script))) {
      try {
        let res = null;
        if (typeof google !== "undefined" && google.script && google.script.run) {
          res = await new Promise((resolve) => {
            google.script.run.withSuccessHandler(resolve).doGet({ parameter: { action: "bootstrap" } });
          });
        } else if (this.apiUrl) {
          const resp = await fetch(`${this.apiUrl}?action=bootstrap`);
          res = await resp.json();
        }
        
        if (res && res.success && res.data) {
          State.products = res.data.products || [];
          State.services = res.data.services || [];
          State.customers = res.data.customers || [];
          State.settings = res.data.settings || {};
          
          // Persist to IndexedDB
          await DB.putMany("products", State.products);
          await DB.putMany("services", State.services);
          await DB.putMany("customers", State.customers);
          State.notify("data_loaded", { source: "cloud" });
        }
      } catch (e) {
        console.warn("Cloud bootstrap error:", e);
      }
    }
  }
};\n