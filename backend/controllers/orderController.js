 const db = require('../models');
 const Order = db.Order;

 exports.createOrder = async (req, res) => {
    try {
       const { items, customer, deliveryAddress, deliveryLocation, paymentMethod, notes } = req.body;

       const subtotal = items.reduce((sum, item) => sum + item.price * item.quatity, 0);
       const deliveryFee = 1000.00; // Fixed delivery fee
       const total = subtotal + deliveryFee;

       const newOrder = await Order.create({
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          deliveryAddress,
          deliveryLandmark: customer.landmark,
          deliveryLocation,
          items,
          subtotal,
          deliveryFee,
          total,
          paymentMethod,
          notes,

          // Metadata from request
          userAgent: req.get('User-Agent'),
          userIp : req.ip || req.connection.remoteAddress,
          referer: req.get('Referer'),
          cookies: JSON.stringify(req.cookies) // only if cookies are enabled
        });

        res.status(201).json({ message: 'Order createad successfully', orderId: newOrder.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to create order', error: err.message });
    }
 };
