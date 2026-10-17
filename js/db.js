/**
 * AS Computer - db.js
 * IndexedDB offline-first database
 */
const DB = {
  dbName: "as_computer_offline_db",
  version: 2,
  instance: null,

  init: function() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        const stores = [
          { name: "products", key: "product_id" },
          { name: "services", key: "service_id" },
          { name: "categories", key: "category_id" },
          { name: "customers", key: "customer_id" },
          { name: "settings", key: "key" },
          { name: "sales_history", key: "invoice_no" },
          { name: "outbox", key: "client_op_id" },
          { name: "cash_closings", key: "closing_date" },
          { name: "metadata", key: "key" }
        ];
        
        stores.forEach(s => {
          if (!db.objectStoreNames.contains(s.name)) {
            db.createObjectStore(s.name, { keyPath: s.key });
          }
        });
      };
      
      request.onsuccess = (e) => {
        this.instance = e.target.result;
        resolve(this.instance);
      };
      
      request.onerror = (e) => {
        console.error("IndexedDB error:", e.target.error);
        reject(e.target.error);
      };
    });
  },

  getAll: function(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.instance) return resolve([]);
      const tx = this.instance.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  get: function(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.instance) return resolve(null);
      const tx = this.instance.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  put: function(storeName, record) {
    return new Promise((resolve, reject) => {
      if (!this.instance) return resolve(null);
      const tx = this.instance.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  },

  putMany: function(storeName, records) {
    return new Promise((resolve, reject) => {
      if (!this.instance || !records || records.length === 0) return resolve([]);
      const tx = this.instance.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      records.forEach(r => store.put(r));
      tx.oncomplete = () => resolve(records);
      tx.onerror = () => reject(tx.error);
    });
  },

  delete: function(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.instance) return resolve(false);
      const tx = this.instance.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  clear: function(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.instance) return resolve(false);
      const tx = this.instance.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }
};\n