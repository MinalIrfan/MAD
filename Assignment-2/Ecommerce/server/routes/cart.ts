import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDB } from '../db';
import { CartItem, Product } from '../models';
import { ObjectId } from 'mongodb';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticate = (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await getDB();
    const cartItems = db.collection<CartItem>('cart_items');
    const products = db.collection<Product>('products');

    const items = await cartItems.find({ userId: new ObjectId(userId) }).toArray();

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await products.findOne({ _id: item.productId });
        return {
          id: item._id?.toString(),
          quantity: item.quantity,
          product: product
            ? {
                id: product._id?.toString(),
                title: product.title,
                price: product.price,
                image: product.image,
              }
            : null,
        };
      })
    );

    res.json(itemsWithProducts.filter((item) => item.product !== null));
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const db = await getDB();
    const cartItems = db.collection<CartItem>('cart_items');

    const existingItem = await cartItems.findOne({
      userId: new ObjectId(userId),
      productId: new ObjectId(productId),
    });

    if (existingItem) {
      await cartItems.updateOne(
        { _id: existingItem._id },
        { $set: { quantity: existingItem.quantity + quantity } }
      );

      res.json({ message: 'Cart updated' });
    } else {
      const newItem: CartItem = {
        userId: new ObjectId(userId),
        productId: new ObjectId(productId),
        quantity,
        createdAt: new Date(),
      };

      await cartItems.insertOne(newItem);
      res.status(201).json({ message: 'Item added to cart' });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid cart item ID' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const db = await getDB();
    const cartItems = db.collection<CartItem>('cart_items');

    const result = await cartItems.updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { $set: { quantity } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Quantity updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid cart item ID' });
    }

    const db = await getDB();
    const cartItems = db.collection<CartItem>('cart_items');

    const result = await cartItems.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/count', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const db = await getDB();
    const cartItems = db.collection<CartItem>('cart_items');

    const items = await cartItems.find({ userId: new ObjectId(userId) }).toArray();
    const total = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ count: total });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
