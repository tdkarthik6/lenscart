/**
 * migrations/run.js
 * Auto-selects MySQL or SQLite based on DATABASE_HOST env var.
 */
require('dotenv').config();

if (process.env.DATABASE_HOST) {
  /* ─── MySQL migration ─── */
  const mysql = require('mysql2/promise');
  const fs    = require('fs');
  const path  = require('path');

  (async () => {
    const conn = await mysql.createConnection({
      host:     process.env.DATABASE_HOST,
      port:     parseInt(process.env.DATABASE_PORT) || 3306,
      user:     process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    });
    try {
      await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DATABASE_NAME || 'lenscraft_db'}\``);
      await conn.execute(`USE \`${process.env.DATABASE_NAME || 'lenscraft_db'}\``);
      const sql = fs.readFileSync(path.join(__dirname, '001_initial_schema.sql'), 'utf8');
      const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const stmt of stmts) await conn.execute(stmt);
      console.log('✅ MySQL migration complete');
    } finally {
      await conn.end();
    }
  })().catch(err => { console.error('Migration error:', err.message); process.exit(1); });

} else {
  /* ─── SQLite migration (no external DB needed) ─── */
  const BetterSQLite = require('better-sqlite3');
  const path = require('path');
  const fs   = require('fs');

  const dbDir  = path.join(__dirname, '../data');
  const dbPath = process.env.SQLITE_PATH || path.join(dbDir, 'lenscraft.db');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = new BetterSQLite(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      phone         TEXT,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'CUSTOMER'
                    CHECK(role IN ('CUSTOMER','OWNER')),
      created_at    DATETIME DEFAULT (datetime('now')),
      updated_at    DATETIME DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

    CREATE TABLE IF NOT EXISTS services (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      name              TEXT    NOT NULL,
      description       TEXT,
      price             REAL    NOT NULL DEFAULT 0,
      duration_minutes  INTEGER NOT NULL DEFAULT 60,
      image_url         TEXT,
      included_features TEXT,
      active            INTEGER NOT NULL DEFAULT 1,
      created_at        DATETIME DEFAULT (datetime('now')),
      updated_at        DATETIME DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

    CREATE TABLE IF NOT EXISTS bookings (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_reference TEXT    NOT NULL UNIQUE,
      customer_id       INTEGER NOT NULL REFERENCES users(id),
      service_id        INTEGER NOT NULL REFERENCES services(id),
      event_date        TEXT    NOT NULL,
      start_time        TEXT    NOT NULL,
      end_time          TEXT    NOT NULL,
      location          TEXT,
      notes             TEXT,
      status            TEXT    NOT NULL DEFAULT 'PENDING'
                        CHECK(status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED')),
      created_at        DATETIME DEFAULT (datetime('now')),
      updated_at        DATETIME DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_date     ON bookings(event_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_status   ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
  `);

  console.log('✅ SQLite migration complete →', dbPath);
  db.close();
}
