const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'claro.db'));

// Users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

// Questions history
db.exec(`
  CREATE TABLE IF NOT EXISTS user_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    status TEXT NOT NULL,
    subject TEXT,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Saved answers
db.exec(`
  CREATE TABLE IF NOT EXISTS saved_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question TEXT,
    answer_data TEXT NOT NULL,
    confidence TEXT NOT NULL,
    source_type TEXT NOT NULL,
    saved_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Indexes for performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_user_questions_user_id ON user_questions(user_id);
  CREATE INDEX IF NOT EXISTS idx_saved_answers_user_id ON saved_answers(user_id);
`);

module.exports = db;