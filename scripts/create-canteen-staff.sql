-- Create canteen staff user
-- Run this in your Supabase SQL editor after setting up the database

-- First, you need to create the auth user manually in Supabase Dashboard:
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Add user"
-- 3. Email: karavanstaff@sandfordschool.edu
-- 4. Password: KaravanStaff123
-- 5. Email Confirm: true (or disable email confirmation in settings)
-- 6. Copy the generated user ID

-- Then run this SQL with the actual user ID:
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from the auth.users table

INSERT INTO users (id, email, name, role, department, phone) VALUES
('4d34052e-be8c-42ee-a022-01c9acafad26', 'karavanstaff@sandfordschool.edu', 'Karavan Staff', 'canteen', 'Canteen', '+251 911234567');

-- Alternative: If you want to find the user ID automatically, run this:
-- SELECT id FROM auth.users WHERE email = 'karavanstaff@sandfordschool.edu';
-- Then use that ID in the INSERT statement above
