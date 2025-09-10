-- FIXED USERS TABLE CREATION
-- This removes the problematic test insert

-- Step 1: Create the users table
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

-- Step 2: Disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- Step 4: Create updated_at trigger
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

-- Success message (no test insert)
SELECT 'Users table created successfully!' as status;
