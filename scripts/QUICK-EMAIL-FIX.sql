-- QUICK EMAIL VERIFICATION FIX
-- Run this in Supabase SQL Editor to completely disable email verification

-- 1. Auto-confirm ALL existing users
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- 2. Create missing profiles for existing auth users
INSERT INTO users (id, email, name, role, department, phone) VALUES
('ae760c2e-8b41-471e-8bb3-e37e45d3a8ff', 'surafel@sandfordschool.org', 'Surafel', 'teacher', 'General', '+251 911 234 567'),
('ed12334-4b72-49af-b6b8-0c86f6b61621', 'john.smith@sandfordschool.org', 'John Smith', 'teacher', 'General', '+251 911 234 568'),
('a4cc388-eb64-4ca2-8c1e-04bc499e48f5', 'karavanstaff@sandfordschool.edu', 'Karavan Staff', 'canteen', 'Canteen', '+251 911 234 569')
ON CONFLICT (id) DO NOTHING;

-- 3. Verify fix worked
SELECT 
    'VERIFICATION RESULTS' as status,
    COUNT(*) as total_auth_users,
    COUNT(email_confirmed_at) as confirmed_users,
    COUNT(*) - COUNT(email_confirmed_at) as remaining_unconfirmed
FROM auth.users;
