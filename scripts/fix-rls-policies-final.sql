-- Fix RLS policies to allow proper operations
-- Run this in your Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Canteen staff can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can view relevant orders" ON orders;
DROP POLICY IF EXISTS "Teachers can create orders" ON orders;
DROP POLICY IF EXISTS "Canteen staff can update orders" ON orders;
DROP POLICY IF EXISTS "Users can view relevant order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

-- Create more permissive policies for development

-- Users table policies
CREATE POLICY "Enable read access for authenticated users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for users based on id" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Menu items policies  
CREATE POLICY "Enable read access for all users" ON menu_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON menu_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON menu_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON menu_items
  FOR DELETE TO authenticated USING (true);

-- Orders policies
CREATE POLICY "Enable read access for authenticated users" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON orders
  FOR UPDATE TO authenticated USING (true);

-- Order items policies
CREATE POLICY "Enable read access for authenticated users" ON order_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON order_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON order_items
  FOR UPDATE TO authenticated USING (true);

-- Grant additional permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Also allow anon users to read menu items (for public viewing)
CREATE POLICY "Enable read access for anon users on menu_items" ON menu_items
  FOR SELECT TO anon USING (true);
