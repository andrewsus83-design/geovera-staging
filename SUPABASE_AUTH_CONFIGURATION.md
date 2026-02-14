# Supabase Auth Configuration - Fix 404 Redirect Issue

## Issue
The 404 auth error mentioned in the tasks is likely related to redirect URLs configured in the Supabase Dashboard.

## Solution

### 1. Configure Redirect URLs in Supabase Dashboard

Go to: **Supabase Dashboard → Authentication → URL Configuration**

#### Site URL
```
https://your-production-domain.com
```
or for staging:
```
http://localhost:8000
```

#### Redirect URLs (Add ALL of these)
```
http://localhost:8000/onboarding-v4.html
http://localhost:8000/dashboard.html
http://localhost:8000/login-working.html
https://your-production-domain.com/onboarding-v4.html
https://your-production-domain.com/dashboard.html
https://your-production-domain.com/login-working.html
```

### 2. Current Redirect Configuration

From `login-working.html` line 182:
```javascript
options: { redirectTo: window.location.origin + '/onboarding-v4.html' }
```

This is correct and will work once the URLs are whitelisted in Supabase Dashboard.

### 3. Email Templates

Go to: **Supabase Dashboard → Authentication → Email Templates**

Update all email templates to use the correct redirect URLs:

#### Magic Link Template
Replace `{{ .SiteURL }}` references with:
```
{{ .SiteURL }}/dashboard.html
```

#### Confirm Signup Template
```
{{ .ConfirmationURL }}
```
Should redirect to onboarding after confirmation.

### 4. Enable Email Confirmations

Go to: **Supabase Dashboard → Authentication → Providers → Email**

**Settings:**
- ✅ Enable Email Provider
- ✅ Confirm Email (recommended for production)
- ⚠️ For testing: Disable "Confirm Email" temporarily

### 5. OAuth Providers (if used)

If using Google/GitHub OAuth:

Go to: **Supabase Dashboard → Authentication → Providers → [Provider]**

**Authorized Redirect URLs:**
```
https://[your-project-ref].supabase.co/auth/v1/callback
```

### 6. JWT Secret Rotation (Security)

**DO NOT** expose JWT secrets in frontend code. All JWT operations should happen via:
- Supabase client library (automatically handles tokens)
- Edge Functions (server-side)

### 7. Testing Checklist

- [ ] Add all redirect URLs to Supabase Dashboard whitelist
- [ ] Test signup flow: signup → email confirmation → redirect to onboarding
- [ ] Test login flow: login → redirect to dashboard
- [ ] Test magic link: click email link → redirect works
- [ ] Test OAuth (if enabled): OAuth → redirect works
- [ ] Verify no 404 errors in browser console

### 8. Common Issues

#### Issue: "Invalid redirect URL"
**Solution:** Add the URL to the whitelist in Supabase Dashboard

#### Issue: "404 Not Found" after auth
**Solution:**
1. Check that the redirect URL file exists (`/onboarding-v4.html`)
2. Verify URL is whitelisted in Supabase Dashboard
3. Check for typos in redirect URL

#### Issue: "CORS error"
**Solution:** Ensure Site URL matches your actual domain

### 9. Production Deployment

Before going live:

1. **Update Site URL** to production domain
2. **Add production redirect URLs** to whitelist
3. **Remove localhost URLs** from whitelist (security)
4. **Enable email confirmation** (if disabled for testing)
5. **Enable leaked password protection**
6. **Test complete auth flow** on production domain

### 10. Security Best Practices

✅ **DO:**
- Use HTTPS in production
- Whitelist only specific redirect URLs
- Enable email confirmation
- Enable leaked password protection
- Use short JWT expiry times

❌ **DON'T:**
- Don't use wildcard redirect URLs (`*`)
- Don't expose service role key in frontend
- Don't disable email confirmation in production
- Don't use HTTP in production

## Quick Fix Commands

There are no SQL migrations needed for this. All configuration is done via Supabase Dashboard UI:

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to Authentication → URL Configuration
4. Add the redirect URLs listed above
5. Save changes
6. Test authentication flow

## Verification

After configuration:

```bash
# Test the auth flow
1. Open browser to http://localhost:8000/login-working.html
2. Sign up with test email
3. Verify redirect to /onboarding-v4.html works
4. Check browser console for any 404 errors
```

Should see:
```
✅ Auth successful
✅ Redirect to onboarding-v4.html
✅ No 404 errors
```

## Support

If issues persist:
- Check Supabase Dashboard → Logs → Auth Logs
- Look for "redirect_uri_mismatch" errors
- Verify all URLs exactly match (including trailing slashes)
