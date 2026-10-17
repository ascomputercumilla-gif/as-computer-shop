/**
 * AS Computer - sync.js
 * Background synchronization engine with idempotency & conflict resolution
 */
const Sync = {
  isSyncing: false,

  init: function() {
    window.addEventListener("online", () => {
      State.isOnline = true;
      UI.updateNetworkStatus(true);
      UI.toast("Connection restored. Initiating sync...", "info");
      this.syncOutbox();
    });

    window.addEventListener("offline", () => {
      State.isOnline = false;
      UI.updateNetworkStatus(false);
      UI.toast("Operating in Offline Mode", "warning");
    });

    this.updatePendingCount();
  },

  updatePendingCount: async function() {
    const items = await DB.getAll("outbox");
    State.syncQueueCount = items.length;
    UI.updateSyncBadge(items.length);
    return items.length;
  },

  syncOutbox: async function() {
    if (this.isSyncing) return;
    const items = await DB.getAll("outbox");
    if (items.length === 0) return;

    if (!State.isOnline || !API.apiUrl) {
      console.log("Cannot sync: offline or API URL not configured");
      return;
    }

    this.isSyncing = true;
    UI.toast(`Syncing ${items.length} pending operations...`, "info");

    try {
      const response = await fetch(API.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "sync_queue",
          payload: { operations: items },
          user: State.currentUser
        })
      });

      const res = await response.json();
      if (res.success && res.results) {
        for (const itemResult of res.results) {
          if (itemResult.status === "SUCCESS" || itemResult.status === "already_processed") {
            await DB.delete("outbox", itemResult.client_op_id);
          } else if (itemResult.result && itemResult.result.conflict) {
            UI.toast(`Sync conflict: ${itemResult.result.message}`, "error");
          }
        }
        await this.updatePendingCount();
        UI.toast("Cloud synchronization complete!", "success");
      }
    } catch (e) {
      console.error("Sync error:", e);
      UI.toast("Synchronization failed. Will retry automatically.", "error");
    } finally {
      this.isSyncing = false;
    }
  }
};\n