const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 1. REGISTER (Naya User Banana) ---
// Route: POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json('Please enter all fields.');
    }
    
    // Check karein ki user pehle se exist karta hai
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json('Email pehle se registered hai.');
    }

    // Password ko Hash (encrypt) karein
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Naya user banayein
    const newUser = new User({
      email,
      password: hashedPassword,
      cart: [] // Shuru mein cart khaali
    });

    const savedUser = await newUser.save();
    res.json({
      msg: "Registration safal raha!",
      userId: savedUser._id
    });

  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});


// --- 2. LOGIN ---
// Route: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json('Please enter all fields.');
    }

    // User ko dhoondein
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json('Email ya password galat hai.');
    }

    // Password check karein
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json('Email ya password galat hai.');
    }

    // --- Token Banayein ---
    // 'process.env.JWT_SECRET' ko humein .env file mein add karna hoga
    const token = jwt.sign(
      { id: user._id, email: user.email }, // Ye data token mein save hoga
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token 1 ghante mein expire ho jayega
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        cart: user.cart // User ka server-side cart bhi bhejein
      }
    });

  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});


module.exports = router;