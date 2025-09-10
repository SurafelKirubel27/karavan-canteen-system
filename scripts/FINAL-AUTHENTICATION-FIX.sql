-- FINAL AUTHENTICATION FIX FOR KARAVAN CANTEEN SYSTEM
-- This script completely fixes all authentication and signup issues
-- Run this in your Supabase SQL Editor

-- Step 1: Disable email confirmation globally
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_confirmations = false,
  enable_email_confirmations = false
WHERE true;

-- Step 2: Auto-confirm ALL existing users
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- Step 3: Ensure users table exists with proper structure
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

-- Step 4: Enable RLS but create permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON users;

-- Create new permissive policies
CREATE POLICY "Enable all operations for authenticated users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 5: Create missing user profiles for existing auth users
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

-- Step 6: Create the canteen staff user if it doesn't exist
DO $$
DECLARE
    canteen_user_id UUID;
BEGIN
    -- Check if canteen staff auth user exists
    SELECT id INTO canteen_user_id 
    FROM auth.users 
    WHERE email = 'karavanstaff@sandfordschool.edu';
    
    -- If not exists, create it
    IF canteen_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'karavanstaff@sandfordschool.edu',
            crypt('KaravanStaff123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}'
        ) RETURNING id INTO canteen_user_id;
        
        -- Create profile for canteen staff
        INSERT INTO users (id, email, name, role, department, phone)
        VALUES (
            canteen_user_id,
            'karavanstaff@sandfordschool.edu',
            'Karavan Staff',
            'canteen',
            'Canteen Management',
            '+251 911 000 001'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Verification queries
SELECT 
    'AUTHENTICATION STATUS' as check_type,
    COUNT(*) as total_auth_users,
    COUNT(email_confirmed_at) as confirmed_users,
    COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users;

SELECT 
    'USER PROFILES STATUS' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
    COUNT(CASE WHEN role = 'canteen' THEN 1 END) as canteen_staff
FROM users;

SELECT 
    'CANTEEN STAFF CHECK' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM users WHERE email = 'karavanstaff@sandfordschool.edu' AND role = 'canteen'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Final message
SELECT '✅ AUTHENTICATION FIX COMPLETE! New users can now sign up without email verification.' as result;
