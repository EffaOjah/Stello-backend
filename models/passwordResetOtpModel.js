// models/passwordResetOtp.model.js
// Require db connection
const { pool } = require('../config/db');

// Helper to decide whether to use the transaction connection or the pool
const useConn = (conn) => conn || pool;

// Function to insert password reset OTP
module.exports.insertPasswordResetOtp = async (userId, otp, expiresAt, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = `
      INSERT INTO password_reset_otps (user_id, otp_code, expires_at)
      VALUES (?, ?, ?)
    `;
    const values = [userId, otp, expiresAt];

    const [result] = await connection.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to invalidate previous OTPs
module.exports.invalidatePreviousOtps = async (userId, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = `UPDATE password_reset_otps SET is_used = 1 WHERE user_id = ? AND is_used = 0`;
    const values = [userId];

    const [result] = await connection.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};
// Function to find a valid OTP
module.exports.findValidOtp = async (userId, otpCode, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = `SELECT * FROM password_reset_otps WHERE user_id = ? AND otp_code = ? AND is_used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`;
    const values = [userId, otpCode];

    const [rows] = await connection.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Function to mark OTP as used
module.exports.markOtpUsed = async (userId, otpCode, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = `UPDATE password_reset_otps SET is_used = 1 WHERE user_id = ? AND otp_code = ?`;
    const values = [userId, otpCode];

    const [result] = await connection.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};