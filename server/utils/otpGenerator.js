const { randomInt } = require('crypto')

// Browser & Node-friendly secure OTP (numeric)
function generateNumericOTP(length = 6) {
  const n = randomInt(0, 1000000);
  return String(n).padStart(6, '0');
}

module.exports = generateNumericOTP;