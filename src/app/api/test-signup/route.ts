import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing signup process...');

    const { email, password, userData } = await request.json();
    
    console.log('📝 Test signup data:', { email, userData });

    // Test the same signup process as AuthContext
    console.log('🔐 Creating auth user...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('❌ Supabase auth signup error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    if (data.user) {
      console.log('✅ Auth user created successfully:', data.user.id);

      // Create user profile in our users table
      console.log('👤 Creating user profile...');
      
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          name: userData.name,
          role: userData.role,
          department: userData.department || 'General',
          phone: userData.phone || '+251 911 000 000',
          email_verified: true
        });

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        
        // Check if it's a duplicate key error
        if (profileError.code === '23505' || profileError.message.includes('duplicate')) {
          console.log('⚠️ User already exists, updating verification status...');
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ email_verified: true })
            .eq('email', email);
            
          if (updateError) {
            console.error('❌ Failed to update existing user:', updateError);
            return NextResponse.json({
              success: false,
              error: 'User exists but verification update failed'
            }, { status: 400 });
          }
          
          console.log('✅ Existing user verification updated');
          return NextResponse.json({ success: true, message: 'User updated' });
        }
        
        return NextResponse.json({
          success: false,
          error: `Profile creation failed: ${profileError.message}`
        }, { status: 400 });
      }

      console.log('✅ User profile created successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'User created successfully',
        userId: data.user.id
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create user account'
    }, { status: 400 });

  } catch (error) {
    console.error('💥 Test signup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test signup endpoint. Use POST to test signup process.',
    usage: {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        userData: {
          name: 'Test User',
          role: 'teacher',
          department: 'Test Department',
          phone: '+251 911 000 000'
        }
      }
    }
  });
}
