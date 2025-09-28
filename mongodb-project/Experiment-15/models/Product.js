const mongoose = require('mongoose');

// Schema for the nested variant documents (e.g., color, size, stock)
const VariantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0 // Stock cannot be negative
  }
});

// Main product schema that includes the variants array
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  //VariantSchema as an array of nested documents
  variants: [VariantSchema]
});

module.exports = mongoose.model('Product', ProductSchema);

