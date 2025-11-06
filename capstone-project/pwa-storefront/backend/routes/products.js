const router = require('express').Router();
let Product = require('../models/Product.model'); // Product model ko import karein

// Route 1: GET /api/products
// Sabhi products ko fetch karta hai
router.route('/').get((req, res) => {
  Product.find() // MongoDB se sabhi products dhoondho
    .then(products => res.json(products)) // Unhein JSON format mein wapas bhejo
    .catch(err => res.status(400).json('Error: ' + err));
});

// Route 2: POST /api/products/add
// Naya product add karne ke liye (testing ke liye)
router.route('/add').post((req, res) => {
  const { name, description, price, category, imageUrl, stock } = req.body;

  const newProduct = new Product({
    name,
    description,
    price,
    category,
    imageUrl,
    stock
  });

  newProduct.save() // Naye product ko database mein save karo
    .then(() => res.json('Product safaltapurvak add ho gaya!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;