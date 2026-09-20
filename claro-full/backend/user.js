const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Auth middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Profile
router.get('/profile', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, username, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json(user);
});

// Add question to history
router.post('/questions', authMiddleware, (req, res) => {
  const { question, status, subject } = req.body;
  if (!question || !status) {
    return res.status(400).json({ error: 'Question and status required.' });
  }

  const timestamp = Date.now();
  try {
    const stmt = db.prepare(`
      INSERT INTO user_questions (user_id, question, status, subject, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(req.user.id, question, status, subject || null, timestamp);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get history
router.get('/questions', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT id, question, status, subject, timestamp
    FROM user_questions
    WHERE user_id = ?
    ORDER BY timestamp DESC
    LIMIT 500
  `).all(req.user.id);

  res.json(rows);
});

// Delete a question
router.delete('/questions/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id FROM user_questions WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) {
    return res.status(404).json({ error: 'Not found.' });
  }
  db.prepare('DELETE FROM user_questions WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.json({ ok: true });
});

// Clear history
router.delete('/questions', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM user_questions WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

// Save answer
router.post('/saved', authMiddleware, (req, res) => {
  const { question, answer_data, confidence, source_type } = req.body;
  if (!answer_data) {
    return res.status(400).json({ error: 'Answer data required.' });
  }

  const saved_at = Date.now();
  try {
    const stmt = db.prepare(`
      INSERT INTO saved_answers (user_id, question, answer_data, confidence, source_type, saved_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(req.user.id, question || null, JSON.stringify(answer_data), confidence, source_type, saved_at);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Get saved answers
router.get('/saved', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT id, question, answer_data, confidence, source_type, saved_at
    FROM saved_answers
    WHERE user_id = ?
    ORDER BY saved_at DESC
    LIMIT 500
  `).all(req.user.id);

  // Parse answer_data JSON
  const result = rows.map(r => ({
    ...r,
    answer_data: JSON.parse(r.answer_data)
  }));

  res.json(result);
});

// Remove saved answer
router.delete('/saved/:id', authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id FROM saved_answers WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!row) {
    return res.status(404).json({ error: 'Not found.' });
  }
  db.prepare('DELETE FROM saved_answers WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.json({ ok: true });
});

// Clear saved answers
router.delete('/saved', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM saved_answers WHERE user_id = ?').run(req.user.id);
  res.json({ ok: true });
});

module.exports = router;