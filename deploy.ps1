Write-Host "🚀 Karavan Canteen Management System - Deployment Script" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Step 1: Checking environment setup..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "❌ Environment file missing" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "✅ Step 3: Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check the errors above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ Step 4: Initializing Git repository..." -ForegroundColor Yellow
git init

Write-Host ""
Write-Host "✅ Step 5: Adding all files to Git..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "✅ Step 6: Creating initial commit..." -ForegroundColor Yellow
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

Write-Host ""
Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Create a GitHub repository" -ForegroundColor White
Write-Host "2. Add remote origin: git remote add origin https://github.com/yourusername/karavan-canteen.git" -ForegroundColor White
Write-Host "3. Push to GitHub: git push -u origin main" -ForegroundColor White
Write-Host "4. Connect to Vercel and deploy" -ForegroundColor White
Write-Host ""
Write-Host "🔑 VERCEL ENVIRONMENT VARIABLES TO ADD:" -ForegroundColor Cyan
Write-Host "NEXT_PUBLIC_SUPABASE_URL=https://mhqwzsksqozydglfbhvx.supabase.co" -ForegroundColor Yellow
Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocXd6c2tzcW96eWRnbGZiaHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUzNDIsImV4cCI6MjA3MzAwMTM0Mn0.ZQqCzkPzWws_HMtUKafVVDBDMRms9Y6dVOI9kmaCP8o" -ForegroundColor Yellow
Write-Host "SUPABASE_SERVICE_ROLE_KEY=[You need to get this from Supabase Settings > API]" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
