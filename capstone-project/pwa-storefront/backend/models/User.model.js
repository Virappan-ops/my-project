const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  
  // User-specific cart
  cart: [
    {
      productId: { type: String },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
      imageUrl: { type: String, required: false } // <-- YEH LINE ADD KARNI THI
    }
  ]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;