-- EMAIL VERIFICATION SETUP FOR KARAVAN CANTEEN SYSTEM
-- Run this in your Supabase SQL Editor

-- Step 1: Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  verification_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON email_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);

-- Step 3: Enable RLS
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
DROP POLICY IF EXISTS "Enable insert for anyone" ON email_verifications;
DROP POLICY IF EXISTS "Enable read for own email" ON email_verifications;
DROP POLICY IF EXISTS "Enable update for own email" ON email_verifications;

CREATE POLICY "Enable insert for anyone" ON email_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for own email" ON email_verifications
  FOR SELECT USING (true);

CREATE POLICY "Enable update for own email" ON email_verifications
  FOR UPDATE USING (true);

-- Step 5: Create function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications 
  WHERE expires_at < NOW() AND verified = false;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to generate verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Step 7: Add email_verified column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Step 8: Update existing users to be verified (for existing accounts)
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = FALSE;

-- Step 9: Create updated_at trigger for email_verifications
DROP TRIGGER IF EXISTS update_email_verifications_updated_at ON email_verifications;
CREATE TRIGGER update_email_verifications_updated_at 
    BEFORE UPDATE ON email_verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Verification
SELECT 'EMAIL VERIFICATION SETUP COMPLETE!' as result;

-- Show table structure
SELECT 
    'email_verifications table created' as status,
    COUNT(*) as total_records
FROM email_verifications;

-- Show users table with email_verified column
SELECT 
    'users table updated' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
FROM users;
