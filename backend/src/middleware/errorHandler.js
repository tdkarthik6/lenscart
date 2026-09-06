const { error } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    const field = err.message.includes('email') ? 'email' : 'field';
    return error(res, `A record with this ${field} already exists.`, 409);
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return error(res, 'Referenced record does not exist.', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token expired', 401);
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Default
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An internal server error occurred'
    : err.message || 'An internal server error occurred';

  return error(res, message, statusCode);
};

module.exports = errorHandler;
