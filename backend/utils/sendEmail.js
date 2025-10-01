// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');
const { ConnectionTimedOutError } = require('sequelize');
const { CONSTRAINT } = require('sqlite3');

// Create transporter using Gmail 
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },

  // Render-specific optimizations
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  retries: 2,

  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ SMTP connection failed:', error);
  } else {
    console.log('✅ SMTP server is ready to take messages');
  }
});

  // async ({ to, subject, html }) => {
  //   try {
  //     const info = await transporter.sendMail({
  //       from: 'goFoodyyy <noreply@gofoodyyy.com>',
  //       to,
  //       subject,
  //       html,
  //       text: html.replace(/<[^>]*>/g, '') // Fallback plain text
  //     });
  //     console.log('✅ Email sent:', info.messageId);
  //     return info;
  //   } catch (err) {
  //     console.error('❌ Failed to send email:', err);
  //     throw err;
  //   }
  // }

async function sendEmail({ to, subject, html }) {
  // Skip if no email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.log('📧 Email skipped - no email configuration');
    return { skipped: true, reason: 'No email configuration' };
  }

  try {
    const mailOptions = {
      from: `goFoodyyy <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '')
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    // Return the error but don't throw it
    return { error: err.message };
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