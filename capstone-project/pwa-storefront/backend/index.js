const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // .env file se variables load karne ke liye

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("MongoDB database se connection safal raha!"))
  .catch(err => console.error("MongoDB connection fail hua:", err));
// --------------------------

// --- API Routes ko Register Karein ---
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const cartRouter = require('./routes/cart');
// Jab koi /api/products par jaaye, toh productsRouter ka istemal karo
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);

// ------------------------------------

// Ek basic test route
app.get('/', (req, res) => {
  res.send('Hello! PWA Storefront Backend is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on server http://localhost:${PORT} `);
});