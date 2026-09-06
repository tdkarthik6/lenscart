const { pool } = require('../config/database');

class ServiceRepository {
  async findAll(activeOnly = true) {
    const whereClause = activeOnly ? 'WHERE active = 1' : '';
    const [rows] = await pool.execute(
      `SELECT * FROM services ${whereClause} ORDER BY created_at DESC`
    );
    return rows.map(this._parseFeatures);
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM services WHERE id = ?',
      [id]
    );
    return rows[0] ? this._parseFeatures(rows[0]) : null;
  }

  async findActiveById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM services WHERE id = ? AND active = 1',
      [id]
    );
    return rows[0] ? this._parseFeatures(rows[0]) : null;
  }

  async create({ name, description, price, durationMinutes, imageUrl, includedFeatures, active = true }) {
    const featuresJson = JSON.stringify(includedFeatures || []);
    const [result] = await pool.execute(
      `INSERT INTO services (name, description, price, duration_minutes, image_url, included_features, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, durationMinutes, imageUrl || null, featuresJson, active ? 1 : 0]
    );
    return this.findById(result.insertId);
  }

  async update(id, { name, description, price, durationMinutes, imageUrl, includedFeatures, active }) {
    const featuresJson = JSON.stringify(includedFeatures || []);
    await pool.execute(
      `UPDATE services SET name=?, description=?, price=?, duration_minutes=?, 
       image_url=?, included_features=?, active=?, updated_at=NOW() WHERE id=?`,
      [name, description, price, durationMinutes, imageUrl || null, featuresJson, active ? 1 : 0, id]
    );
    return this.findById(id);
  }

  async updateStatus(id, active) {
    await pool.execute(
      'UPDATE services SET active=?, updated_at=NOW() WHERE id=?',
      [active ? 1 : 0, id]
    );
    return this.findById(id);
  }

  async delete(id) {
    // Check if service has bookings
    const [bookings] = await pool.execute(
      'SELECT id FROM bookings WHERE service_id = ? LIMIT 1',
      [id]
    );
    if (bookings.length > 0) {
      // Soft delete - deactivate instead
      await pool.execute('UPDATE services SET active=0, updated_at=NOW() WHERE id=?', [id]);
      return { softDeleted: true };
    }
    await pool.execute('DELETE FROM services WHERE id=?', [id]);
    return { softDeleted: false };
  }

  _parseFeatures(service) {
    try {
      service.included_features = typeof service.included_features === 'string'
        ? JSON.parse(service.included_features)
        : (service.included_features || []);
    } catch {
      service.included_features = [];
    }
    return service;
  }
}

module.exports = new ServiceRepository();
