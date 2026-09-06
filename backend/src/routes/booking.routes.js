const express = require('express');
const router = express.Router();
const {
  checkAvailability, createBooking, getMyBookings, getMyBookingById,
  getAllBookings, getBookingById, updateBookingStatus, getDashboard, getCalendar,
} = require('../controllers/booking.controller');
const authenticate = require('../middleware/authenticate');
const requireOwner = require('../middleware/requireOwner');

// Public - availability check
router.get('/availability', checkAvailability);

// Customer
router.post('/', authenticate, createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/:id', authenticate, getMyBookingById);

module.exports = router;
