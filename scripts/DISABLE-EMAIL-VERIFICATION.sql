-- COMPLETELY DISABLE EMAIL VERIFICATION
-- This script permanently disables email verification for all users
-- Run this in your Supabase SQL Editor

-- Step 1: Disable email confirmation globally in auth settings
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_confirmations = false,
  enable_email_confirmations = false
WHERE true;

-- Step 2: Auto-confirm ALL existing users (including unconfirmed ones)
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- Step 3: Create missing user profiles for any auth users without profiles
INSERT INTO users (id, email, name, role, department, phone)
SELECT 
    au.id,
    au.email,
    COALESCE(SPLIT_PART(au.email, '@', 1), 'User') as name,
    'teacher' as role,
    'General' as department,
    '+251 911 000 000' as phone
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify all users are confirmed
SELECT 
    'Auth Users Status' as check_type,
    COUNT(*) as total_users,
    COUNT(email_confirmed_at) as confirmed_users,
    COUNT(*) - COUNT(email_confirmed_at) as unconfirmed_users
FROM auth.users

UNION ALL

SELECT 
    'User Profiles Status' as check_type,
    COUNT(u.*) as total_profiles,
    COUNT(au.email_confirmed_at) as confirmed_profiles,
    COUNT(u.*) - COUNT(au.email_confirmed_at) as unconfirmed_profiles
FROM users u
LEFT JOIN auth.users au ON u.id = au.id;

-- Step 5: Show current auth configuration
SELECT 
    'Email Confirmations' as setting,
    CASE 
        WHEN enable_email_confirmations = true THEN 'ENABLED (BAD)'
        ELSE 'DISABLED (GOOD)'
    END as status
FROM auth.config
WHERE enable_email_confirmations IS NOT NULL

UNION ALL

SELECT 
    'General Confirmations' as setting,
    CASE 
        WHEN enable_confirmations = true THEN 'ENABLED (BAD)'
        ELSE 'DISABLED (GOOD)'
    END as status
FROM auth.config
WHERE enable_confirmations IS NOT NULL;

-- Step 6: Final verification - show any remaining unconfirmed users
SELECT 
    'REMAINING UNCONFIRMED USERS' as warning,
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
