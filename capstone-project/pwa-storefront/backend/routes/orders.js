const router = require('express').Router();
let Order = require('../models/Order.model');
const authMiddleware = require('../middleware/auth'); // 1. Import AuthMiddleware

// --- 1. GET User's Orders ---
// Route: GET /api/orders
// Description: Fetches all orders for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
                             .sort({ createdAt: -1 }); // Newest orders first
    res.json(orders);
  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});


// --- 2. Checkout (Create New Order) ---
// Route: POST /api/orders/checkout
router.post('/checkout', authMiddleware, async (req, res) => { // 2. Add middleware here
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.id; // 3. Get User ID from the token

    if (!items || items.length === 0 || !totalAmount) {
      return res.status(400).json('Cart is empty.');
    }

    const newOrder = new Order({
      userId, // 4. Save the User ID
      items,
      totalAmount,
      status: 'Pending',
    });

    const savedOrder = await newOrder.save();
    res.json({ message: 'Order placed successfully!', orderId: savedOrder._id });

  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;