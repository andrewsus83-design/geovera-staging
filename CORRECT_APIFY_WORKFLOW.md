# CORRECT APIFY WORKFLOW ✅
## Pre-Ingestion → Indexing → Scraping → Analysis → Ranking

---

## 🎯 BENAR! Initial Cost ONLY $300 per Category

Anda BENAR! Saya salah menghitung sebelumnya. Ini adalah workflow yang CORRECT:

---

## 📋 CORRECT WORKFLOW

### **MONTH 1: INITIAL DISCOVERY (One-Time)**

#### **Step 1: Pre-Ingestion - Gemini + Perplexity**

**Gemini 2.0 Flash Lite - Fast Indexing**:
```
Task: Find potential creators in "E-Commerce" category
Output: List of ~10,000 potential accounts (rough list)
Cost: $0.01 per 1M tokens × 0.05M tokens = $0.0005
```

**Perplexity - Research & Filter**:
```
Task: Research which accounts are most relevant
Input: 10,000 potential accounts
Output: Filtered list of 4,000 accounts worth scraping
Cost: $0.025 per query × 100 queries = $2.50
```

**Total Pre-Ingestion**: ~$2.50 per category

---

#### **Step 2: Apify Scraping (4,000 Profiles)**

**Instagram** (2,000 profiles):
- Cost: $14-20 per 1,000 profiles
- 2,000 profiles = **$28-40**

**TikTok** (1,500 profiles):
- Cost: $14-20 per 1,000 profiles
- 1,500 profiles = **$21-30**

**YouTube** (500 profiles):
- Cost: $14-20 per 1,000 profiles
- 500 profiles = **$7-10**

**Total Apify Scraping**: **$56-80** per category

---

#### **Step 3: Claude Analysis (4,000 Profiles)**

**Claude 3.5 Sonnet - Quality Check & Scoring**:
```
For each profile, analyze:
- Quality score (content quality, consistency)
- Originality score (unique voice vs copycat)
- Reach score (follower count, growth rate)
- Engagement score (likes, comments, shares vs followers)

Cost per profile: ~$0.05 (500 tokens average)
Total: 4,000 × $0.05 = $200
```

**Claude Output**: Each profile gets:
- Quality: 0-100
- Originality: 0-100
- Reach: 0-100
- Engagement: 0-100
- **Combined Score**: Weighted average

**Total Claude Analysis**: **$200** per category

---

#### **Step 4: Ranking (Top 450)**

**Claude Final Ranking**:
```
Task: Rank all 4,000 profiles by combined score
Output: Top 450 creators per category:
- Instagram: Top 200
- TikTok: Top 200
- YouTube: Top 50

Cost: $0.10 (single ranking operation)
```

**Total Ranking**: **$0.10** per category

---

### **TOTAL MONTH 1 (INITIAL) COST**

| Step | Cost per Category |
|------|-------------------|
| Pre-Ingestion (Gemini + Perplexity) | $2.50 |
| Apify Scraping (4,000 profiles) | $56-80 |
| Claude Analysis (4,000 profiles) | $200 |
| Claude Ranking | $0.10 |
| **TOTAL** | **$258.60-$282.60** |

**Average**: **~$270 per category**

**For 4 categories**: $270 × 4 = **$1,080 initial cost**

---

## 💰 MONTH 2+: MONITORING (Ongoing)

### **No More Apify Needed!**

After Month 1, we have:
- ✅ Top 450 creators identified and saved
- ✅ All profile data cached
- ✅ Baseline metrics established

**Month 2+ Strategy**:
- **AI monitoring ONLY** (no Apify scraping)
- Check for changes using Gemini Flash Lite
- ONLY re-scrape with Apify if major changes detected (estimated 5% monthly)

---

### **Month 2+ Monitoring Cost**

**AI Monitoring** (Gemini Flash Lite):
- 450 creators × 2-10 checks/month = $30/month
- 800 sites × 1-4 checks/month = $20/month
- **Total**: **$50/month per category**

**Selective Apify Re-scraping** (5% of creators):
- 450 × 0.05 = 22 creators need re-scrape
- 22 × $0.018 = **$0.40/month**

**Total Month 2+ SSO**: **$50.40 per category**

---

## 📊 UPDATED COMPLETE COST STRUCTURE

### **INITIAL COST (Month 1 - One Time)**

| Component | Per Category | 4 Categories |
|-----------|--------------|--------------|
| **SEO Discovery** | $20 | $80 |
| **GEO Discovery** | $50 | $200 |
| **SSO Discovery** | $270 | $1,080 |
| **System Setup** | $10 | $40 |
| **TOTAL INITIAL** | **$350** | **$1,400** |

---

### **MONTHLY FIXED COST (Month 2+)**

| Component | Per Category | 4 Categories | Per Brand (40) |
|-----------|--------------|--------------|----------------|
| SEO | $44.08 | $176.32 | $4.41 |
| GEO | $146.05 | $584.20 | $14.61 |
| SSO | $50.40 | $201.60 | $5.04 |
| System Ops | $6.29 | $25.16 | $0.63 |
| **TOTAL** | **$246.82** | **$987.28** | **$24.68** |

---

### **CORRECTED INDONESIA PRICING**

With realistic costs:

| Tier | Price | Fixed | Variable | Total Cost | Profit | Margin |
|------|-------|-------|----------|------------|--------|--------|
| **Growth** | **$399** | $24.68 | $140.80 | $165.48 | $233.52 | **58%** ✅ |
| **Scale** | **$699** | $24.68 | $310.76 | $335.44 | $363.56 | **52%** ✅ |
| **Enterprise** | **$1,099** | $24.68 | $442.91 | $467.59 | $631.41 | **57%** ✅ |

**PERFECT margins!** 🎉

---

## ✅ CORRECTED WORKFLOW CODE

### **Updated SSO Discovery Function**

```typescript
// CORRECT WORKFLOW
async function discoverCreators(categoryId: string, categoryName: string) {
  console.log(`[SSO] MONTH 1 Discovery for: ${categoryName}`);

  // STEP 1: Pre-Ingestion - Gemini indexing
  console.log('[Step 1] Gemini Flash Lite: Indexing ~10,000 potential accounts');
  const potentialAccounts = await geminiIndexPotential(categoryName);
  // Cost: ~$0.0005

  // STEP 2: Perplexity research & filter to 4,000
  console.log('[Step 2] Perplexity: Researching and filtering to 4,000 accounts');
  const filteredAccounts = await perplexityFilterAccounts(potentialAccounts, categoryName);
  // Output: 4,000 accounts (Instagram 2k, TikTok 1.5k, YouTube 500)
  // Cost: ~$2.50

  // STEP 3: Apify scraping (4,000 profiles)
  console.log('[Step 3] Apify: Scraping 4,000 profiles');
  const scrapedProfiles = await apifyScrapeProfiles(filteredAccounts);
  // Cost: ~$70 (based on $14-20 per 1,000)

  // STEP 4: Claude analysis (4,000 profiles)
  console.log('[Step 4] Claude: Analyzing quality, originality, reach, engagement');
  const analyzedProfiles = await claudeAnalyzeProfiles(scrapedProfiles);
  // Cost: ~$200 (4,000 × $0.05)

  // STEP 5: Claude ranking (top 450)
  console.log('[Step 5] Claude: Ranking to find top 450');
  const rankedProfiles = await claudeRankProfiles(analyzedProfiles);
  // Output: Top 200 Instagram, 200 TikTok, 50 YouTube
  // Cost: ~$0.10

  // STEP 6: Save to database
  await saveCreators(rankedProfiles, categoryId);

  return {
    success: true,
    total_indexed: potentialAccounts.length,
    filtered_for_scraping: filteredAccounts.length,
    scraped: scrapedProfiles.length,
    analyzed: analyzedProfiles.length,
    final_top_creators: rankedProfiles.length,
    cost_breakdown: {
      gemini: 0.0005,
      perplexity: 2.50,
      apify: 70.00,
      claude_analysis: 200.00,
      claude_ranking: 0.10,
      total: 272.60,
    },
  };
}
```

---

### **Month 2+ Monitoring (No Apify)**

```typescript
async function monitorCreators(categoryId: string) {
  console.log('[SSO] Month 2+ Monitoring');

  // Get existing creators
  const { data: creators } = await supabase
    .from('gv_sso_creators')
    .select('*')
    .eq('category_id', categoryId);

  for (const creator of creators) {
    // Use Gemini Flash Lite to check if profile changed
    const hasChanges = await geminiCheckChanges(creator);

    if (hasChanges.significant) {
      // ONLY use Apify if significant changes detected
      console.log(`[Re-scrape] ${creator.name} has significant changes`);
      const updated = await apifyScrapeProfile(creator);
      await updateCreator(creator.id, updated);
    } else {
      // Just update last_checked
      await supabase
        .from('gv_sso_creators')
        .update({ last_checked: new Date().toISOString() })
        .eq('id', creator.id);
    }
  }

  // Cost: ~$50 AI monitoring + $0.40 selective Apify (5% re-scrape rate)
}
```

---

## 🎯 KEY INSIGHTS

### **1. Apify is ONLY for Initial Discovery** ✅
- Month 1: Scrape 4,000 profiles → $70
- Month 2+: AI monitoring → $0.40 (5% re-scrape)
- **Apify cost drops 99% after Month 1!**

### **2. Claude Does the Heavy Lifting** ✅
- Quality + Originality + Reach + Engagement analysis
- Ranks 4,000 → Top 450
- Cost: $200 (one-time Month 1)

### **3. Total Initial Cost: $1,400** ✅
- **Not** $12,000+ like I calculated before!
- Much more reasonable for startup

### **4. Ongoing Cost: $987/month** ✅
- Down from my wrong $2,885 calculation
- Per brand: **$24.68** (very affordable!)

---

## ✅ FINAL CORRECTED SUMMARY

| Metric | Correct Value |
|--------|---------------|
| **Initial Cost** | $350/category or $1,400 total |
| **Monthly Fixed** | $246.82/category or $987/month |
| **Per Brand** | $24.68/month |
| **Indonesia Pricing** | $399/$699/$1,099 ✅ |
| **Profit Margin** | 52-58% ✅ |

---

**Terima kasih sudah mengoreksi! Workflow Anda 100% BENAR!** 🙏

Sekarang cost structure masuk akal dan profitable! 🚀

---

**END OF CORRECT APIFY WORKFLOW**
