const { pool } = require('../config/database');
const bookingRepository = require('../repositories/booking.repository');
const serviceRepository = require('../repositories/service.repository');
const userRepository   = require('../repositories/user.repository');
const { generateBookingReference } = require('../utils/booking-reference');
const { isFutureOrToday, toTimeString } = require('../utils/datetime');

class BookingService {
  /**
   * Check slot availability without creating a booking.
   */
  async checkAvailability({ eventDate, startTime, endTime, serviceId }) {
    if (serviceId) {
      const service = await serviceRepository.findActiveById(serviceId);
      if (!service) return { available: false, message: 'Service not found or is inactive.' };
    }
    const normalizedStart = toTimeString(startTime);
    const normalizedEnd   = toTimeString(endTime);
    const overlapping = await bookingRepository.findOverlapping(eventDate, normalizedStart, normalizedEnd);
    if (overlapping.length > 0) {
      return {
        available: false,
        message: 'The selected time overlaps with an existing appointment. Please choose a different time.',
      };
    }
    return { available: true };
  }

  /**
   * Guest booking — no login required.
   * Finds or creates a CUSTOMER user by email, then creates the booking.
   */
  async createGuestBooking({
    serviceId, eventDate, startTime, endTime, location, notes,
    customerName, customerEmail, customerPhone,
  }) {
    // Validate required fields
    if (!customerName?.trim()) {
      const err = new Error('Your name is required.'); err.statusCode = 400; throw err;
    }
    if (!customerEmail?.trim()) {
      const err = new Error('Your email is required.'); err.statusCode = 400; throw err;
    }

    if (!isFutureOrToday(eventDate)) {
      const err = new Error('Cannot book for a past date.'); err.statusCode = 400; throw err;
    }

    const normalizedStart = toTimeString(startTime);
    const normalizedEnd   = toTimeString(endTime);

    if (normalizedStart >= normalizedEnd) {
      const err = new Error('Start time must be before end time.'); err.statusCode = 400; throw err;
    }

    const service = await serviceRepository.findActiveById(serviceId);
    if (!service) {
      const err = new Error('The selected service is not available.'); err.statusCode = 404; throw err;
    }

    // Find or create customer by email (no password needed for guests)
    let customer = await userRepository.findByEmail(customerEmail.toLowerCase().trim());
    if (!customer) {
      // Auto-create a guest account — they can set a password later if needed
      const bcrypt = require('bcrypt');
      const tempHash = await bcrypt.hash(Math.random().toString(36), 8);
      customer = await userRepository.create({
        name: customerName.trim(),
        email: customerEmail.toLowerCase().trim(),
        phone: customerPhone?.trim() || null,
        passwordHash: tempHash,
        role: 'CUSTOMER',
      });
    }

    // Atomic booking with advisory lock
    const lockName = `booking_slot_${eventDate}`;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [lockResult] = await connection.execute('SELECT GET_LOCK(?, 10) as locked', [lockName]);
      if (!lockResult[0].locked) {
        await connection.rollback();
        const err = new Error('The booking system is busy. Please try again.'); err.statusCode = 503; throw err;
      }

      const overlapping = await bookingRepository.findOverlapping(eventDate, normalizedStart, normalizedEnd);
      if (overlapping.length > 0) {
        await connection.execute('SELECT RELEASE_LOCK(?)', [lockName]);
        await connection.rollback();
        const err = new Error('The selected time slot is no longer available.');
        err.statusCode = 409; throw err;
      }

      const bookingReference = generateBookingReference();
      const booking = await bookingRepository.create(
        { bookingReference, customerId: customer.id, serviceId, eventDate,
          startTime: normalizedStart, endTime: normalizedEnd, location, notes },
        connection
      );

      await connection.execute('SELECT RELEASE_LOCK(?)', [lockName]);
      await connection.commit();
      return { ...booking, customerName: customer.name, customerEmail: customer.email };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async getBookingByReference(reference) {
    const booking = await bookingRepository.findByReference(reference);
    if (!booking) {
      const err = new Error('Booking not found.'); err.statusCode = 404; throw err;
    }
    return booking;
  }

  async getAllBookings(filters) { return bookingRepository.findAll(filters); }

  async getBookingById(id) {
    const booking = await bookingRepository.findById(id);
    if (!booking) { const err = new Error('Booking not found.'); err.statusCode = 404; throw err; }
    return booking;
  }

  async updateBookingStatus(id, status) {
    const booking = await bookingRepository.findById(id);
    if (!booking) { const err = new Error('Booking not found.'); err.statusCode = 404; throw err; }
    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], CANCELLED: [],
    };
    if (!validTransitions[booking.status]?.includes(status)) {
      const err = new Error(`Cannot change booking status from ${booking.status} to ${status}.`);
      err.statusCode = 400; throw err;
    }
    return bookingRepository.updateStatus(id, status);
  }

  async getDashboardStats()        { return bookingRepository.getDashboardStats(); }
  async getUpcomingBookings(n = 10){ return bookingRepository.getUpcoming(n); }
  async getCalendarBookings(s, e)  { return bookingRepository.findByDateRange(s, e); }
}

module.exports = new BookingService();
