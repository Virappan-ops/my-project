const router = require('express').Router();
let Order = require('../models/Order.model');
const authMiddleware = require('../middleware/auth'); // <-- 1. AuthMiddleware import karein

// --- 1. GET User's Orders --- (YAHAN NAYA ROUTE)
// Route: GET /api/orders
// Description: Logged-in user ke saare orders fetch karta hai
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
                             .sort({ createdAt: -1 }); // Naye order sabse upar
    res.json(orders);
  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});


// --- 2. Checkout (Create New Order) ---
// Route: POST /api/orders/checkout
router.post('/checkout', authMiddleware, async (req, res) => { // <-- 2. Middleware yahan add karein
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.id; // <-- 3. User ID ko token se lein

    if (!items || items.length === 0 || !totalAmount) {
      return res.status(400).json('Cart khaali hai.');
    }

    const newOrder = new Order({
      userId, // <-- 4. User ID ko save karein
      items,
      totalAmount,
      status: 'Pending', // Hum ise baad mein 'Successful' kar sakte hain
    });

    const savedOrder = await newOrder.save();
    res.json({ message: 'Order safaltapurvak place ho gaya!', orderId: savedOrder._id });

  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;