# 💳 API INVENTORY & BALANCE CHECKER

**Date**: 12 February 2026
**Purpose**: Track all APIs used in GeoVera and monitor credit balances

---

## 📋 ALL APIS USED

### 1. **Anthropic (Claude API)** 🤖
**Environment Variable**: `ANTHROPIC_API_KEY`

**Used In**:
- `step1-chronicle-analyzer.ts` - Brand DNA analysis
- `step3-question-generator.ts` - Smart question generation

**Model**: `claude-sonnet-4-20250514`

**Pricing**:
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens
- Prompt caching: 90% discount

**Usage per Brand**:
- Step 1: ~10-12K tokens ($0.20-$0.25)
- Step 3: ~11-13K tokens ($0.20-$0.30)
- **Total**: ~$0.40-$0.55 per brand

**Check Balance**:
```bash
# Via Anthropic Console
https://console.anthropic.com/settings/billing

# Or via API
curl https://api.anthropic.com/v1/organization/usage \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

**Refill Link**: https://console.anthropic.com/settings/billing

---

### 2. **OpenAI (GPT-4 Turbo)** 🧠
**Environment Variable**: `OPENAI_API_KEY`

**Used In**:
- `step4-chat-activation.ts` - Q&A generation (GPT-4 Turbo)
- `pipeline-review-engine.ts` - Pipeline validation (GPT-4o)

**Models**:
- `gpt-4-turbo` (step4)
- `gpt-4o` (pipeline review)

**Pricing** (GPT-4 Turbo):
- Input: $10.00 per 1M tokens
- Output: $30.00 per 1M tokens

**Pricing** (GPT-4o):
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens

**Usage per Brand**:
- Step 4: ~3K tokens ($0.20-$0.40)
- Pipeline Review: ~2K tokens ($0.20-$0.40)
- **Total**: ~$0.40-$0.80 per brand

**Check Balance**:
```bash
# Via OpenAI Dashboard
https://platform.openai.com/usage

# Or via API
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Refill Link**: https://platform.openai.com/account/billing/overview

---

### 3. **Perplexity AI** 🔍
**Environment Variable**: `PERPLEXITY_API_KEY`

**Used In**:
- `step2-platform-research.ts` - Platform research
- `phase61-brand-discovery.ts` - Brand discovery
- `radar-creator-discovery-batch.ts` - Creator discovery

**Model**: `sonar-pro` or `sonar`

**Pricing**:
- Sonar: $5.00 per 1M tokens
- Sonar Pro: $15.00 per 1M tokens

**Usage per Brand**:
- Platform Research: ~$0.10-$0.20
- Brand Discovery: ~$0.10-$0.30
- Creator Discovery: ~$0.40 per batch (8 categories)
- **Total**: ~$0.60-$0.90 per brand

**Check Balance**:
```bash
# Via Perplexity Console
https://www.perplexity.ai/settings/api

# Or via API (check usage)
curl https://api.perplexity.ai/usage \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY"
```

**Refill Link**: https://www.perplexity.ai/settings/api

---

### 4. **Apify** 🕷️
**Environment Variable**: `APIFY_API_TOKEN`

**Used In**:
- `radar-apify-ingestion.ts` - Instagram/TikTok scraping

**Actors Used**:
- Instagram Profile Scraper
- TikTok Profile Scraper

**Pricing**:
- Pay-per-use based on compute units
- ~$0.50-$2.00 per 1000 profiles scraped
- Depends on actor and data volume

**Usage per Brand**:
- Instagram scraping: ~$0.10-$0.30
- TikTok scraping: ~$0.10-$0.30
- **Total**: ~$0.20-$0.60 per brand

**Check Balance**:
```bash
# Via Apify Console
https://console.apify.com/billing/usage

# Or via API
curl "https://api.apify.com/v2/account?token=$APIFY_API_TOKEN"
```

**Refill Link**: https://console.apify.com/billing/payment-methods

---

### 5. **SerpAPI (Google Search)** 🔎
**Environment Variable**: `SERPAPI_KEY`

**Used In**:
- `serpapi-search.ts` - Google search for brand visibility

**Pricing**:
- Free: 100 searches/month
- Paid plans: $50/month (5,000 searches), $100/month (15,000 searches)

**Usage per Brand**:
- ~10-20 searches per brand
- Cost: ~$0.10-$0.20 per brand (on paid plan)

**Check Balance**:
```bash
# Via SerpAPI Dashboard
https://serpapi.com/account

# Or via API
curl "https://serpapi.com/account?api_key=$SERPAPI_KEY"
```

**Refill Link**: https://serpapi.com/pricing

---

### 6. **Notion API** 📝
**Environment Variable**: `NOTION_API_KEY`

**Used In**:
- `publish-authority-asset.ts` - Publishing content to Notion

**Pricing**:
- FREE for API usage
- No per-request charges
- Rate limits: 3 requests per second

**Usage per Brand**:
- Publishing assets: FREE
- **Cost**: $0

**Check Balance**:
```bash
# No balance to check (free API)
# Just verify API key is valid
curl https://api.notion.com/v1/users/me \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

**Setup Link**: https://www.notion.so/my-integrations

---

### 7. **Cloudinary** 🖼️
**Environment Variable**: `CLOUDINARY_API_KEY`

**Used In**:
- `seed-data-generator.ts` - Image storage/manipulation

**Pricing**:
- Free: 25 credits/month (25GB storage, 25GB bandwidth)
- Paid: $99/month (500 credits)

**Usage per Brand**:
- Image uploads: ~1-5 images
- Cost: ~$0.01-$0.05 per brand

**Check Balance**:
```bash
# Via Cloudinary Console
https://cloudinary.com/console/usage

# Or via API
curl https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/usage \
  -u "$CLOUDINARY_API_KEY:$CLOUDINARY_API_SECRET"
```

**Refill Link**: https://cloudinary.com/console/settings/billing

---

### 8. **Runway ML** 🎬
**Environment Variable**: Not found in current files (but endpoint detected)

**Potential Use**: Video generation or AI media

**Pricing**: Pay-per-use (credits system)

**Status**: 🟡 Detected endpoint but not actively used in current files

**Check Balance**: https://app.runwayml.com/settings/billing

---

### 9. **Supabase** 🗄️
**Environment Variables**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

**Used In**: ALL files (database, auth, storage, realtime)

**Pricing**:
- Free tier: 500MB database, 1GB storage, 2GB bandwidth
- Pro: $25/month (8GB database, 100GB storage, 250GB bandwidth)
- Pay-as-you-go for overages

**Usage per Brand**:
- Database operations: FREE (within limits)
- Storage: ~$0.01-$0.05 per brand
- **Cost**: ~$0.01-$0.05 per brand

**Check Balance**:
```bash
# Via Supabase Dashboard
https://supabase.com/dashboard/project/YOUR_PROJECT/settings/billing/subscription

# No API for balance check, use dashboard
```

**Refill Link**: https://supabase.com/dashboard/project/_/settings/billing

---

## 💰 TOTAL COST PER BRAND

| API | Cost per Brand | Usage Type |
|-----|----------------|------------|
| Anthropic (Claude) | $0.40-$0.55 | Steps 1 & 3 |
| OpenAI (GPT-4) | $0.40-$0.80 | Step 4 & Validation |
| Perplexity | $0.60-$0.90 | Step 2 & Phase 6.1 |
| Apify | $0.20-$0.60 | Scraping |
| SerpAPI | $0.10-$0.20 | Search |
| Notion | FREE | Publishing |
| Cloudinary | $0.01-$0.05 | Images |
| Supabase | $0.01-$0.05 | Database |
| **TOTAL** | **$1.72-$3.15** | **Full Pipeline** |

**Recommended**: Use **$2.50 per brand** as budget estimate

---

## 🚨 BALANCE MONITORING SCRIPT

Create this script to check all API balances automatically:

```bash
#!/bin/bash
# check-api-balances.sh

echo "🔍 Checking API Balances..."
echo "================================"

# 1. Anthropic
echo ""
echo "1️⃣ ANTHROPIC (Claude):"
curl -s https://api.anthropic.com/v1/organization/usage \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" | jq '.'

# 2. OpenAI
echo ""
echo "2️⃣ OPENAI (GPT-4):"
curl -s https://api.openai.com/v1/usage?date=$(date +%Y-%m-%d) \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.'

# 3. Perplexity
echo ""
echo "3️⃣ PERPLEXITY:"
curl -s https://api.perplexity.ai/usage \
  -H "Authorization: Bearer $PERPLEXITY_API_KEY" | jq '.'

# 4. Apify
echo ""
echo "4️⃣ APIFY:"
curl -s "https://api.apify.com/v2/account?token=$APIFY_API_TOKEN" | jq '.data.usageCredits'

# 5. SerpAPI
echo ""
echo "5️⃣ SERPAPI:"
curl -s "https://serpapi.com/account?api_key=$SERPAPI_KEY" | jq '.account_type, .searches_per_month, .plan_searches_left'

# 6. Notion
echo ""
echo "6️⃣ NOTION:"
curl -s https://api.notion.com/v1/users/me \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" | jq '.name, .type'

# 7. Cloudinary
echo ""
echo "7️⃣ CLOUDINARY:"
echo "(Check manually at: https://cloudinary.com/console/usage)"

# 8. Supabase
echo ""
echo "8️⃣ SUPABASE:"
echo "(Check manually at: https://supabase.com/dashboard)"

echo ""
echo "================================"
echo "✅ Balance check complete!"
```

**Usage**:
```bash
chmod +x check-api-balances.sh
./check-api-balances.sh
```

---

## 📊 RECOMMENDED BALANCE THRESHOLDS

Set alerts when balances fall below:

| API | Alert Threshold | Refill Amount |
|-----|----------------|---------------|
| Anthropic | < $50 | $100-$200 |
| OpenAI | < $50 | $100-$200 |
| Perplexity | < $50 | $100-$200 |
| Apify | < $20 | $50-$100 |
| SerpAPI | < 500 searches | Upgrade plan |
| Notion | N/A (FREE) | N/A |
| Cloudinary | < 100 credits | Upgrade plan |
| Supabase | < 50% quota | Upgrade plan |

---

## 🔔 MONITORING SETUP

### Option 1: Manual Check (Daily)
- Run `check-api-balances.sh` script daily
- Review balances before large batch jobs

### Option 2: Automated Monitoring (Recommended)
Create a Supabase Edge Function that runs daily:

```typescript
// check-api-balances-daily.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const balances = {
    anthropic: await checkAnthropic(),
    openai: await checkOpenAI(),
    perplexity: await checkPerplexity(),
    apify: await checkApify(),
    serpapi: await checkSerpAPI(),
  }

  // Check if any balance is low
  const alerts = []
  if (balances.anthropic < 50) alerts.push('Anthropic < $50')
  if (balances.openai < 50) alerts.push('OpenAI < $50')
  if (balances.perplexity < 50) alerts.push('Perplexity < $50')
  if (balances.apify < 20) alerts.push('Apify < $20')

  // Send alert email if any balance is low
  if (alerts.length > 0) {
    await sendAlertEmail(alerts)
  }

  return new Response(JSON.stringify({ balances, alerts }))
})
```

---

## 📧 ALERT CONTACTS

Set up email alerts when balances are low:
- **Email**: your-email@example.com
- **Slack**: #api-alerts channel
- **SMS**: (optional) for critical alerts

---

## 🎯 QUICK REFERENCE

**All API Dashboards**:
1. Anthropic: https://console.anthropic.com/settings/billing
2. OpenAI: https://platform.openai.com/usage
3. Perplexity: https://www.perplexity.ai/settings/api
4. Apify: https://console.apify.com/billing/usage
5. SerpAPI: https://serpapi.com/account
6. Notion: https://www.notion.so/my-integrations
7. Cloudinary: https://cloudinary.com/console/usage
8. Supabase: https://supabase.com/dashboard/project/_/settings/billing

**Environment Variables File**:
```bash
# Save this to .env
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
PERPLEXITY_API_KEY=pplx-xxx
APIFY_API_TOKEN=apify_api_xxx
SERPAPI_KEY=xxx
NOTION_API_KEY=secret_xxx
CLOUDINARY_API_KEY=xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_ANON_KEY=xxx
```

---

**Check this document regularly to ensure all APIs have sufficient credits!** 💳
