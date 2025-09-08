# 🚀 IntelliJ Terminal Setup Guide

## Quick Start Commands

### 1. Initial Setup (First Time Only)
```bash
# Install dependencies
npm install

# Create environment file
copy .env.example .env.local

# Start development server
npm run dev
```

### 2. Daily Development
```bash
# Start the development server
npm run dev

# In a new terminal tab (Ctrl+Shift+T), you can run:
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Check code quality
```

## 🌐 Access Your Application

- **Local Development**: http://localhost:3000
- **Network Access**: http://172.20.10.2:3000 (accessible from other devices on your network)

## 🧪 Demo Credentials

Test the application with these accounts:

- **Admin User**: 
  - Email: `admin@canteen.com`
  - Password: `admin123`

- **Student User**:
  - Email: `student@canteen.com` 
  - Password: `student123`

## 📁 IntelliJ Terminal Commands

### Project Management
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# View package.json scripts
npm run

# Install new dependency
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Update dependencies
npm update
```

### Development Workflow
```bash
# Start development (with Turbopack for faster builds)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix
```

### Git Commands (if needed)
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/yourusername/canteen-management.git

# Push to GitHub
git push -u origin main
```

## 🔧 Environment Variables

Edit `.env.local` file for configuration:

```env
# Supabase Configuration (when ready for database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Canteen Management System"
```

## 🛠️ IntelliJ IDEA Integration

### Recommended Plugins
1. **Tailwind CSS IntelliSense** - Auto-completion for Tailwind classes
2. **TypeScript Importer** - Auto-import TypeScript modules
3. **Prettier** - Code formatting
4. **ESLint** - Code linting

### IntelliJ Settings
1. **File → Settings → Languages & Frameworks → TypeScript**
   - Enable TypeScript service
   - Use TypeScript from node_modules

2. **File → Settings → Languages & Frameworks → JavaScript → Prettier**
   - Enable Prettier
   - Set config path to `.prettierrc` (if you create one)

3. **File → Settings → Tools → File Watchers**
   - Add TypeScript watcher for auto-compilation

## 📱 Testing the Application

### 1. Homepage Features
- ✅ Responsive navigation
- ✅ Hero section with call-to-action
- ✅ Feature highlights
- ✅ Mobile hamburger menu

### 2. Menu System
- ✅ Browse menu items
- ✅ Search functionality
- ✅ Category filtering
- ✅ Add items to cart

### 3. Shopping Cart
- ✅ View cart items
- ✅ Update quantities
- ✅ Remove items
- ✅ Price calculations

### 4. Authentication
- ✅ Login with demo credentials
- ✅ Signup form
- ✅ User profile display

### 5. Checkout Process
- ✅ Order summary
- ✅ Pickup time selection
- ✅ Payment method selection
- ✅ Order confirmation

## 🚨 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   # Or use different port
   npm run dev -- -p 3001
   ```

2. **Module not found errors**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Delete node_modules and reinstall
   rmdir /s node_modules
   npm install
   ```

3. **TypeScript errors**
   ```bash
   # Check TypeScript compilation
   npx tsc --noEmit
   ```

4. **Tailwind CSS not working**
   ```bash
   # Restart development server
   # Press Ctrl+C to stop, then npm run dev again
   ```

## 🔄 Development Workflow

### Making Changes
1. **Edit files** in IntelliJ IDEA
2. **Save changes** (Ctrl+S)
3. **View updates** automatically in browser (hot reload)
4. **Check terminal** for any errors

### Adding New Features
1. **Create new components** in `src/components/`
2. **Add new pages** in `src/app/`
3. **Update contexts** in `src/contexts/`
4. **Test changes** in browser

### Code Quality
```bash
# Run linting
npm run lint

# Check TypeScript
npx tsc --noEmit

# Format code (if Prettier is set up)
npx prettier --write .
```

## 📊 Performance Monitoring

### Development Metrics
- **Turbopack** provides fast hot reloads
- **Next.js** shows compilation times in terminal
- **Browser DevTools** for runtime performance

### Build Analysis
```bash
# Analyze bundle size
npm run build
# Check .next/static/ folder for bundle sizes
```

## 🎯 Next Steps

1. **Customize the design** to match your requirements
2. **Add more menu items** in the menu data
3. **Integrate with Supabase** for real database
4. **Deploy to Vercel** for production
5. **Add more features** as needed

## 📞 Quick Help

- **Stop server**: Press `Ctrl+C` in terminal
- **Restart server**: `npm run dev`
- **New terminal tab**: `Ctrl+Shift+T`
- **Clear terminal**: `cls` (Windows) or `clear` (Mac/Linux)

**🎉 Your Canteen Management System is now running at http://localhost:3000!**
