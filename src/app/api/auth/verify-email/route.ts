import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode } = await request.json();

    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Find the verification record
    const { data: verificationRecord, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('verification_code', verificationCode)
      .eq('verified', false)
      .single();

    if (fetchError || !verificationRecord) {
      // Increment attempts for any existing record
      await supabase
        .from('email_verifications')
        .update({ 
          attempts: supabase.rpc('increment_attempts', { email_param: email })
        })
        .eq('email', email);

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(verificationRecord.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Check attempts limit (max 5 attempts)
    if (verificationRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ 
        verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationRecord.id);

    if (updateError) {
      console.error('Update verification error:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      );
    }

    // Update user's email_verified status
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('email', email);

    if (userUpdateError) {
      console.error('User update error:', userUpdateError);
      // Don't fail the request if user update fails
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
