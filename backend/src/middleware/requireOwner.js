const { forbidden } = require('../utils/response');

const requireOwner = (req, res, next) => {
  if (!req.user || req.user.role !== 'OWNER') {
    return forbidden(res, 'Access denied. Owner privileges required.');
  }
  next();
};

module.exports = requireOwner;
