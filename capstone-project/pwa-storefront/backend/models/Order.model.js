const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Ye define karega ki har order ke andar product kaisa dikhega
const orderItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  imageUrl: { type: String, required: false },
}, { _id: false }); // Har item ki alag se _id nahi chahiye

const orderSchema = new Schema({
  userId: { type: String, required: true },
  items: [orderItemSchema], // Products ki array
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' }, // Order ka status
  // Hum yahan user details (name, address) bhi save kar sakte hain
  // Abhi simple rakhte hain.
}, {
  timestamps: true, // createdAt aur updatedAt
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;