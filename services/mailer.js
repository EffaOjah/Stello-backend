// services/mailer.js
const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'effaojah@gmail.com',
    pass: 'nsjx mnel dfwv yzbc',
  },
});

async function sendVerificationEmail(toEmail, otp) {
  const html = `
    <p>Your verification code is: <b>${otp}</b></p>
    <p>This code expires in 15 minutes.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@yourapp.com",
    to: toEmail,
    subject: "Email verification code",
    html,
  });
}

async function sendPasswordResetEmail(toEmail, otp) {
  const html = `
    <p>Your password reset code is: <b>${otp}</b></p>
    <p>This code expires in 15 minutes.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@yourapp.com",
    to: toEmail,
    subject: "Password reset code",
    html,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
