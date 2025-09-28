const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const dbURI = 'mongodb://localhost:27017/ecommerceDB'; // Database name is ecommerceDB

mongoose.connect(dbURI).then(() => {
  console.log('Successfully connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

const productRoutes = require('./routes/products');
app.use('/products', productRoutes); // All product routes will start with /products

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

