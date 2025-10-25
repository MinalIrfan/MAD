import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDB } from '../db';
import { Order, OrderItem, Product } from '../models';
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
    const orders = db.collection<Order>('orders');
    const orderItems = db.collection<OrderItem>('order_items');
    const products = db.collection<Product>('products');

    const userOrders = await orders
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await orderItems.find({ orderId: order._id }).toArray();

        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const product = await products.findOne({ _id: item.productId });
            return {
              quantity: item.quantity,
              price: item.price,
              product: product
                ? {
                    title: product.title,
                    image: product.image,
                  }
                : null,
            };
          })
        );

        return {
          id: order._id?.toString(),
          total_amount: order.totalAmount,
          payment_method: order.paymentMethod,
          status: order.status,
          created_at: order.createdAt,
          shipping_address: order.shippingAddress,
          shipping_city: order.shippingCity,
          order_items: itemsWithProducts.filter((item) => item.product !== null),
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {
      totalAmount,
      paymentMethod,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingPostalCode,
      items,
    } = req.body;

    if (
      !totalAmount ||
      !paymentMethod ||
      !shippingAddress ||
      !shippingCity ||
      !shippingCountry ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await getDB();
    const orders = db.collection<Order>('orders');
    const orderItems = db.collection<OrderItem>('order_items');
    const cartItems = db.collection('cart_items');

    const newOrder: Order = {
      userId: new ObjectId(userId),
      totalAmount,
      paymentMethod,
      shippingAddress,
      shippingCity,
      shippingCountry,
      shippingPostalCode,
      status: 'confirmed',
      createdAt: new Date(),
    };

    const orderResult = await orders.insertOne(newOrder);

    const orderItemsData: OrderItem[] = items.map((item: any) => ({
      orderId: orderResult.insertedId,
      productId: new ObjectId(item.productId),
      quantity: item.quantity,
      price: item.price,
      createdAt: new Date(),
    }));

    await orderItems.insertMany(orderItemsData);

    await cartItems.deleteMany({ userId: new ObjectId(userId) });

    res.status(201).json({
      id: orderResult.insertedId.toString(),
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
