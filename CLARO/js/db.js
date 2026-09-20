const DB_NAME = 'ClaroDB';
const DB_VERSION = 1;

const STORES = {
  HISTORY: 'history',
  SAVED: 'saved',
  KNOWLEDGE: 'knowledge'
};

let dbInstance = null;

const DB = {
  async open() {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // History store
        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          historyStore.createIndex('status', 'status', { unique: false });
        }

        // Saved answers store
        if (!db.objectStoreNames.contains(STORES.SAVED)) {
          const savedStore = db.createObjectStore(STORES.SAVED, { keyPath: 'id' });
          savedStore.createIndex('savedAt', 'savedAt', { unique: false });
        }

        // Knowledge cache store (for questions JSON)
        if (!db.objectStoreNames.contains(STORES.KNOWLEDGE)) {
          const knowStore = db.createObjectStore(STORES.KNOWLEDGE, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(dbInstance);
      };

      request.onerror = () => reject(request.error);
    });
  },

  // Generic helpers
  async getAll(storeName) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, item) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  async delete(storeName, key) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  async clear(storeName) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  // History
  async getHistory() {
    const items = await this.getAll(STORES.HISTORY);
    items.sort((a, b) => b.timestamp - a.timestamp);
    return items;
  },

  async addHistory(item) {
    await this.put(STORES.HISTORY, item);
  },

  async deleteHistory(id) {
    await this.delete(STORES.HISTORY, id);
  },

  async clearHistory() {
    await this.clear(STORES.HISTORY);
  },

  // Saved answers
  async getSaved() {
    const items = await this.getAll(STORES.SAVED);
    items.sort((a, b) => b.savedAt - a.savedAt);
    return items;
  },

  async saveAnswer(item) {
    // Check existence
    const all = await this.getSaved();
    if (all.find(x => x.id === item.id)) return false;
    await this.put(STORES.SAVED, item);
    return true;
  },

  async removeSaved(id) {
    await this.delete(STORES.SAVED, id);
    return true;
  },

  async clearSaved() {
    await this.clear(STORES.SAVED);
  },

  // Knowledge cache
  async cacheKnowledge(key, data) {
    await this.put(STORES.KNOWLEDGE, { key, data, cachedAt: Date.now() });
  },
  async addHistory(item) {
  await this.put(STORES.HISTORY, item);
  const all = await this.getAll(STORES.HISTORY);
  if (all.length > 500) {
    // Sort by timestamp, keep latest 500
    all.sort((a, b) => b.timestamp - a.timestamp);
    const toDelete = all.slice(500);
    const tx = (await this.open()).transaction(STORES.HISTORY, 'readwrite');
    const store = tx.objectStore(STORES.HISTORY);
    for (const old of toDelete) {
      store.delete(old.id);
    }
  }
},

  async getCachedKnowledge(key) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.KNOWLEDGE, 'readonly');
      const store = tx.objectStore(STORES.KNOWLEDGE);
      const req = store.get(key);
      req.onsuccess = () => {
        const res = req.result;
        resolve(res ? res.data : null);
      };
      req.onerror = () => reject(req.error);
    });
  }
};
