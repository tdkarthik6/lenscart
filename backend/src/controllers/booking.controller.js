const bookingService = require('../services/booking.service');
const { success, created } = require('../utils/response');

// Customer endpoints
const checkAvailability = async (req, res) => {
  const { date, startTime, endTime, serviceId } = req.query;
  const result = await bookingService.checkAvailability({
    eventDate: date,
    startTime,
    endTime,
    serviceId: serviceId ? parseInt(serviceId) : null,
  });
  return success(res, result);
};

const createBooking = async (req, res) => {
  const { serviceId, eventDate, startTime, endTime, location, notes } = req.body;
  const booking = await bookingService.createBooking({
    customerId: req.user.id,
    serviceId: parseInt(serviceId),
    eventDate,
    startTime,
    endTime,
    location,
    notes,
  });
  return created(res, booking, 'Booking created successfully');
};

const getMyBookings = async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user.id);
  return success(res, bookings);
};

const getMyBookingById = async (req, res) => {
  const booking = await bookingService.getMyBookingById(parseInt(req.params.id), req.user.id);
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
  checkAvailability, createBooking, getMyBookings, getMyBookingById,
  getAllBookings, getBookingById, updateBookingStatus, getDashboard, getCalendar,
};
