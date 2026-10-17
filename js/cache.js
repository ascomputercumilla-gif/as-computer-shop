/**
 * AS Computer - cache.js
 * In-memory fast cache for instantaneous UI response (<50ms)
 */
const Cache = {
  memoryStore: {},

  set: function(key, data, ttlSeconds = 300) {
    this.memoryStore[key] = {
      data: data,
      expiresAt: Date.now() + (ttlSeconds * 1000)
    };
  },

  get: function(key) {
    const item = this.memoryStore[key];
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      delete this.memoryStore[key];
      return null;
    }
    return item.data;
  },

  clear: function() {
    this.memoryStore = {};
  }
};\n