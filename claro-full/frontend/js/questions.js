import { askEngine } from '../wasm/connector.js';

const Questions = {
  async process(questionText) {
    const q = (questionText || '').trim();
    if (!q) throw new Error('Please enter a question.');

    await Knowledge.load();
    const dataset = Knowledge.getAll();

    // 1) Try engine (WASM or JS implementation)
    try {
      const engineResult = await askEngine(q, dataset);
      if (engineResult && engineResult.status === 'success') {
        return engineResult;
      }
      if (engineResult && engineResult.status === 'nomatch') {
        // Use engine’s related suggestions if available (optional)
        const related = dataset.slice(0, 5);
        return {
          status: 'nomatch',
          related
        };
      }
    } catch (e) {
      // If engine throws, fall back to JS search
      // console.warn('Engine failed, using JS search fallback', e);
    }

    // 2) Fallback: simple keyword search (existing logic)
    const result = Search.findMatches(q, dataset);

    if (!result.match) {
      return {
        status: 'nomatch',
        related: result.related || []
      };
    }

    const m = result.match;
    const qNorm = Search.normalize(q);
    const questionNorm = Search.normalize(m.question);
    let confidence = 'Medium';
    if (questionNorm === qNorm || questionNorm.includes(qNorm)) confidence = 'High';
    else if (qNorm.split(' ').length <= 2) confidence = 'Medium';
    else confidence = 'Medium';

    return {
      status: 'success',
      confidence,
      sourceType: m.sourceType || 'Definition',
      answer: m.answer,
      meta: {
        subject: m.subject || m.subjectId || '',
        chapter: m.chapter || '',
        topic: m.topic || ''
      }
    };
  },

  renderAnswer(res, onSave) {
    if (res.status === 'nomatch') {
      const box = document.createElement('div');
      box.className = 'answer-card';
      box.innerHTML = `
        <h3>I couldn't find a strong local match.</h3>
        <p>Try:</p>
        <ul>
          <li>Rephrasing the question</li>
          <li>Using simpler keywords</li>
          <li>Selecting a subject</li>
          <li>Browsing the Knowledge Library</li>
        </ul>
        <p>You may also want to ask:</p>
        <p class="sub" id="askStatus">Searching local knowledge…</p>
        <div class="chips">
          ${(res.related || []).map(r => `<span class="chip" data-q="${r.question.replace(/"/g,'&quot;')}">${r.question}</span>`).join('')}
        </div>
      `;
      box.querySelectorAll('.chip').forEach(c => {
        c.addEventListener('click', () => {
          const ev = new CustomEvent('askQuestion', { detail: c.getAttribute('data-q') });
          window.dispatchEvent(ev);
        });
      });
      return box;
    }
    if (ok) {
  saveBtn.textContent = 'Saved';
  saveBtn.disabled = true;
  saveBtn.classList.add('saved');
  saved = true;
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

    const a = res.answer;
    const card = document.createElement('div');
    card.className = 'answer-card';

    const saveBtnText = 'Save Answer';
    card.innerHTML = `
      <h3>Answer</h3>
      <div class="section"><p>${a.summary || ''}</p></div>

      ${a.keyPoints?.length ? `
      <div class="section">
        <h4>Key Points</h4>
        <ul>${a.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>` : ''}

      ${a.steps?.length ? `
      <div class="section">
        <h4>Step-by-Step</h4>
        <ol>${a.steps.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>` : ''}

      ${a.example ? `
      <div class="section">
        <h4>Example</h4>
        <p>${a.example}</p>
      </div>` : ''}

      <div class="answer-meta">
        <span class="meta-badge">Confidence: ${res.confidence}</span>
        <span class="meta-badge">Source Type: ${res.sourceType}</span>
        ${res.meta?.subject ? `<span class="meta-badge">Subject: ${res.meta.subject}</span>` : ''}
      </div>

      <div class="section">
        <h4>Why Does This Matter?</h4>
        <p>${a.whyItMatters || 'This concept helps build a stronger academic and practical understanding.'}</p>
      </div>

      <button class="btn btn-ghost save-btn">${saveBtnText}</button>
    `;

    let saved = false;
    const saveBtn = card.querySelector('.save-btn');
    saveBtn.addEventListener('click', () => {
      if (saved) return;
      const ok = onSave && onSave({
        id: (a.summary || '').slice(0, 40).replace(/\W/g,'') + Date.now(),
        question: '',
        answer: a,
        confidence: res.confidence,
        sourceType: res.sourceType,
        savedAt: Date.now()
      });
      if (ok) {
        saveBtn.textContent = 'Saved';
        saveBtn.disabled = true;
         saveBtn.classList.add('saved');
        saved = true;
      }
    });
   
    return card;
  }
};
