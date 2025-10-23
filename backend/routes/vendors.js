// backend/routes/vendors.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const db = require('../models'); // ✅ Fixed import
const Vendor = db.Vendor;        // ✅ Get from db object
const Product = db.Product;      // ✅ Get from db object
const sendEmail = require('../utils/sendEmail');
console.log('sendEmail imported:', typeof sendEmail);
console.log('sendEmail function:', sendEmail);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
fs.ensureDirSync(uploadDir);

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET /api/vendors/approved - Get only approved vendors
router.get('/approved', async (req, res) => {
  try {
    const vendors = await Vendor.findAll({
      where: { status: 'approved' },
      attributes: ['vendorName', 'vendorSlug']
    });

    res.status(200).json(
      vendors.map(v => ({
        name: v.vendorName,
        slug: v.vendorSlug
      }))
    );
  } catch (err) {
    console.error('Failed to fetch approved vendors:', err);
    res.status(500).json({ error: 'Could not load vendors' });
  }
});

// All vendor for admin
router.get('/all/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.findAll();
    res.status(200).json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/vendors/:vendorSlug
router.get('/:vendorSlug', async (req, res) => {
  try {
    const { vendorSlug } = req.params;
    const vendor = await Vendor.findOne({ 
      where: { 
        vendorSlug,
        status: 'approved'
      } 
    });

    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.status(200).json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all vendors (for admin)
router.get('/all/vendors', async (req, res) => {
  try {
    const vendors = await db.Vendor.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

//Admin approval route
router.put('/:vendorSlug/approve', async (req, res) => {
  try {
    const { vendorSlug } = req.params;
    const vendor = await Vendor.findOne({ where: { vendorSlug } });

    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    vendor.status = 'approved';
    await vendor.save();

    // Send approval email to vendor
    const emailResult = await sendEmail({
      to: vendor.email, // Send to VENDOR
      subject: `🎉 Your Vendor Account Has Been Approved! - goFoodyyy`,
      html: `
        <h2>Congratulations, ${vendor.vendorName}!</h2>
        <p>Your vendor account has been approved and is now live on goFoodyyy.</p>
        
        <h3>Your Store Details:</h3>
        <ul>
          <li><strong>Store Name:</strong> ${vendor.vendorName}</li>
          <li><strong>Store URL:</strong> https://gofoodyyy.netlify.app/vendor/${vendor.vendorSlug}</li>
          <li><strong>Your Contact:</strong> ${vendor.phone}</li>
          <li><strong>Your Email:</strong> ${vendor.email}</li>
        </ul>

        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Share your store link with customers</li>
          <li>Start receiving orders</li>
          <li>Check your email for order notifications</li>
        </ol>

        <p>If you need to update your menu or store information, please contact support.</p>

        <p>Welcome to the goFoodyyy family! 🎉</p>

        <hr/>
        <p><small>This is an automated message. Please do not reply to this email.</small></p>
      `
    });

    res.json({ 
      message: 'Vendor approved successfully', 
      vendor,
      emailSent: !emailResult.error
    });
  } catch (err) {
    console.error('Error approving vendor:', err);
    res.status(500).json({ error: 'Failed to approve vendor'});
  }
});

// Suspend vendor route
router.put('/:vendorSlug/suspend', async (req, res) => {
  try {
    const { vendorSlug } = req.params;
    const vendor = await db.Vendor.findOne({ where: { vendorSlug } });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.update({
      status: 'suspended',
      isActive: false
    });

    res.json({ 
      message: 'Vendor suspended successfully', 
      vendor: vendor.toJSON()
    });
  } catch (error) {
    console.error('Error suspending vendor:', error);
    res.status(500).json({ message: 'Failed to suspend vendor' });
  }
});

// Delete vendor route  
router.delete('/:vendorSlug/delete', async (req, res) => {
  try {
    const { vendorSlug } = req.params;
    const vendor = await db.Vendor.findOne({ where: { vendorSlug } });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await vendor.destroy();

    res.json({ 
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Error deleting vendor' });
  }
});

// Get vendors by state (for homepage categorization)
router.get('/state/:state', async (req, res) => {
  const { state } = req.params;

  try {
    const vendors = await Vendor.findAll({
      where: { 
        state,
        status: 'approved',
        isActive: true
      },
      order: [['vendorName', 'ASC']]
    });

    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors by state:', error);
    res.status(500).json({ message: 'Error fetching vendors by state' });
  }
});

// POST /api/vendors/onboard
router.post('/onboard', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'menuImages', maxCount: 20 }
]), async (req, res) => {
  console.log('📬 Body fields:', Object.keys(req.body));
  console.log('📁 Files received:', req.files);

  try {
    const {
      vendorName,
      vendorSlug: rawVendorSlug,
      phone,
      email,
      password,
      bank,
      accountName,
      accountNumber,
      delivery,
      pickup,
      openingHours
    } = req.body;

    const vendorSlug = (rawVendorSlug || vendorName)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (!vendorName || !vendorSlug || !phone || !email || !bank || !accountName || !accountNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await Vendor.findOne({ where: { vendorSlug } });
    if (existing) return res.status(409).json({ error: 'Slug already taken' });

    // Handle logo
    const logoFile = req.files && req.files['logo'] ? req.files['logo'][0] : null;
    const logo = logoFile ? `/uploads/${logoFile.filename}` : null;

    // Handle menu images
    const menuImageFiles = req.files && req.files['menuImages'] ? req.files['menuImages'] : [];
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const vendor = await Vendor.create({
      vendorName,
      vendorSlug,
      phone,
      email,
      password_hash: password_hash,
      bankName: bank, // ✅ Fixed: your model expects 'bankName' but frontend sends 'bank'
      accountName,
      accountNumber,
      delivery: !!delivery,
      pickup: !!pickup,
      logo,
      status: 'pending',
      openingHours: openingHours || 'Mon-Fri 8AM–8PM'
    });

    const menuItems = [];
    const itemKeys = Object.keys(req.body).filter(k => k.startsWith('menuName'));
    
    for (let i = 0; i < itemKeys.length; i++) {
      const name = req.body[`menuName${i}`];
      const price = parseFloat(req.body[`menuPrice${i}`]);
      const description = req.body[`menuDescription${i}`];

      if (!name || isNaN(price)) continue;

      // Get image by index
      const imageFile = menuImageFiles[i] || null;
      const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;

      menuItems.push({
        name,
        price,
        description,
        imageUrl,
        vendorName,
        vendorSlug,
        paymentMethod: 'bank'
      });
    }

    await Product.bulkCreate(menuItems);

    const emailResult = await sendEmail({
      to: email,
      subject: `Vendor Application Received - goFoodyyy`,
      html: `
        <h2>Thank You for Your Application, ${vendorName}</h2>
        <p>We have received your vendor application for <strong>${vendorName}</strong>.</p>

        <h3>Application Details:</h3>
        <ul>
          <li><strong>Vendor Name:</strong>${vendorName}</li>
          <li><strong>Vendor Slug:</strong>${vendorSlug}</li>
          <li><strong>Contact Email:</strong>${email}</li>
          <li><strong>Phone:</strong>${phone}</li>
          <li><strong>Status:</strong>Pending Approval</li>
        </ul>

         <p><strong>What happens next?</strong></p>
        <ol>
          <li>Our team will review your application</li>
          <li>You'll receive an email once approved</li>
          <li>Your store will go live at: https://gofoodyyy.netlify.app/vendor/${vendorSlug}</li>
        </ol>

        <p>If you have any questions, please contact us at support@gofoodyyy.com</p>

        <hr/>
        <p><small>This is an automated confirmation. Please do not reply to this email.</small></p>
      `
    });

    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `New Vendor Awaiting Approval: ${vendorName}`,
        html: `
          <h2>New Vendor Application</h2>
          <p><strong>Name:</strong> ${vendorName}</p>
          <p><strong>Slug:</strong> ${vendorSlug}</p>
          <p><strong>Contact:</strong> ${phone} | ${email}</p>
          <p><strong>Status:</strong> Pending</p>
          <p><a href="https://gofoodyyy.netlify.app/admin">Review in Admin Dashboard</a></p>
        `
      });
    }

    res.status(201).json({
      message: 'Vendor submitted! Awaiting approval. Check your email for confirmation.',
      vendorUrl: `/vendor/${vendorSlug}`,
      emailSent: !emailResult.error
    });

  } catch (err) {
    console.error('❌ Failed to onboard vendor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;