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

// backend/utils/sendEmail.js
// const nodemailer = require('nodemailer');
// require('dotenv').config(); // Ensure env vars are loaded

// Create transporter using Gmail
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_APP_PASSWORD
//   },
  // Optional: Add logging for debugging in development
  // debug: false, // Set to true only during testing
//   logger: false
// });

// Optional: Verify connection configuration early
// transporter.verify((err, success) => {
//   if (err) {
//     console.error('❌ Email transporter failed verification:', err);
//   } else {
//     console.log('✅ Email transporter verified – ready to send messages');
//   }
// });

// async function sendEmail({ to, subject, html, from = 'goFoodyyy <noreply@gofoodyyy.com>' }) {
//   try {
//     const info = await transporter.sendMail({
//       from,
//       to,
//       subject,
//       html,
//       text: html.replace(/<[^>]*>/g, '').trim(), // Clean plain-text fallback
//       // Optional headers to improve trust & avoid spam
//       headers: {
//         'X-Mailer': 'goFoodyyy v1.0',
//         'List-Unsubscribe': '<mailto:unsubscribe@gofoodyyy.com>',
//       }
//     });

//     console.log(`✅ Email sent successfully to ${to}`);
//     console.log(`📎 Message ID: ${info.messageId}`);
//     return info;
//   } catch (err) {
//     console.error('❌ Failed to send email:', {
//       to,
//       subject,
//       error: err.message || err,
//       ...(err.code && { code: err.code }), // e.g., "EAUTH", "EENVELOPE"
//     });
//     throw new Error(`Failed to send email: ${err.message || 'Unknown error'}`);
//   }
// }

// module.exports = sendEmail;