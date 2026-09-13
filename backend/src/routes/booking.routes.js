const express = require('express');
const router = express.Router();
const {
  checkAvailability, createBooking, getBookingByReference,
} = require('../controllers/booking.controller');

// All customer booking routes are now PUBLIC (no login required)
router.get('/availability', checkAvailability);
router.post('/', createBooking);
router.get('/ref/:reference', getBookingByReference);

module.exports = router;
