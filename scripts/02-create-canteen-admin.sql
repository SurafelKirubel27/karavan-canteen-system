-- STEP 2: CREATE CANTEEN ADMIN USER
-- Run this AFTER creating the users table

-- This will create the canteen admin user in the users table
-- You need to create the auth user manually first

-- Instructions:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user"
-- 3. Email: karavanstaff@sandfordschool.edu
-- 4. Password: KaravanStaff123
-- 5. Check "Auto Confirm User"
-- 6. Click "Create user"
-- 7. Copy the User ID that appears
-- 8. Replace 'YOUR_USER_ID_HERE' below with the actual ID
-- 9. Run this SQL

INSERT INTO users (id, email, name, role, department, phone) VALUES
('YOUR_USER_ID_HERE', 'karavanstaff@sandfordschool.edu', 'Karavan Staff', 'canteen', 'Canteen', '+251 911234567');

-- Verify the user was created
SELECT * FROM users WHERE email = 'karavanstaff@sandfordschool.edu';
