const Search = {
  normalize(text) {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  },
  findMatches(query, dataset) {
    const q = this.normalize(query);
    const tokens = q.split(' ').filter(Boolean);
    const scored = dataset.map(item => {
      const hay = [
        item.question,
        item.topic,
        item.chapter,
        item.book,
        item.subject,
        item.answer?.summary
      ].filter(Boolean).join(' ').toLowerCase();

      let score = 0;
      for (const t of tokens) {
        if (!t) continue;
        if (hay.includes(t)) score += 1;
        if (item.question.toLowerCase().includes(t)) score += 1;
      }
      return { item, score };
    }).filter(x => x.score > 0).sort((a,b)=>b.score-a.score);

    if (scored.length === 0) return { match: null, related: dataset.slice(0, 5) };
    const best = scored[0].item;
    const related = dataset.filter(x => x.id !== best.id).slice(0, 5);
    return { match: best, related };
  }
};