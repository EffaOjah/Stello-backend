// utils/generateOtp.js

// Generate OTP
function generateOTP(length = 6) {
  // numeric OTP
  const max = Math.pow(10, length);
  const num = Math.floor(Math.random() * (max - Math.pow(10, length - 1))) + Math.pow(10, length - 1);
  return String(num).slice(0, length);
}

module.exports = { generateOTP };