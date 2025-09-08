# 🍽️ Canteen Management System

A modern, responsive canteen management web application built with Next.js 15, TypeScript, and Tailwind CSS v4. This system allows students and staff to browse menus, place orders, and manage their canteen experience efficiently.

## 🚀 Technology Stack

Based on the **Lem Plant** web application architecture:

- **Framework**: Next.js 15.4.5 (Latest)
- **React**: 19.1.0 (Latest)
- **TypeScript**: Full TypeScript support
- **Styling**: Tailwind CSS v4 (Latest)
- **Build Tool**: Turbopack (Fast development)
- **Deployment**: Vercel (Recommended)
- **Database**: Supabase (PostgreSQL)

## 📋 Features

### 🏠 **Homepage & Navigation**
- Modern hero section with call-to-action
- Responsive navigation with mobile menu
- User authentication status display
- Quick stats and feature highlights

### 🍽️ **Menu Management**
- Browse menu items by category
- Search functionality
- Detailed item information (ingredients, allergens, nutrition)
- Real-time availability status
- Preparation time estimates

### 🛒 **Shopping Cart**
- Add/remove items with quantity controls
- Persistent cart storage
- Price calculations with tax and fees
- Special instructions support
- Guest and authenticated user support

### 👤 **User Authentication**
- Student and staff account types
- Secure login/signup with validation
- Profile management
- Role-based access control
- Demo credentials for testing

### 💳 **Checkout Process**
- Order summary and validation
- Pickup time selection
- Multiple payment methods
- Order confirmation and tracking
- Special dietary requirements

### 📱 **Mobile Responsive**
- Mobile-first design approach
- Touch-friendly interface
- Responsive grid layouts
- Optimized for all screen sizes

## 🛠️ Local Development Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canteen-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Vercel Deployment Setup

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial canteen management system"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Set Environment Variables**
   In Vercel dashboard → Project Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - Get your live URL: `https://your-app.vercel.app`

## 🗄️ Supabase Database Setup

### Step 1: Create Supabase Project

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create a new project**
   - Choose organization
   - Enter project name: "canteen-management"
   - Set database password
   - Select region (closest to your users)

### Step 2: Database Schema

Create the following tables in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('student', 'staff', 'admin')) NOT NULL,
  student_id VARCHAR,
  department VARCHAR,
  phone VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR NOT NULL,
  type VARCHAR CHECK (type IN ('food', 'beverage', 'snack')) NOT NULL,
  image_url VARCHAR,
  available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 10,
  ingredients TEXT[],
  allergens TEXT[],
  nutritional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status VARCHAR CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')) DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  pickup_time TIMESTAMP WITH TIME ZONE,
  special_instructions TEXT,
  payment_method VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  customizations TEXT[]
);
```

### Step 3: Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 4: Get API Keys

1. **Go to Project Settings → API**
2. **Copy the following:**
   - Project URL
   - Anon (public) key
   - Service role (secret) key

## 🔧 Configuration Files

The project uses the same configuration as Lem Plant:

- **package.json**: Dependencies and scripts
- **tsconfig.json**: TypeScript configuration
- **next.config.ts**: Next.js configuration
- **postcss.config.mjs**: PostCSS with Tailwind
- **eslint.config.mjs**: ESLint configuration

## 🎨 Styling & Theme

- **Primary Color**: Orange (#ff6b35)
- **Secondary Colors**: Blue, Green, Red for status
- **Typography**: Geist Sans & Geist Mono fonts
- **Components**: Custom CSS classes with Tailwind utilities
- **Animations**: CSS keyframes for smooth transitions

## 🧪 Demo Credentials

For testing the application:

- **Admin**: admin@canteen.com / admin123
- **Student**: student@canteen.com / student123

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🔄 Development Workflow

1. **Make changes** to your code
2. **Test locally** with `npm run dev`
3. **Commit changes** to Git
4. **Push to GitHub**
5. **Vercel auto-deploys** from main branch

## 📞 Support & Customization

### Adding New Features
- Menu items: Update `src/app/menu/page.tsx`
- User roles: Modify `src/contexts/AuthContext.tsx`
- Styling: Edit `src/app/globals.css`

### Database Changes
- Update Supabase schema
- Modify TypeScript interfaces
- Update API calls

## 🚀 Production Considerations

- Set up proper authentication with Supabase Auth
- Implement real payment processing
- Add order management dashboard for staff
- Set up email notifications
- Configure monitoring and analytics
- Implement proper error handling and logging

---

**Built with ❤️ using the same technology stack as Lem Plant**
