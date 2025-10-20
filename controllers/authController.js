// controllers/authController.js
const bcrypt = require('bcrypt');

const emitter = require('../events/events');
const { generateOTP } = require('../utils/generateOtp');
const dayjs = require('dayjs');

// Require db connection
const { pool } = require('../config/db');

// User model
const userModel = require('../models/userModel');

// Utility to generate JWT
const generateToken = require('../utils/generateToken');

// Utility to validate email
const { isValidEmail } = require('../utils/validateEmail');

// Post route to register users
module.exports.user_register_post = async (req, res) => {
  const { fullName, email, phoneNo, username, password, confirmPassword } = req.body;
  console.log('Received registration data for:', { fullName, email, phoneNo, username });

  // Check if all fields are provided
  if (!fullName || !email || !phoneNo || !username || !password || !confirmPassword) {
    console.log('Please provide all the required fields');
    return res.status(400).json({ success: false, message: 'Please provide all the required fields' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    console.log('Passwords do not match');
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  // Check if email is valid
  if (!isValidEmail(email)) {
    console.log('Invalid email');
    return res.status(400).json({ success: false, message: 'Invalid email' });
  }

  // Get a connection from the pool
  const connection = await pool.getConnection();
  try {
    // Start transaction
    await connection.beginTransaction();

    // Check if user with email already exists
    const checkEmail = await userModel.getUserByEmail(email, connection);
    if (checkEmail) {
      console.log('User with this email already exists');
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Check if user with username already exists
    const checkUsername = await userModel.getUserByUsername(username, connection);
    if (checkUsername) {
      console.log('User with this username already exists');
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'User with this username already exists' });
    }

    // Check if user with phone number already exists
    const checkPhoneNo = await userModel.getUserByPhoneNo(phoneNo, connection);
    if (checkPhoneNo) {
      console.log('User with this phone number already exists');
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'User with this phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    await userModel.createUser(fullName, email, phoneNo, username, hashedPassword, connection);

    // Get the just created user
    const justCreatedUser = await userModel.getUserByEmail(email, connection);
    console.log('Successfully created user:', justCreatedUser);

    // Generate JWT token
    const token = generateToken({ id: justCreatedUser.user_id, email: justCreatedUser.email });

    // Set cookie
    res.cookie('stello_user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    });

    // generate OTP and store in email_verifications
    const otp = generateOTP(6);
    const expiresAt = dayjs().add(15, "minute").format("YYYY-MM-DD HH:mm:ss");

    console.log(otp, expiresAt);

    // insert email verification OTP
    await userModel.insertEmailVerificationOTP(justCreatedUser.user_id, otp, expiresAt, connection);

    // Commit the transaction
    await connection.commit();

    // Emit event to send verification email
    emitter.emit("emailVerificationRequested", {
      userId: justCreatedUser.user_id,
      email: justCreatedUser.email,
      otp
    });

    return res.status(201).json({ success: true, message: 'User registered successfully', redirect: '/verify-email' });
  } catch (error) {
    console.error('Internal server error:', error);
    await connection.rollback();
    return res.status(500).json({ success: false, message: 'Error occurred while registering user' });
  } finally {
    connection.release();
  }
};

// Post route to login users
module.exports.user_login_post = async (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are provided
  if (!email || !password) {
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

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      console.log('Incorrect password');
      return res.status(400).json({ success: false, message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = generateToken({ id: user.user_id, email: user.email });

    // Set cookie
    res.cookie('stello_user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None'
    });

    // Check if user has verified email
    if (!user.is_verified) {
      console.log('User has not verified email');
      return res.status(200).json({ success: true, message: 'User logged in successfully', redirect: '/verify-email' });
    }
    return res.status(200).json({ success: true, message: 'User logged in successfully', token });
  } catch (error) {
    console.error('Internal server error: ', error);

    // Rollback first
    await connection.rollback();
    return res.status(500).json({ success: false, message: 'Error occurred while logging in user' });
  }
  finally {
    // Release the connection
    connection.release();
  }
}

// Post route to resend email verification OTP
module.exports.user_resend_email_verification_post = async (req, res) => {
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

    // Check if user has already verified email
    if (user.is_verified) {
      console.log('User has already verified email');
      return res.status(400).json({ success: false, message: 'User has already verified email' });
    }

    // generate OTP and store in email_verifications
    const otp = generateOTP(6);
    const expiresAt = dayjs().add(15, "minute").format("YYYY-MM-DD HH:mm:ss");

    console.log(otp, expiresAt);

    // insert email verification OTP
    await userModel.insertEmailVerificationOTP(user.user_id, otp, expiresAt, connection);

    // Commit the transaction
    await connection.commit();

    // Emit event to send verification email
    emitter.emit("emailVerificationRequested", {
      userId: user.user_id,
      email: user.email,
      otp
    });

    return res.status(200).json({ success: true, message: 'Email verification OTP sent successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);

    // Rollback first
    await connection.rollback();
    return res.status(500).json({ success: false, message: 'Error occurred while resending email verification OTP' });
  }
  finally {
    // Release the connection
    connection.release();
  }
}

// Post route to verify email OTP
module.exports.user_verify_email_post = async (req, res) => {
  const { email, otp } = req.body;

  // Check if all fields are provided
  if (!email || !otp) {
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
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'User with this email does not exist' });
    }

    // Check if user has already verified email
    if (user.is_email_verified) {
      console.log('User has already verified email');
      return res.status(400).json({ success: false, message: 'User has already verified email' });
    }

    // Check the otp
    const emailVerificationOTP = await userModel.getEmailVerificationOTP(user.user_id, otp, connection);

    if (!emailVerificationOTP) {
      console.log('Invalid or expired OTP');
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Update user's is_verified field
    await userModel.updateUserIsVerified(user.user_id, true, connection);

    // Update the otp's is_used field
    await userModel.updateEmailVerificationOTPIsUsed(true, user.user_id, otp, connection);

    // Commit the transaction
    await connection.commit();

    return res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Internal server error: ', error);

    // Rollback first
    await connection.rollback();
    return res.status(500).json({ success: false, message: 'Error occurred while verifying email' });
  }
  finally {
    // Release the connection
    connection.release();
  }
}

// Post route to logout user
module.exports.user_logout_post = async (req, res) => {
  try {
    // Delete the cookie
    res.clearCookie('stello_user_token');
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.log('Internal server error: ', error);
    return res.status(500).json({ success: false, message: 'Error logging out!' });
  }
}