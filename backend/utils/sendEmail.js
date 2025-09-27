// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

// Create transporter using Gmail 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
        from: 'goFoodyyy <noreply@gofoodyyy.com>',
        to,
        subject,
        html,
        text: html.replace(/<[^>]*>/g, '') // Fallback plain text
    });
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    throw err;
  }
}

module.exports = sendEmail;