/**
 * AS Computer - utils.js
 */
const Utils = {
  formatCurrency: function(num) {
    const val = Number(num) || 0;
    return "৳ " + val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatDate: function(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
    } catch(e) {
      return dateStr;
    }
  },

  getTodayDateIso: function() {
    const now = new Date();
    const offsetMs = 6 * 60 * 60 * 1000; // Asia/Dhaka UTC+6
    const dhakaDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + offsetMs);
    const yyyy = dhakaDate.getFullYear();
    const mm = String(dhakaDate.getMonth() + 1).padStart(2, "0");
    const dd = String(dhakaDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  },

  generateUUID: function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  debounce: function(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
};\n