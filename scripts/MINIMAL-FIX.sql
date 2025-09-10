-- MINIMAL AUTHENTICATION FIX FOR KARAVAN CANTEEN SYSTEM
-- This script only fixes what we can safely change
-- Run this in your Supabase SQL Editor

-- Step 1: Only update email_confirmed_at (avoid confirmed_at)
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Step 2: Ensure users table exists with proper structure
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'canteen', 'admin')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable RLS and create permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON users;

-- Create simple policy for all operations
CREATE POLICY "Enable all operations for authenticated users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 4: Create missing user profiles for existing auth users
INSERT INTO users (id, email, name, role, department, phone)
SELECT 
    au.id,
    au.email,
    COALESCE(SPLIT_PART(au.email, '@', 1), 'User') as name,
    CASE 
      WHEN au.email = 'karavanstaff@sandfordschool.edu' THEN 'canteen'
      ELSE 'teacher'
    END as role,
    'General' as department,
    '+251 911 000 000' as phone
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 5: Verification
SELECT 
    'USERS TABLE STATUS' as check_type,
    COUNT(*) as total_profiles
FROM users;

SELECT '✅ MINIMAL FIX COMPLETE!' as result;
