# ⚡ QUICK START GUIDE
## Deploy GeoVera in 10 Minutes

**Last Updated**: February 17, 2026
**Status**: Ready to deploy!

---

## 🚀 ONE-COMMAND DEPLOYMENT

```bash
cd /Users/drew83/Desktop/geovera-staging
./deploy.sh
```

That's it! The script will guide you through:
1. ✅ Database schema deployment
2. ✅ API key configuration
3. ✅ Edge Functions deployment
4. ✅ System verification

---

## 📋 WHAT YOU'RE DEPLOYING

### **Database Schema**
- 20+ tables (categories, brands, creators, keywords, topics, QA pairs)
- Weighted priority system (Revenue 60% + Engagement 25% + Tier 15%)
- Sub-category focus (Coca-Cola vs Pepsi, not vs Chipotle)
- Auto-rebalancing triggers
- 4 categories + 18 sub-categories pre-loaded

### **Edge Functions**
- `priority-processor`: Calculate weighted resource allocations
- `sub-category-detector`: Auto-detect brand product categories
- `qa-generator`: Generate 1500 QA pairs per category monthly

### **Cost Model**
- **Fixed**: $336.29 per category (monitors 450 creators + 800 sites + 6 AI platforms)
- **Variable**: $1.80 per brand (deep research + strategy + publishing)
- **Scalability**: 87.3% cost reduction from 40 to 500 brands

---

## 🧪 VERIFY DEPLOYMENT

```bash
./test-system.sh
```

**What this checks**:
- ✅ All tables exist
- ✅ 4 categories loaded (F&B, Tech, Healthcare, Finance)
- ✅ 18 sub-categories loaded (Beverages, Fast Food, Software, etc.)
- ✅ Priority function installed
- ✅ Indexes created
- ✅ Keywords loaded

---

## 🔑 API KEYS NEEDED

You'll be prompted to enter these during deployment:

1. **Anthropic** (Claude): `sk-ant-...`
   - Used for: QA generation, analysis
   - Cost: $0.48 per category

2. **OpenAI** (GPT-4): `sk-...`
   - Used for: Strategy generation
   - Cost: Variable, ~$0.60 per brand

3. **Perplexity**: `pplx-...`
   - Used for: Research, sub-category detection
   - Cost: $0.005 per query

4. **Apify**: `...`
   - Used for: Web scraping (SSO/SEO)
   - Cost: $310.59 per category (450 creators + 800 sites)

5. **SerpAPI**: `...`
   - Used for: Search results (GEO)
   - Cost: $12.70 per category

6. **Google Gemini**: `...`
   - Used for: AI response indexing (GEO)
   - Cost: ~$0 (free tier sufficient)

**Skip any keys you don't have yet** - you can add them later!

---

## 📊 TEST THE SYSTEM

### **Test 1: Priority Processor**
```bash
supabase functions invoke priority-processor --data '{
  "test": true
}'
```

**Expected output**:
```json
{
  "success": true,
  "allocations": [
    {"category": "F&B", "allocation": 0.25},
    {"category": "Tech", "allocation": 0.25},
    {"category": "Healthcare", "allocation": 0.25},
    {"category": "Finance", "allocation": 0.25}
  ]
}
```

### **Test 2: Sub-Category Detector**
```bash
supabase functions invoke sub-category-detector --data '{
  "brand_name": "Coca-Cola",
  "category_slug": "food_beverage"
}'
```

**Expected output**:
```json
{
  "success": true,
  "sub_category": "beverages",
  "confidence": 0.95,
  "method": "keyword_match"
}
```

### **Test 3: QA Generator**
```bash
supabase functions invoke qa-generator --data '{
  "category_slug": "food_beverage",
  "count": 10
}'
```

**Expected output**:
```json
{
  "success": true,
  "qa_pairs": [
    {
      "question": "What are the latest trends in beverage innovation?",
      "answer": "...",
      "platform": "social"
    }
  ],
  "total": 10
}
```

---

## 🎯 PRIORITY SYSTEM EXAMPLES

### **Example 1: Equal Split (No Clients Yet)**
All categories get 25% resources:
- F&B: 25%
- Tech: 25%
- Healthcare: 25%
- Finance: 25%

### **Example 2: First Client Joins (Coca-Cola in F&B)**
F&B gets priority:
- F&B: **50%** (Coca-Cola's category)
- Tech: 16.67%
- Healthcare: 16.67%
- Finance: 16.67%

### **Example 3: Weighted Within Category**
3 brands in F&B:
- **Coca-Cola** (Enterprise, High engagement): 67.7%
- **Local Juice** (Scale, Medium engagement): 17.3%
- **Startup Water** (Growth, Low engagement): 15.0%

---

## 📁 KEY FILES TO READ

### **Must Read** (30 minutes)
1. **DEPLOYMENT_STATUS_FINAL.md** - Complete system overview
2. **COMPLETE_COST_SUMMARY.md** - Cost breakdown
3. **WEIGHTED_PRIORITY_SYSTEM.md** - How priorities work

### **Optional Reading** (2 hours)
4. **SEO_GEO_FIXED_VARIABLE_MODEL.md** - SEO/GEO details
5. **SSO_COMPLETE_WORKFLOW_FINAL.md** - SSO workflow
6. **SUB_CATEGORY_FOCUS_SYSTEM.md** - Sub-category logic
7. **CLIENT_PRIORITY_PROCESSING.md** - Priority processing
8. **GEOVERA_BUDGET_PLAN_V2.md** - 3-month budget
9. **FINAL_IMPLEMENTATION_SUMMARY.md** - Implementation guide

---

## 🐛 TROUBLESHOOTING

### **Problem**: "supabase command not found"
**Solution**:
```bash
brew install supabase/tap/supabase
```

### **Problem**: "Database migration failed"
**Solution**:
```bash
# Check Supabase connection
supabase db execute "SELECT NOW();"

# If connection fails, link project
supabase link --project-ref your-project-ref
```

### **Problem**: "Edge Function deployment failed"
**Solution**:
```bash
# Check if function directory exists
ls -la supabase/functions/priority-processor/

# If missing, you'll need to create it first
# See DEPLOYMENT_STATUS_FINAL.md for instructions
```

### **Problem**: "API key not working"
**Solution**:
```bash
# Verify secrets are set
supabase secrets list

# Re-set the key
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

---

## 📞 WHAT TO DO NEXT

### **Immediate** (Today)
1. ✅ Run `./deploy.sh`
2. ✅ Run `./test-system.sh`
3. ✅ Verify all tests pass
4. ✅ Test 3 Edge Functions

### **Tomorrow**
1. Read DEPLOYMENT_STATUS_FINAL.md (20 minutes)
2. Read COMPLETE_COST_SUMMARY.md (15 minutes)
3. Read WEIGHTED_PRIORITY_SYSTEM.md (20 minutes)
4. Understand system architecture

### **This Week**
1. Create remaining SSO functions:
   - `sso-triple-ai-discovery`
   - `sso-queue-processor`
   - `sso-perplexity-analysis`

2. Test SSO workflow end-to-end
3. Verify 450 creators discovered per category

### **Next Week**
1. Create SEO functions:
   - `seo-site-monitoring`
   - `seo-brand-strategy`
   - `seo-brand-publishing`

2. Create GEO functions:
   - `geo-ai-monitoring`
   - `geo-brand-strategy`
   - `geo-brand-publishing`

---

## 💡 PRO TIPS

### **Tip 1: Start Small**
Don't try to build all 13 functions at once. Start with core monitoring:
1. Priority processor ✅
2. Sub-category detector ✅
3. QA generator ✅
4. SSO queue processor (next)

### **Tip 2: Test Frequently**
After each function deployment, test immediately:
```bash
supabase functions invoke function-name --data '{...}'
```

### **Tip 3: Monitor Costs**
Check API usage regularly:
- Anthropic: https://console.anthropic.com
- OpenAI: https://platform.openai.com/usage
- Perplexity: https://www.perplexity.ai/settings/api
- Apify: https://console.apify.com/billing

### **Tip 4: Use Test Mode**
Most functions support `test: true` parameter to run without API calls:
```bash
supabase functions invoke priority-processor --data '{"test": true}'
```

### **Tip 5: Read the Docs**
All 9 documentation files contain examples and explanations:
- SEO_GEO_FIXED_VARIABLE_MODEL.md has complete SEO/GEO logic
- SSO_COMPLETE_WORKFLOW_FINAL.md has SSO implementation details
- WEIGHTED_PRIORITY_SYSTEM.md has priority calculation examples

---

## 🎯 SUCCESS CHECKLIST

**After Deployment** (Today):
- [ ] Database schema deployed successfully
- [ ] All 20+ tables created
- [ ] 4 categories + 18 sub-categories loaded
- [ ] Priority function installed
- [ ] 3 Edge Functions deployed
- [ ] All tests pass

**After Testing** (Tomorrow):
- [ ] Priority processor works correctly
- [ ] Sub-category detector identifies products accurately
- [ ] QA generator creates quality content
- [ ] Weighted priorities calculate correctly
- [ ] Auto-rebalancing triggers fire

**After Development** (2-3 Weeks):
- [ ] All 13 Edge Functions created
- [ ] SSO monitoring operational (450 creators)
- [ ] SEO monitoring operational (800 sites)
- [ ] GEO monitoring operational (6 AI platforms)
- [ ] Cron jobs scheduled
- [ ] End-to-end workflow tested

**After Launch** (Month 4):
- [ ] First client onboarded
- [ ] Revenue generating
- [ ] All monitoring cycles running
- [ ] Dashboard displaying data
- [ ] Priority system working automatically

---

## 📋 COMMAND CHEAT SHEET

```bash
# Deploy everything
./deploy.sh

# Test system
./test-system.sh

# Deploy single function
supabase functions deploy function-name

# Test function
supabase functions invoke function-name --data '{...}'

# Check database
supabase db execute "SELECT * FROM gv_categories;"

# View logs
supabase functions logs function-name

# Set secret
supabase secrets set KEY_NAME=value

# List secrets
supabase secrets list

# Link project
supabase link --project-ref your-ref

# Start local dev
supabase start

# Stop local dev
supabase stop
```

---

## ✅ YOU'RE READY!

**What's Complete**:
- ✅ Database schema (463 lines SQL)
- ✅ Sub-category system (374 lines SQL)
- ✅ 3 Edge Functions (priority, sub-category, QA)
- ✅ 9 documentation files (~10,000 words)
- ✅ Deployment automation (deploy.sh, test-system.sh)

**What's Next**:
- 📝 Build 10 remaining Edge Functions (2-3 weeks)
- 🧪 Test end-to-end workflows (1 week)
- 🚀 Launch with first client (Month 4)

**Time Investment**: 14 hours done, 2-3 weeks remaining
**Financial Investment**: $0-25/month until launch
**Revenue Potential**: $15K-200K/month at scale

---

**RUN THIS NOW**: `./deploy.sh` 🚀

---

**END OF QUICK START GUIDE**
