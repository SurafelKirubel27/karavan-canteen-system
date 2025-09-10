-- CREATE MENU ITEMS TABLE FOR CANTEEN MANAGEMENT SYSTEM
-- Run this in your Supabase SQL Editor

-- Step 1: Create menu_items table with all required fields
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    category TEXT NOT NULL CHECK (category IN ('Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Snacks')),
    image_url TEXT NOT NULL DEFAULT '🍽️',
    available BOOLEAN NOT NULL DEFAULT true,
    prep_time INTEGER NOT NULL CHECK (prep_time > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_items_created_at ON menu_items(created_at);

-- Step 3: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Disable RLS for development (enable full access)
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions
GRANT ALL PRIVILEGES ON menu_items TO authenticated;
GRANT ALL PRIVILEGES ON menu_items TO anon;

-- Step 7: Insert sample menu items for testing
INSERT INTO menu_items (name, description, price, category, image_url, prep_time, available) VALUES
('Grilled Chicken', 'Tender grilled chicken breast with herbs and spices', 320.00, 'Lunch', '🍗', 15, true),
('Caesar Salad', 'Fresh romaine lettuce with caesar dressing and croutons', 220.00, 'Lunch', '🥗', 10, true),
('Ethiopian Coffee', 'Traditional Ethiopian coffee served hot', 80.00, 'Drinks', '☕', 5, true),
('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 380.00, 'Dinner', '🍕', 20, true),
('Pasta Carbonara', 'Creamy pasta with bacon and parmesan cheese', 300.00, 'Dinner', '🍝', 18, true),
('Club Sandwich', 'Triple-layer sandwich with chicken, bacon, and vegetables', 250.00, 'Lunch', '🥪', 12, true),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 100.00, 'Drinks', '🍊', 3, true),
('Chocolate Cookies', 'Homemade chocolate chip cookies', 120.00, 'Snacks', '🍪', 5, true),
('Pancakes', 'Fluffy pancakes with syrup and butter', 180.00, 'Breakfast', '🥞', 10, true),
('French Fries', 'Crispy golden french fries', 150.00, 'Snacks', '🍟', 8, true)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Verify table creation and data
SELECT 
    'Menu Items Table Status' as check_type,
    COUNT(*) as total_items,
    COUNT(CASE WHEN available = true THEN 1 END) as available_items,
    COUNT(CASE WHEN available = false THEN 1 END) as unavailable_items
FROM menu_items;

-- Step 9: Show sample data by category
SELECT 
    category,
    COUNT(*) as item_count,
    AVG(price) as avg_price
FROM menu_items 
GROUP BY category 
ORDER BY category;

-- Step 10: Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'menu_items' 
ORDER BY ordinal_position;
