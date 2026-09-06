const jwt = require('jsonwebtoken');
const { unauthorized } = require('../utils/response');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token has expired. Please login again.');
    }
    return unauthorized(res, 'Invalid authentication token');
  }
};

module.exports = authenticate;
