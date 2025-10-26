import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { where } from 'sequelize';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin Signup
router.post('/admin/signup', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check if admin already exists
    const existingAdmin = await db.Admin.findOne({ where: { email } });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin
    const newAdmin = await db.Admin.create({
      email, 
      passwordHash, 
      name
    });

    // Generate token
    const token = jwt.sign(
      {
        id: newAdmin.id,
        email: newAdmin.email,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ message: 'Server error during admin signup' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = await db.Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Vendor Login
router.post('/vendor/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find vendor by email
    const vendor = await db.Vendor.findOne({ where: { email } });

    if (!vendor) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if vendor is approved
    if (vendor.status !== 'approved') {
      return res.status(400).json({ message: 'Vendor account not approved yet' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, vendor.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: vendor.id,
        email: vendor.email,
        vendorSlug: vendor.vendorSlug,
        role: 'vendor'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      vendor: {
        id: vendor.id,
        vendorSlug: vendor.vendorSlug,
        vendorName: vendor.vendorName,
        email: vendor.email,
        phone: vendor.phone,
        state: vendor.state,
        city: vendor.city,
        status: vendor.status
      }
    });

  } catch (error) {
    console.error('Vendor login error', error);
    res.status(500).json({ message: 'Server error during vendor login' });
  }
});

// Vendor Signup (enhanced onboarding)
router.post('/vendor/signup', async (req, res) => {
  const {
    vendorName,
    vendorSlug,
    email,
    password,
    phone,
    state,
    city,
    address,
    logo,
    bankName,
    accountName
  } = req.body;

  try {
    // Check if vendor already exists
    const existingVendor = await db.Vendor.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email }, { vendorName }, { vendorSlug }]
      }
    });

    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor already exists with this email, name, or slug' });
    }

    // Generate vendor slug
    // const vendorSlug = vendorName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create vendor
    const newVendor = await db.Vendor.create({
      vendorName,
      vendorSlug,
      email,
      passwordHash,
      phone,
      state,
      city,
      address,
      logoUrl: logo,
      bankName,
      accountName,
      status: 'pending'
    });

     res.status(201).json({
       message: 'Vendor registered successfully. Waiting for admin approval.',
       vendor: {
         id: newVendor.id,
         vendorSlug: newVendor.vendorSlug,
         vendorName: newVendor.vendorName,
         email: newVendor.email,
         phone: newVendor.phone,
         state: newVendor.state,
         city: newVendor.city,
         status: newVendor.status
       }
     });

  } catch (error) {
    console.error('Vendor signup error:', error);
    res.status(500).json({ message: 'Server error during vendor registration'});
  }
});

// Verify token endpoint
router.get('/verify', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;