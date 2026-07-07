const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const { dbFile } = require('./config');

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Unable to connect to SQLite database', err);
    process.exit(1);
  }
});

function createTables() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('employee','manager')),
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        summary TEXT NOT NULL,
        blockers TEXT,
        status TEXT NOT NULL CHECK(status IN ('done','in-progress','blocked')),
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_logs_user_date
      ON logs(user_id, date)
    `);
  });
}

function ensureDefaultManager() {
  const {
    DEFAULT_MANAGER_EMAIL: managerEmail = 'manager@example.com',
    DEFAULT_MANAGER_PASSWORD: managerPassword = 'Manager123!',
    DEFAULT_MANAGER_NAME: managerName = 'Team Manager'
  } = process.env;

  if (!managerEmail || !managerPassword) {
    return;
  }

  db.get('SELECT id FROM users WHERE email = ?', [managerEmail], (err, row) => {
    if (err) {
      console.error('Error checking default manager account', err);
      return;
    }
    if (row) {
      return;
    }

    bcrypt.hash(managerPassword, 10, (hashErr, hashed) => {
      if (hashErr) {
        console.error('Failed to hash default manager password', hashErr);
        return;
      }

      db.run(
        `INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, 'manager', datetime('now'))`,
        [managerName, managerEmail, hashed],
        (insertErr) => {
          if (insertErr) {
            console.error('Failed to create default manager', insertErr);
          } else {
            console.info(`Default manager (${managerEmail}) seeded successfully.`);
          }
        }
      );
    });
  });
}

createTables();
ensureDefaultManager();

module.exports = db;
