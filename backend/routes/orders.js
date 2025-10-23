const express = require('express');
const router = express.Router();
const db = require('../models');
const Order = db.Order;
const Vendor = db.Vendor;
const { createOrder } = require('../controllers/orderController');
const sendReceiptEmail = require('../utils/sendReceiptEmail');
const { where } = require('sequelize');

// Get all orders (for admin)
router.get('/', async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.Vendor,
          as: 'Vendor',
          attributes: ['vendorName', 'vendorSlug']
        },
        {
          model: db.User,
          as: 'User',
          attributes: ['name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Vendor,
          attributes: ['vendorName', 'vendorSlug'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create new order
router.post('/', async (req, res) => {
  console.log('📦 Received order creation request:',{
    body:req.body,
    headers: req.headers
  });

  try {
    const { customerName, customerEmail, customerPhone, deliveryAddress, items, vendorSlug, total } = req.body;

    // Validate required fields
    if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
    if (!vendorSlug) return res.status(400).json({ error: 'Vendor slug is required'});
    if (!deliveryAddress) return res.status(400).json({ error: 'Delivery Address is required'});
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required'});
    } 
    if (!total || total <= 0) return res.status(400).json({ error: 'Valid total amount is required' });

    console.log('✅ Order data validated');

    const order = await Order.create({
      customerName,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      deliveryAddress: deliveryAddress || null,
      vendorSlug,
      items,
      subtotal: total - 1000, // Assuming 1000 is delivery fee
      deliveryFee: 1000,
      total,
      status: 'pending'
    });

    console.log('✅ Order created in database with ID:', order.id);

// Get orders for specific vendor
router.get('/vendor/:vendorSlug', async (req, res) => {
  const { vendorSlug } = req.params;

  try {
    const orders = await Order.findAll({
      include: [{
        model: Vendor,
        where: { vendorSlug },
        attributes: ['vendorName', 'vendorSlug'],
        required: true
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ message: 'Error fetching vendor orders' });
  }
});

    // Find vendor for receipt
    // const vendor = await Vendor.findOne({ where: { vendorSlug } });

    // Send receipt email if customer provided email
    try {
      const vendor = await Vendor.findOne({ where: { vendorSlug } });
      if (customerEmail && vendor) {
        console.log('📧 Attempting to send receipt to:', customerEmail);
          const emailResult = await sendReceiptEmail(customerEmail, {
            orderId: order.id,
            vendor: vendor,
            items: items,
            total: total,
            paymentRef: `GOFOOD${order.id}`
          });

          if (emailResult.error) {
           console.log('⚠️ Receipt email failed but order was created:', emailResult.error);
        } else {
          console.log('✅ Receipt email sent:', emailResult.emailId);
        } 
        } else {
          console.log('❌ Vendor not found for slug:', vendorSlug);
        }
      } catch (emailError) {
        console.error('❌ Failed to send email, but order was created:', emailError);
      }

      res.status(201).json({
        message: 'Order created successfully',
        orderId: order.id,
        order: order
      });

    } catch (error) {
      console.error('❌ Order creation error:', error);
      res.status(500).json({ error: 'Failed to create order: ' + error.message });
    }    
  });
// Create a new order

module.exports = router;