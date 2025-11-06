const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Har email unique hona chahiye
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  // Aap yahan aur bhi fields add kar sakte hain, jaise 'username', 'phone', etc.
  
  // User-specific cart ke liye
  // Hum user ke cart ko bhi database mein save karenge
  cart: [
    {
      productId: { type: String },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number }
    }
  ]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;