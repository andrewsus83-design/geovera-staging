# 🔥 ENABLE AUTHENTICATION - URGENT FIX

## Problem
**Sign up tidak bekerja** karena Email provider BELUM DI-ENABLE!

---

## ⚡ SOLUTION (2 MINUTES)

### **Step 1: Enable Email Provider**

**Open this URL**:
```
https://supabase.com/dashboard/project/vozjwptzutolvkvfpknk/auth/providers
```

**Actions**:
1. Scroll sampai ketemu **"Email"** section
2. Click untuk expand
3. **Toggle ON**: ✅ Enable Email provider
4. **UNCHECK**: ❌ Confirm email (disable untuk testing!)
5. Click **SAVE** button

---

### **Step 2: Add Vercel Redirect URLs**

**Open this URL**:
```
https://supabase.com/dashboard/project/vozjwptzutolvkvfpknk/auth/url-configuration
```

**Site URL** - Set to:
```
https://frontend-five-mu-64.vercel.app
```

**Redirect URLs** - Add these (one per line):
```
https://frontend-five-mu-64.vercel.app/**
https://frontend-five-mu-64.vercel.app/login
https://frontend-five-mu-64.vercel.app/onboarding
https://frontend-five-mu-64.vercel.app/dashboard
http://localhost:3000/**
```

Click **SAVE**

---

## ✅ Test After Enable

1. Go to: https://frontend-five-mu-64.vercel.app/login
2. Click "Sign Up" tab
3. Enter email/password/name
4. Click "Sign Up"
5. **Should work!** ✅

---

## 🐛 Debug Console

Open browser console (F12) and look for:
- ✅ `[Signup] Response status: 200` = Success!
- ❌ `Email provider not enabled` = Go to Step 1
- ❌ `Invalid redirect URL` = Go to Step 2

---

## 📧 Email Confirmation

**Current**: DISABLED (users can login immediately)
**Production**: Should ENABLE (users verify email first)

For testing, keep it DISABLED!
