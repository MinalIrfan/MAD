import { getDB } from './db';
import { Product } from './models';

const sampleProducts: Omit<Product, '_id'>[] = [
  {
    title: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'electronics',
    rating_rate: 4.8,
    rating_count: 342,
    stock: 45,
    createdAt: new Date(),
  },
  {
    title: 'Leather Crossbody Bag',
    description: 'Elegant leather crossbody bag with multiple compartments. Stylish and practical for everyday use.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
    category: 'fashion',
    rating_rate: 4.6,
    rating_count: 128,
    stock: 78,
    createdAt: new Date(),
  },
  {
    title: 'Minimalist Watch',
    description: 'Sleek minimalist watch with stainless steel band. Timeless design that goes with any outfit.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'accessories',
    rating_rate: 4.7,
    rating_count: 256,
    stock: 32,
    createdAt: new Date(),
  },
  {
    title: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking. Perfect for work and gaming.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
    category: 'electronics',
    rating_rate: 4.5,
    rating_count: 189,
    stock: 120,
    createdAt: new Date(),
  },
  {
    title: 'Cotton T-Shirt',
    description: 'Premium cotton t-shirt with perfect fit. Comfortable and breathable fabric.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    category: 'fashion',
    rating_rate: 4.4,
    rating_count: 412,
    stock: 200,
    createdAt: new Date(),
  },
  {
    title: 'Smart Watch',
    description: 'Advanced smartwatch with fitness tracking, notifications, and customizable watch faces.',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
    category: 'electronics',
    rating_rate: 4.9,
    rating_count: 567,
    stock: 28,
    createdAt: new Date(),
  },
  {
    title: 'Sunglasses',
    description: 'Polarized sunglasses with UV protection. Classic style with modern comfort.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    category: 'accessories',
    rating_rate: 4.3,
    rating_count: 94,
    stock: 65,
    createdAt: new Date(),
  },
  {
    title: 'Running Shoes',
    description: 'Lightweight running shoes with superior cushioning. Perfect for athletes and casual runners.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    category: 'fashion',
    rating_rate: 4.8,
    rating_count: 378,
    stock: 54,
    createdAt: new Date(),
  },
  {
    title: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 360° sound. Water-resistant and long battery life.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    category: 'electronics',
    rating_rate: 4.6,
    rating_count: 223,
    stock: 89,
    createdAt: new Date(),
  },
  {
    title: 'Backpack',
    description: 'Durable backpack with laptop compartment and multiple pockets. Perfect for travel and daily use.',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    category: 'accessories',
    rating_rate: 4.7,
    rating_count: 156,
    stock: 103,
    createdAt: new Date(),
  },
];

async function seedDatabase() {
  try {
    const db = await getDB();
    const products = db.collection<Product>('products');

    const existingProducts = await products.countDocuments();

    if (existingProducts > 0) {
      console.log('Database already seeded. Skipping...');
      return;
    }

    await products.insertMany(sampleProducts as any);
    console.log('Database seeded successfully with', sampleProducts.length, 'products');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
