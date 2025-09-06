// routes/products.js
const express = require('express');
const router = express.Router();

// Import from productController.js, not index.js
const { getAllProducts, createProduct, getProductById } = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);

module.exports = router;