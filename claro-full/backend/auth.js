const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const created_at = Date.now();

  try {
    const stmt = db.prepare(`
      INSERT INTO users (name, username, email, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(name, username, email, hash, created_at);
    res.json({ ok: true, message: 'Account created.' });
  } catch (err) {
    // Unique constraint violation
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE'))) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username/email and password required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(usernameOrEmail, usernameOrEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email
    }
  });
});

module.exports = router;