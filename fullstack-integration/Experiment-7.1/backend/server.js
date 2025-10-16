const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Using port 5001

// Use CORS middleware to allow requests from the frontend
app.use(cors());

// The product data
const products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 45 },
];

// The API endpoint to get the products
app.get('/api/products', (req, res) => {
  console.log(`Request received for products on port ${PORT}.`);
  res.json(products);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});