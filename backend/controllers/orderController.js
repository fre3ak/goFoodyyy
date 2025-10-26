import db from '../models/index.js';
const { Order, Vendor, Product } = db; // We'll need this to get vendor info
import sendEmail from '../utils/sendEmail.js';
import sendReceiptEmail from '../utils/sendReceiptEmail.js';

export async function createOrder(req, res) {
  try {
   // 🔥 Log the full request body for debugging
    console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
    
    // Destructure the logged data
    const { items, customer, deliveryAddress, deliveryLocation, paymentMethod, notes, vendorSlug } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ message: 'Customer information is incomplete' });
    }

    // Find the vendor to get the ID
    const vendor = await Vendor.findOne({ where: { vendorSlug } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 1000.00;
    const total = subtotal + deliveryFee;

let newOrder;
try {
   // Create order
   newOrder = await Order.create({
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      deliveryAddress,
      deliveryLandmark: customer.landmark || null,
      deliveryLocation: deliveryLocation ? JSON.stringify(deliveryLocation) : null,
      vendorSlug: vendor.vendorSlug,
      items: items, // Sequelize handles JSONB serialization
      subtotal,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'bank_transfer',
      notes: notes || '',
      vendorId: vendor.id, // CRITICAL: Associate order with vendor

      // Metadata
      userAgent: req.get('User-Agent') || '',
      userIp: req.ip || req.connection.remoteAddress || '',
      referer: req.get('Referer') || '',
      cookies: JSON.stringify(req.cookies || {})
    });

    console.log('✅ Order saved successfully:', newOrder.id);

   } catch (dbErr) {
     console.error('❌ Failed to create order in DB:', dbErr);
     console.error('Sequelize validation errors:', dbErr.errors?.map(e => e.message));
     return res.status(500).json({
       message: 'Failed to save order',
       error: dbErr.message,
       details: dbErr.errors?.map(e => e.message)
     });
   }

    // ✅ Send notifications after order creation
    // Notify vendor
    await sendEmail({
      to: vendor.email,
      subject: `📦 New Order #${newOrder.id} - ₦${total.toFixed(2)}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${newOrder.id}</p>
        <p><strong>Total:</strong> ₦${total.toFixed(2)}</p>
        <p><strong>Customer:</strong> ${customer.name}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p>Please prepare the food. Customer will pay via bank transfer.</p>
        <p><strong>Payment Reference:</strong> ORD-${newOrder.id}</p>
      `
    });

    // ✅ Send receipt to customer
    await sendReceiptEmail(customer.email, {
      orderId: newOrder.id,
      vendor: vendor.get({ plain: true }),
      items,
      total,
      paymentRef: `ORD-${newOrder.id}`
    });

    // ✅ Success response
    res.status(201).json({
      message: 'Order created successfully',
      orderId: newOrder.id
    });

  } catch (err) {
    console.error('❌ Failed to create order:', err);
    res.status(500).json({
      message: 'Failed to create order',
      error: err.message
    });
  }
}