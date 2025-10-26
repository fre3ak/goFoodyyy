// utils/sendEmail.js - COMPLETE WORKING VERSION
import { Resend } from 'resend';

let resendInstance = null;

const getResendInstance = () => {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    try {
      resendInstance = new Resend(process.env.RESEND_API_KEY, {
        region: 'us-east-1'
      });
      console.log('✅ Resend instance created');
    } catch (error) {
      console.error('❌ Failed to create Resend instance:', error.message);
    }
  }
  return resendInstance;
};

async function sendEmail({ to, subject, html, category = 'transactional' }) {
  const resend = getResendInstance();
  
  if (!resend) {
    console.log('📧 Email skipped - Resend not configured');
    return { skipped: true, reason: 'Resend not configured' };
  }

  try {
    const emailData = {
      from: 'goFoodyyy <admin@gofoodyyy.com>',
    // { data, error } = await resend.emails.send({
    //   from: 'goFoodyyy <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: html.replace(/<[^>]*>/g, ''),

      // Return Path Configuration
      reply_to: 'admin@gofoodyyy.com',

      // Optional: Categorise your emails
      tags: [
        {
          name: 'category',
          value: category
        }
      ]
    };

    // Add custom return path only after domain verification
    if (process.env.NODE_ENV === 'production') {
      emailData.headers = {
        'Return-Path': 'admin@gofoodyyy.com',
        'X-Entity-Ref': 'goFoodyyy-Vendor-System'
      };
    }

    const { data, error } = await resend.emails.send(emailData);

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

export default sendEmail;