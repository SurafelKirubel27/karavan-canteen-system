-- Complete database setup for Karavan Canteen Management System
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'canteen', 'admin')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  prep_time INTEGER DEFAULT 10,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_location TEXT NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Canteen staff can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Teachers can create orders" ON orders;
DROP POLICY IF EXISTS "Canteen staff can update orders" ON orders;
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for menu_items table
CREATE POLICY "Anyone can view menu items" ON menu_items 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Canteen staff can manage menu items" ON menu_items 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('canteen', 'admin'))
  );

-- Create RLS policies for orders table
CREATE POLICY "Users can view relevant orders" ON orders 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('canteen', 'admin'))
  );

CREATE POLICY "Teachers can create orders" ON orders 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'teacher')
  );

CREATE POLICY "Canteen staff can update orders" ON orders 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('canteen', 'admin'))
  );

-- Create RLS policies for order_items table
CREATE POLICY "Users can view relevant order items" ON order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('canteen', 'admin')))
    )
  );

CREATE POLICY "Users can create order items" ON order_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, image_url, prep_time, available) VALUES
('Grilled Chicken Breast', 'Tender grilled chicken breast seasoned with Ethiopian herbs and spices', 320, 'Lunch', '🍗', 15, true),
('Caesar Salad', 'Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing', 220, 'Lunch', '🥗', 5, true),
('Ethiopian Pancakes', 'Fluffy pancakes served with honey and fresh fruit', 180, 'Breakfast', '🥞', 8, true),
('Ethiopian Coffee', 'Fresh brewed traditional Ethiopian coffee', 80, 'Drinks', '☕', 3, true),
('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil', 380, 'Dinner', '🍕', 18, true),
('Beef Stir Fry', 'Tender beef strips with mixed vegetables in savory sauce', 350, 'Lunch', '🥩', 12, true),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 60, 'Drinks', '🍊', 2, true),
('Chocolate Cake', 'Rich chocolate cake with chocolate frosting', 150, 'Snacks', '🍰', 5, true),
('Vegetable Soup', 'Hearty vegetable soup with fresh herbs', 120, 'Lunch', '🍲', 10, true),
('Scrambled Eggs', 'Fluffy scrambled eggs with toast and butter', 140, 'Breakfast', '🍳', 6, true);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'KRV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Disable email confirmation for development (optional)
-- You can run this in the Supabase dashboard under Authentication > Settings
-- UPDATE auth.config SET email_confirm = false;
