# 🚀 Vercel + Supabase Deployment Guide

## Overview
GeoVera menggunakan arsitektur **JAMstack**:
- **Frontend**: Static HTML/CSS/JS → Deploy ke **Vercel**
- **Backend**: Edge Functions → Sudah deploy di **Supabase**
- **Database**: PostgreSQL → Sudah di **Supabase**

## 📦 Deployment Options

### **Option 1: Vercel Dashboard (EASIEST!)**

1. **Login ke Vercel**
   - Buka: https://vercel.com
   - Login dengan GitHub/GitLab/Email

2. **Add New Project**
   - Click: **"Add New Project"**
   - Upload folder: `frontend/` atau connect GitHub repo

3. **Configure Project**
   - Framework Preset: **Other**
   - Root Directory: `./` (leave blank)
   - Build Command: (leave blank)
   - Output Directory: `./` (leave blank)

4. **Environment Variables (Optional)**
   - Tidak perlu karena Supabase URL/Key sudah hardcoded di HTML
   - Tapi jika mau lebih secure, tambahkan:
     ```
     VITE_SUPABASE_URL=https://vozjwptzutolvkvfpknk.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGci...
     ```

5. **Deploy!**
   - Click **"Deploy"**
   - Wait 30 seconds ⏳
   - Done! ✅

6. **Get URL**
   - Vercel akan kasih URL: `https://geovera-xxxxx.vercel.app`
   - Test frontend di URL tersebut

---

### **Option 2: Vercel CLI**

```bash
# 1. Install Vercel CLI (already installed)
npm install -g vercel

# 2. Login to Vercel
cd frontend
vercel login
# Follow browser authentication

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

---

### **Option 3: GitHub Integration (Auto-Deploy)**

1. **Push to GitHub**
   ```bash
   cd /Users/drew83/Desktop/untitled\ folder
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/geovera-frontend.git
   git push -u origin main
   ```

2. **Connect Vercel to GitHub**
   - Vercel Dashboard → **Import Project**
   - Select GitHub repository
   - Vercel will auto-deploy on every push to `main` branch

3. **Auto-Deploy Workflow**
   - Push to `main` → Auto deploy to **production**
   - Push to other branches → Auto deploy to **preview** URLs
   - Pull requests → Auto generate **preview** URLs

---

## 🔗 Vercel + Supabase Integration

### **Option A: Official Integration**

1. **In Vercel Dashboard:**
   - Project Settings → **Integrations**
   - Search: **"Supabase"**
   - Click **"Add Integration"**

2. **Connect Supabase Project:**
   - Select: `vozjwptzutolvkvfpknk` project
   - Vercel will auto-import environment variables

3. **Benefits:**
   - Auto-sync environment variables
   - One-click setup
   - Secure secret management

### **Option B: Manual Environment Variables**

1. **In Vercel Dashboard:**
   - Project Settings → **Environment Variables**

2. **Add Variables:**
   ```
   VITE_SUPABASE_URL=https://vozjwptzutolvkvfpknk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **For Edge Functions (Backend):**
   - Environment variables sudah di-set di Supabase Dashboard
   - Tidak perlu set di Vercel

---

## 🌐 Custom Domain

### **Setup Custom Domain:**

1. **In Vercel Dashboard:**
   - Project Settings → **Domains**
   - Click **"Add"**

2. **Add Domain:**
   - Example: `geovera.com` or `app.geovera.com`

3. **Configure DNS:**
   - Vercel akan kasih DNS records:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21

     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

4. **Wait for SSL:**
   - Vercel auto-generates SSL certificate
   - Takes 5-10 minutes

---

## 🔐 Security Configuration

### **CORS (Already Configured)**

Supabase Edge Functions sudah enable CORS untuk semua origins:

```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### **Security Headers (Vercel)**

`vercel.json` sudah include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### **API Keys Protection**

- **Supabase Anon Key**: Safe to expose (RLS protected)
- **Supabase Service Role Key**: NEVER expose (only in Edge Functions)
- **Xendit Secret Key**: NEVER expose (only in Edge Functions)

---

## 🧪 Testing After Deployment

### **1. Test Login Page**
```
https://your-vercel-url.vercel.app/login
```
- Sign up with email
- Login with email
- Try Google OAuth

### **2. Test Onboarding**
```
https://your-vercel-url.vercel.app/onboarding
```
- Complete 4-step wizard
- Check brand lock warning
- Verify email sent

### **3. Test Pricing Page**
```
https://your-vercel-url.vercel.app/pricing
```
- Toggle monthly/yearly
- Click "Get Started"
- Verify Xendit redirect

### **4. Check Edge Functions**
```bash
# Test auth handler
curl -X POST https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/auth-handler \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"action": "test"}'

# Test onboarding wizard
curl -X POST https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/onboarding-wizard-handler \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"action": "test"}'
```

---

## 🐛 Troubleshooting

### **Issue: Frontend tidak bisa connect ke Supabase**

**Solution:**
- Check Supabase URL di HTML files
- Verify anon key is correct
- Check browser console for CORS errors
- Verify Supabase Edge Functions are deployed

### **Issue: Xendit payment tidak redirect**

**Solution:**
- Check `xendit-payment-handler` function is deployed
- Verify Xendit API key in Supabase secrets
- Check function logs in Supabase Dashboard
- Ensure test mode is enabled in Xendit

### **Issue: Google OAuth tidak bekerja**

**Solution:**
- Add Vercel URL to Supabase redirect URLs:
  - Supabase Dashboard → Authentication → URL Configuration
  - Add: `https://your-vercel-url.vercel.app/**`
- Enable Google provider in Supabase:
  - Authentication → Providers → Google
  - Add Client ID and Secret

### **Issue: Routes tidak bekerja (404)**

**Solution:**
- Check `vercel.json` routes configuration
- Verify HTML files exist in root directory
- Redeploy project

---

## 📊 Monitoring

### **Vercel Analytics**
- Enable in: Project Settings → Analytics
- Track: Page views, visitors, performance

### **Supabase Logs**
- Check Edge Function logs: Supabase Dashboard → Edge Functions → Logs
- Check Database logs: Database → Logs
- Check Auth logs: Authentication → Logs

### **Error Tracking**
- Use Vercel deployment logs
- Use Supabase function logs
- Check browser console errors

---

## 🔄 CI/CD Pipeline

### **Automated Deployment Flow:**

1. **Developer pushes code** to GitHub `main` branch
2. **Vercel detects change** via webhook
3. **Vercel builds** (static files, no build needed)
4. **Vercel deploys** to edge network (100+ locations)
5. **Vercel runs checks** (if configured)
6. **Vercel notifies** via Slack/Discord (optional)

### **Branch Strategy:**

- `main` → Production (`https://geovera.com`)
- `develop` → Preview (`https://geovera-git-develop.vercel.app`)
- Feature branches → Auto preview URLs

---

## 🚀 Performance Optimization

### **Already Optimized:**
✅ Static HTML (no SSR needed)
✅ CDN delivery (Tailwind, Supabase JS)
✅ Edge network (100+ locations)
✅ HTTP/2 enabled
✅ Gzip/Brotli compression
✅ Image optimization (if images added)

### **Future Optimizations:**
- Add service worker for offline support
- Implement lazy loading for images
- Add prefetching for critical routes
- Optimize Tailwind CSS (use JIT mode)

---

## 📝 Deployment Checklist

### **Before Deployment:**
- [ ] All HTML files tested locally
- [ ] Supabase Edge Functions deployed
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Xendit webhook configured

### **During Deployment:**
- [ ] Deploy frontend to Vercel
- [ ] Verify deployment success
- [ ] Check all routes work
- [ ] Test authentication flows
- [ ] Test payment integration

### **After Deployment:**
- [ ] Add custom domain (if applicable)
- [ ] Configure Google OAuth redirect URLs
- [ ] Set up Xendit webhook URL
- [ ] Enable Vercel analytics
- [ ] Monitor error logs

---

## 🆘 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Discord**: https://discord.supabase.com

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Go to frontend folder
cd frontend

# 2. Deploy to Vercel
vercel --prod

# 3. Done! 🎉
```

Or just use Vercel Dashboard:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Upload `frontend` folder
4. Click "Deploy"
5. Done in 30 seconds! ✅
