// server.js
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

const allowedOrigins = [
  'http://localhost:5173',
  'https://gofoodyyy.netlify.app',
  'https://gofoodyyy.onrender.com'
];

// Simplified Cors
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requsted-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//Serve static files (so images are accessible)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', require('./routes/orders'));
app.use('/api/vendors', vendorRoutes);

// Home route
app.get('/', (req, res) => {
  res.send(`
    <h1>Marketplace API is Running!</h1>
    <ul>
      <li><a href="/api/products">View Products</a></li>
      <li><a href="/api/health"Health Check</a></li>
      <li><a href="/api/test-cors">Test CORS</a></li>
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
    origins: allowedOrigins
  });
});

// Test CORS route
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    allowedOrigin: req.headers.origin,
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin,
    isAllowed: allowedOrigins.includes(req.headers.origin)
  });
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
// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// Sync DB and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced');
    console.log('📋 Models:', Object.keys(db));
    console.log('🌍 CORS enabled for:', allowedOrigins);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to sync DB:', err);
  });
