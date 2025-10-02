// utils/sendEmail.js - COMPLETE WORKING VERSION
const { Resend } = require('resend');

let resendInstance = null;

const getResendInstance = () => {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    try {
      resendInstance = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Resend instance created');
    } catch (error) {
      console.error('❌ Failed to create Resend instance:', error.message);
    }
  }
  return resendInstance;
};

async function sendEmail({ to, subject, html }) {
  const resend = getResendInstance();
  
  if (!resend) {
    console.log('📧 Email skipped - Resend not configured');
    return { skipped: true, reason: 'Resend not configured' };
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

// ✅ MAKE SURE THIS EXPORT EXISTS
module.exports = sendEmail;