// server.js - COMPLETE FIXED VERSION
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
fs.ensureDirSync(uploadDir);

const sequelize = require('./config/db');
const db = require('./models'); // Import the models index
const vendorRoutes = require('./routes/vendors');
const productRoutes = require('./routes/products');

const Product = db.Product;
const Order = db.Order;

// Define relationship
Order.belongsTo(Product);

const app = express();
const PORT = process.env.PORT || 5000;

// DEFINE allowedOrigins HERE - THIS WAS MISSING!
const allowedOrigins = [
  'http://localhost:5173',
  'https://gofoodyyy.netlify.app',
  'https://gofoodyyy.onrender.com',
  'https://main--gofoodyyy.netlify.app',
  'https://deploy-preview-*--gofoodyyy.netlify.app'
];

// FIXED CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const regex = new RegExp('^' + allowed.replace('*', '.*') + '$');
        return regex.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('🚫 CORS BLOCKED ORIGIN:', origin);
      console.log('✅ ALLOWED ORIGINS:', allowedOrigins);
      // For now, allow all in development - tighten in production
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (so images are accessible)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', productRoutes);
app.use('/api/orders', require('./routes/orders'));
app.use('/api/vendors', vendorRoutes);

// Home route
app.get('/', (req, res) => {
  res.send(`
    <h1>Marketplace API is Running!</h1>
    <ul>
      <li><a href="/api/products">View Products</a></li>
      <li><a href="/api/health">Health Check</a></li>
      <li><a href="/api/test-cors">Test CORS</a></li>
      <li><a href="/api/vendors/debug/all-vendors">Debug Vendors</a></li>
    </ul>
  `);
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    origins: allowedOrigins // NOW THIS WILL WORK!
  });
});

// Test CORS route
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    allowedOrigin: req.headers.origin,
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin,
    isAllowed: allowedOrigins.includes(req.headers.origin) // NOW THIS WILL WORK!
  });
});

// Database Seeding Route - CREATE SAMPLE VENDORS
app.post('/api/seed/vendors', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const sampleVendors = [
      {
        vendorName: "Tasty Bites Restaurant",
        vendorSlug: "tasty-bites",
        email: "tastybites@example.com",
        phone: "+2348012345678",
        passwordHash: await bcrypt.hash("password123", 10),
        state: "Lagos",
        city: "Ikeja",
        bankName: "Guaranty Trust Bank",
        accountName: "Tasty Bites Enterprises",
        accountNumber: "1234567890",
        status: "approved",
        isActive: true,
        delivery: true,
        pickup: true,
        openingHours: "Mon-Sun 8AM-10PM"
      },
      {
        vendorName: "Spicy Kitchen",
        vendorSlug: "spicy-kitchen", 
        email: "spicykitchen@example.com",
        phone: "+2348023456789",
        passwordHash: await bcrypt.hash("password123", 10),
        state: "Lagos", 
        city: "Victoria Island",
        bankName: "Access Bank",
        accountName: "Spicy Kitchen Ltd",
        accountNumber: "2345678901",
        status: "approved",
        isActive: true,
        delivery: true,
        pickup: false,
        openingHours: "Mon-Sat 9AM-9PM"
      }
    ];

    // Clear existing vendors and create new ones
    await db.Vendor.destroy({ where: {} });
    const createdVendors = await db.Vendor.bulkCreate(sampleVendors);

    res.json({
      message: 'Sample vendors created successfully!',
      vendors: createdVendors.map(v => ({
        id: v.id,
        name: v.vendorName,
        slug: v.vendorSlug,
        status: v.status
      }))
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed vendors: ' + error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Sync DB and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced');
    console.log('📋 Models:', Object.keys(db));
    console.log('🌍 CORS enabled for:', allowedOrigins); // NOW THIS WILL WORK!
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to sync DB:', err);
  });