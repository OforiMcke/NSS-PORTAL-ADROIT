const { transporter } = require("../config/nodemailer.js");

// This accepts emails
const sendAcceptanceEmail = async (application) => {
  const subject = `Congratulations Your application was accepted | Adroit 360`;
  const html = `  
    <div style="font-family: Arial, sans-serif; min-width: 600px; margin:auto;">  
      <h2 style="color:#1a73e8;">Adroit 360: Application Accepted</h2>  
      <p>Dear <strong>${application.fullName}</strong>,</p>  
      <p>We are delighted to inform you that your application has been  
         <strong>accepted</strong>. Congratulations!</p>  
      <p>Our team will reach out to you shortly with the next steps.</p>  
      <p style="margin-top: -20px;">Warm regards,<br/>The Adroit 360 Team</p>
      </div>
      <footer style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
      <p>This email was sent from Adroit 360. If you have any questions, please contact us at 
      <a href="mailto:amiskyjunior@gmail.com">amiskyjunior@gmail.com</a>
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
  const subject = `Update on your application | Adroit 360`;
  const feedback = application.adminFeedback
    ? `<p style="background: #f9f9f9; padding:12px; border-left:4px solid #ec289d;">
         <strong>Feedback:</strong> ${application.adminFeedback}
       </p>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; min-width: 600px; margin:auto;  padding:20px;">
      <h2 style="color: #ec289d;;">Adroit 360: Application Update</h2>
      <p>Dear <strong>${application.fullName}</strong>,</p>
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
      <a href="mailto:amiskyjunior@gmail.com">amiskyjunior@gmail.com</a>
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

module.exports = { sendAcceptanceEmail, sendRejectionEmail };
