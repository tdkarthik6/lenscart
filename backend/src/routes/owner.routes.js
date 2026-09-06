const express = require('express');
const router = express.Router();
const {
  getAllBookings, getBookingById, updateBookingStatus, getDashboard, getCalendar,
} = require('../controllers/booking.controller');
const authenticate = require('../middleware/authenticate');
const requireOwner = require('../middleware/requireOwner');

const ownerGuard = [authenticate, requireOwner];

router.get('/dashboard', ...ownerGuard, getDashboard);
router.get('/calendar', ...ownerGuard, getCalendar);
router.get('/bookings', ...ownerGuard, getAllBookings);
router.get('/bookings/:id', ...ownerGuard, getBookingById);
router.patch('/bookings/:id/status', ...ownerGuard, updateBookingStatus);

module.exports = router;
