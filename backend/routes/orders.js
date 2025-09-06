const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');

router.post('/', createOrder); // Create a new order

module.exports = router;