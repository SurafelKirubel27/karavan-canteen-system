// Script to create sample users for testing
// Run this with: node scripts/create-sample-users.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleUsers = [
  {
    email: 'teacher@sandford.edu',
    password: 'teacher123',
    name: 'John Smith',
    role: 'teacher',
    department: 'Mathematics',
    phone: '+251 911234567'
  },
  {
    email: 'canteen@sandford.edu', 
    password: 'canteen123',
    name: 'Sarah Johnson',
    role: 'canteen',
    department: 'Canteen Staff',
    phone: '+251 911234568'
  },
  {
    email: 'admin@sandford.edu',
    password: 'admin123', 
    name: 'Mike Wilson',
    role: 'admin',
    department: 'Administration',
    phone: '+251 911234569'
  }
];

async function createSampleUsers() {
  try {
    console.log('Creating sample users...');
    
    for (const userData of sampleUsers) {
      console.log(`Creating user: ${userData.email}`);
      
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error(`Error creating auth user ${userData.email}:`, authError);
        continue;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            department: userData.department,
            phone: userData.phone
          });

        if (profileError) {
          console.error(`Error creating profile for ${userData.email}:`, profileError);
        } else {
          console.log(`✓ Successfully created user: ${userData.email} (${userData.role})`);
        }
      }
    }

    console.log('\nSample users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Teacher: teacher@sandford.edu / teacher123');
    console.log('Canteen Staff: canteen@sandford.edu / canteen123');
    console.log('Admin: admin@sandford.edu / admin123');

  } catch (error) {
    console.error('Error creating sample users:', error);
  }
}

createSampleUsers();
