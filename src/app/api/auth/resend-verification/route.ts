import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if there's a recent verification request (rate limiting)
    const { data: recentRequest } = await supabase
      .from('email_verifications')
      .select('created_at')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentRequest) {
      const timeSinceLastRequest = Date.now() - new Date(recentRequest.created_at).getTime();
      const oneMinute = 60 * 1000;
      
      if (timeSinceLastRequest < oneMinute) {
        return NextResponse.json(
          { error: 'Please wait at least 1 minute before requesting a new code' },
          { status: 429 }
        );
      }
    }

    // Get user name for the email
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('email', email)
      .single();

    const userName = userData?.name || 'User';

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Delete any existing verification codes for this email
    await supabase
      .from('email_verifications')
      .delete()
      .eq('email', email);

    // Store new verification code in database
    const { error: dbError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        verification_code: verificationCode,
        expires_at: expiresAt,
        verified: false,
        attempts: 0
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store verification code' },
        { status: 500 }
      );
    }

    // Send verification email
    const emailResult = await sendVerificationEmail({
      email,
      verificationCode,
      userName
    });

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'New verification code sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
