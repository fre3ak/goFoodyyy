import express from 'express';
import db from '../models/index.js';
import sendReceiptEmail from '../utils/sendReceiptEmail.js';
import { where } from 'sequelize';

const router = express.Router();
const Order = db.Order;
const Vendor = db.Vendor;

// Get all orders (for admin) - This is the single, correct route for GET /
router.get('/', async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [
        {
          model: Vendor,
          as: 'Vendor', // Specify the alias for the association
          attributes: ['vendorName', 'vendorSlug']
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

// Get orders for a specific vendor
// This was previously nested inside the POST route, which is a bug.
// It is now correctly defined at the top level.
router.get('/vendor/:vendorSlug', async (req, res) => {
  const { vendorSlug } = req.params;

  try {
    // First, find the vendor by their slug to get the ID
    const vendor = await Vendor.findOne({ where: { vendorSlug } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Then, find all orders associated with that vendor's ID
    const orders = await Order.findAll({
      where: { vendorId: vendor.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ message: 'Error fetching vendor orders' });
  }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate the provided status
  const allowedStatuses = ['pending', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' });
  }

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// POST create new order
router.post('/', async (req, res) => {
  console.log('📦 Received order creation request:',{
    body:req.body,
    headers: req.headers
  });

  try {
    const { customerName, customerEmail, customerPhone, deliveryAddress, items, vendorSlug, total, vendorId } = req.body;

    // Validate required fields
    if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
    if (!vendorSlug) return res.status(400).json({ error: 'Vendor slug is required'});
    if (!deliveryAddress) return res.status(400).json({ error: 'Delivery Address is required'});
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required'});
    } 
    if (!total || total <= 0) return res.status(400).json({ error: 'Valid total amount is required' });

    console.log('✅ Order data validated');

    // Find the vendor to get the ID
    const vendor = await Vendor.findOne({ where: { vendorSlug } });
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found for the provided slug.' });
    }

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
      status: 'pending',
      vendorId: vendor.id // CRITICAL: Associate order with vendor
    });

    console.log('✅ Order created in database with ID:', order.id);

    // Send receipt email if customer provided email
    try {
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

export default router;