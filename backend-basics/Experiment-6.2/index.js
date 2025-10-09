require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('./models/User');

const app = express();
app.use(express.json()); // Middleware to parse incoming JSON requests

const PORT = 3000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB!');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});


//  MIDDLEWARE DEFINITION
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; 
    next(); 
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};


app.post('/create-users', async (req, res) => {
  try {
    const hashedVirappanPassword = await bcrypt.hash('password123', 10);
    const hashedVishavPassword = await bcrypt.hash('password456', 10);

    await User.deleteMany({});

    const users = await User.create([
      { username: 'virappan', password: hashedVirappanPassword, name: 'Virappan', balance: 1000 },
      { username: 'vishav', password: hashedVishavPassword, name: 'Vishav', balance: 500 },
    ]);
    res.status(201).json({ message: 'Users created.', users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/balance', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ balance: user.balance });
});

app.post('/deposit', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Deposit amount must be a positive number.' });
  }
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $inc: { balance: amount } },
    { new: true } 
  );
  res.json({ message: `Deposited $${amount}`, newBalance: user.balance });
});

app.post('/withdraw', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Withdrawal amount must be a positive number.' });
  }
  
  const user = await User.findById(req.userId);

  if (user.balance < amount) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  user.balance -= amount;
  await user.save();
  res.json({ message: `Withdrew $${amount}`, newBalance: user.balance });
});

app.post('/transfer', authMiddleware, async (req, res) => {
  const { toUserID, amount } = req.body;
  const fromUserID = req.userId;

  if (fromUserID === toUserID) {
    return res.status(400).json({ message: "Cannot transfer money to yourself." });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Transfer amount must be a positive number." });
  }

  try {
    const sender = await User.findById(fromUserID);
    const receiver = await User.findById(toUserID);

    if (!receiver) {
      return res.status(404).json({ message: "Receiver account not found." });
    }
    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.json({
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}.`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during the transfer." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀`);
});