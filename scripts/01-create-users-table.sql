-- STEP 1: CREATE USERS TABLE
-- Run this in your Supabase SQL Editor

-- Create the users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'canteen')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for development (no permission issues)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Test the table creation
INSERT INTO users (id, email, name, role, department, phone) 
VALUES (gen_random_uuid(), 'test@example.com', 'Test User', 'teacher', 'Test Dept', '+251 900000000');

-- Clean up test data
DELETE FROM users WHERE email = 'test@example.com';

-- Success message
SELECT 'Users table created successfully!' as status;
