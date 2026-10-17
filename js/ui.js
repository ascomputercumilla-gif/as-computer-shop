/**
 * AS Computer - ui.js
 */
const UI = {
  toast: function(message, type = "info") {
    const container = document.getElementById("toast-container") || document.body;
    const toastEl = document.createElement("div");
    toastEl.className = "toast";
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    if (type === "warning") icon = "⚠️";
    
    toastEl.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toastEl);
    
    setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transition = "opacity 0.3s";
      setTimeout(() => toastEl.remove(), 300);
    }, 3500);
  },

  modal: function(title, bodyHtml, onConfirm = null, confirmText = "Confirm") {
    this.closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "app-modal";
    
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="card-header">
          <h3 class="card-title">${title}</h3>
          <button class="btn btn-secondary btn-sm" onclick="UI.closeModal()">✕</button>
        </div>
        <div class="modal-body" style="margin: 1rem 0;">${bodyHtml}</div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem;">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
          ${onConfirm ? `<button class="btn btn-primary" id="modal-confirm-btn">${confirmText}</button>` : ""}
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    if (onConfirm) {
      document.getElementById("modal-confirm-btn").addEventListener("click", () => {
        onConfirm();
      });
    }
  },

  closeModal: function() {
    const modal = document.getElementById("app-modal");
    if (modal) modal.remove();
  },

  updateNetworkStatus: function(isOnline) {
    const badge = document.getElementById("network-badge");
    if (!badge) return;
    if (isOnline) {
      badge.className = "badge badge-online";
      badge.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:var(--status-success);"></span> Online`;
    } else {
      badge.className = "badge badge-offline";
      badge.innerHTML = `<span style="width:6px; height:6px; border-radius:50%; background:var(--status-danger);"></span> Offline`;
    }
  },

  updateSyncBadge: function(pendingCount) {
    const badge = document.getElementById("sync-badge");
    if (!badge) return;
    if (pendingCount > 0) {
      badge.style.display = "inline-flex";
      badge.innerText = `Pending Sync: ${pendingCount}`;
    } else {
      badge.style.display = "none";
    }
  }
};\n