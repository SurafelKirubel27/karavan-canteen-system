-- CREATE COMPLETE ORDER MANAGEMENT SYSTEM
-- Run this in your Supabase SQL Editor

-- Step 1: Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    service_fee DECIMAL(10,2) NOT NULL DEFAULT 25.00,
    delivery_location TEXT NOT NULL,
    special_instructions TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile')) DEFAULT 'cash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_ready_time TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
    item_name TEXT NOT NULL,
    item_description TEXT,
    item_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Step 4: Create updated_at trigger for orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    -- Generate order number like KRV-20241209-001
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'KRV-[0-9]{8}-([0-9]{3})') AS INTEGER)), 0) + 1
    INTO counter
    FROM orders 
    WHERE order_number LIKE 'KRV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
    
    order_num := 'KRV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to calculate estimated ready time
CREATE OR REPLACE FUNCTION calculate_estimated_ready_time(order_id_param UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    max_prep_time INTEGER;
    estimated_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the maximum prep time from all items in the order
    SELECT COALESCE(MAX(mi.prep_time), 15)
    INTO max_prep_time
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE oi.order_id = order_id_param;
    
    -- Add 5 minutes buffer and calculate estimated time
    estimated_time := NOW() + INTERVAL '1 minute' * (max_prep_time + 5);
    
    RETURN estimated_time;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to auto-calculate estimated ready time
CREATE OR REPLACE FUNCTION set_estimated_ready_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
        NEW.estimated_ready_time := calculate_estimated_ready_time(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_estimated_ready_time ON orders;
CREATE TRIGGER trigger_set_estimated_ready_time
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_estimated_ready_time();

-- Step 8: Disable RLS for development
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Step 9: Grant permissions
GRANT ALL PRIVILEGES ON orders TO authenticated;
GRANT ALL PRIVILEGES ON orders TO anon;
GRANT ALL PRIVILEGES ON order_items TO authenticated;
GRANT ALL PRIVILEGES ON order_items TO anon;

-- Step 10: Insert sample orders for testing
DO $$
DECLARE
    sample_user_id UUID;
    sample_order_id UUID;
    sample_menu_item_id UUID;
BEGIN
    -- Get a sample user (first teacher)
    SELECT id INTO sample_user_id FROM users WHERE role = 'teacher' LIMIT 1;
    
    -- Get a sample menu item
    SELECT id INTO sample_menu_item_id FROM menu_items WHERE available = true LIMIT 1;
    
    IF sample_user_id IS NOT NULL AND sample_menu_item_id IS NOT NULL THEN
        -- Create sample order
        INSERT INTO orders (user_id, order_number, status, total_amount, delivery_location, special_instructions)
        VALUES (sample_user_id, generate_order_number(), 'pending', 345.00, 'Main Building - Room 101', 'Please deliver during lunch break')
        RETURNING id INTO sample_order_id;
        
        -- Create sample order items
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, total_price, item_name, item_description, item_image_url)
        SELECT 
            sample_order_id,
            id,
            2,
            price,
            price * 2,
            name,
            description,
            image_url
        FROM menu_items 
        WHERE available = true 
        LIMIT 3;
    END IF;
END $$;

-- Step 11: Verification queries
SELECT 'ORDERS TABLE' as table_name, COUNT(*) as record_count FROM orders;
SELECT 'ORDER_ITEMS TABLE' as table_name, COUNT(*) as record_count FROM order_items;

-- Show sample data
SELECT 
    o.order_number,
    o.status,
    o.total_amount,
    o.delivery_location,
    u.name as customer_name,
    COUNT(oi.id) as item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.total_amount, o.delivery_location, u.name
ORDER BY o.created_at DESC;
