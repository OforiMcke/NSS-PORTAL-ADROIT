const { transporter } = require("../config/nodemailer.js");

//significant characters so user-controlled strings (fullName,
// adminFeedback) can't inject markup/scripts into the email body.
const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// This accepts emails
const sendAcceptanceEmail = async (application) => {
  const safeName = escapeHtml(application.fullName);
  const subject = `Congratulations Your application was accepted | Adroit 360`;
  const html = `  
    <div style="font-family: Arial, sans-serif; min-width: 600px; margin:auto;">  
      <h2 style="color:#1a73e8;">Adroit 360: Application Accepted</h2>  
      <p>Dear <strong>${safeName}</strong>,</p>  
      <p>We are delighted to inform you that your application has been  
         <strong>accepted</strong>. Congratulations!</p>  
      <p>Our team will reach out to you shortly with the next steps.</p>  
      <p style="margin-top: -20px;">Warm regards,<br/>The Adroit 360 Team</p>
      </div>
      <footer style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
      <p>This email was sent from Adroit 360. If you have any questions, please contact us at 
      <a href="mailto:careers@adroit360.com">careers@adroit360.com</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} Adroit 360. All rights reserved.</p>    
    </footer>
  `;

  await transporter.sendMail({
    from: `"Adroit 360" <${process.env.EMAIL_USER}>`,
    to: application.email,
    subject,
    html,
  });
};

// Rejection email
const sendRejectionEmail = async (application) => {
  const safeName = escapeHtml(application.fullName);
  const subject = `Update on your application | Adroit 360`;
  const feedback = application.adminFeedback
    ? `<p style="background: #f9f9f9; padding:12px; border-left:4px solid #ec289d;">
         <strong>Feedback:</strong> ${escapeHtml(application.adminFeedback)}
       </p>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; min-width: 600px; margin:auto;  padding:20px;">
      <h2 style="color: #ec289d;;">Adroit 360: Application Update</h2>
      <p>Dear <strong>${safeName}</strong>,</p>
      <p>Thank you for your interest in Adroit 360. After careful review,
         we regret to inform you that your application has been
         <strong>declined</strong> at this time.</p>
      ${feedback}
      <p>We encourage you to apply again in the future and wish you the best
         in your career journey.</p>
      <p style="margin-top: -20px;">Warm regards,<br/>The Adroit 360 Team</p>
    </div>
     <footer style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
      <p>This email was sent from Adroit 360. If you have any questions, please contact us at 
      <a href="mailto:careers@adroit360.com">careers@adroit360.com</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} Adroit 360. All rights reserved.</p>    
    </footer>
  `;

  await transporter.sendMail({
    from: `"Adroit 360" <${process.env.EMAIL_USER}>`,
    to: application.email,
    subject,
    html,
  });
};

// confirmation email sent to the applicant right after they submit
const sendApplicationReceivedEmail = async (application) => {
  const safeName = escapeHtml(application.fullName);
  const safeJobRole = escapeHtml(application.jobRole || "the role");
  const subject = `We've received your application | Adroit 360`;
  const html = `
    <div style="font-family: Arial, sans-serif; min-width: 600px; margin:auto; padding:20px;">
      <h2 style="color:#1a73e8;">Adroit 360: Application Received</h2>
      <p>Dear <strong>${safeName}</strong>,</p>
      <p>Thank you for applying for <strong>${safeJobRole}</strong>. <br/> We've
         successfully received your application and it is now under review.</p>
      <p>We'll be in touch as soon as there's an update on your status.</p>
      <p style="margin-top: -20px;">Warm regards,<br/>The Adroit 360 Team</p>
    </div>
    <footer style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
      <p>This email was sent from Adroit 360. If you have any questions, please contact us at
      <a href="mailto:careers@adroit360.com">careers@adroit360.com</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} Adroit 360. All rights reserved.</p>
    </footer>
  `;

  await transporter.sendMail({
    from: `"Adroit 360" <${process.env.EMAIL_USER}>`,
    to: application.email,
    subject,
    html,
  });
};

// notification email sent to admins when a new application comes in
const sendNewApplicationAdminEmail = async (application, adminEmails = []) => {
  if (!adminEmails.length) return;

  const safeName = escapeHtml(application.fullName);
  const safeJobRole = escapeHtml(application.jobRole || "a role");
  const safeEmail = escapeHtml(application.email);
  const safePhone = escapeHtml(application.phoneNumber || "");
  const subject = `New application: ${application.jobRole || "a role"} | Adroit 360`;
  const html = `
    <div style="font-family: Arial, sans-serif; min-width: 600px; margin:auto; padding:20px;">
      <h2 style="color:#1a73e8;">Adroit 360: New Application Submitted</h2>
      <p>A new application has just come in for <strong>${safeJobRole}</strong>.</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 12px;">
        <tr><td style="padding:6px 0;"><strong>Applicant</strong></td><td style="padding:6px 0;">${safeName}</td></tr>
        <tr><td style="padding:6px 0;"><strong>Email</strong></td><td style="padding:6px 0;">${safeEmail}</td></tr>
        <tr><td style="padding:6px 0;"><strong>Phone</strong></td><td style="padding:6px 0;">${safePhone}</td></tr>
      </table>
      <p style="margin-top: 16px;">Log in to the admin dashboard to review it.</p>
    </div>
    <footer style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
      <p>&copy; ${new Date().getFullYear()} Adroit 360. All rights reserved.</p>
    </footer>
  `;

  await transporter.sendMail({
    from: `"Adroit 360" <${process.env.EMAIL_USER}>`,
    to: adminEmails,
    subject,
    html,
  });
};

// password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
  const safeName = escapeHtml(user.firstName);
  const subject = `Reset your password | Adroit 360`;
  const html = `
    <div style="font-family: Arial, sans-serif; min-width: 600px; margin:auto; padding:20px;">
      <h2 style="color:#1a73e8;">Adroit 360: Password Reset Request</h2>
      <p>Dear <strong>${safeName}</strong>,</p>
      <p>We received a request to reset your password. Click the button below
         to choose a new one. This link expires in 30 minutes.</p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="${resetUrl}" style="background:#1a73e8; color:#fff; padding:12px 24px;
           border-radius:6px; text-decoration:none; font-weight:600;">Reset Password</a>
      </p>
      <p>If you didn't request this, you can safely ignore this email and your
         password will remain unchanged.</p>
      <p style="margin-top: -20px;">Warm regards,<br/>The Adroit 360 Team</p>
    </div>
    <footer style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
      <p>This email was sent from Adroit 360. If you have any questions, please contact us at
      <a href="mailto:careers@adroit360.com">careers@adroit360.com</a>
      </p>
      <p>&copy; ${new Date().getFullYear()} Adroit 360. All rights reserved.</p>
    </footer>
  `;

  await transporter.sendMail({
    from: `"Adroit 360" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject,
    html,
  });
};

module.exports = {
  sendAcceptanceEmail,
  sendRejectionEmail,
  sendApplicationReceivedEmail,
  sendNewApplicationAdminEmail,
  sendPasswordResetEmail,
};
