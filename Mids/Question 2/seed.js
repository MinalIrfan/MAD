// Optional: Load environment variables from .env file
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not installed, continue without it
}

const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

// MongoDB connection string - Replace with your MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mani87654321manimani:mani@cluster0.o7ltit.mongodb.net/coffee_shop_db?appName=Cluster0&retryWrites=true&w=majority';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert sample data
    const menuItems = [
      {
        name: 'Espresso',
        category: 'Hot Drinks',
        price: 800.50,
        inStock: true
      },
      {
        name: 'Cappuccino',
        category: 'Hot Drinks',
        price: 550.50,
        inStock: true
      },
      {
        name: 'Iced Coffee',
        category: 'Cold Drinks',
        price: 800.00,
        inStock: true
      },
      {
        name: 'Latte',
        category: 'Hot Drinks',
        price: 900.00,
        inStock: true
      },
      {
        name: 'Croissant',
        category: 'Pastries',
        price: 700.50,
        inStock: true
      },
      {
        name: 'Muffin',
        category: 'Pastries',
        price: 400.00,
        inStock: false
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('Sample menu items inserted successfully');

    await mongoose.connection.close();
    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

