# ShopHub - MongoDB Setup Guide

This project has been converted from Supabase to MongoDB.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account with connection string
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Connection

The MongoDB connection string is already configured in:
- `server/db.ts` with the connection string: `mongodb+srv://abdulrehmn78976:mani123@cluster0.idv84b5.mongodb.net/`
- Database name: `shophub`

### 3. Seed the Database

First, start the server and seed the database with sample products:

```bash
npm run seed
```

This will populate your MongoDB database with 10 sample products.

### 4. Start the Backend Server

In one terminal, run:

```bash
npm run server
```

The backend API will start on `http://localhost:3001`

### 5. Start the Frontend

In another terminal, run:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Project Structure

```
project/
├── server/                 # Backend Express server
│   ├── db.ts              # MongoDB connection
│   ├── models.ts          # TypeScript interfaces
│   ├── index.ts           # Express server setup
│   ├── seed.ts            # Database seeding script
│   └── routes/            # API routes
│       ├── auth.ts        # Authentication endpoints
│       ├── products.ts    # Products CRUD
│       ├── cart.ts        # Cart management
│       ├── orders.ts      # Order management
│       └── profile.ts     # User profile
├── src/                   # Frontend React app
│   ├── context/           # Auth context
│   ├── lib/               # API client
│   ├── pages/             # React pages
│   └── components/        # React components
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Cart
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `GET /api/cart/count` - Get cart item count

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Features

- User authentication (signup/login)
- Product browsing and search
- Shopping cart management
- Secure checkout process
- Order history
- User profile management
- Responsive design
- Progressive Web App (PWA)

## Database Collections

- `users` - User accounts
- `products` - Product catalog
- `cart_items` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Items in orders

## Environment Variables

The API URL is hardcoded in:
- `src/context/AuthContext.tsx`
- `src/lib/api.ts`

Change `http://localhost:3001/api` to your production API URL when deploying.

## Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## Notes

- JWT authentication with 7-day token expiration
- Passwords hashed with bcrypt
- MongoDB ObjectId used for all IDs
- CORS enabled for frontend-backend communication
- Cart automatically cleared after order placement
