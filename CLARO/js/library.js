(async function initLibrary() {
  const subjectsGrid = document.getElementById('subjectsGrid');
  const booksGrid = document.getElementById('booksGrid');
  const chaptersList = document.getElementById('chaptersList');
  const topicsList = document.getElementById('topicsList');

  const viewSubjects = document.getElementById('view-subjects');
  const viewBooks = document.getElementById('view-books');
  const viewChapters = document.getElementById('view-chapters');
  const viewTopics = document.getElementById('view-topics');

  const booksSubjectName = document.getElementById('booksSubjectName');
  const crumbSubject = document.getElementById('crumbSubject');
  const crumbBook = document.getElementById('crumbBook');
  const tCrumbSubject = document.getElementById('tCrumbSubject');
  const tCrumbBook = document.getElementById('tCrumbBook');
  const tCrumbChapter = document.getElementById('tCrumbChapter');

  // Load data
  const [subjectsRes, booksRes, chaptersRes, questionsRes] = await Promise.all([
    fetch('data/subjects.json'),
    fetch('data/books.json'),
    fetch('data/chapters.json'),
    fetch('data/questions.json')
  ]);

  const subjects = await subjectsRes.json();
  const books = await booksRes.json();
  const chapters = await chaptersRes.json();
  const questions = await questionsRes.json();

  // Render subjects
  subjectsGrid.innerHTML = subjects.map(s => `
    <a href="#" class="subject-card" data-id="${s.id}">
      <h3>${s.name}</h3>
      <p>${s.description}</p>
      <div class="level-tags">
        ${s.levels.map(l => `<span class="level-tag">${l}</span>`).join('')}
      </div>
    </a>
  `).join('');

  subjectsGrid.querySelectorAll('.subject-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const subjectId = card.getAttribute('data-id');
      const subject = subjects.find(x => x.id === subjectId);
      showBooks(subject);
    });
  });

  function showBooks(subject) {
    hideAll();
    viewBooks.style.display = '';
    booksSubjectName.textContent = subject.name;
    crumbSubject.textContent = subject.name;
    crumbSubject.href = '#';
    crumbSubject.onclick = (e) => { e.preventDefault(); showSubjects(); };

    const subjectBooks = books.filter(b => b.subjectId === subject.id);
    if (subjectBooks.length === 0) {
      booksGrid.innerHTML = '<div class="empty-state">No books available for this subject yet.</div>';
      return;
    }
    booksGrid.innerHTML = subjectBooks.map(b => `
      <a href="#" class="book-card" data-id="${b.id}">
        <h3>${b.title}</h3>
        <p>${b.description}</p>
      </a>
    `).join('');

    booksGrid.querySelectorAll('.book-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const bookId = card.getAttribute('data-id');
        const book = books.find(x => x.id === bookId);
        showChapters(subject, book);
      });
    });
  }

  function showChapters(subject, book) {
    hideAll();
    viewChapters.style.display = '';
    tCrumbSubject.textContent = subject.name;
    tCrumbBook.textContent = book.title;
    crumbBook.textContent = book.title;

    tCrumbSubject.href = '#';
    tCrumbBook.href = '#';
    crumbSubject.textContent = subject.name;
    crumbBook.textContent = book.title;

    crumbSubject.onclick = (e) => { e.preventDefault(); showSubjects(); };
    crumbBook.onclick = (e) => { e.preventDefault(); showBooks(subject); };

    const bookChapters = chapters.filter(c => c.bookId === book.id);
    if (bookChapters.length === 0) {
      chaptersList.innerHTML = '<div class="empty-state">No chapters available for this book yet.</div>';
      return;
    }
    chaptersList.innerHTML = bookChapters.map(c => `
      <a href="#" class="chapter-card" data-book="${book.id}" data-chapter="${c.id}">
        <h4>${c.title}</h4>
        <p>${c.description}</p>
      </a>
    `).join('');

    chaptersList.querySelectorAll('.chapter-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const chapterId = card.getAttribute('data-chapter');
        const chapter = chapters.find(x => x.id === chapterId);
        showTopics(subject, book, chapter);
      });
    });
  }

  function showTopics(subject, book, chapter) {
    hideAll();
    viewTopics.style.display = '';
    tCrumbSubject.textContent = subject.name;
    tCrumbBook.textContent = book.title;
    tCrumbChapter.textContent = chapter.title;

    tCrumbSubject.href = '#';
    tCrumbBook.href = '#';
    tCrumbChapter.href = '#';

    tCrumbSubject.onclick = (e) => { e.preventDefault(); showSubjects(); };
    tCrumbBook.onclick = (e) => { e.preventDefault(); showBooks(subject); };
    tCrumbChapter.onclick = (e) => { e.preventDefault(); showChapters(subject, book); };

    const qList = questions.filter(q => q.chapterId === chapter.id);
    if (qList.length === 0) {
      topicsList.innerHTML = '<div class="empty-state">No questions available for this chapter yet.</div>';
      return;
    }
    topicsList.innerHTML = qList.map(q => `
      <a href="dashboard.html?view=ask&q=${encodeURIComponent(q.question)}" class="question-card">
        <h4>${q.question}</h4>
        <p>Topic: ${q.topic || 'General'}</p>
      </a>
    `).join('');
  }

  function showSubjects() {
    hideAll();
    viewSubjects.style.display = '';
  }

  function hideAll() {
    [viewSubjects, viewBooks, viewChapters, viewTopics].forEach(v => v.style.display = 'none');
  }

  // Offline status (reuse logic)
  const netDot = document.getElementById('netDot');
  const netText = document.getElementById('netText');
  function updateNet() {
    const online = navigator.onLine;
    if (netDot) {
      netDot.classList.toggle('online', online);
      netDot.classList.toggle('offline', !online);
    }
    if (netText) netText.textContent = online ? 'Online connection available.' : 'CLARO is running using local learning resources.';
  }
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  updateNet();

  // Logout
  document.getElementById('libLogout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('claro_current');
    window.location.href = 'index.html';
  });
})();