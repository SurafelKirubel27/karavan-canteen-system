import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection and schema...');

    // Test 1: Check if users table exists by trying to query it
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    let tableInfo = null;
    if (!usersError) {
      console.log('✅ Users table exists and is accessible');
      tableInfo = { exists: true, accessible: true };
    } else {
      console.error('❌ Users table issue:', usersError);
      tableInfo = { exists: false, error: usersError.message };
    }

    console.log('📊 Users table info:', tableInfo);

    // Test 2: Check current users
    if (!usersError && usersData) {
      console.log('👥 Current users count:', usersData.length);
    }

    // Test 3: Check if email_verifications table exists
    const { data: emailVerifications, error: emailVerError } = await supabase
      .from('email_verifications')
      .select('*')
      .limit(1);

    let emailVerTable = null;
    if (!emailVerError) {
      console.log('✅ Email verifications table exists');
      emailVerTable = { exists: true, count: emailVerifications?.length || 0 };
    } else {
      console.error('❌ Email verifications table issue:', emailVerError);
      emailVerTable = { exists: false, error: emailVerError.message };
    }

    // Test 4: Check if email_verified column exists by trying to select it
    const { data: emailVerifiedTest, error: emailVerifiedError } = await supabase
      .from('users')
      .select('email_verified')
      .limit(1);

    let emailVerifiedColumn = null;
    if (!emailVerifiedError) {
      console.log('✅ email_verified column exists');
      emailVerifiedColumn = { exists: true };
    } else {
      console.error('❌ email_verified column missing:', emailVerifiedError);
      emailVerifiedColumn = { exists: false, error: emailVerifiedError.message };
    }

    // Test 5: Try to insert a test user with proper UUID (will rollback)
    const { data: insertTest, error: insertError } = await supabase
      .from('users')
      .insert({
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'teacher',
        department: 'Test Department',
        phone: '+251 911 000 000'
      })
      .select();

    let insertResult = null;
    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
      insertResult = { success: false, error: insertError.message };
    } else {
      console.log('✅ Test insert successful:', insertTest);
      insertResult = { success: true, data: insertTest };
      
      // Clean up test user
      if (insertTest && insertTest[0]?.id) {
        await supabase
          .from('users')
          .delete()
          .eq('id', insertTest[0].id);
        console.log('🧹 Test user cleaned up');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database test completed',
      results: {
        usersTable: tableInfo,
        usersQuery: usersError ? { error: usersError.message } : { success: true, count: usersData?.length || 0 },
        emailVerificationsTable: emailVerTable,
        emailVerifiedColumn: emailVerifiedColumn,
        insertTest: insertResult
      }
    });

  } catch (error) {
    console.error('💥 Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'fix-schema') {
      console.log('🔧 Attempting to fix database schema...');

      // Try to add email_verified column using direct SQL
      try {
        // First check if column exists
        const { data: columnCheck, error: checkError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'users')
          .eq('column_name', 'email_verified');

        if (checkError) {
          console.log('⚠️ Could not check column existence, attempting to add anyway');
        }

        if (!columnCheck || columnCheck.length === 0) {
          console.log('📝 Adding email_verified column...');

          // Use a simple approach - try to select the column, if it fails, we know it doesn't exist
          const { error: testError } = await supabase
            .from('users')
            .select('email_verified')
            .limit(1);

          if (testError && testError.message.includes('column "email_verified" does not exist')) {
            console.log('✅ Confirmed email_verified column does not exist');

            // Since we can't use DDL directly, we'll need to handle this differently
            return NextResponse.json({
              success: false,
              error: 'email_verified column missing',
              message: 'Please run the SQL script manually in Supabase dashboard',
              sqlScript: `
                ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
                UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
                UPDATE users SET email_verified = TRUE WHERE email = 'karavanstaff@sandfordschool.edu';
              `
            });
          } else {
            console.log('✅ email_verified column already exists');
          }
        } else {
          console.log('✅ email_verified column already exists');
        }

        return NextResponse.json({
          success: true,
          message: 'Schema check completed'
        });

      } catch (error) {
        console.error('❌ Schema fix error:', error);
        return NextResponse.json({
          success: false,
          error: 'Schema fix failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });

  } catch (error) {
    console.error('💥 Database fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
