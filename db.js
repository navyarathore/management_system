const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'students.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    roll_no TEXT NOT NULL UNIQUE,
    course TEXT NOT NULL,
    grade TEXT,
    email TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
