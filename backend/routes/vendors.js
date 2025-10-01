// backend/routes/vendors.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const db = require('../models'); // ✅ Fixed import
const Vendor = db.Vendor;        // ✅ Get from db object
const Product = db.Product;      // ✅ Get from db object
const sendEmail = require('../utils/sendEmail');

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

// Return only approved vendors
// router.get('/', async (req, res) => {
//   try {
//     const vendors = await Vendor.findAll({
//       where: { status: 'approved' }
//     });
//     res.status(200).json(vendors);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

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

// Route to get only approved vendors
// router.get('/', async (req, res) => {
//   try {
//     const vendors = await Vendor.findAll({
//       where: { status: 'approved' } // Only show approved vendors
//     });
//     res.status(200).json(vendors);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error'});
//   }
// });

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

//Admin approval route
router.put('/:vendorSlug/approve', async (req, res) => {
  try {
    const { vendorSlug } = req.params;
    const vendor = await Vendor.findOne({ where: { vendorSlug } });

    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    vendor.status = 'approved';
    await vendor.save();

    // Send approval email to vendor
    await sendEmail({
      to: vendor.email,
      subject: `🎉 Your Vendor Account Has Been Approved! - goFoodyyy`,
      html: `
        <h2>Congratulations, ${vendor.vendorName}!</h2>
        <p>Your vendor account has been approved and is now live on goFoodyyy.</p>
        <p>Customers can now view your store at: <strong>http://localhost:5173/vendor/${vendor.vendorSlug}</strong></p>
        <p><strong>Store Details:</strong></p>
        <ul>
          <li>Store Name: ${vendor.vendorName}</li>
          <li>Store URL: http://localhost:5173/vendor/${vendor.vendorSlug}</li>
          <li>Contact: ${vendor.phone}</li>
          <li>Email: ${vendor.email}</li>
        </ul>
        <p>Start receiving orders today!</p>
        <p>If you have any questions, contact us at support@gofoodyyy.com</p>
    `
  });

    res.json({ message: 'Vendor approved successfully', vendor });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Server error'});
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

    const vendor = await Vendor.create({
      vendorName,
      vendorSlug,
      phone,
      email,
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

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Vendor Awaiting Approval: ${vendorName}`,
      html: `
        <h2>New Vendor Application</h2>
        <p><strong>Name:</strong> ${vendorName}</p>
        <p><strong>Slug:</strong> ${vendorSlug}</p>
        <p><strong>Contact:</strong> ${phone} | ${email}</p>
        <p><strong>Status:</strong> Pending</p>
        <p><a href="http://localhost:5173/admin">Review in Admin Dashboard</a></p>
      `
    });

    res.status(201).json({
      message: 'Vendor submitted! Awaiting approval.',
      vendorUrl: `/vendor/${vendorSlug}`
    });

  } catch (err) {
    console.error('❌ Failed to onboard vendor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;