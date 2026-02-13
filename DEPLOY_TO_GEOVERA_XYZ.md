# Deploy GeoVera to geovera.xyz - Production Deployment Guide 🚀

**Date:** 2026-02-13
**Target:** geovera.xyz (Production Domain)
**Current Status:** All features deployed to staging, ready for production

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Backend (Supabase) - READY ✅
- ✅ 6 Edge Functions deployed to project vozjwptzutolvkvfpknk
- ✅ Database schema complete (233 migrations)
- ✅ API keys configured (OPENAI, ANTHROPIC, etc.)
- ✅ RLS policies active
- ✅ Quota tracking functional

### Frontend (Vercel) - READY ✅
- ✅ All HTML pages committed to Git
- ✅ vercel.json configured with routes
- ✅ Security headers configured
- ✅ Auto-deploy enabled via GitHub

### Edge Functions CORS - NEEDS UPDATE ⚠️
Currently set to: `https://geovera.xyz` (already correct!)
- generate-article: ✅ geovera.xyz
- generate-image: ✅ geovera.xyz
- generate-video: ✅ geovera.xyz

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Update Vercel Domain (Manual via Dashboard)

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select your project: `geovera-staging`
3. Go to Settings → Domains
4. Add custom domain: `geovera.xyz`
5. Add www redirect: `www.geovera.xyz` → `geovera.xyz`
6. Vercel will provide DNS records
7. Update your DNS provider with Vercel's records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel's IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
8. Wait for DNS propagation (5-30 minutes)
9. Vercel will auto-issue SSL certificate

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Add domain
vercel domains add geovera.xyz --project geovera-staging

# Check status
vercel domains ls
```

### Step 2: Verify DNS Configuration

**Check DNS Propagation:**
```bash
# Check A record
dig geovera.xyz

# Check CNAME
dig www.geovera.xyz

# Check SSL
curl -I https://geovera.xyz
```

**Expected Results:**
- geovera.xyz → Points to Vercel IP (76.76.21.21)
- www.geovera.xyz → CNAME to Vercel
- SSL certificate active (HTTPS working)

### Step 3: Update ALLOWED_ORIGIN in Supabase (Optional)

Currently Edge Functions have fallback to `geovera.xyz`, but you can explicitly set it:

```bash
# Set ALLOWED_ORIGIN environment variable
supabase secrets set ALLOWED_ORIGIN=https://geovera.xyz --project-ref vozjwptzutolvkvfpknk
```

### Step 4: Test Production Deployment

**Test URLs:**
1. Landing: https://geovera.xyz
2. Login: https://geovera.xyz/login
3. Dashboard: https://geovera.xyz/dashboard
4. Content Studio: https://geovera.xyz/content-studio
5. AI Chat: https://geovera.xyz/chat
6. Pricing: https://geovera.xyz/pricing

**Test Checklist:**
- [ ] Homepage loads correctly
- [ ] Login works (Supabase Auth)
- [ ] Email confirmation flow works
- [ ] Dashboard loads with brand data
- [ ] Content Studio shows correct tier prompt
- [ ] AI Chat accessible for paid tiers
- [ ] All Edge Functions respond correctly
- [ ] SSL certificate valid (HTTPS green lock)

### Step 5: Verify Edge Function CORS

**Test API Calls from geovera.xyz:**
```javascript
// In browser console on https://geovera.xyz/content-studio
const response = await fetch('https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/generate-article', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${YOUR_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    brand_id: 'YOUR_BRAND_ID',
    topic: 'Test Article'
  })
});
console.log(await response.json());
```

**Expected:** 200 OK or 403 (if free tier) - NO CORS errors

---

## 🔒 SECURITY VERIFICATION

### SSL/TLS Certificate
- [ ] HTTPS enabled (green lock)
- [ ] Valid SSL certificate
- [ ] HTTP → HTTPS redirect active
- [ ] www → non-www redirect (or vice versa)

### CORS Configuration
- [ ] Edge Functions only accept requests from geovera.xyz
- [ ] No wildcard (*) in CORS headers
- [ ] Proper preflight handling (OPTIONS)

### Authentication
- [ ] JWT validation working
- [ ] Session persistence
- [ ] Logout functionality
- [ ] Password reset flow

### RLS Policies
- [ ] Free tier blocked from paid features
- [ ] Users can only access their brands
- [ ] Quota enforcement active
- [ ] Content library isolated by brand

---

## 📊 MONITORING SETUP

### Day 1 Monitoring
**Supabase Edge Functions:**
- Go to: https://supabase.com/dashboard/project/vozjwptzutolvkvfpknk/functions
- Monitor:
  - Error rates
  - Response times
  - Invocation counts
  - API costs

**Vercel Analytics:**
- Go to: https://vercel.com/dashboard
- Monitor:
  - Page load times
  - Traffic volume
  - Error rates
  - Core Web Vitals

**API Costs:**
- OpenAI: https://platform.openai.com/usage
- Anthropic: https://console.anthropic.com/settings/usage
- Check daily spend vs quotas

### Alerts to Setup
1. **Supabase Alerts:**
   - Edge Function errors > 5% rate
   - Database CPU > 80%
   - API costs > $100/day

2. **Vercel Alerts:**
   - Error rate > 1%
   - Response time > 2s
   - SSL certificate expiring

---

## 🎯 POST-DEPLOYMENT TASKS

### Immediate (Within 1 hour)
- [ ] Test all user flows end-to-end
- [ ] Verify free tier shows upgrade prompts
- [ ] Test paid tier content generation
- [ ] Check quota tracking accuracy
- [ ] Monitor error logs

### Day 1
- [ ] Monitor API costs (OpenAI, Anthropic)
- [ ] Check Edge Function performance
- [ ] Verify SSL certificate stability
- [ ] Test from multiple devices/browsers

### Week 1
- [ ] Analyze user behavior
- [ ] Check conversion rates (free → paid)
- [ ] Review API cost optimization
- [ ] Gather user feedback
- [ ] Monitor quota reset (monthly)

### Month 1
- [ ] Feature usage analysis
- [ ] Cost per generation metrics
- [ ] User retention analysis
- [ ] Content quality assessment
- [ ] Scale planning

---

## 🔄 ROLLBACK PLAN

### If Critical Issues Found:

**Option 1: Revert Domain (Fastest)**
1. Go to Vercel Dashboard → Settings → Domains
2. Remove geovera.xyz domain
3. Traffic reverts to geovera-staging.vercel.app
4. Fix issues
5. Re-add domain

**Option 2: Revert Edge Functions**
```bash
# List function versions
supabase functions list --project-ref vozjwptzutolvkvfpknk

# If needed, redeploy previous version
# (Note: Supabase keeps version history)
```

**Option 3: Database Rollback**
```bash
# Only if critical database issue
# WARNING: This will lose recent data
supabase db reset --linked
```

---

## 📝 ENVIRONMENT VARIABLES

### Supabase Secrets (Already Configured)
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SERPAPI_API_KEY=...
APIFY_API_TOKEN=...
GOOGLE_PLACES_API_KEY=...
NOTION_API_KEY=...
# ... all other secrets already set
```

### Vercel Environment Variables (Auto from Git)
No additional env vars needed - all API calls go through Supabase Edge Functions

---

## 🌐 DNS CONFIGURATION REFERENCE

### Recommended DNS Setup (Cloudflare/Your DNS Provider)

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
Proxy: Disabled (let Vercel handle SSL)
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

**Alternative: Use Vercel Nameservers**
If using Vercel's nameservers:
- ns1.vercel-dns.com
- ns2.vercel-dns.com

---

## ✅ SUCCESS CRITERIA

### Technical
- ✅ All pages load < 2 seconds
- ✅ SSL certificate valid
- ✅ Zero CORS errors
- ✅ Edge Functions 99.9% uptime
- ✅ Database queries < 100ms

### Business
- ✅ Free tier sees upgrade prompts
- ✅ Paid tier can generate content
- ✅ Quota tracking accurate
- ✅ Zero unauthorized access
- ✅ API costs within budget

### User Experience
- ✅ Smooth onboarding flow
- ✅ Clear error messages
- ✅ Fast page loads
- ✅ Mobile responsive
- ✅ Accessible (WCAG AA)

---

## 🎉 DEPLOYMENT SUMMARY

### What's Being Deployed to geovera.xyz:

**Frontend (Vercel):**
- 10+ HTML pages
- Full routing configuration
- Security headers
- Auto-deploy via Git

**Backend (Supabase - already deployed):**
- 6 Edge Functions
- 15+ database tables
- RLS policies
- Quota tracking
- API integrations

**Features Live:**
- ✅ Content Studio (Articles, Images, Videos)
- ✅ AI Chat with tier limits
- ✅ Dashboard with brand management
- ✅ Onboarding flow
- ✅ Pricing page with tiers
- ✅ Authentication system

**Security:**
- ✅ 3-layer access control (DB + API + Frontend)
- ✅ Paid-only features enforced
- ✅ SSL/TLS encryption
- ✅ CORS restrictions
- ✅ RLS policies active

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue: geovera.xyz shows Vercel 404**
- Solution: Check DNS propagation (can take 24-48 hours)
- Use: https://dnschecker.org to check status

**Issue: CORS errors on API calls**
- Solution: Verify ALLOWED_ORIGIN is set to geovera.xyz
- Check: Edge Function CORS headers

**Issue: SSL certificate not working**
- Solution: Wait for Vercel auto-provision (5-10 minutes)
- Check: Vercel dashboard → Settings → Domains

**Issue: Content generation fails**
- Solution: Check API keys in Supabase secrets
- Verify: Brand has paid subscription tier

### Emergency Contacts
- Supabase Support: https://supabase.com/dashboard/support
- Vercel Support: https://vercel.com/help
- DNS Provider: (your DNS provider's support)

---

## 🚀 FINAL STEPS

### To Go Live on geovera.xyz:

1. **Add Domain in Vercel Dashboard**
   - Project: geovera-staging
   - Domain: geovera.xyz
   - Auto-SSL: Yes

2. **Update DNS Records**
   - Point @ to Vercel IP: 76.76.21.21
   - Point www to cname.vercel-dns.com

3. **Wait for DNS Propagation**
   - Usually 5-30 minutes
   - Can take up to 48 hours

4. **Test Everything**
   - All pages load
   - API calls work
   - Authentication works
   - Content generation works

5. **Monitor Closely**
   - First hour: Every 15 minutes
   - First day: Every hour
   - First week: Daily checks

---

**Status:** ✅ READY FOR PRODUCTION
**Next Step:** Add geovera.xyz domain in Vercel Dashboard
**ETA to Live:** 30-60 minutes (after DNS propagation)

🎊 **Ready to serve production traffic!**
