// Optional: Load environment variables from .env file
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, continue without it
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const MenuItem = require('./models/MenuItem');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string - Replace with your MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mani87654321manimani:mani@cluster0.o7ltit.mongodb.net/coffee_shop_db?appName=Cluster0&retryWrites=true&w=majority';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message || '[no response]');
  });

// GET /menu - return all menu items
app.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({});
    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
      message: error.message
    });
  }
});

// GET /menu/random - return one random item where inStock = true
app.get('/menu/random', async (req, res) => {
  try {
    const availableItems = await MenuItem.find({ inStock: true });
    
    if (availableItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No items in stock'
      });
    }

    // Get random item
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const randomItem = availableItems[randomIndex];

    res.json({
      success: true,
      data: randomItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random menu item',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Coffee shop server running on port ${PORT}`);
});

