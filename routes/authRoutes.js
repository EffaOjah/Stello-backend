// routes/authRoutes.js
const { Router } = require('express');
const authController = require('../controllers/authController');
const forgotPasswordController = require('../controllers/forgotPasswordController');

const authRoutes = Router();

// Post route for user registration
authRoutes.post('/user/register',
  authController.user_register_post);

// Post route for user login
authRoutes.post('/user/login',
  authController.user_login_post);

// Post route for user resend email verification OTP
authRoutes.post('/user/resend-email-verification',
  authController.user_resend_email_verification_post);

// Post route for user verify email OTP
authRoutes.post('/user/verify-email',
  authController.user_verify_email_post);

// Post route for sending password reset OTP
authRoutes.post('/user/send-password-reset-otp',
  forgotPasswordController.user_send_password_reset_otp_post);

// Post route for resetting password
authRoutes.post('/user/reset-password',
  forgotPasswordController.user_reset_password_post);

// Post route for logout
authRoutes.post('/user/logout',
  authController.user_logout_post);


module.exports = authRoutes;