-- Step 2: Disable RLS and grant permissions
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;
