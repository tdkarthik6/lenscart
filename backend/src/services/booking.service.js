const { pool } = require('../config/database');
const bookingRepository = require('../repositories/booking.repository');
const serviceRepository = require('../repositories/service.repository');
const { generateBookingReference } = require('../utils/booking-reference');
const { isFutureOrToday, toTimeString } = require('../utils/datetime');

class BookingService {
  /**
   * Check slot availability without creating a booking.
   * Used by the availability check endpoint.
   */
  async checkAvailability({ eventDate, startTime, endTime, serviceId }) {
    // Validate service exists and is active
    if (serviceId) {
      const service = await serviceRepository.findActiveById(serviceId);
      if (!service) {
        return { available: false, message: 'Service not found or is inactive.' };
      }
    }

    const normalizedStart = toTimeString(startTime);
    const normalizedEnd = toTimeString(endTime);

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
   * Create a booking with atomic conflict check using MySQL GET_LOCK.
   * This prevents race conditions from simultaneous booking requests.
   */
  async createBooking({ customerId, serviceId, eventDate, startTime, endTime, location, notes }) {
    // Pre-validation
    if (!isFutureOrToday(eventDate)) {
      const err = new Error('Cannot book for a past date.');
      err.statusCode = 400;
      throw err;
    }

    const normalizedStart = toTimeString(startTime);
    const normalizedEnd = toTimeString(endTime);

    if (normalizedStart >= normalizedEnd) {
      const err = new Error('Start time must be before end time.');
      err.statusCode = 400;
      throw err;
    }

    // Validate service is active
    const service = await serviceRepository.findActiveById(serviceId);
    if (!service) {
      const err = new Error('The selected service is not available.');
      err.statusCode = 404;
      throw err;
    }

    // Use MySQL advisory lock to prevent race conditions
    const lockName = `booking_slot_${eventDate}`;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Acquire advisory lock (timeout: 10 seconds)
      const [lockResult] = await connection.execute(
        'SELECT GET_LOCK(?, 10) as locked',
        [lockName]
      );

      if (!lockResult[0].locked) {
        await connection.rollback();
        const err = new Error('The booking system is busy. Please try again.');
        err.statusCode = 503;
        throw err;
      }

      // Final conflict check inside the lock
      const overlapping = await bookingRepository.findOverlapping(
        eventDate, normalizedStart, normalizedEnd
      );

      if (overlapping.length > 0) {
        await connection.execute('SELECT RELEASE_LOCK(?)', [lockName]);
        await connection.rollback();
        const err = new Error(
          'The selected time slot is no longer available. Another booking was just made for this time.'
        );
        err.statusCode = 409;
        throw err;
      }

      // Generate unique booking reference
      const bookingReference = generateBookingReference();

      // Create the booking
      const booking = await bookingRepository.create(
        { bookingReference, customerId, serviceId, eventDate, startTime: normalizedStart, endTime: normalizedEnd, location, notes },
        connection
      );

      // Release lock and commit
      await connection.execute('SELECT RELEASE_LOCK(?)', [lockName]);
      await connection.commit();

      return booking;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  async getMyBookings(customerId) {
    return bookingRepository.findByCustomerId(customerId);
  }

  async getMyBookingById(id, customerId) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }
    if (booking.customer_id !== customerId) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      throw err;
    }
    return booking;
  }

  async getAllBookings(filters) {
    return bookingRepository.findAll(filters);
  }

  async getBookingById(id) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }
    return booking;
  }

  async updateBookingStatus(id, status) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }

    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      const err = new Error(
        `Cannot change booking status from ${booking.status} to ${status}.`
      );
      err.statusCode = 400;
      throw err;
    }

    return bookingRepository.updateStatus(id, status);
  }

  async getDashboardStats() {
    return bookingRepository.getDashboardStats();
  }

  async getUpcomingBookings(limit = 10) {
    return bookingRepository.getUpcoming(limit);
  }

  async getCalendarBookings(startDate, endDate) {
    return bookingRepository.findByDateRange(startDate, endDate);
  }
}

module.exports = new BookingService();
