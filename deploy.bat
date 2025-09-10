@echo off
echo 🚀 Karavan Canteen Management System - Deployment Script
echo ========================================================

echo.
echo ✅ Step 1: Checking environment setup...
if exist .env.local (
    echo ✅ Environment file found
) else (
    echo ❌ Environment file missing
    pause
    exit /b 1
)

echo.
echo ✅ Step 2: Installing dependencies...
call npm install

echo.
echo ✅ Step 3: Building application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Step 4: Initializing Git repository...
git init

echo.
echo ✅ Step 5: Adding all files to Git...
git add .

echo.
echo ✅ Step 6: Creating initial commit...
git commit -m "Production ready: Complete Karavan canteen management system

Features included:
- User authentication and registration
- Teacher and canteen staff interfaces
- Real-time menu management
- Shopping cart and checkout
- Order tracking and history
- PDF report generation
- Ethiopian localization (ETB currency)
- Responsive design
- Complete database integration"

echo.
echo ✅ Deployment preparation complete!
echo.
echo 📋 NEXT STEPS:
echo 1. Create a GitHub repository
echo 2. Add remote origin: git remote add origin https://github.com/yourusername/karavan-canteen.git
echo 3. Push to GitHub: git push -u origin main
echo 4. Connect to Vercel and deploy
echo.
echo 🔑 VERCEL ENVIRONMENT VARIABLES TO ADD:
echo NEXT_PUBLIC_SUPABASE_URL=https://mhqwzsksqozydglfbhvx.supabase.co
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocXd6c2tzcW96eWRnbGZiaHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUzNDIsImV4cCI6MjA3MzAwMTM0Mn0.ZQqCzkPzWws_HMtUKafVVDBDMRms9Y6dVOI9kmaCP8o
echo SUPABASE_SERVICE_ROLE_KEY=[You need to get this from Supabase Settings > API]
echo.
pause
