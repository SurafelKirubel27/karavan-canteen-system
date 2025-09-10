-- FIX AUTHENTICATION ISSUE
-- This script fixes the "Failed to load user profile" error
-- Run this in your Supabase SQL Editor

-- Step 1: Check if users table exists and show current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 2: Ensure users table exists with correct structure
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

-- Step 3: Completely disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop any existing policies that might interfere
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON users;

-- Step 5: Grant full permissions to authenticated and anonymous users
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON users TO anon;
GRANT ALL PRIVILEGES ON users TO postgres;

-- Step 6: Check current users in the table
SELECT 
    id,
    email,
    name,
    role,
    department,
    created_at
FROM users
ORDER BY created_at DESC;

-- Step 7: Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Step 8: Show any existing auth users that don't have profiles
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    u.id as profile_exists
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- If you see any auth users without profiles, you can create them manually:
-- INSERT INTO users (id, email, name, role, department, phone)
-- VALUES ('auth-user-id-here', 'email@example.com', 'Full Name', 'teacher', 'Department', '+251 9XX XXX XXX');
