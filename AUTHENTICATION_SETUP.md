# 🔐 Authentication Setup Guide

## Problem
Frontend di Vercel tidak bisa login/signup karena:
1. ❌ Google OAuth belum dikonfigurasi
2. ❌ Vercel URL belum ditambahkan ke Supabase redirect URLs
3. ❌ Email authentication mungkin belum di-enable

## 🚀 Quick Fix (Manual via Supabase Dashboard)

### **Step 1: Enable Email Authentication**

1. Go to: https://supabase.com/dashboard/project/vozjwptzutolvkvfpknk
2. Navigate to: **Authentication** → **Providers**
3. Find **Email** provider
4. Enable: **✅ Email provider**
5. Disable: **Confirm email** (untuk testing, bisa enable nanti)
6. Click **Save**

---

### **Step 2: Configure Google OAuth**

1. **Get Google OAuth Credentials:**
   - Go to: https://console.cloud.google.com
   - Create/Select project
   - Enable **Google+ API**
   - Go to: **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://vozjwptzutolvkvfpknk.supabase.co/auth/v1/callback
     ```
   - Copy **Client ID** and **Client Secret**

2. **Add to Supabase:**
   - Supabase Dashboard → **Authentication** → **Providers**
   - Find **Google** provider
   - Enable: **✅ Google provider**
   - Paste **Client ID** and **Client Secret**
   - Click **Save**

---

### **Step 3: Add Vercel URL to Redirect URLs**

1. Go to: **Authentication** → **URL Configuration**

2. Add **Site URL**:
   ```
   https://frontend-five-mu-64.vercel.app
   ```

3. Add **Redirect URLs** (IMPORTANT!):
   ```
   https://frontend-five-mu-64.vercel.app/**
   https://frontend-five-mu-64.vercel.app/login
   https://frontend-five-mu-64.vercel.app/onboarding
   https://frontend-five-mu-64.vercel.app/dashboard
   http://localhost:3000/**
   ```

4. Click **Save**

---

### **Step 4: Test Authentication**

1. **Test Email Signup:**
   - Go to: https://frontend-five-mu-64.vercel.app/login
   - Click **Sign Up** tab
   - Enter email and password
   - Click **Sign Up**
   - Should redirect to onboarding

2. **Test Email Login:**
   - Enter email and password
   - Click **Login**
   - Should redirect to dashboard (if has brand) or onboarding (if no brand)

3. **Test Google OAuth:**
   - Click **Continue with Google**
   - Login with Google account
   - Should redirect back to Vercel URL
   - Should redirect to onboarding

---

## 🛠️ Alternative: Configure via Supabase CLI

### **Enable Email Authentication:**
```bash
supabase secrets set AUTH_ENABLE_SIGNUP=true
```

### **Check Current Settings:**
```bash
supabase projects get-config --project-ref vozjwptzutolvkvfpknk
```

---

## 🐛 Troubleshooting

### **Issue: "Invalid login credentials"**
**Solution:**
- Check if user exists in Supabase Dashboard → Authentication → Users
- Verify password is correct
- Check if email confirmation is disabled (for testing)

### **Issue: Google OAuth returns error**
**Solution:**
- Verify Google OAuth credentials are correct
- Check redirect URI matches exactly:
  ```
  https://vozjwptzutolvkvfpknk.supabase.co/auth/v1/callback
  ```
- Ensure Google+ API is enabled in Google Cloud Console
- Check Supabase logs: Authentication → Logs

### **Issue: Redirect after login not working**
**Solution:**
- Add Vercel URL to redirect URLs in Supabase
- Check browser console for errors
- Verify `localStorage` has `access_token`

### **Issue: CORS errors**
**Solution:**
- Edge Functions already have CORS enabled
- If still error, check Supabase function logs
- Verify Supabase URL and Anon Key are correct in HTML files

---

## 📝 Verification Checklist

- [ ] Email provider enabled in Supabase
- [ ] Email confirmation disabled (for testing)
- [ ] Google OAuth credentials added
- [ ] Vercel URL added to redirect URLs
- [ ] Test email signup works
- [ ] Test email login works
- [ ] Test Google OAuth works
- [ ] Check user appears in Supabase Dashboard
- [ ] Verify redirect to onboarding after signup
- [ ] Verify redirect to dashboard after login (if has brand)

---

## 🔐 Security Notes

### **Production Checklist:**
- ✅ Enable email confirmation
- ✅ Add rate limiting
- ✅ Enable RLS policies on all tables
- ✅ Use custom SMTP for emails (not Supabase default)
- ✅ Enable MFA (Multi-Factor Authentication)
- ✅ Restrict redirect URLs to production domains only

### **Current Settings (Development):**
- ⚠️ Email confirmation: DISABLED (for testing)
- ⚠️ Rate limiting: DEFAULT (may be too permissive)
- ✅ RLS policies: Should be enabled on all tables
- ⚠️ SMTP: Using Supabase default (limited to 3 emails/hour)

---

## 🎯 Quick Test Commands

### **Test Auth Handler Function:**
```bash
curl -X POST https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/auth-handler \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "action": "signup_email",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### **Check if user was created:**
```bash
# In Supabase Dashboard:
# Authentication → Users
# Should see new user with email test@example.com
```

---

## 🆘 Still Not Working?

1. **Check Supabase Logs:**
   - Dashboard → Logs → Query Logs
   - Dashboard → Edge Functions → Logs
   - Dashboard → Authentication → Logs

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Verify Edge Functions are deployed:**
   ```bash
   supabase functions list
   ```

4. **Test Edge Function directly:**
   - Use Postman or curl to test auth-handler function
   - Check response status and error messages

---

## 📞 Contact Support

If still having issues:
- Supabase Discord: https://discord.supabase.com
- Supabase GitHub Issues: https://github.com/supabase/supabase/issues
- Vercel Support: https://vercel.com/support
