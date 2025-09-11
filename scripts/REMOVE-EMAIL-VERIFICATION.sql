-- REMOVE EMAIL VERIFICATION SYSTEM FROM KARAVAN CANTEEN
-- This script completely removes all email verification related database schema
-- Run this in your Supabase SQL Editor

-- Step 1: Drop email_verifications table completely
DROP TABLE IF EXISTS email_verifications CASCADE;

-- Step 2: Drop email verification functions
DROP FUNCTION IF EXISTS cleanup_expired_verification_codes() CASCADE;
DROP FUNCTION IF EXISTS generate_verification_code() CASCADE;

-- Step 3: Remove email_verified column from users table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users DROP COLUMN email_verified;
        RAISE NOTICE 'Removed email_verified column from users table';
    ELSE
        RAISE NOTICE 'email_verified column does not exist';
    END IF;
END $$;

-- Step 4: Ensure users table has clean structure (no email verification)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'canteen')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

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

-- Step 8: Verification - show clean table structure
SELECT 
    'USERS TABLE STRUCTURE (NO EMAIL VERIFICATION)' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Step 9: Show current users
SELECT 
    'CURRENT USERS' as info,
    COUNT(*) as total_users
FROM users;

-- Step 10: Verify email_verifications table is gone
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_verifications')
        THEN 'ERROR: email_verifications table still exists'
        ELSE 'SUCCESS: email_verifications table removed'
    END as verification_table_status;

-- Step 11: Verify email_verified column is gone
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified')
        THEN 'ERROR: email_verified column still exists'
        ELSE 'SUCCESS: email_verified column removed'
    END as email_verified_column_status;

SELECT '✅ EMAIL VERIFICATION SYSTEM COMPLETELY REMOVED!' as result;
