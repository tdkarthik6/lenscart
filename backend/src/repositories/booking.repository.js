const { pool } = require('../config/database');

class BookingRepository {
  /**
   * Check for overlapping bookings using half-open interval logic [start, end)
   * Only considers PENDING and CONFIRMED bookings
   * Excludes a specific booking ID (for updates)
   */
  async findOverlapping(eventDate, startTime, endTime, excludeId = null) {
    let query = `
      SELECT id, booking_reference, start_time, end_time, status
      FROM bookings
      WHERE event_date = ?
        AND status IN ('PENDING', 'CONFIRMED')
        AND start_time < ?
        AND end_time > ?
    `;
    const params = [eventDate, endTime, startTime];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT b.*, 
         u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
         s.name as service_name, s.price as service_price, s.image_url as service_image
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN services s ON b.service_id = s.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async findByReference(reference) {
    const [rows] = await pool.execute(
      `SELECT b.*, 
         u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
         s.name as service_name, s.price as service_price, s.image_url as service_image
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN services s ON b.service_id = s.id
       WHERE b.booking_reference = ?`,
      [reference]
    );
    return rows[0] || null;
  }

  async findByCustomerId(customerId) {
    const [rows] = await pool.execute(
      `SELECT b.*, s.name as service_name, s.price as service_price, s.image_url as service_image
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.customer_id = ?
       ORDER BY b.event_date DESC, b.start_time DESC`,
      [customerId]
    );
    return rows;
  }

  async findAll({ status, dateFrom, dateTo, page = 1, limit = 20 } = {}) {
    let where = 'WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      where += ' AND b.status = ?';
      params.push(status);
    }
    if (dateFrom) {
      where += ' AND b.event_date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      where += ' AND b.event_date <= ?';
      params.push(dateTo);
    }

    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT b.*, 
         u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
         s.name as service_name, s.price as service_price
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN services s ON b.service_id = s.id
       ${where}
       ORDER BY b.event_date DESC, b.start_time DESC
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      params
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM bookings b ${where}`,
      params
    );

    return {
      bookings: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countRows[0].total / limit),
    };
  }

  async findByDate(eventDate) {
    const [rows] = await pool.execute(
      `SELECT b.*, 
         u.name as customer_name,
         s.name as service_name
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN services s ON b.service_id = s.id
       WHERE b.event_date = ?
       ORDER BY b.start_time ASC`,
      [eventDate]
    );
    return rows;
  }

  async findByDateRange(startDate, endDate) {
    const [rows] = await pool.execute(
      `SELECT b.*, 
         u.name as customer_name,
         s.name as service_name
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN services s ON b.service_id = s.id
       WHERE b.event_date BETWEEN ? AND ?
         AND b.status IN ('PENDING', 'CONFIRMED')
       ORDER BY b.event_date ASC, b.start_time ASC`,
      [startDate, endDate]
    );
    return rows;
  }

  async create({ bookingReference, customerId, serviceId, eventDate, startTime, endTime, location, notes }, connection = null) {
    const executor = connection || pool;
    const [result] = await executor.execute(
      `INSERT INTO bookings 
       (booking_reference, customer_id, service_id, event_date, start_time, end_time, location, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [bookingReference, customerId, serviceId, eventDate, startTime, endTime, location || null, notes || null]
    );
    return this.findById(result.insertId);
  }

  async updateStatus(id, status, connection = null) {
    const executor = connection || pool;
    await executor.execute(
      'UPDATE bookings SET status=?, updated_at=NOW() WHERE id=?',
      [status, id]
    );
    return this.findById(id);
  }

  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status IN ('PENDING','CONFIRMED') AND event_date >= ? THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
      FROM bookings
    `, [today]);
    return rows[0];
  }

  async getUpcoming(limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      `SELECT b.*, u.name as customer_name, s.name as service_name
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN services s ON b.service_id = s.id
       WHERE b.event_date >= ? AND b.status IN ('PENDING','CONFIRMED')
       ORDER BY b.event_date ASC, b.start_time ASC
       LIMIT ?`,
      [today, limit]
    );
    return rows;
  }
}

module.exports = new BookingRepository();
