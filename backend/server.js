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
const Product = db.Product;
const Order = db.Order;

// Define relationship
Order.belongsTo(Product);

const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'https//:gofoodyyy.netlify.app',
  'https//:gofoodyyy.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

//Serve static files (so images are accessible)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.get('/', (req, res) => {
  res.send(`
    <h1>Marketplace API is Running!</h1>
    <ul>
      <li><a href="/api/products">View Products</a></li>
    </ul>
  `);
});

app.use('/api/products', productRoutes);
app.use('/api/orders', require('./routes/orders'));
app.use('/api/vendors', vendorRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test CORS route
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    allowedOrigin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Sync DB and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced');
    console.log('📋 Models:', Object.keys(db));
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to sync DB:', err);
  });
