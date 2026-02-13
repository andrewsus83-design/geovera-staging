# 🌐 Setup GeoVera.xyz Domain

## Current Status
- ✅ Domain: **geovera.xyz** (owned)
- ❌ Not connected to Vercel project yet
- 🔗 Need to connect to: `frontend` project

---

## 🚀 Quick Setup via Vercel Dashboard (EASIEST)

### **Step 1: Open Vercel Project Settings**
```
https://vercel.com/andrewsus83-5642s-projects/frontend/settings/domains
```

### **Step 2: Add Domain**
1. Click **"Add"** button
2. Enter: `geovera.xyz`
3. Click **"Add"**

### **Step 3: Add www subdomain (optional)**
1. Click **"Add"** button
2. Enter: `www.geovera.xyz`
3. Click **"Add"**

### **Step 4: DNS Configuration**
Vercel will show DNS records. Update your DNS provider with:

**For apex domain (geovera.xyz):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **Step 5: Wait for SSL**
- SSL certificate auto-generates
- Takes 5-10 minutes
- You'll see "Valid" status when ready

---

## 🎯 After Setup

Your frontend will be available at:
- **Main**: https://geovera.xyz
- **WWW**: https://www.geovera.xyz (optional)

Update Supabase redirect URLs to:
```
https://geovera.xyz/**
https://www.geovera.xyz/**
```

---

## 📱 Subdomain for App (Recommended)

You can also use:
- **App**: `app.geovera.xyz` (for web app)
- **API**: `api.geovera.xyz` (for API/functions)
- **Staging**: `staging.geovera.xyz` (for testing)

Add subdomain:
1. In Vercel project settings
2. Add: `app.geovera.xyz`
3. DNS:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```

---

## ✅ Verification

After DNS propagates (5-30 minutes):
1. Open: https://geovera.xyz
2. Should show your frontend
3. No more `frontend-five-mu-64.vercel.app`! 🎉
