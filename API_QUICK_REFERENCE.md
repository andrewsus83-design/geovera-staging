# 💳 API QUICK REFERENCE CARD

**Last Updated**: 12 February 2026

---

## 🚀 QUICK CHECK

Run this command to check all API balances:

```bash
./check-api-balances.sh
```

---

## 📋 ALL 8 APIS

| # | API | Cost/Brand | Refill at | Dashboard |
|---|-----|------------|-----------|-----------|
| 1 | **Anthropic** | $0.40-$0.55 | < $50 | [console.anthropic.com](https://console.anthropic.com/settings/billing) |
| 2 | **OpenAI** | $0.40-$0.80 | < $50 | [platform.openai.com](https://platform.openai.com/usage) |
| 3 | **Perplexity** | $0.60-$0.90 | < $50 | [perplexity.ai](https://www.perplexity.ai/settings/api) |
| 4 | **Apify** | $0.20-$0.60 | < $20 | [console.apify.com](https://console.apify.com/billing/usage) |
| 5 | **SerpAPI** | $0.10-$0.20 | < 500 searches | [serpapi.com](https://serpapi.com/account) |
| 6 | **Notion** | FREE | N/A | [notion.so](https://www.notion.so/my-integrations) |
| 7 | **Cloudinary** | $0.01-$0.05 | < 100 credits | [cloudinary.com](https://cloudinary.com/console/usage) |
| 8 | **Supabase** | $0.01-$0.05 | < 50% quota | [supabase.com](https://supabase.com/dashboard) |

**TOTAL COST**: ~$1.72-$3.15 per brand (use $2.50 as estimate)

---

## 🔔 ALERT THRESHOLDS

| API | ⚠️ Warning | 🚨 Critical |
|-----|-----------|------------|
| Anthropic | < $100 | < $50 |
| OpenAI | < $100 | < $50 |
| Perplexity | < $100 | < $50 |
| Apify | < $50 | < $20 |
| SerpAPI | < 1,000 searches | < 500 searches |

---

## 💰 RECOMMENDED REFILL AMOUNTS

| API | Refill Amount | Lasts For |
|-----|---------------|-----------|
| Anthropic | $100-$200 | ~200-400 brands |
| OpenAI | $100-$200 | ~125-250 brands |
| Perplexity | $100-$200 | ~110-165 brands |
| Apify | $50-$100 | ~80-250 brands |
| SerpAPI | Upgrade to $100/month | 15,000 searches |

**For 1000 brands/month**: Budget $2,500-$3,000

---

## 📊 MONTHLY COSTS

### Staging (0.5-1% volume = 5-10 brands/month):
- Total: **$10-50/month**

### Production (1000 brands/month):
| Volume | Monthly Cost |
|--------|--------------|
| 100 brands | $175-$315 |
| 500 brands | $860-$1,575 |
| 1000 brands | $1,720-$3,150 |
| 5000 brands | $8,600-$15,750 |

---

## 🔑 ENVIRONMENT VARIABLES

Create `.env` file with:

```bash
# AI APIs
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
PERPLEXITY_API_KEY=pplx-xxx

# Scraping APIs
APIFY_API_TOKEN=apify_api_xxx
SERPAPI_KEY=xxx

# Other Services
NOTION_API_KEY=secret_xxx
CLOUDINARY_API_KEY=xxx

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_ANON_KEY=xxx
```

---

## ✅ DAILY CHECKLIST

**Before Running Pipeline**:
- [ ] Check all API balances: `./check-api-balances.sh`
- [ ] Ensure each API has sufficient credits
- [ ] Refill any API below threshold
- [ ] Test 1-2 brands before batch processing

**After Running Pipeline**:
- [ ] Monitor actual costs vs estimates
- [ ] Check for any API errors
- [ ] Update cost estimates if needed
- [ ] Plan next refill based on usage

---

## 📞 REFILL LINKS (Quick Access)

1. **Anthropic**: https://console.anthropic.com/settings/billing
2. **OpenAI**: https://platform.openai.com/account/billing/overview
3. **Perplexity**: https://www.perplexity.ai/settings/api
4. **Apify**: https://console.apify.com/billing/payment-methods
5. **SerpAPI**: https://serpapi.com/pricing
6. **Cloudinary**: https://cloudinary.com/console/settings/billing
7. **Supabase**: https://supabase.com/dashboard/project/_/settings/billing

---

## 🚨 EMERGENCY CONTACTS

**If API balance runs out during processing**:

1. **Pause pipeline immediately**
2. **Refill the affected API** (links above)
3. **Wait 2-5 minutes** for credits to reflect
4. **Resume pipeline** from last successful brand
5. **Document the incident** for future planning

---

## 📈 COST OPTIMIZATION TIPS

1. **Enable Claude Prompt Caching** → 90% savings on repeated prompts
2. **Batch API calls** → Reduce overhead
3. **Use lower-tier models** for non-critical tasks
4. **Monitor and adjust** max_tokens limits
5. **Set up rate limiting** to avoid unexpected costs

---

## 🎯 USAGE BY PIPELINE STEP

| Step | APIs Used | Cost per Brand |
|------|-----------|----------------|
| **Step 1: Chronicle** | Claude | $0.20-$0.25 |
| **Step 2: Research** | Perplexity | $0.10-$0.20 |
| **Step 3: Questions** | Claude | $0.20-$0.30 |
| **Step 4: Chat** | OpenAI | $0.20-$0.40 |
| **Phase 6.1: Discovery** | Perplexity | $0.15-$0.35 |
| **Scraping** | Apify | $0.20-$0.60 |
| **Search** | SerpAPI | $0.10-$0.20 |
| **Validation** | OpenAI | $0.20-$0.40 |

---

## 💡 PRO TIPS

**Save money**:
- ✅ Test on 1 brand before batch
- ✅ Use staging (0.5-1% volume) for testing
- ✅ Monitor costs daily
- ✅ Set budget alerts on each platform
- ✅ Optimize prompts to reduce token usage

**Avoid surprises**:
- ⚠️ Never run batch jobs without checking balances first
- ⚠️ Set up email alerts for low balances
- ⚠️ Keep $50 buffer on each API
- ⚠️ Review costs weekly
- ⚠️ Update this document when pricing changes

---

**Keep this file handy! Print it out or bookmark it!** 📌
