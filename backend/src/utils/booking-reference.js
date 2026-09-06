const { v4: uuidv4 } = require('uuid');

/**
 * Generates a unique booking reference like BK-A3F9D2
 */
const generateBookingReference = () => {
  const unique = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 6);
  return `BK-${unique}`;
};

module.exports = { generateBookingReference };
