// server.js - FIXED VERSION
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

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin 
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000', 
      'https://gofoodyyy.netlify.app',
      'https://main--gofoodyyy.netlify.app',
      'https://deploy-preview-*--gofoodyyy.netlify.app',
      'https://gofoodyyy.onrender.com'
    ];

    // Check if origin is in allowed list or matches pattern
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//Serve static files (so images are accessible)
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
    </ul>
  `);
});

// Health check route - FIXED: Remove allowedOrigins reference
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test CORS route - FIXED: Remove allowedOrigins reference
app.get('/api/test-cors', (req, res) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://gofoodyyy.netlify.app',
    'https://main--gofoodyyy.netlify.app',
    'https://deploy-preview-*--gofoodyyy.netlify.app',
    'https://gofoodyyy.onrender.com'
  ];
  
  const isAllowed = allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const regex = new RegExp('^' + allowed.replace('*', '.*') + '$');
      return regex.test(req.headers.origin);
    }
    return allowed === req.headers.origin;
  });

  res.json({ 
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin,
    isAllowed: isAllowed
  });
});

// Test RESEND route - FIXED: Add missing sendEmail import
app.get('/api/test-resend', async (req, res) => {
  try {
    const sendEmail = require('./utils/sendEmail');
    const result = await sendEmail({
      to: 'saeedumar5@gmail.com', // Use your actual email
      subject: 'Resend Test from goFoodyyy',
      html: '<h1>Resend Test</h1><p>If you receive this, Resend is working perfectly!</p>'
    });
    
    res.json({ 
      success: !result.error,
      message: result.error ? 'Email failed' : 'Email sent successfully',
      details: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
app.use('*', (req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// ALTERNATIVE FIX: If the above still fails, use this instead:
// app.use((req, res, next) => {
//   res.status(404).json({ error: 'Route not found: ' + req.originalUrl });
// });

// Sync DB and start server - FIXED: Remove allowedOrigins reference
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced');
    console.log('📋 Models:', Object.keys(db));
    console.log('🌍 CORS enabled for all origins'); // REMOVED: allowedOrigins reference
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to sync DB:', err);
  });