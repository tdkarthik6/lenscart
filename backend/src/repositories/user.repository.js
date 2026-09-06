const { pool } = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async create({ name, email, phone, passwordHash, role = 'CUSTOMER' }) {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, passwordHash, role]
    );
    return this.findById(result.insertId);
  }

  async existsByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    return rows.length > 0;
  }
}

module.exports = new UserRepository();
