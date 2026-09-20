// wasm/engine.js
// Temporary JS implementation of the reasoning engine.
// Later, this will be replaced by a C → WebAssembly module.

export function reason(question, knowledgeBase) {
  const q = (question || '').toLowerCase();

  // Example: very small rule-based reasoning for demo subjects.
  // This is intentionally simple and transparent.

  // 1) DBMS normalization concept
  if (/(what is|define|explain)\s+normaliz/.test(q)) {
    const entry = knowledgeBase.find(k =>
      /normaliz/i.test(k.question) && /dbms|database/i.test(k.subject || '')
    );
    if (entry) {
      return {
        status: 'success',
        confidence: 'high',
        sourceType: entry.sourceType || 'Definition',
        answer: entry.answer,
        meta: {
          subject: entry.subject || 'DBMS',
          chapter: entry.chapter || 'Normalization',
          topic: entry.topic || 'Introduction'
        }
      };
    }
  }

  // 2) Newton's second law
  if (/(newton.*second|f\s*=\s*m\s*[\*x]\s*a|force.*mass.*acceleration)/.test(q)) {
    const entry = knowledgeBase.find(k =>
      /newton.*second|F = m|force.*mass/i.test(k.question)
    );
    if (entry) {
      return {
        status: 'success',
        confidence: 'medium',
        sourceType: entry.sourceType || 'Concept',
        answer: entry.answer,
        meta: {
          subject: entry.subject || 'Physics',
          chapter: entry.chapter || 'Laws of Motion',
          topic: entry.topic || "Newton's Second Law"
        }
      };
    }
  }

  // 3) Ohm's law
  if (/(ohm.*law|v\s*=\s*i\s*[\*x]\s*r|voltage.*current.*resistance)/.test(q)) {
    const entry = knowledgeBase.find(k =>
      /ohm/i.test(k.question)
    );
    if (entry) {
      return {
        status: 'success',
        confidence: 'medium',
        sourceType: entry.sourceType || 'Formula',
        answer: entry.answer,
        meta: {
          subject: entry.subject || 'Physics',
          chapter: entry.chapter || 'Current Electricity',
          topic: entry.topic || "Ohm's Law"
        }
      };
    }
  }

  // 4) Operating system basic
  if (/(what is|define|explain)\s+(an\s+)?operating\s+system/i.test(q)) {
    const entry = knowledgeBase.find(k =>
      /operating system|OS/i.test(k.question)
    );
    if (entry) {
      return {
        status: 'success',
        confidence: 'medium',
        sourceType: entry.sourceType || 'Definition',
        answer: entry.answer,
        meta: {
          subject: entry.subject || 'Operating Systems',
          chapter: entry.chapter || 'Introduction',
          topic: entry.topic || 'OS Basics'
        }
      };
    }
  }

  // If nothing matches strongly, return nomatch
  return {
    status: 'nomatch',
    confidence: 'low',
    sourceType: 'Estimate',
    answer: null,
    meta: null
  };
}