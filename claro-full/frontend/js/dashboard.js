function setLoading(elementId, loading) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (loading) {
    el.innerHTML = '<p class="sub">Loading…</p>';
  }
}
(async function initDashboard() {
  Settings.init();
  await Knowledge.load();

  const url = new URL(window.location.href);
  const guestParam = url.searchParams.get('guest') === 'true';
  const viewParam = url.searchParams.get('view') || 'dashboard';

  const current = AuthStorage.getCurrent();
  const isGuest = guestParam || !current;

  const welcome = document.getElementById('welcomeText');
  const guestBadge = document.getElementById('guestBadge');
  if (welcome) {
    welcome.textContent = isGuest ? 'Welcome, Guest Learner.' : `Welcome back, ${current?.name || current?.username || 'Learner'}.`;
  }
  if (guestBadge) guestBadge.style.display = isGuest ? 'inline-block' : 'none';

  // Offline status
  const netDot = document.getElementById('netDot');
  const netText = document.getElementById('netText');
  const setOfflineStatus = document.getElementById('setOfflineStatus');
  function updateNet() {
    const online = navigator.onLine;
    if (netDot) {
      netDot.classList.toggle('online', online);
      netDot.classList.toggle('offline', !online);
    }
    if (netText) netText.textContent = online ? 'Online connection available.' : 'CLARO is running using local learning resources.';
    if (setOfflineStatus) setOfflineStatus.textContent = 'Offline status: ' + (online ? 'Online available' : 'Offline');
  }
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  updateNet();

  // View routing
  function showView(view) {
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    const target = document.getElementById('view-' + view);
    if (target) target.style.display = '';
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navMap = {
      'dashboard':'Dashboard',
      'ask':'Ask CLARO',
      'recent':'Recent Questions',
      'saved':'Saved Answers',
      'progress':'Progress',
      'offline':'Offline Mode',
      'settings':'Settings'
    };
    const activeText = navMap[view] || 'Dashboard';
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.textContent.trim() === activeText) el.classList.add('active');
    });
    if (view === 'ask') {
  loadSuggestions();
  const input = document.getElementById('askInput');
  if (input) {
    setTimeout(() => input.focus(), 50);
  }
}    
    if (view === 'recent') {
      renderRecent();
    }
    if (view === 'saved') {
      renderSaved();
    }
    if (view === 'progress') {
      renderProgress();
    }
    if (view === 'offline') {
      renderOffline();
    }
    if (view === 'settings') {
      renderSettings();
    }
    if (view === 'dashboard') {
      renderDashboardStats();
    }
  }

  showView(viewParam);

  // Quick ask from dashboard
  const quickInput = document.getElementById('quickQuestion');
  const quickAsk = document.getElementById('quickAsk');
  if (quickAsk) {
    quickAsk.addEventListener('click', () => {
      const q = (quickInput?.value || '').trim();
      if (!q) { alert('Please enter a question.'); return; }
      window.location.href = 'dashboard.html?view=ask&q=' + encodeURIComponent(q);
    });
  }
  const statusEl = document.getElementById('askStatus');
if (statusEl) {
  const steps = [
    'Analyzing your question…',
    'Searching local knowledge…',
    'Preparing explanation…'
  ];
  let i = 0;
  const interval = setInterval(() => {
    if (!statusEl) { clearInterval(interval); return; }
    statusEl.textContent = steps[i % steps.length];
    i++;
  }, 350);
  // Clear interval after answer rendered (you’ll need to keep a reference).
}

  // Ask CLARO page logic
  const askInput = document.getElementById('askInput');
  const charCount = document.getElementById('charCount');
  const clearAsk = document.getElementById('clearAsk');
  const submitAsk = document.getElementById('submitAsk');
  const answerArea = document.getElementById('answerArea');
  const suggestedChips = document.getElementById('suggestedChips');

  function loadSuggestions() {
    if (!suggestedChips) return;
    const sugg = Knowledge.getSuggestions(6);
    suggestedChips.innerHTML = sugg.map(q => `<span class="chip" data-q="${q.replace(/"/g,'&quot;')}">${q}</span>`).join('');
    suggestedChips.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        const val = c.getAttribute('data-q');
        if (askInput) askInput.value = val;
        if (charCount) charCount.textContent = `${val.length} / 500`;
      });
    });
  }

  if (askInput) {
  askInput.addEventListener('input', () => {
    const len = askInput.value.length;
    if (charCount) {
      charCount.textContent = `${len} / 500`;
      charCount.classList.toggle('over', len > 500);
    }
  });
}
  if (clearAsk) clearAsk.addEventListener('click', () => {
    if (askInput) askInput.value = '';
    if (charCount) charCount.textContent = '0 / 500';
    if (answerArea) answerArea.innerHTML = '';
  });
  if (submitAsk) {
  submitAsk.addEventListener('click', async () => {
    const q = (askInput?.value || '').trim();
    if (!q) { alert('Please enter a question.'); return; }
    if (askInput.value.length > 500) {
      alert('Question is too long. Please keep it under 500 characters.');
      return;
    }
  
      try {
        const res = await Questions.process(q);
        if (answerArea) answerArea.innerHTML = '';
        const card = Questions.renderAnswer(res, (item) => {
          item.question = q;
          const ok = ActivityStorage.saveAnswer(item);
          if (!ok) alert('Already saved or unable to save.');
          return ok;
        });
        if (answerArea) answerArea.appendChild(card);

        // Save to history with inferred subject
        const subject = ActivityStorageHelpers.inferSubjectFromQuestion(q, Knowledge.getAll());
        ActivityStorage.addQuestion({
          id: Date.now().toString(),
          question: q,
          status: res.status,
          timestamp: Date.now(),
          subject: subject
        });

        renderDashboardStats();
      } catch (err) {
        if (answerArea) answerArea.innerHTML = `<p class="sub">${err.message || 'Unable to process question.'}</p>`;
      }
    });
  }

  // Prefill question from URL
  const qParam = url.searchParams.get('q');
  if (qParam && askInput && submitAsk) {
    askInput.value = qParam;
    if (charCount) charCount.textContent = `${qParam.length} / 500`;
    setTimeout(() => submitAsk.click(), 250);
  }

  // Listen for suggested chips inside no-match
  window.addEventListener('askQuestion', (e) => {
    if (askInput) askInput.value = e.detail;
    if (charCount) charCount.textContent = `${e.detail.length} / 500`;
    if (submitAsk) submitAsk.click();
  });

  // ---------- Recent Questions (with search + filter) ----------
  const recentSearch = document.getElementById('recentSearch');
  const recentStatusFilter = document.getElementById('recentStatusFilter');

  async function renderRecent() {
  const list = document.getElementById('recentList');
  if (!list) return;

  setLoading('recentList', true);

  const hist = await ActivityStorage.getHistory();
  const query = (recentSearch?.value || '').toLowerCase();
  const status = recentStatusFilter?.value || 'all';

  let filtered = hist;
  if (query) {
    filtered = filtered.filter(h => (h.question || '').toLowerCase().includes(query));
  }
  if (status !== 'all') {
    filtered = filtered.filter(h => h.status === status);
  }

  setLoading('recentList', false);

  if (filtered.length === 0) {
    if (hist.length === 0) {
  list.innerHTML = `
    <p class="sub">You haven't asked any questions yet.</p>
    <p class="sub">Start by asking something in Ask CLARO.</p>
  `;
} else {
  list.innerHTML = '<p class="sub">No matching questions found.</p>';
}
    return;
  }

  list.innerHTML = filtered.map(h => `
    <div class="list-item">
      <div>
        <div style="font-weight:600">${h.question}</div>
        <small class="sub">${new Date(h.timestamp).toLocaleString()} • ${h.status}${h.subject ? ' • ' + h.subject : ''}</small>
      </div>
      <div>
        <button class="btn btn-ghost" data-q="${(h.question || '').replace(/"/g,'&quot;')}">Open</button>
        <button class="btn btn-ghost" data-del="${h.id}">Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('button[data-q]').forEach(b => {
    b.addEventListener('click', () => {
      window.location.href = 'dashboard.html?view=ask&q=' + encodeURIComponent(b.getAttribute('data-q'));
    });
  });

  list.querySelectorAll('button[data-del]').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-del');
      await ActivityStorage.deleteQuestion(id);
      renderRecent();
      renderDashboardStats();
    });
  });
}
  recentSearch?.addEventListener('input', renderRecent);
  recentStatusFilter?.addEventListener('change', renderRecent);

  document.getElementById('clearRecent')?.addEventListener('click', () => {
    if (!confirm('Clear all recent questions?')) return;
    ActivityStorage.clearHistory();
    renderRecent();
    renderDashboardStats();
  });

  // ---------- Saved Answers (with search + subject filter) ----------
  const savedSearch = document.getElementById('savedSearch');
  const savedSubjectFilter = document.getElementById('savedSubjectFilter');

   async function renderProgress() {
  const hist = await ActivityStorage.getHistory();
  const saved = await ActivityStorage.getSaved();

  const asked = hist.length;
  const solved = hist.filter(h => h.status === 'success').length;
  const topics = new Set(hist.map(h => (h.question || '').split(' ').slice(0, 3).join(' '))).size;

  document.getElementById('progAsked').textContent = asked;
  document.getElementById('progSolved').textContent = solved;
  document.getElementById('progSaved').textContent = saved.length;
  document.getElementById('progTopics').textContent = topics;

  // Subject distribution
  const subjectCount = {};
  hist.forEach(h => {
    const subj = h.subject || ActivityStorageHelpers.inferSubjectFromQuestion(h.question || '', Knowledge.getAll());
    subjectCount[subj] = (subjectCount[subj] || 0) + 1;
  });

  const subjectDist = document.getElementById('subjectDist');
  if (subjectDist) {
    if (asked === 0) {
  subjectDist.innerHTML = `
    <p class="sub">No activity recorded yet.</p>
    <p class="sub">Ask a few questions to see your progress here.</p>
  `;
  recentActivity.innerHTML = `
    <p class="sub">No recent activity yet.</p>
  `;
} else {
      const maxCount = Math.max(...Object.values(subjectCount), 1);
      subjectDist.innerHTML = Object.entries(subjectCount)
        .sort((a,b) => b[1] - a[1])
        .map(([subj, count]) => {
          const pct = Math.round((count / asked) * 100);
          const barWidth = Math.max(10, Math.round((count / maxCount) * 100));
          return `
            <div style="display:grid; grid-template-columns:120px 1fr 40px; gap:8px; align-items:center;">
              <div style="font-size:12px; color:var(--muted);">${subj}</div>
              <div style="height:10px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid var(--border); overflow:hidden;">
                <div style="width:${barWidth}%; height:100%; background:linear-gradient(90deg, var(--primary), var(--primary-2));"></div>
              </div>
              <div style="font-size:12px; color:var(--muted); text-align:right;">${pct}%</div>
            </div>
          `;
        }).join('');
    }
  }

  // Recent activity list
  const recentActivity = document.getElementById('recentActivity');
  if (recentActivity) {
    const recent = hist.slice(0, 8);
    if (recent.length === 0) {
      recentActivity.innerHTML = '<p class="sub">No recent activity yet.</p>';
    } else {
      recentActivity.innerHTML = recent.map(h => {
        const subj = h.subject || ActivityStorageHelpers.inferSubjectFromQuestion(h.question || '', Knowledge.getAll());
        return `
          <div class="list-item" style="padding:8px 10px;">
            <div style="font-size:13px;">
              <div style="font-weight:600; margin-bottom:2px;">${h.question}</div>
              <div style="color:var(--muted); font-size:11px;">
                ${new Date(h.timestamp).toLocaleString()} • ${h.status} • ${subj}
              </div>
            </div>
            <button class="btn btn-ghost" style="font-size:11px; padding:4px 8px;"
                    data-q="${(h.question || '').replace(/"/g,'&quot;')}">Open</button>
          </div>
        `;
      }).join('');
      recentActivity.querySelectorAll('button[data-q]').forEach(b => {
        b.addEventListener('click', () => {
          window.location.href = 'dashboard.html?view=ask&q=' + encodeURIComponent(b.getAttribute('data-q'));
        });
      });
    }
  }
}
  savedSearch?.addEventListener('input', renderSaved);
  savedSubjectFilter?.addEventListener('change', renderSaved);

  // ---------- Progress Page ----------
  function renderProgress() {
    const hist = ActivityStorage.getHistory();
    const saved = ActivityStorage.getSaved();

    const asked = hist.length;
    const solved = hist.filter(h => h.status === 'success').length;
    const topics = new Set(hist.map(h => (h.question || '').split(' ').slice(0, 3).join(' '))).size;

    document.getElementById('progAsked').textContent = asked;
    document.getElementById('progSolved').textContent = solved;
    document.getElementById('progSaved').textContent = saved.length;
    document.getElementById('progTopics').textContent = topics;

    // Subject distribution
    const subjectCount = {};
    hist.forEach(h => {
      const subj = h.subject || ActivityStorageHelpers.inferSubjectFromQuestion(h.question || '', Knowledge.getAll());
      subjectCount[subj] = (subjectCount[subj] || 0) + 1;
    });

    const subjectDist = document.getElementById('subjectDist');
    if (subjectDist) {
      if (asked === 0) {
        subjectDist.innerHTML = '<p class="sub">Ask questions to see your subject distribution.</p>';
      } else {
        const maxCount = Math.max(...Object.values(subjectCount), 1);
        subjectDist.innerHTML = Object.entries(subjectCount)
          .sort((a,b) => b[1] - a[1])
          .map(([subj, count]) => {
            const pct = Math.round((count / asked) * 100);
            const barWidth = Math.max(10, Math.round((count / maxCount) * 100));
            return `
              <div style="display:grid; grid-template-columns:120px 1fr 40px; gap:8px; align-items:center;">
                <div style="font-size:12px; color:var(--muted);">${subj}</div>
                <div style="height:10px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid var(--border); overflow:hidden;">
                  <div style="width:${barWidth}%; height:100%; background:linear-gradient(90deg, var(--primary), var(--primary-2));"></div>
                </div>
                <div style="font-size:12px; color:var(--muted); text-align:right;">${pct}%</div>
              </div>
            `;
          }).join('');
      }
    }

    // Recent activity list
    const recentActivity = document.getElementById('recentActivity');
    if (recentActivity) {
      const recent = hist.slice(0, 8);
      if (recent.length === 0) {
        recentActivity.innerHTML = '<p class="sub">No recent activity yet.</p>';
      } else {
        recentActivity.innerHTML = recent.map(h => {
          const subj = h.subject || ActivityStorageHelpers.inferSubjectFromQuestion(h.question || '', Knowledge.getAll());
          return `
            <div class="list-item" style="padding:8px 10px;">
              <div style="font-size:13px;">
                <div style="font-weight:600; margin-bottom:2px;">${h.question}</div>
                <div style="color:var(--muted); font-size:11px;">
                  ${new Date(h.timestamp).toLocaleString()} • ${h.status} • ${subj}
                </div>
              </div>
              <button class="btn btn-ghost" style="font-size:11px; padding:4px 8px;"
                      data-q="${(h.question || '').replace(/"/g,'&quot;')}">Open</button>
            </div>
          `;
        }).join('');
        recentActivity.querySelectorAll('button[data-q]').forEach(b => {
          b.addEventListener('click', () => {
            window.location.href = 'dashboard.html?view=ask&q=' + encodeURIComponent(b.getAttribute('data-q'));
          });
        });
      }
    }
  }
  function setLoading(elementId, loading) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (loading) {
    el.innerHTML = '<p class="sub">Loading your data…</p>';
  }
}

  // ---------- Offline Page ----------
  function renderOffline() {
    const detail = document.getElementById('offlineDetail');
    if (!detail) return;
    detail.textContent = navigator.onLine
      ? 'Online connection available. Core learning still uses local resources.'
      : 'CLARO is running using local learning resources.';
  }

  // ---------- Settings Page ----------
  function renderSettings() {
    const acc = document.getElementById('setAccount');
    if (acc) {
      const cur = AuthStorage.getCurrent();
      acc.textContent = cur ? `${cur.name || cur.username} • ${cur.email}` : 'Guest / Not logged in';
    }
  }

  // ---------- Dashboard Stats ----------
  async function renderDashboardStats() {
  const hist = await ActivityStorage.getHistory();
  const saved = await ActivityStorage.getSaved();
  const asked = hist.length;
  const solved = hist.filter(h => h.status === 'success').length;
  const topics = new Set(hist.map(h => (h.question || '').split(' ').slice(0, 3).join(' '))).size;

  const elAsked = document.getElementById('statAsked');
  const elSolved = document.getElementById('statSolved');
  const elSaved = document.getElementById('statSaved');
  const elTopics = document.getElementById('statTopics');
  if (elAsked) elAsked.textContent = asked;
  if (elSolved) elSolved.textContent = solved;
  if (elSaved) elSaved.textContent = saved.length;
  if (elTopics) elTopics.textContent = topics;
}
  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    AuthStorage.logout();
    window.location.href = 'index.html';
  });

  document.getElementById('clearRecent')?.addEventListener('click', async () => {
  if (!confirm('Clear all recent questions?')) return;
  await ActivityStorage.clearHistory();
  renderRecent();
  renderDashboardStats();
});
})();
await ActivityStorage.addQuestion({
  id: Date.now().toString(),
  question: q,
  status: res.status,
  timestamp: Date.now(),
  subject: subject
});
const shownOnboarding = Storage.get('claro_onboard', false);
if (!shownOnboarding && viewParam === 'dashboard') {
  const hero = document.querySelector('.hero-ask');
  if (hero) {
    const hint = document.createElement('p');
    hint.className = 'sub';
    hint.textContent = 'Tip: Try “What is normalization?” or “Explain Newton’s second law.”';
    hint.style.marginTop = '8px';
    hero.appendChild(hint);
  }
  Storage.set('claro_onboard', true);
}
if (saved.length === 0) {
  list.innerHTML = `
    <p class="sub">No saved answers yet.</p>
    <p class="sub">Save useful explanations to revise them quickly.</p>
  `;
} else {
  list.innerHTML = '<p class="sub">No matching saved answers found.</p>';
}