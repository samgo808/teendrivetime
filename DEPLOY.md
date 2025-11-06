# Quick Deployment Guide

## Fastest Way to Deploy (5 minutes)

### Step 1: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: TeenDriveTime app"
```

### Step 2: Push to GitHub
1. Go to https://github.com/new
2. Create repository named `teendrivetime`
3. Run these commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/teendrivetime.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your `teendrivetime` repository
5. Click "Deploy" (no configuration needed!)
6. Wait ~2 minutes for deployment
7. Get your URL: `https://teendrivetime.vercel.app`

### Step 4: Use on iPhone
1. Open the Vercel URL in Safari on iPhone
2. Tap Share → "Add to Home Screen"
3. Launch the app from your home screen
4. Grant location permission when prompted
5. Start tracking drives!

## Alternative: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Environment Variables

No environment variables needed! Everything runs client-side.

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Updates

To update the deployed app:

```bash
git add .
git commit -m "Your update message"
git push

# Vercel auto-deploys on every push!
```

## Troubleshooting

**Build fails?**
- Run `npm run build` locally first
- Check for TypeScript errors
- Ensure all dependencies are in package.json

**Can't access on iPhone?**
- Must use HTTPS (Vercel provides this)
- Must open in Safari (not Chrome)
- Check location services are enabled

**Need help?**
- See full README.md
- Check Vercel deployment logs
- Verify all files committed to Git

---

**You're all set! 🎉**
