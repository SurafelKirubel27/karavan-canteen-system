# 🚀 Canteen Management System - Deployment Guide

Complete step-by-step instructions for deploying the Canteen Management System using Vercel and Supabase.

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Supabase account (free)
- Node.js 18+ installed locally

## 🗄️ Step 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up/Login** with GitHub
4. **Create New Project**:
   - Organization: Select or create
   - Name: `canteen-management`
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to your users
   - Pricing Plan: Free tier is sufficient

### 1.2 Database Schema Setup

1. **Go to SQL Editor** in Supabase dashboard
2. **Create a new query**
3. **Copy and paste this schema**:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('student', 'staff', 'admin')) NOT NULL DEFAULT 'student',
  student_id VARCHAR,
  department VARCHAR,
  phone VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu categories table
CREATE TABLE menu_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES menu_categories(id),
  type VARCHAR CHECK (type IN ('food', 'beverage', 'snack')) NOT NULL,
  image_url VARCHAR,
  available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 10,
  ingredients TEXT[],
  allergens TEXT[],
  nutritional_info JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number VARCHAR UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  status VARCHAR CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE,
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  special_instructions TEXT,
  payment_method VARCHAR,
  payment_status VARCHAR CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  customizations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history table
CREATE TABLE order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. **Click "Run"** to execute the schema

### 1.3 Insert Sample Data

```sql
-- Insert sample menu categories
INSERT INTO menu_categories (name, description, display_order) VALUES
('Main Course', 'Hearty meals and main dishes', 1),
('Salads', 'Fresh and healthy salad options', 2),
('Beverages', 'Drinks and refreshments', 3),
('Desserts', 'Sweet treats and desserts', 4),
('Snacks', 'Quick bites and snacks', 5);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category_id, type, available, preparation_time, ingredients, allergens, nutritional_info) VALUES
('Grilled Chicken Sandwich', 'Tender grilled chicken breast with fresh lettuce, tomatoes, and mayo on whole grain bread', 8.99, 1, 'food', true, 10, ARRAY['Chicken breast', 'Whole grain bread', 'Lettuce', 'Tomatoes', 'Mayo'], ARRAY['Gluten', 'Eggs'], '{"calories": 420, "protein": 35, "carbs": 28, "fat": 18}'),
('Caesar Salad', 'Fresh romaine lettuce with parmesan cheese, croutons, and caesar dressing', 6.99, 2, 'food', true, 5, ARRAY['Romaine lettuce', 'Parmesan cheese', 'Croutons', 'Caesar dressing'], ARRAY['Dairy', 'Gluten'], '{"calories": 280, "protein": 12, "carbs": 15, "fat": 22}'),
('Fresh Orange Juice', 'Freshly squeezed orange juice, 100% natural with no added sugar', 3.99, 3, 'beverage', true, 2, ARRAY['Fresh oranges'], ARRAY[], '{"calories": 110, "protein": 2, "carbs": 26, "fat": 0}'),
('Chocolate Chip Cookies', 'Warm, freshly baked chocolate chip cookies (pack of 3)', 4.99, 4, 'snack', true, 3, ARRAY['Flour', 'Chocolate chips', 'Butter', 'Sugar', 'Eggs'], ARRAY['Gluten', 'Dairy', 'Eggs'], '{"calories": 380, "protein": 5, "carbs": 48, "fat": 19}');

-- Insert sample admin user
INSERT INTO users (email, name, role, created_at) VALUES
('admin@canteen.com', 'Admin User', 'admin', NOW()),
('student@canteen.com', 'John Doe', 'student', NOW());
```

### 1.4 Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Public read access for menu items and categories
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Policies for orders table
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Policies for order items
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Public read policies for menu
CREATE POLICY "Anyone can read menu categories" ON menu_categories
  FOR SELECT USING (active = true);

CREATE POLICY "Anyone can read menu items" ON menu_items
  FOR SELECT USING (true);
```

### 1.5 Get API Keys

1. **Go to Settings → API** in Supabase dashboard
2. **Copy these values** (you'll need them later):
   - Project URL
   - Anon (public) key  
   - Service role key (keep this secret!)

## 🌐 Step 2: Vercel Deployment

### 2.1 Prepare Repository

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial canteen management system"
   git branch -M main
   git remote add origin https://github.com/yourusername/canteen-management.git
   git push -u origin main
   ```

### 2.2 Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Import your repository**:
   - Select your GitHub account
   - Find "canteen-management" repository
   - Click "Import"

### 2.3 Configure Project Settings

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (default)
3. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

### 2.4 Environment Variables

**Click "Environment Variables" and add these**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=Canteen Management System
```

**Replace with your actual Supabase values from Step 1.5**

### 2.5 Deploy

1. **Click "Deploy"**
2. **Wait for build** (usually 2-3 minutes)
3. **Get your live URL**: `https://your-app.vercel.app`

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Update Supabase Settings

1. **Go to Supabase → Authentication → URL Configuration**
2. **Add your Vercel URL** to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

### 3.2 Test Your Deployment

1. **Visit your live URL**
2. **Test login with demo credentials**:
   - Admin: admin@canteen.com / admin123
   - Student: student@canteen.com / student123
3. **Test menu browsing and cart functionality**
4. **Place a test order**

## 🔄 Step 4: Continuous Deployment

### 4.1 Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys!
```

### 4.2 Preview Deployments

- Every pull request gets a preview URL
- Test changes before merging
- Share with team for review

## 🛠️ Step 5: Optional Enhancements

### 5.1 Custom Domain

1. **Buy a domain** (e.g., from Namecheap, GoDaddy)
2. **In Vercel → Project → Settings → Domains**
3. **Add your domain**
4. **Update DNS records** as instructed

### 5.2 Analytics

1. **Vercel Analytics**: Enable in project settings
2. **Google Analytics**: Add tracking code
3. **Supabase Analytics**: Monitor database usage

### 5.3 Monitoring

1. **Vercel Functions**: Monitor serverless functions
2. **Supabase Logs**: Check database queries
3. **Error Tracking**: Set up Sentry or similar

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (use 18+)
   - Verify all dependencies in package.json
   - Check TypeScript errors

2. **Environment Variables**:
   - Ensure all required vars are set
   - Check for typos in variable names
   - Restart deployment after changes

3. **Database Connection**:
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure tables exist

4. **Authentication Issues**:
   - Check Supabase Auth settings
   - Verify redirect URLs
   - Test with demo credentials

### Getting Help

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Sample data inserted
- [ ] RLS policies configured
- [ ] API keys copied
- [ ] GitHub repository created
- [ ] Vercel project deployed
- [ ] Environment variables set
- [ ] Live URL working
- [ ] Authentication tested
- [ ] Demo credentials working
- [ ] Menu browsing functional
- [ ] Cart and checkout working

**🎉 Congratulations! Your Canteen Management System is now live!**
