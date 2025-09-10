# 🚀 QUICK DEPLOYMENT GUIDE - KARAVAN CANTEEN

## ✅ EVERYTHING IS SET UP! HERE'S WHAT TO DO:

### STEP 1: Run the Deployment Script
```bash
# Double-click this file or run in terminal:
deploy.bat
```

### STEP 2: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `karavan-canteen`
4. Make it public or private
5. DON'T initialize with README (we already have files)
6. Click "Create repository"

### STEP 3: Connect to GitHub
```bash
# Replace 'yourusername' with your actual GitHub username
git remote add origin https://github.com/yourusername/karavan-canteen.git
git branch -M main
git push -u origin main
```

### STEP 4: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `karavan-canteen` repository
5. Configure these settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### STEP 5: Add Environment Variables in Vercel
In your Vercel project settings, add these **EXACT** variables:

```
NEXT_PUBLIC_SUPABASE_URL
https://mhqwzsksqozydglfbhvx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocXd6c2tzcW96eWRnbGZiaHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUzNDIsImV4cCI6MjA3MzAwMTM0Mn0.ZQqCzkPzWws_HMtUKafVVDBDMRms9Y6dVOI9kmaCP8o

SUPABASE_SERVICE_ROLE_KEY
[GET THIS FROM SUPABASE DASHBOARD → SETTINGS → API → service_role key]
```

### STEP 6: Deploy!
Click "Deploy" in Vercel and wait for it to complete.

## 🎉 YOUR APP WILL BE LIVE AT:
`https://karavan-canteen.vercel.app` (or similar)

## 🧪 TEST THESE FEATURES:
- [ ] Welcome page loads
- [ ] User registration works
- [ ] Teacher login works
- [ ] Canteen staff login: `karavanstaff@sandfordschool.edu` / `KaravanStaff123`
- [ ] Menu displays correctly
- [ ] Cart functionality works
- [ ] Order placement works
- [ ] PDF reports generate

## 🆘 IF YOU NEED HELP:
1. Check Vercel build logs for errors
2. Verify environment variables are set correctly
3. Make sure Supabase database is accessible
4. Test locally first with `npm run dev`

## 📞 READY TO DEPLOY?
Just run: `deploy.bat` and follow the steps above!
