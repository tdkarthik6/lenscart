const express = require('express');
const router = express.Router();
const { register, login, ownerLogin, getMe } = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/owner/login', authLimiter, ownerLogin);
router.get('/me', authenticate, getMe);

module.exports = router;
