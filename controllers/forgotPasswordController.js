// controllers/forgotPasswordController.js
const bcrypt = require('bcrypt');

const emitter = require('../events/events');
const { generateOTP } = require('../utils/generateOtp');
const dayjs = require('dayjs');

// Require db connection
const { pool } = require('../config/db');

// User model
const userModel = require('../models/userModel');
const passwordResetOtpModel = require('../models/passwordResetOtpModel');

// Post route to send password reset OTP
module.exports.user_send_password_reset_otp_post = async (req, res) => {
  const { email } = req.body;

  // Check if all fields are provided
  if (!email) {
    console.log('Please provide all the required fields');
    return res.status(400).json({ success: false, message: 'Please provide all the required fields' });
  }

  // Get a connection from the pool
  const connection = await pool.getConnection();
  try {
    // Start transaction
    await connection.beginTransaction();

    // Get user by email
    const user = await userModel.getUserByEmail(email, connection);
    if (!user) {
      console.log('User with this email does not exist');
      return res.status(400).json({ success: false, message: 'User with this email does not exist' });
    }

    // Invalidate previous OTPs
    await passwordResetOtpModel.invalidatePreviousOtps(user.user_id, connection);

    // generate OTP and store in password_reset_otps
    const otp = generateOTP(6);
    const expiresAt = dayjs().add(15, "minute").format("YYYY-MM-DD HH:mm:ss");

    console.log(otp, expiresAt);

    // insert password reset OTP
    await passwordResetOtpModel.insertPasswordResetOtp(user.user_id, otp, expiresAt, connection);

    // Commit the transaction
    await connection.commit();

    // Emit event to send verification email
    emitter.emit("passwordResetOtpRequested", {
      userId: user.user_id,
      email: user.email,
      otp
    });

    return res.status(200).json({ success: true, message: 'Password reset OTP sent successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);

    // Rollback first
    await connection.rollback();
    return res.status(500).json({ success: false, message: 'Error occurred while sending password reset OTP' });
  }
  finally {
    // Release the connection
    connection.release();
  }
}

// Post route to reset password
module.exports.user_reset_password_post = async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  // Check if all fields are provided
  if (!email || !otp || !password || !confirmPassword) {
    console.log('Please provide all the required fields');
    return res.status(400).json({ success: false, message: 'Please provide all the required fields' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    console.log('Passwords do not match');
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  // Get a connection from the pool
  const connection = await pool.getConnection();
  try {
    // Start transaction
    await connection.beginTransaction();

    // Get user by email
    const user = await userModel.getUserByEmail(email, connection);
    if (!user) {
      console.log('User with this email does not exist');
      return res.status(400).json({ success: false, message: 'User with this email does not exist' });
    }

    // Check the otp
    const passwordResetOtp = await passwordResetOtpModel.findValidOtp(user.user_id, req.body.otp, connection);

    if (!passwordResetOtp) {
      console.log('Invalid or expired OTP');
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash the new passwor
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await userModel.updateUserPassword(user.user_id, hashedPassword, connection);

    // Mark OTP as used
    await passwordResetOtpModel.markOtpUsed(user.user_id, otp, connection);

    // Commit the transaction
    await connection.commit();

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);

    // Rollback first
    await connection.rollback();
    return res.status(500).json({ success: false, message: 'Error occurred while resetting password' });
  }
  finally {
    // Release the connection
    connection.release();
  }
}