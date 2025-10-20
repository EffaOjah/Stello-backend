// events/listeners.js
const emitter = require("./events");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../services/mailer");

// when verification requested: send email
emitter.on("emailVerificationRequested", async ({ userId, email, otp }) => {
  try {
    // send email (non-blocking in main flow)
    await sendVerificationEmail(email, otp);
    // Optionally log to DB/audit table here.
    console.log(`Verification OTP sent to ${email}`);
  } catch (err) {
    // You might want to record failed send attempts in DB for retries.
    console.error("Failed to send verification email:", err);
  }
});

// when password reset OTP requested: send email
emitter.on("passwordResetOtpRequested", async ({ userId, email, otp }) => {
  try {
    // send email (non-blocking in main flow)
    await sendPasswordResetEmail(email, otp);
    // Optionally log to DB/audit table here.
    console.log(`Password reset OTP sent to ${email}`);
  } catch (err) {
    // You might want to record failed send attempts in DB for retries.
    console.error("Failed to send password reset OTP:", err);
  }
});