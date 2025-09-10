# Karavan - Canteen Management System

A modern, full-stack canteen management system built for Sandford School. This application allows teachers to order food and canteen staff to manage orders and menu items.

## 🚀 Features

### For Teachers
- **User Registration & Authentication** - Secure signup and login with Supabase
- **Browse Menu** - View available food items with prices and descriptions
- **Place Orders** - Add items to cart and place orders with delivery location
- **Order History** - Track current and past orders
- **Real-time Updates** - Get notified when order status changes

### For Canteen Staff
- **Dashboard** - Overview of daily orders and revenue
- **Order Management** - View and process incoming orders
- **Menu Management** - Add, edit, and delete menu items with real database operations
- **Real-time Monitoring** - Live updates on order status

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canteen-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup** ⚠️ **IMPORTANT**
   
   **Step 1: Run the main database setup**
   - Go to your Supabase dashboard → SQL Editor
   - Copy and paste the entire content from `scripts/setup-database.sql`
   - Click "Run" to execute the script
   
   **Step 2: Create canteen staff user**
   - In Supabase dashboard → Authentication → Users
   - Click "Add user"
   - Email: `karavanstaff@sandfordschool.edu`
   - Password: `KaravanStaff123`
   - Email Confirm: Check this box
   - Click "Create user"
   - Copy the generated User ID
   
   **Step 3: Add canteen staff to users table**
   - Go back to SQL Editor
   - Replace `YOUR_USER_ID_HERE` in `scripts/create-canteen-staff.sql` with the actual User ID
   - Run the modified SQL script

5. **Disable Email Confirmation (Optional for Development)**
   - Go to Authentication → Settings in Supabase
   - Turn off "Enable email confirmations"
   - This allows teachers to sign up without email verification

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Open [http://localhost:3001](http://localhost:3001)
   - Choose your role: Teacher or Canteen Staff

## 👥 User Credentials

### Canteen Staff
- **Email**: karavanstaff@sandfordschool.edu
- **Password**: KaravanStaff123

### Teachers
- Sign up with any email address (no restrictions)
- All teacher accounts are stored in the database

## 🗄️ Database Schema

The application uses the following main tables:
- `users` - User profiles linked to Supabase auth
- `menu_items` - Food items with prices, categories, and availability
- `orders` - Customer orders with status tracking and order numbers
- `order_items` - Individual items within orders with quantities

### Key Features:
- **Row Level Security (RLS)** - Proper access control
- **Auto-generated Order Numbers** - Format: KRV-YYYY-0001
- **Real-time Updates** - Changes reflect immediately
- **Data Validation** - Proper constraints and checks

## 🎨 Design Features

- **Modern UI** - Clean, responsive design inspired by delivery apps
- **Ethiopian Localization** - Uses Ethiopian Birr (ETB) currency
- **Color Scheme** - Green and light beige theme
- **Mobile Responsive** - Works on all device sizes
- **Animated Cart** - Smooth slide-over cart experience

## 🔐 Security

- Row Level Security (RLS) policies for all tables
- JWT-based authentication via Supabase
- Role-based access control (teacher, canteen, admin)
- Secure API endpoints with proper authorization

## 📱 Usage

### For Teachers:
1. Visit the welcome page at `/welcome`
2. Choose "I'm a Teacher"
3. Sign up with any email or log in
4. Browse menu and add items to cart
5. Place order with delivery location
6. Track order status in real-time

### For Canteen Staff:
1. Visit the welcome page at `/welcome`
2. Choose "I'm Canteen Staff"
3. Log in with: karavanstaff@sandfordschool.edu / KaravanStaff123
4. View incoming orders in real-time
5. Add/edit/delete menu items
6. Update order status (pending → preparing → ready → completed)

## 🔧 Troubleshooting

### Common Issues:

1. **"Profile creation failed" error during signup**
   - Make sure you ran the database setup script completely
   - Check that RLS policies are properly configured
   - Verify Supabase connection in `.env.local`

2. **Menu items not loading**
   - Ensure the sample menu items were inserted via the setup script
   - Check browser console for any API errors

3. **Orders not appearing**
   - Verify the orders table exists and has proper RLS policies
   - Check that the user is properly authenticated

4. **Can't access canteen dashboard**
   - Make sure the canteen staff user was created in both auth.users and users tables
   - Verify the credentials are exactly: karavanstaff@sandfordschool.edu / KaravanStaff123

## 🚀 Deployment

The application is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📞 Support

For technical support or questions about the system, please contact the development team.

---

**Built with ❤️ for Sandford School**
