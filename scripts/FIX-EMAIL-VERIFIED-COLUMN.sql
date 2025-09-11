-- FIX EMAIL VERIFIED COLUMN
-- This script adds the missing email_verified column to the users table
-- Run this in your Supabase SQL Editor

-- Step 1: Add email_verified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added email_verified column to users table';
    ELSE
        RAISE NOTICE 'email_verified column already exists';
    END IF;
END $$;

-- Step 2: Update existing users to have email_verified = false by default
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;

-- Step 3: Set canteen staff as verified if they exist
UPDATE users SET email_verified = TRUE WHERE email = 'karavanstaff@sandfordschool.edu';

-- Step 4: Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'email_verified';

-- Step 5: Show current users and their verification status
SELECT id, email, name, role, email_verified FROM users;

-- Success message
SELECT 'email_verified column added successfully!' as status;
