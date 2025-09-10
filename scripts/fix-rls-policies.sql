-- Fix Row Level Security policies to allow user profile creation

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create new policies that allow profile creation during signup
CREATE POLICY "Users can view their own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can create their own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, department, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.orders TO anon, authenticated;
GRANT ALL ON public.order_items TO anon, authenticated;
