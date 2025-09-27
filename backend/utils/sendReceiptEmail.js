// backend/utils/sendReceiptEmail.js
const sendEmail = require('./sendEmail');

async function sendReceiptEmail(customerEmail, orderDetails) {
  try {
    const { orderId, vendor, items, total, paymentRef } = orderDetails;

    // Safety checks
    if (!customerEmail || !vendor) {
      console.error('Missing required email or vendor data');
      return;
    }

    const itemsList = Array.isArray(items) ? items : [];
    const safeTotal = total || 0;

    const htmlContent = `
      <h2>Thank You for Your Order!</h2>
      <p>We've sent your order to <strong>${vendor.vendorName || 'the vendor'}</strong>.</p>
      
      <h3>Order #${orderId || 'N/A'}</h3>
      <ul>
        ${itemsList.map(item => `
          <li>${item.name} × ${item.quantity || 1} = ₦${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</li>
        `).join('')}
      </ul>
      <p><strong>Total: ₦${safeTotal.toFixed(2)}</strong></p>

      <h3>Payment Instructions</h3>
      <p>Please transfer the amount to:</p>
      <p>
        <strong>Bank:</strong> ${vendor.bankName || vendor.bank || 'N/A'}<br/>
        <strong>Account Name:</strong> ${vendor.accountName || 'N/A'}<br/>
        <strong>Account Number:</strong> ${vendor.accountNumber || 'N/A'}<br/>
        <strong>Reference:</strong> ${paymentRef || `GOFOOD${orderId}`}
      </p>

      <hr/>
      <p><small>This is an automated receipt. Do not reply.</small></p>
    `;

    await sendEmail({
      to: customerEmail,
      subject: `🧾 Order Receipt #${orderId} - goFoodyyy`,
      html: htmlContent
    });

    console.log('✅ Receipt email processed successfully');
  } catch (error) {
    console.error('❌ Error in sendReceiptEmail:', error);
    throw error;
  }
}

module.exports = sendReceiptEmail;