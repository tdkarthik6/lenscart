/**
 * database.js
 *
 * AUTO-SELECTS the database engine:
 *   • DATABASE_HOST is set  →  MySQL (mysql2) — local dev / cloud MySQL
 *   • DATABASE_HOST not set →  SQLite (better-sqlite3) — zero-config, no signup needed
 *
 * Both expose the same { pool } interface so all repositories work unchanged.
 */

require('dotenv').config();

if (process.env.DATABASE_HOST) {
  /* ═══════════════════════════════════════════════════
     MYSQL MODE
  ═══════════════════════════════════════════════════ */
  const mysql = require('mysql2/promise');

  const pool = mysql.createPool({
    host:     process.env.DATABASE_HOST     || 'localhost',
    port:     parseInt(process.env.DATABASE_PORT) || 3306,
    user:     process.env.DATABASE_USER     || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME     || 'lenscraft_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+05:30',
  });

  async function testConnection() {
    try {
      const conn = await pool.getConnection();
      console.log('✅ MySQL connected');
      conn.release();
    } catch (err) {
      console.error('❌ MySQL connection failed:', err.message);
      process.exit(1);
    }
  }

  module.exports = { pool, testConnection };

} else {
  /* ═══════════════════════════════════════════════════
     SQLITE MODE  (no external DB needed)
  ═══════════════════════════════════════════════════ */
  const BetterSQLite = require('better-sqlite3');
  const path  = require('path');
  const fs    = require('fs');

  const dbDir  = path.join(__dirname, '../../data');
  const dbPath = process.env.SQLITE_PATH || path.join(dbDir, 'lenscraft.db');

  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = new BetterSQLite(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  /* ── helpers ── */
  function normaliseSql(sql) {
    return sql
      .replace(/NOW\(\)/gi, "datetime('now')")
      .replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");
  }

  function isSelect(sql) {
    return /^\s*(SELECT|WITH|PRAGMA)/i.test(sql);
  }

  function isGetLock(sql)     { return /GET_LOCK/i.test(sql); }
  function isReleaseLock(sql) { return /RELEASE_LOCK/i.test(sql); }

  /* ── execute() mimics mysql2 pool.execute() ── */
  function execute(sql, params = []) {
    if (isGetLock(sql))     return [[{ locked: 1 }]];
    if (isReleaseLock(sql)) return [[{ released: 1 }]];

    const clean = normaliseSql(sql);

    try {
      if (isSelect(clean)) {
        const rows = db.prepare(clean).all(params);
        return [rows];
      } else {
        const info = db.prepare(clean).run(params);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
      }
    } catch (err) {
      throw err;
    }
  }

  /* ── pool object (async-compatible wrappers) ── */
  const pool = {
    execute: async (sql, params) => execute(sql, params),

    getConnection: async () => {
      let inTx = false;
      return {
        execute: async (sql, params) => execute(sql, params),
        beginTransaction: async () => { db.prepare('BEGIN EXCLUSIVE').run(); inTx = true; },
        commit:    async () => { if (inTx) { db.prepare('COMMIT').run();   inTx = false; } },
        rollback:  async () => { if (inTx) { db.prepare('ROLLBACK').run(); inTx = false; } },
        release:   () => {},
      };
    },

    query: async (sql, params) => execute(sql, params),
  };

  async function testConnection() {
    try {
      db.prepare('SELECT 1').get();
      console.log(`✅ SQLite connected → ${dbPath}`);
    } catch (err) {
      console.error('❌ SQLite failed:', err.message);
      process.exit(1);
    }
  }

  module.exports = { pool, testConnection, db };
}
