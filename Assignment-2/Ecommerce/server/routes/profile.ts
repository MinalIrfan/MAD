import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getDB } from '../db';
import { User } from '../models';
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
    const users = db.collection<User>('users');

    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id?.toString(),
      full_name: user.fullName,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || '',
      postal_code: user.postalCode || '',
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { full_name, email, phone, address, city, country, postal_code } = req.body;

    const db = await getDB();
    const users = db.collection<User>('users');

    const updateData: Partial<User> = {
      fullName: full_name,
      phone,
      address,
      city,
      country,
      postalCode: postal_code,
      updatedAt: new Date(),
    };

    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
