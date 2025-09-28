const express = require('express');
const router = express.Router();

// Import the controller that contains the logic
const productController = require('../controllers/productController');

router.post('/add', productController.addProduct);

router.get('/', productController.getAllProducts);

router.get('/category/:categoryName', productController.getProductsByCategory);

router.get('/by-color/:color', productController.getProductsByColor);

module.exports = router;

