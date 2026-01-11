const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      code TEXT,
      credits INTEGER DEFAULT 0,
      capacity INTEGER DEFAULT 0,
      enrolled INTEGER DEFAULT 0
    )
  `);
});

module.exports = db;
