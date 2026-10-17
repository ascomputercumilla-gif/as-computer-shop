/**
 * AS Computer - state.js
 * Observable application state
 */
const State = {
  currentUser: {
    userId: "USR-ADMIN",
    username: "admin",
    fullName: "Md. Abu Said",
    role: "Admin"
  },
  isOnline: navigator.onLine,
  syncQueueCount: 0,
  activeTab: "dashboard",
  settings: {},
  products: [],
  services: [],
  categories: [],
  customers: [],
  cart: [],
  listeners: [],

  subscribe: function(callback) {
    this.listeners.push(callback);
  },

  notify: function(event, data) {
    this.listeners.forEach(cb => cb(event, data));
  }
};\n