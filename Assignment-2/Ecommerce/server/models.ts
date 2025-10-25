import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: ObjectId;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating_rate: number;
  rating_count: number;
  stock: number;
  createdAt: Date;
}

export interface CartItem {
  _id?: ObjectId;
  userId: ObjectId;
  productId: ObjectId;
  quantity: number;
  createdAt: Date;
}

export interface Order {
  _id?: ObjectId;
  userId: ObjectId;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  status: string;
  createdAt: Date;
}

export interface OrderItem {
  _id?: ObjectId;
  orderId: ObjectId;
  productId: ObjectId;
  quantity: number;
  price: number;
  createdAt: Date;
}
