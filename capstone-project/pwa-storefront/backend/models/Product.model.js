const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  imageUrl: { type: String }, // Product image ka URL
  stock: { type: Number, default: 0 },
}, {
  timestamps: true, // Ye 'createdAt' aur 'updatedAt' fields add karega
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;