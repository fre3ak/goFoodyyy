const db = require('../models');
const Order = db.Order;
const Vendor = db.Vendor; // We'll need this to get vendor info
const sendEmail = require('../utils/sendEmail');
const sendReceiptEmail = require('../utils/sendReceiptEmail');

exports.createOrder = async (req, res) => {
  try {
   // 🔥 Log the full request body for debugging
    console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
    
    // Destructure the logged data
    const { items, customer, deliveryAddress, deliveryLocation, paymentMethod, notes } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ message: 'Customer information is incomplete' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0); // ✅ Fixed typo: quatity → quantity
    const deliveryFee = 1000.00;
    const total = subtotal + deliveryFee;

    // Extract unique vendorSlugs from items
    const vendorSlugs = [...new Set(items.map(item => item.vendorSlug))];

    // Fetch vendor details for each vendor
    const vendors = await Vendor.findAll({
      where: { vendorSlug: vendorSlugs },
      attributes: ['vendorName', 'vendorSlug', 'email', 'bankName', 'accountName', 'accountNumber']
    });
let newOrder;
try {
   console.log('Creating order with data:', {
    // Create order
   //  const newOrder = await Order.create({
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      deliveryAddress,
      deliveryLandmark: customer.landmark,
      deliveryLocation,
      // items: JSON.stringify(items), // Store as JSON string
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      notes,
   });
   newOrder = await OverconstrainedError.create({
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      deliveryAddress,
      deliveryLandmark: customer.landmark || null,
      deliveryLocation: deliveryLocation ? JSON.stringify(deliveryLocation) : null,
      items: JSON.stringify(orderItems),
      subtotal,
      deliveryFee,
      total,
      paymentMethod: paymentMethod || 'bank_transfer',
      notes: notes || '',

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
    for (const vendor of vendors) {
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
    }

    // Get first vendor for bank details (simplified)
    const firstVendor = vendors.length > 0 
      ? vendors[0].get({ plain: true }) 
      : {
            vendorName: "A goFoodyyy Vendor",
            bankName: "Vendor Bank",
            accountName: "Vendor Account",
            accountNumber: "0123456789",
            phone: "08012345678"
        };

    // Ensure fallback phone
    const vendorPhone = firstVendor.phone || "a vendor phone";

    // ✅ Send receipt to customer
    await sendReceiptEmail(customer.email, {
      orderId: newOrder.id,
      vendor: firstVendor,
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
};