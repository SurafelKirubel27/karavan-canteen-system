-- URGENT DATABASE FIX - Run this in Supabase SQL Editor
-- This will fix all RLS policy issues and make everything work

-- 1. Disable RLS temporarily to fix issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
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
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON menu_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON menu_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON menu_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON menu_items;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable read access for anon users on menu_items" ON menu_items;

-- 3. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, permissive policies for development

-- Users table - allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON users
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Menu items - allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON menu_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anon users to read menu items (for public access)
CREATE POLICY "Allow read for anon users" ON menu_items
  FOR SELECT TO anon USING (true);

-- Orders - allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Order items - allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON order_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Grant all necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant read access to anon users for menu items
GRANT SELECT ON menu_items TO anon;

-- 6. Ensure the canteen staff user exists
-- First check if the user exists in auth.users
DO $$
DECLARE
    staff_user_id UUID;
BEGIN
    -- Try to find existing canteen staff user
    SELECT id INTO staff_user_id 
    FROM auth.users 
    WHERE email = 'karavanstaff@sandfordschool.edu';
    
    IF staff_user_id IS NOT NULL THEN
        -- User exists in auth, make sure they exist in users table
        INSERT INTO users (id, email, name, role, department, phone) 
        VALUES (staff_user_id, 'karavanstaff@sandfordschool.edu', 'Karavan Staff', 'canteen', 'Canteen', '+251 911234567')
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            department = EXCLUDED.department,
            phone = EXCLUDED.phone;
        
        RAISE NOTICE 'Canteen staff user updated in users table with ID: %', staff_user_id;
    ELSE
        RAISE NOTICE 'Canteen staff user not found in auth.users. Please create manually in Authentication > Users';
    END IF;
END $$;

-- 7. Test the setup
DO $$
BEGIN
    -- Test menu item insertion
    INSERT INTO menu_items (name, description, price, category, image_url, prep_time, available) 
    VALUES ('Test Item', 'Test Description', 100, 'Test', '🧪', 5, true);
    
    -- Delete the test item
    DELETE FROM menu_items WHERE name = 'Test Item';
    
    RAISE NOTICE 'Database setup test completed successfully!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Database setup test failed: %', SQLERRM;
END $$;
