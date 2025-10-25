-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  category TEXT,
  rating_rate DECIMAL(2, 1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Cart policies
CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT,
  shipping_country TEXT,
  shipping_postal_code TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Function to update profile timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample products
INSERT INTO public.products (title, description, price, image, category, rating_rate, rating_count, stock) VALUES
('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.', 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'electronics', 4.8, 342, 45),
('Leather Crossbody Bag', 'Elegant leather crossbody bag with multiple compartments. Stylish and practical for everyday use.', 89.99, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', 'fashion', 4.6, 128, 78),
('Minimalist Watch', 'Sleek minimalist watch with stainless steel band. Timeless design that goes with any outfit.', 149.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'accessories', 4.7, 256, 32),
('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking. Perfect for work and gaming.', 49.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', 'electronics', 4.5, 189, 120),
('Cotton T-Shirt', 'Premium cotton t-shirt with perfect fit. Comfortable and breathable fabric.', 29.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'fashion', 4.4, 412, 200),
('Smart Watch', 'Advanced smartwatch with fitness tracking, notifications, and customizable watch faces.', 399.99, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', 'electronics', 4.9, 567, 28),
('Sunglasses', 'Polarized sunglasses with UV protection. Classic style with modern comfort.', 79.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 'accessories', 4.3, 94, 65),
('Running Shoes', 'Lightweight running shoes with superior cushioning. Perfect for athletes and casual runners.', 129.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'fashion', 4.8, 378, 54),
('Bluetooth Speaker', 'Portable Bluetooth speaker with 360° sound. Water-resistant and long battery life.', 89.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 'electronics', 4.6, 223, 89),
('Backpack', 'Durable backpack with laptop compartment and multiple pockets. Perfect for travel and daily use.', 69.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'accessories', 4.7, 156, 103);