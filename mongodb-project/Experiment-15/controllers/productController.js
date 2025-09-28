const Product = require('../models/Product');

// Controller to CREATE/INSERT a new product
const addProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      variants: req.body.variants
    });
    const newProduct = await product.save();
    res.status(201).send(JSON.stringify(newProduct, null, 2));
  } catch (err) {
    res.status(400).send(JSON.stringify({ message: err.message }, null, 2));
  }
};

// Controller to RETRIEVE ALL products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.send(JSON.stringify(products, null, 2));
  } catch (err) {
    res.status(500).send(JSON.stringify({ message: err.message }, null, 2));
  }
};

// Controller to FILTER products by category
const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryName });
    if (products.length === 0) {
      return res.status(404).send(JSON.stringify({ message: 'No products found in this category' }, null, 2));
    }
    res.send(JSON.stringify(products, null, 2));
  } catch (err) {
    res.status(500).send(JSON.stringify({ message: err.message }, null, 2));
  }
};

// Controller to PROJECT specific variant details by color
const getProductsByColor = async (req, res) => {
  try {
    const requestedColor = req.params.color;
    const products = await Product.find(
      { 'variants.color': requestedColor },
      {
        name: 1,
        price: 1,
        category: 1,
        variants: { $elemMatch: { color: requestedColor } }
      }
    );
    if (products.length === 0) {
      return res.status(404).send(JSON.stringify({ message: 'No products found with this variant color' }, null, 2));
    }
    res.send(JSON.stringify(products, null, 2));
  } catch (err) {
    res.status(500).send(JSON.stringify({ message: err.message }, null, 2));
  }
};

// Export all controller functions
module.exports = {
  addProduct,
  getAllProducts,
  getProductsByCategory,
  getProductsByColor
};
    

