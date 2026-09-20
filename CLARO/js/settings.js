const Settings = {
  init() {
    const theme = Storage.get('claro_theme', 'dark');
    this.applyTheme(theme);

    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const cur = Storage.get('claro_theme', 'dark');
        const next = cur === 'dark' ? 'light' : 'dark';
        Storage.set('claro_theme', next);
        this.applyTheme(next);
      });
    }

    const setDark = document.getElementById('setThemeDark');
    const setLight = document.getElementById('setThemeLight');
    if (setDark) setDark.addEventListener('click', () => { Storage.set('claro_theme','dark'); this.applyTheme('dark'); });
    if (setLight) setLight.addEventListener('click', () => { Storage.set('claro_theme','light'); this.applyTheme('light'); });

    const clearHist = document.getElementById('clearHistoryBtn');
    const clearSaved = document.getElementById('clearSavedBtn');
    if (clearHist) clearHist.addEventListener('click', () => { ActivityStorage.clearHistory(); alert('History cleared.'); window.location.reload(); });
    if (clearSaved) clearSaved.addEventListener('click', () => { ActivityStorage.clearSaved(); alert('Saved answers cleared.'); window.location.reload(); });
  },
  applyTheme(theme) {
    document.body.classList.remove('dark-theme','light-theme');
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.add('dark-theme');
    }
  }
};