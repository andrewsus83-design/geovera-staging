# 🚀 GeoVera Production Setup - NO FAKE DATA!

## ✅ CRITICAL: Production Requirements

### **1. Domain Setup**
- [ ] Connect geovera.xyz to Vercel
- [ ] Setup SSL certificate
- [ ] Configure DNS properly
- [ ] Test domain access

### **2. Security - RLS Policies (CRITICAL!)**
All these tables need RLS enabled:
- [ ] public.gv_apply_usage
- [ ] public.gv_authority_citations
- [ ] public.gv_behavior_analysis
- [ ] public.gv_brands
- [ ] public.gv_content_opportunities
- [ ] public.gv_content_patterns
- [ ] public.gv_crawl_sessions
- [ ] public.gv_creator_discovery
- [ ] public.gv_creator_market_intel
- [ ] public.gv_customer_timeline
- [ ] public.gv_deep_research_sessions
- [ ] public.gv_discovered_creators
- [ ] public.gv_gemini_creator_crawls
- [ ] public.gv_invoices
- [ ] public.gv_llm_analysis
- [ ] public.gv_market_benchmarks
- [ ] public.gv_nia_analysis
- [ ] public.gv_perplexity_requests
- [ ] public.gv_platform_research
- [ ] public.gv_research_artifacts
- [ ] public.gv_reverse_engineering
- [ ] public.gv_subscriptions

**NO TABLE should have public access without RLS!**

### **3. Authentication**
- [x] Email provider enabled ✅
- [x] Google OAuth enabled ✅
- [ ] Email confirmation ENABLED (production must verify emails)
- [ ] Rate limiting configured
- [ ] MFA optional setup
- [ ] Redirect URLs for geovera.xyz

### **4. Database - NO FAKE DATA**
- [ ] Verify all tables have proper constraints
- [ ] Ensure no seed/fake data in production
- [ ] Setup database backups
- [ ] Configure connection pooling

### **5. Edge Functions**
- [x] auth-handler deployed ✅
- [x] onboarding-wizard-handler deployed ✅
- [x] xendit-payment-handler deployed ✅
- [ ] All functions use REAL API calls (no mocks)
- [ ] Environment variables set properly
- [ ] Error logging configured

### **6. Payment (Xendit)**
- [ ] Switch from TEST mode to PRODUCTION mode
- [ ] Get production API keys
- [ ] Configure production webhook URL
- [ ] Test payment flow with real card
- [ ] Setup invoice notifications

### **7. Email Configuration**
- [ ] Setup custom SMTP (not Supabase default)
- [ ] Configure email templates
- [ ] Test email delivery
- [ ] Setup email notifications

### **8. Monitoring & Logs**
- [ ] Enable Vercel Analytics
- [ ] Configure Supabase logs retention
- [ ] Setup error tracking
- [ ] Configure uptime monitoring

### **9. Performance**
- [ ] Enable CDN for static assets
- [ ] Configure database indexes
- [ ] Optimize API response times
- [ ] Test with real user load

### **10. Compliance**
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Cookie consent
- [ ] GDPR compliance (if EU users)

---

## 🔥 IMMEDIATE ACTIONS (NOW!)

### **Action 1: Enable RLS on ALL Tables**
```sql
-- Run this for EACH table with RLS disabled
ALTER TABLE public.gv_apply_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_authority_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gv_behavior_analysis ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all 22+ tables)
```

### **Action 2: Create RLS Policies**
```sql
-- Example: Only users can see their own brands
CREATE POLICY "Users can view own brands" ON public.brands
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brands" ON public.brands
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Repeat for each table with proper policies
```

### **Action 3: Setup geovera.xyz Domain**
1. Go to: https://vercel.com/andrewsus83-5642s-projects/frontend/settings/domains
2. Add: `geovera.xyz`
3. Configure DNS
4. Wait for SSL

### **Action 4: Production Redirect URLs**
Go to: https://supabase.com/dashboard/project/vozjwptzutolvkvfpknk/auth/url-configuration

Add:
```
https://geovera.xyz/**
https://www.geovera.xyz/**
https://app.geovera.xyz/**
```

### **Action 5: Enable Email Confirmation**
Go to: https://supabase.com/dashboard/project/vozjwptzutolvkvfpknk/auth/providers

- [x] Email provider: ON
- [ ] Confirm email: ON (ENABLE THIS!)
- [ ] Secure email change: ON

### **Action 6: Xendit Production Mode**
1. Login to Xendit dashboard
2. Switch from TEST to PRODUCTION
3. Get production API keys
4. Update Supabase secrets:
```bash
supabase secrets set XENDIT_SECRET_KEY=xnd_production_xxxxx
supabase secrets set XENDIT_CALLBACK_TOKEN=production_token
```

---

## 🧪 Production Testing Protocol

### **Test 1: User Signup (REAL)**
1. Use REAL email address
2. Signup → Should receive verification email
3. Click verification link
4. Should redirect to onboarding

### **Test 2: Onboarding (REAL)**
1. Enter REAL brand information
2. Complete 4 steps
3. Verify data saved to database (no fake data!)
4. Check brand lock works (30 days)

### **Test 3: Payment (REAL)**
1. Select pricing plan
2. Use REAL test credit card (Xendit test mode first)
3. Complete payment
4. Verify subscription activated
5. Check webhook received

### **Test 4: Security (CRITICAL)**
1. Try to access other user's data → Should FAIL
2. Try to modify locked brand fields → Should FAIL
3. Try SQL injection → Should FAIL
4. Check all RLS policies work

---

## ⚠️ PRODUCTION DON'Ts

❌ **NO** fake data in database
❌ **NO** test mode in production
❌ **NO** disabled RLS policies
❌ **NO** exposed API keys in frontend
❌ **NO** localhost redirect URLs
❌ **NO** disabled email confirmation
❌ **NO** HTTP (must be HTTPS)
❌ **NO** unhandled errors
❌ **NO** missing backup strategy

---

## 📊 Production Metrics to Monitor

- **Uptime**: 99.9% target
- **API Response Time**: < 500ms
- **Database Queries**: < 100ms avg
- **Error Rate**: < 1%
- **User Signup Success**: > 95%
- **Payment Success**: > 98%

---

## 🆘 Rollback Plan

If production fails:
1. Revert to previous Vercel deployment
2. Restore database from backup
3. Switch Xendit back to test mode
4. Notify users via email
5. Debug and fix issues
6. Re-deploy with fixes

---

## ✅ Production Go-Live Checklist

Before announcing to users:
- [ ] All security policies enabled
- [ ] Domain configured and SSL active
- [ ] Payment system tested
- [ ] Email delivery verified
- [ ] Database backups configured
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] Documentation complete
- [ ] Support channel ready
- [ ] Tested on multiple devices/browsers

---

**REMEMBER: Production means REAL users, REAL data, REAL money!**
**NO SHORTCUTS. NO FAKE DATA. SECURITY FIRST.**
