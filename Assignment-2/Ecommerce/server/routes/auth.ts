import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../db';
import { User } from '../models';
import { ObjectId } from 'mongodb';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await getDB();
    const users = db.collection<User>('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      email,
      password: hashedPassword,
      fullName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    const token = jwt.sign({ userId: result.insertedId.toString() }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        fullName: newUser.fullName,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDB();
    const users = db.collection<User>('users');

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id?.toString() }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        id: user._id?.toString(),
        email: user.email,
        fullName: user.fullName,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/user', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = await getDB();
    const users = db.collection<User>('users');

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id?.toString(),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
      city: user.city,
      country: user.country,
      postalCode: user.postalCode,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
