import { Router, Request, Response } from 'express';
import { getDB } from '../db';
import { Product } from '../models';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDB();
    const products = db.collection<Product>('products');

    const productList = await products.find({}).sort({ createdAt: -1 }).toArray();

    res.json(
      productList.map((p) => ({
        id: p._id?.toString(),
        title: p.title,
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category,
        rating_rate: p.rating_rate,
        rating_count: p.rating_count,
        stock: p.stock,
        created_at: p.createdAt,
      }))
    );
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const db = await getDB();
    const products = db.collection<Product>('products');

    const product = await products.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      id: product._id?.toString(),
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      rating_rate: product.rating_rate,
      rating_count: product.rating_count,
      stock: product.stock,
      created_at: product.createdAt,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
