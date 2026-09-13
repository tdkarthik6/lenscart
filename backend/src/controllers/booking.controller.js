const bookingService = require('../services/booking.service');
const { success, created } = require('../utils/response');

// Public - check slot availability
const checkAvailability = async (req, res) => {
  const { date, startTime, endTime, serviceId } = req.query;
  const result = await bookingService.checkAvailability({
    eventDate: date, startTime, endTime,
    serviceId: serviceId ? parseInt(serviceId) : null,
  });
  return success(res, result);
};

// Public - guest booking (no login required)
const createBooking = async (req, res) => {
  const {
    serviceId, eventDate, startTime, endTime,
    location, notes,
    // Guest customer info
    customerName, customerEmail, customerPhone,
  } = req.body;

  const booking = await bookingService.createGuestBooking({
    serviceId: parseInt(serviceId),
    eventDate, startTime, endTime, location, notes,
    customerName, customerEmail, customerPhone,
  });
  return created(res, booking, 'Booking created successfully');
};

// Public - look up a booking by reference number
const getBookingByReference = async (req, res) => {
  const booking = await bookingService.getBookingByReference(req.params.reference);
  return success(res, booking);
};

// Owner endpoints
const getAllBookings = async (req, res) => {
  const { status, dateFrom, dateTo, page, limit } = req.query;
  const result = await bookingService.getAllBookings({ status, dateFrom, dateTo, page, limit });
  return success(res, result);
};

const getBookingById = async (req, res) => {
  const booking = await bookingService.getBookingById(parseInt(req.params.id));
  return success(res, booking);
};

const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const booking = await bookingService.updateBookingStatus(parseInt(req.params.id), status);
  return success(res, booking, `Booking ${status.toLowerCase()} successfully`);
};

const getDashboard = async (req, res) => {
  const [stats, upcoming] = await Promise.all([
    bookingService.getDashboardStats(),
    bookingService.getUpcomingBookings(10),
  ]);
  return success(res, { stats, upcoming });
};

const getCalendar = async (req, res) => {
  const { startDate, endDate } = req.query;
  const bookings = await bookingService.getCalendarBookings(startDate, endDate);
  return success(res, bookings);
};

module.exports = {
  checkAvailability, createBooking, getBookingByReference,
  getAllBookings, getBookingById, updateBookingStatus, getDashboard, getCalendar,
};
