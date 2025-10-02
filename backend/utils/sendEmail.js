// utils/sendEmail.js - USING RESEND WITH COMMONJS
const { Resend } = require('resend');

// Initialize Resend with your API key
// const resend = new Resend(process.env.RESEND_API_KEY);

// Prevents immediate initialisation until needed
let resendInstance = null;

const getResendInstance = () => {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log('⚠️ Resend API key not configured');
      return null;
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
};

async function sendEmail({ to, subject, html }) {
  const resend = getResendInstance();
  
  // Skip if no Resend instance (API key not configured)
  if (!resend) {
    console.log('📧 Email skipped - no Resend API key configured');
    return { skipped: true, reason: 'No Resend API key' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'goFoodyyy <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '')
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { error: error.message };
    }

    console.log('✅ Email sent via Resend:', data.id);
    return data;
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    return { error: err.message };
  }
}

module.exports = sendEmail;