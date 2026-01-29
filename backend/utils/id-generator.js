const crypto = require('crypto');

const generateEmployeeId = (year = new Date().getFullYear()) => {
  const random = crypto.randomInt(1000, 9999);
  return `RACO-${year}-${random}`;
};

module.exports = { generateEmployeeId };
