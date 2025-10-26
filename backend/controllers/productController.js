// controllers/productController.js
import db from '../models/index.js';
const { Product, Vendor } = db;

// Get all products
// controllers/productController.js
export async function getAllProducts(req, res) {
  const { vendorSlug } = req.query;

  try {
    // If filtering by vendorSlug, first check if vendor exists and is approved
    if (vendorSlug) {
      const vendor = await Vendor.findOne({
        where: { vendorSlug, status: 'approved' }
      });

      if (!vendor) {
        return res.status(404).json({
          error: 'Vendor not found or pending approval'
        });
      }

      const products = await Product.findAll({ where: { vendorSlug } });
      return res.status(200).json(products);
    }

    // Otherwise, return all products
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      error: 'Failed to fetch products'
    });
  }
}

export async function createProduct(req, res) {
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
}

// Get a single product by ID
export async function getProductById(req, res) {
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
}