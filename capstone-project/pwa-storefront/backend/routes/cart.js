const router = require('express').Router();
const User = require('../models/User.model');
const authMiddleware = require('../middleware/auth');

// --- 1. Get User's Cart ---
// Route: GET /api/cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.cart);
  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});

// --- 2. Add/Update item in Cart --- (YAHAN SE NAYA CODE)
// Route: POST /api/cart/add
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, name, price, quantity } = req.body;
    const user = await User.findById(req.user.id);
    
    // Check karein ki item pehle se cart mein hai
    const existingItemIndex = user.cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      // Agar hai, toh quantity update karein
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Agar nahi hai, toh naya item add karein
      user.cart.push({ productId, name, price, quantity });
    }
    
    await user.save();
    res.json(user.cart); // Poora updated cart wapas bhejein

  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});


// --- 3. Remove item from Cart ---
// Route: DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    // Item ko cart se filter karke hata dein
    user.cart = user.cart.filter(item => item.productId !== productId);
    
    await user.save();
    res.json(user.cart); // Poora updated cart wapas bhejein

  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});


// Note: /api/cart/update route (jo humne pehle banaya tha) ki ab zarurat nahi hai.
// Lekin use rakhein, woh "sync" ke liye kaam aa sakta hai.
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { cart } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { cart: cart } },
      { new: true }
    );
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});


module.exports = router;