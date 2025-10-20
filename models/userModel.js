// models/userModel.js
// Require db connection
const { pool } = require('../config/db');

// Helper to decide whether to use the transaction connection or the pool
const useConn = (conn) => conn || pool;

// Function to get user using email
module.exports.getUserByEmail = async (email, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = 'SELECT * FROM users WHERE email = ?';
    const values = [email];

    const [rows] = await connection.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Function to get user using username
module.exports.getUserByUsername = async (username, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = 'SELECT * FROM users WHERE username = ?';
    const values = [username];

    const [rows] = await connection.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

// Function to get user using user ID
module.exports.getUserByUserID = async (userId, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = 'SELECT * FROM users WHERE user_id = ?';
    const values = [userId];

    const [rows] = await connection.query(query, values);
    return rows[0];
  } catch (error) {
    return error;
  }
}

// Function to get user using phone number
module.exports.getUserByPhoneNo = async (phoneNo, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = 'SELECT * FROM users WHERE phone_no = ?';
    const values = [phoneNo];

    const [rows] = await connection.query(query, values);
    return rows[0];
  } catch (error) {
    return error;
  }
}

// Function to create new user
module.exports.createUser = async (fullName, email, phoneNo, username, hashedPassword, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = `
      INSERT INTO users (full_name, email, phone_no, username, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [fullName, email, phoneNo, username, hashedPassword];

    const [result] = await connection.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to insert email verification OTP
module.exports.insertEmailVerificationOTP = async (userId, otp, expiresAt, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = `
      INSERT INTO email_verifications (user_id, otp_code, expires_at)
      VALUES (?, ?, ?)
    `;
    const values = [userId, otp, expiresAt];

    const [result] = await connection.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to get email verification OTP
module.exports.getEmailVerificationOTP = async (userId, otpCode, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = 'SELECT * FROM email_verifications WHERE user_id = ? AND otp_code = ? AND is_used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1';
    const values = [userId, otpCode];

    const [rows] = await connection.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Function to update user's is_verified field
module.exports.updateUserIsVerified = async (userId, isVerified, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = 'UPDATE users SET is_verified = ? WHERE user_id = ?';
    const values = [isVerified, userId];

    const [result] = await connection.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to update the otp's is_used field
module.exports.updateEmailVerificationOTPIsUsed = async (isUsed, userId, otpCode, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = 'UPDATE email_verifications SET is_used = ? WHERE user_id = ? AND otp_code = ?';
    const values = [isUsed, userId, otpCode];

    const [result] = await connection.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};

// Function to update user's password
module.exports.updateUserPassword = async (userId, passwordHash, conn = null) => {
  try {
    const connection = useConn(conn);
    const query = 'UPDATE users SET password_hash = ? WHERE user_id = ?';
    const values = [passwordHash, userId];

    const [result] = await connection.query(query, values);
    return result;
  } catch (error) {
    throw error;
  }
};