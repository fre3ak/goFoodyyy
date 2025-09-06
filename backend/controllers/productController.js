// controllers/productController.js
const db = require('../models');
const Product = db.Product;

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Failed to fetch products', 
      error: err.message 
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, imageUrl, vendorName, paymentMethod } = req.body;

    if (!name || !price || !vendorName) {
      return res.status(400).json({ 
        message: 'Name, price, and vendorName are required' 
      });
    }

    const product = await Product.create({
      name,
      price,
      description,
      imageUrl,
      vendorName,
      paymentMethod: paymentMethod || 'bank'
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ 
      message: 'Failed to create product', 
      error: err.message 
    });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};