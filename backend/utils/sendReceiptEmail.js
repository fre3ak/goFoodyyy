// backend/utils/sendReceiptEmail.js
const sendEmail = require('./sendEmail');

async function sendReceiptEmail(customerEmail, orderDetails) {
  try {
    const { orderId, vendor, items, total, paymentRef } = orderDetails;

    // Safety checks
    if (!customerEmail || !vendor) {
      console.error('Missing required email or vendor data');
      return { error: 'Missing email or vendor data' };
    }

    const itemsList = Array.isArray(items) ? items : [];
    const safeTotal = total || 0;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #059669, #10b981); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">🍔 goFoodyyy</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Order Receipt</p>
        </div>

        <div style="padding: 20px;">
          <h2 style="color: #059669; margin-bottom: 10px;">Thank You for Your Order!</h2>
          <p style="color: #666; margin-bottom: 20px;">
            We've sent your order to <strong style="color: #333;">${vendor.vendorName || 'the vendor'}</strong>.
          </p>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 10px;">Order #${orderId || 'N/A'}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsList.map(item => `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <strong>${item.name}</strong><br>
                    <small style="color: #666;">${item.description || ''}</small>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                    ${item.quantity || 1} × ₦${(item.price || 0).toFixed(2)}
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">
                    ₦${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </table>
            
            <div style="border-top: 2px solid #059669; margin-top: 15px; padding-top: 15px;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 5px 0;">Subtotal:</td>
                  <td style="padding: 5px 0; text-align: right;">₦${(safeTotal - 1000).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">Delivery Fee:</td>
                  <td style="padding: 5px 0; text-align: right;">₦1,000.00</td>
                </tr>
                <tr style="font-weight: bold; font-size: 18px;">
                  <td style="padding: 10px 0; color: #059669;">Total:</td>
                  <td style="padding: 10px 0; text-align: right; color: #059669;">₦${safeTotal.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>

          <div style="background: #fff7ed; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #ea580c; margin-bottom: 10px;">💰 Payment Instructions</h3>
            <p style="margin-bottom: 10px;">Please transfer <strong>₦${safeTotal.toFixed(2)}</strong> to:</p>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #fed7aa;">
              <p style="margin: 5px 0;"><strong>Bank:</strong> ${vendor.bankName || vendor.bank || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Account Name:</strong> ${vendor.accountName || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Account Number:</strong> ${vendor.accountNumber || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Reference:</strong> ${paymentRef || `GOFOOD${orderId}`}</p>
            </div>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">
              📱 Send proof of payment to the vendor at <strong>${vendor.phone || 'the provided contact number'}</strong>
            </p>
          </div>

          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px;">
            <h3 style="color: #0369a1; margin-bottom: 10px;">🚚 What Happens Next?</h3>
            <ol style="color: #666; padding-left: 20px;">
              <li>Send payment proof to the vendor</li>
              <li>Vendor confirms payment and starts preparing your order</li>
              <li>You'll receive updates on your order status</li>
              <li>Enjoy your delicious meal! 🍽️</li>
            </ol>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #666; font-size: 12px;">
            <p>If you have any questions, contact us at support@gofoodyyy.com</p>
            <p>This is an automated receipt. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `;

    const emailResult = await sendEmail({
      to: customerEmail,
      subject: `🧾 Order Receipt #${orderId} - goFoodyyy`,
      html: htmlContent
    });

    if (emailResult.error) {
      console.error('❌ Failed to send receipt email:', emailResult.error);
      return { error: emailResult.error };
    }

    console.log('✅ Receipt email sent successfully to:', customerEmail);
    return { success: true, emailId: emailResult.id };
    
  } catch (error) {
    console.error('❌ Error in sendReceiptEmail:', error);
    return { error: error.message };
  }
}

module.exports = sendReceiptEmail;