const nodemailer = require("nodemailer");

// we create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// we verify the connection on startup
const verifyEmail = async () => {
  try {
    await transporter.verify();
    console.log("Email service ready");
  } catch (error) {
    console.error(`Email service error: ${error.message}`);
  }
};

module.exports = { transporter, verifyEmail };
