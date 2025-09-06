// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const db = require('./models'); // Import the models index
const Product = db.Product;
const Order = db.Order;

// Define relationship
Order.belongsTo(Product);

const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// Sync DB and start server
sequelize.sync({ force: false })
  .then(() => {
    console.log('✅ Database synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to sync DB:', err);
  });