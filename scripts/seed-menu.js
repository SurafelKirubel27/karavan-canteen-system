// Script to seed the database with sample menu items
// Run this with: node scripts/seed-menu.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleMenuItems = [
  {
    name: "Grilled Chicken Breast",
    description: "Tender grilled chicken breast seasoned with Ethiopian herbs and spices",
    price: 320,
    category: "Lunch",
    image_url: "🍗",
    prep_time: 15,
    available: true
  },
  {
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing",
    price: 220,
    category: "Lunch",
    image_url: "🥗",
    prep_time: 5,
    available: true
  },
  {
    name: "Ethiopian Pancakes",
    description: "Fluffy pancakes served with honey and fresh fruit",
    price: 180,
    category: "Breakfast",
    image_url: "🥞",
    prep_time: 8,
    available: true
  },
  {
    name: "Ethiopian Coffee",
    description: "Fresh brewed traditional Ethiopian coffee",
    price: 80,
    category: "Drinks",
    image_url: "☕",
    prep_time: 3,
    available: true
  },
  {
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil",
    price: 380,
    category: "Dinner",
    image_url: "🍕",
    prep_time: 18,
    available: true
  },
  {
    name: "Beef Stir Fry",
    description: "Tender beef strips with mixed vegetables in savory sauce",
    price: 350,
    category: "Lunch",
    image_url: "🥩",
    prep_time: 12,
    available: true
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 60,
    category: "Drinks",
    image_url: "🍊",
    prep_time: 2,
    available: true
  },
  {
    name: "Chocolate Cake",
    description: "Rich chocolate cake with chocolate frosting",
    price: 150,
    category: "Snacks",
    image_url: "🍰",
    prep_time: 5,
    available: true
  },
  {
    name: "Vegetable Soup",
    description: "Hearty vegetable soup with fresh herbs",
    price: 120,
    category: "Lunch",
    image_url: "🍲",
    prep_time: 10,
    available: true
  },
  {
    name: "Scrambled Eggs",
    description: "Fluffy scrambled eggs with toast and butter",
    price: 140,
    category: "Breakfast",
    image_url: "🍳",
    prep_time: 6,
    available: true
  }
];

async function seedMenuItems() {
  try {
    console.log('Starting to seed menu items...');
    
    // Insert sample menu items
    const { data, error } = await supabase
      .from('menu_items')
      .insert(sampleMenuItems)
      .select();

    if (error) {
      console.error('Error inserting menu items:', error);
      return;
    }

    console.log(`Successfully inserted ${data.length} menu items:`);
    data.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - ${item.price} ETB`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedMenuItems();
