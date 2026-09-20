const Storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); return true; } catch { return false; }
  }
};

const AuthStorage = {
  getUsers() { return Storage.get('claro_users', []) || []; },
  addUser(user) {
    const users = this.getUsers();
    if (users.find(u => u.username === user.username || u.email === user.email)) return false;
    users.push(user);
    Storage.set('claro_users', users);
    return true;
  },
  validate(usernameOrEmail, password) {
    const users = this.getUsers();
    const u = users.find(x => (x.username === usernameOrEmail || x.email === usernameOrEmail) && x.password === password);
    return u || null;
  },
  setCurrent(user) { Storage.set('claro_current', user); },
  getCurrent() { return Storage.get('claro_current', null); },
  logout() { Storage.remove('claro_current'); }
};

// New ActivityStorage using IndexedDB (db.js must be loaded before this)
const ActivityStorage = {
  async getHistory() {
    return await DB.getHistory();
  },

  async addQuestion(item) {
    await DB.addHistory(item);
  },

  async deleteQuestion(id) {
    await DB.deleteHistory(id);
  },

  async clearHistory() {
    await DB.clearHistory();
  },

  async getSaved() {
    return await DB.getSaved();
  },

  async saveAnswer(item) {
    return await DB.saveAnswer(item);
  },

  async removeSaved(id) {
    return await DB.removeSaved(id);
  },

  async clearSaved() {
    await DB.clearSaved();
  }
};

const ActivityStorageHelpers = {
  inferSubjectFromQuestion(question, knowledge) {
    const q = (question || '').toLowerCase();
    if (/(dbms|database|normaliz|sql|table|relation)/.test(q)) return 'DBMS';
    if (/(operating system|os|process|memory|scheduling|deadlock)/.test(q)) return 'Operating Systems';
    if (/(network|ip|tcp|udp|router|packet|internet)/.test(q)) return 'Computer Networks';
    if (/(newton|force|mass|acceleration|motion|energy|work)/.test(q)) return 'Physics';
    if (/(ohm|voltage|current|resistance|circuit|electric)/.test(q)) return 'Physics';
    if (/(function|loop|array|string|pointer|recursion|algorithm)/.test(q)) return 'Programming';
    if (/(matrix|determinant|integral|derivative|probability|statistics)/.test(q)) return 'Mathematics';
    return 'General';
  }
};