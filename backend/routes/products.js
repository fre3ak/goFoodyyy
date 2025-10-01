// routes/products.js
const express = require('express');
const db = require('../models');
const Product = db.Product;
const Vendor = db.Vendor;

const router = express.Router();

// Import controller functions
const { getAllProducts, createProduct, getProductById } = require('../controllers/productController');

// ✅ Single source of truth for GET /api/products
router.get('/', getAllProducts);

// Get product by ID
router.get('/:id', getProductById);

// Create new product
router.post('/', createProduct);

// Optional: Clean vendor-specific endpoint (can be removed if using ?vendorSlug)
// You can keep it for SEO-friendly URLs like /api/products/vendor/meals-by-zubs
router.get('/vendor/:vendorSlug', async (req, res) => {
  try {
    const { vendorSlug } = req.params;

    const vendor = await Vendor.findOne({
      where: { vendorSlug, status: 'approved' }
    });

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found or pending approval'
      });
    }

    const products = await Product.findAll({ where: { vendorSlug } });
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Failed to fetch vendor products',
      error: err.message
    });
  }
});

// Update product by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      description,
      imageUrl,
      vendorName,
      vendorSlug,
      paymentMethod
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({
      name,
      price,
      description,
      imageUrl,
      vendorName,
      vendorSlug,
      paymentMethod
    });

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({
      message: 'Failed to update product',
      error: err.message
    });
  }
});

module.exports = router;