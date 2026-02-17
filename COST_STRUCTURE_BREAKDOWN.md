# GEOVERA COST STRUCTURE BREAKDOWN
## Initial Cost + Monthly Fixed Cost + Brand Intelligence Variable Cost

---

## OVERVIEW

GeoVera cost structure dibagi menjadi **3 kategori** yang jelas:

1. **Initial Cost** (One-time): Setup dan discovery pertama kali
2. **Monthly Fixed Cost**: Monitoring dan maintenance rutin
3. **Brand Intelligence Variable Cost**: Fitur-fitur yang directly interact dengan brand (per-usage)

---

## 1. INITIAL COST (ONE-TIME PER BRAND)

### 1.1 Brand Onboarding & Discovery

Cost ini dikenakan **SEKALI** saat brand pertama kali ditambahkan ke sistem.

```typescript
interface InitialCost {
  // Stage 1: Gemini Flash Lite Indexing (ALL categories)
  gemini_flash_lite_indexing: {
    categories: 10, // 5 social + 5 website
    cost_per_category: 0.01,
    total: 0.10 // $0.10
  };

  // Stage 2: Perplexity Full Discovery (ALL categories)
  perplexity_full_discovery: {
    seo: {
      backlink_platforms: 10,
      cost_per_platform: 0.50,
      total: 5.00 // $5
    },
    geo: {
      topics_research: 20, // Initial topics
      cost_per_topic: 0.25,
      total: 5.00 // $5
    },
    sso: {
      creators_per_category: 500,
      sites_per_category: 1000,
      categories: 10,
      cost_per_category: 2.50,
      total: 25.00 // $25
    }
  };

  // Stage 3: Gemini Deep Analysis (Top items only)
  gemini_deep_analysis: {
    top_creators: 100,
    top_sites: 200,
    top_competitors: 50,
    cost_per_analysis: 0.0001,
    total: 0.035 // $0.035
  };

  // Initial database setup
  database_setup: {
    unified_indexes: 0.00, // Free (Supabase)
    rls_policies: 0.00,
    total: 0.00
  };

  // Total Initial Cost
  total_initial_cost: 35.135 // ~$35 per brand
}
```

### 1.2 Breakdown by Tier

| Tier    | Initial Discovery Scope | Initial Cost |
|---------|-------------------------|--------------|
| Basic   | 5 categories + 10 topics | $20         |
| Premium | 10 categories + 20 topics | $35        |
| Partner | 15 categories + 40 topics | $50        |

### 1.3 What's Included in Initial Cost?

✅ **One-Time Setup**:
- Gemini Flash Lite indexes ALL potential creators/sites
- Perplexity discovers and ranks top performers
- Gemini deep analysis for top 100 creators
- Unified indexes created (URL, Research, Entity)
- Database tables initialized
- Delta cache baseline established
- Monitoring schedules configured

❌ **NOT Included** (covered in Monthly or Variable costs):
- Ongoing monitoring
- Content generation
- AI chat interactions
- Keyword optimization
- Competitor tracking

---

## 2. MONTHLY FIXED COST (RECURRING)

### 2.1 System Monitoring & Maintenance

Cost ini dikenakan **SETIAP BULAN** untuk monitoring dan maintenance rutin.

```typescript
interface MonthlyFixedCost {
  // SSO Monitoring (Creators + Sites)
  sso_monitoring: {
    platinum_creators: {
      count: 100,
      checks_per_month: 10, // Every 3 days
      cost_per_check: 0.01, // Delta cache optimized
      total: 10.00 // $10
    },
    gold_creators: {
      count: 100,
      checks_per_month: 4, // Every 7 days
      cost_per_check: 0.01,
      total: 4.00 // $4
    },
    silver_creators: {
      count: 150,
      checks_per_month: 2, // Every 14 days
      cost_per_check: 0.01,
      total: 3.00 // $3
    },
    bronze_creators: {
      count: 150,
      checks_per_month: 1, // Every 28 days
      cost_per_check: 0.01,
      total: 1.50 // $1.50
    },
    sites_monitoring: {
      count: 1000,
      average_checks: 2.5, // Weighted by priority
      cost_per_check: 0.01,
      total: 25.00 // $25
    },
    total_sso: 43.50 // $43.50
  };

  // GEO Citation Monitoring
  geo_monitoring: {
    basic: {
      checks_per_month: 100,
      cost_per_check: 0.10,
      total: 10.00 // $10
    },
    premium: {
      checks_per_month: 200,
      cost_per_check: 0.10,
      total: 20.00 // $20
    },
    partner: {
      checks_per_month: 400,
      cost_per_check: 0.10,
      total: 40.00 // $40
    }
  };

  // SEO Backlink Monitoring
  seo_monitoring: {
    opportunities_check: {
      platforms: 10,
      checks_per_month: 4, // Weekly
      cost_per_check: 0.50,
      total: 20.00 // $20
    },
    rank_tracking: {
      keywords: 50, // Average per brand
      checks_per_month: 4,
      cost_per_check: 0.02,
      total: 4.00 // $4
    },
    total_seo: 24.00 // $24
  };

  // Incremental Discovery (Month 2+)
  incremental_discovery: {
    perplexity_new_search: {
      categories: 10,
      cost_per_category: 0.20, // Only search for items > baseline
      total: 2.00 // $2
    }
  };

  // Data Refresh (7D/14D/28D)
  data_refresh: {
    gold_refresh: 2.00,
    silver_refresh: 1.00,
    bronze_refresh: 0.50,
    total: 3.50 // $3.50
  };

  // Unified Sync & Cache Maintenance
  system_maintenance: {
    unified_index_sync: 0.50,
    delta_cache_cleanup: 0.25,
    database_optimization: 0.25,
    total: 1.00 // $1
  };

  // Self-Learning Pattern Recognition (Weekly)
  self_learning: {
    gemini_pattern_analysis: {
      frequency: 4, // Weekly
      cost_per_analysis: 0.50,
      total: 2.00 // $2
    }
  };

  // Total Monthly Fixed Cost (per tier)
  total_by_tier: {
    basic: 76.00,   // SSO + GEO(10) + SEO + Discovery + Refresh + Maintenance + Learning
    premium: 86.00, // SSO + GEO(20) + SEO + Discovery + Refresh + Maintenance + Learning
    partner: 106.00 // SSO + GEO(40) + SEO + Discovery + Refresh + Maintenance + Learning
  }
}
```

### 2.2 Breakdown by Tier

| Component | Basic | Premium | Partner |
|-----------|-------|---------|---------|
| SSO Monitoring | $43.50 | $43.50 | $43.50 |
| GEO Monitoring | $10.00 | $20.00 | $40.00 |
| SEO Monitoring | $24.00 | $24.00 | $24.00 |
| Incremental Discovery | $2.00 | $2.00 | $2.00 |
| Data Refresh | $3.50 | $3.50 | $3.50 |
| System Maintenance | $1.00 | $1.00 | $1.00 |
| Self-Learning | $2.00 | $2.00 | $2.00 |
| **Total Fixed** | **$86** | **$96** | **$116** |

### 2.3 What's Included in Monthly Fixed Cost?

✅ **Automated Monitoring**:
- SSO: Top 500 creators + 1000 sites monitoring
- GEO: Citation checks across AI engines
- SEO: Backlink opportunities + rank tracking
- Incremental discovery (only new items > baseline)
- Data refresh (7D/14D/28D cycles)
- Delta cache maintenance
- Self-learning pattern recognition

❌ **NOT Included** (covered in Variable costs):
- AI Chat questions
- Content generation
- Keyword suggestions
- Competitor analysis reports
- Custom research requests

---

## 3. BRAND INTELLIGENCE VARIABLE COST (PER-USAGE)

### 3.1 AI Chat & Interactions

Cost ini dikenakan **PER USAGE** untuk fitur yang directly interact dengan brand.

```typescript
interface BrandIntelligenceVariableCost {
  // AI Chat (Daily Questions)
  ai_chat: {
    cost_per_question: {
      simple: 0.05,   // "What's my GEO rank?" (Claude quick lookup)
      medium: 0.15,   // "Analyze my competitor X" (Claude + Perplexity)
      complex: 0.50   // "Create content strategy for topic Y" (All AIs)
    },
    typical_monthly_usage: {
      simple: 30,  // ~1 per day
      medium: 10,  // ~2-3 per week
      complex: 5   // ~1 per week
    },
    estimated_monthly_cost: 7.50 // $7.50
  };

  // Suggested Q&A (Context-Aware)
  suggested_qa: {
    cost_per_suggestion: {
      generation: 0.10,  // Claude generates relevant questions
      answer: 0.15       // Claude provides answers
    },
    typical_monthly_usage: {
      suggestions: 20,  // 20 suggested questions/month
      answers: 15       // User asks 15 of them
    },
    estimated_monthly_cost: 4.25 // $4.25
  };

  // Content Generator
  content_generator: {
    cost_per_content: {
      blog_post: 1.50,        // OpenAI + Claude feedback
      social_post: 0.25,      // Quick generation
      email_campaign: 0.75,   // Medium length
      landing_page: 2.00,     // Full page content
      meta_description: 0.10  // Short content
    },
    typical_monthly_usage: {
      blog_posts: 4,      // 1 per week
      social_posts: 12,   // 3 per week
      email_campaigns: 2,
      landing_pages: 1,
      meta_descriptions: 8
    },
    estimated_monthly_cost: 12.80 // $12.80
  };

  // Keyword Intelligence
  keyword_intelligence: {
    targeting_keywords: {
      cost_per_research: 0.50, // Perplexity + Gemini
      typical_monthly: 5,      // 5 new keyword researches
      total: 2.50 // $2.50
    },
    optimized_keywords: {
      cost_per_optimization: 0.30, // Claude analyzes + suggests improvements
      typical_monthly: 10,         // Optimize 10 keywords
      total: 3.00 // $3.00
    },
    keyword_gap_analysis: {
      cost_per_analysis: 1.00, // Deep competitor keyword analysis
      typical_monthly: 2,
      total: 2.00 // $2.00
    },
    total_keywords: 7.50 // $7.50
  };

  // Competitor Intelligence
  competitor_intelligence: {
    competitor_tracking: {
      cost_per_competitor_per_month: 5.00, // Continuous monitoring
      typical_competitors: 3,
      total: 15.00 // $15
    },
    competitor_deep_dive: {
      cost_per_analysis: 3.00, // Full analysis (SEO+GEO+SSO)
      typical_monthly: 2,
      total: 6.00 // $6
    },
    competitive_gap_analysis: {
      cost_per_report: 5.00, // Comprehensive comparison
      typical_monthly: 1,
      total: 5.00 // $5
    },
    total_competitors: 26.00 // $26
  };

  // Content Optimization
  content_optimization: {
    seo_optimization: {
      cost_per_page: 0.50, // Claude analyzes + suggests improvements
      typical_monthly: 10,
      total: 5.00 // $5
    },
    readability_analysis: {
      cost_per_analysis: 0.30,
      typical_monthly: 15,
      total: 4.50 // $4.50
    },
    total_optimization: 9.50 // $9.50
  };

  // Citation Improvement Strategies
  citation_strategies: {
    topic_strategy_generation: {
      cost_per_strategy: 2.00, // Claude reverse engineering
      typical_monthly: 5,      // 5 new topics
      total: 10.00 // $10
    },
    strategy_refinement: {
      cost_per_refinement: 1.00, // Based on performance data
      typical_monthly: 3,
      total: 3.00 // $3
    },
    total_strategies: 13.00 // $13
  };

  // Custom Research Requests
  custom_research: {
    market_research: {
      cost_per_research: 10.00, // Perplexity + Gemini deep dive
      typical_monthly: 1,
      total: 10.00 // $10
    },
    industry_analysis: {
      cost_per_analysis: 8.00,
      typical_monthly: 1,
      total: 8.00 // $8
    },
    total_research: 18.00 // $18
  };

  // OpenAI Automated Execution (Variable)
  automated_execution: {
    content_publishing: {
      cost_per_publish: 0.50, // OpenAI publishes content
      typical_monthly: 8,
      total: 4.00 // $4
    },
    outreach_campaigns: {
      cost_per_campaign: 2.00, // OpenAI sends outreach emails
      typical_monthly: 3,
      total: 6.00 // $6
    },
    total_execution: 10.00 // $10
  };

  // Total Brand Intelligence Variable Cost
  estimated_monthly_variable: {
    light_usage: 30.00,   // Minimal AI chat, basic features
    typical_usage: 109.55, // Average usage as calculated above
    heavy_usage: 250.00   // Power users, lots of content + research
  }
}
```

### 3.2 Breakdown by Usage Intensity

| Feature | Light ($30) | Typical ($110) | Heavy ($250) |
|---------|-------------|----------------|--------------|
| AI Chat | $2 | $7.50 | $20 |
| Suggested Q&A | $1 | $4.25 | $10 |
| Content Generator | $3 | $12.80 | $40 |
| Keywords | $2 | $7.50 | $20 |
| Competitors | $8 | $26.00 | $60 |
| Optimization | $3 | $9.50 | $25 |
| Strategies | $5 | $13.00 | $35 |
| Research | $5 | $18.00 | $30 |
| Execution | $1 | $10.00 | $10 |

### 3.3 What's Included in Variable Cost?

✅ **Direct Brand Interactions**:
- AI Chat questions (simple/medium/complex)
- Suggested Q&A generation and answers
- Content generation (blog, social, email, landing pages)
- Keyword targeting research
- Keyword optimization suggestions
- Competitor tracking and analysis
- Content optimization (SEO, readability)
- Citation improvement strategies
- Custom research requests
- OpenAI automated execution

❌ **NOT Included** (covered in Fixed costs):
- Regular monitoring (SSO, GEO, SEO)
- Incremental discovery
- Data refresh
- System maintenance
- Self-learning pattern recognition

---

## 4. COMPLETE COST STRUCTURE BY TIER

### 4.1 Basic Tier

```
Initial Cost (One-time):
  └─→ Brand onboarding & discovery: $20

Monthly Fixed Cost:
  ├─→ SSO Monitoring: $43.50
  ├─→ GEO Monitoring (100 checks): $10.00
  ├─→ SEO Monitoring: $24.00
  ├─→ Incremental Discovery: $2.00
  ├─→ Data Refresh: $3.50
  ├─→ System Maintenance: $1.00
  └─→ Self-Learning: $2.00
  Total Fixed: $86/month

Brand Intelligence Variable Cost:
  └─→ Typical usage: $110/month
  └─→ Range: $30-250/month (based on usage)

Total Monthly Cost: $196/month (Fixed + Typical Variable)
```

### 4.2 Premium Tier

```
Initial Cost (One-time):
  └─→ Brand onboarding & discovery: $35

Monthly Fixed Cost:
  ├─→ SSO Monitoring: $43.50
  ├─→ GEO Monitoring (200 checks): $20.00
  ├─→ SEO Monitoring: $24.00
  ├─→ Incremental Discovery: $2.00
  ├─→ Data Refresh: $3.50
  ├─→ System Maintenance: $1.00
  └─→ Self-Learning: $2.00
  Total Fixed: $96/month

Brand Intelligence Variable Cost:
  └─→ Typical usage: $110/month
  └─→ Range: $30-250/month

Total Monthly Cost: $206/month (Fixed + Typical Variable)
```

### 4.3 Partner Tier

```
Initial Cost (One-time):
  └─→ Brand onboarding & discovery: $50

Monthly Fixed Cost:
  ├─→ SSO Monitoring: $43.50
  ├─→ GEO Monitoring (400 checks): $40.00
  ├─→ SEO Monitoring: $24.00
  ├─→ Incremental Discovery: $2.00
  ├─→ Data Refresh: $3.50
  ├─→ System Maintenance: $1.00
  └─→ Self-Learning: $2.00
  Total Fixed: $116/month

Brand Intelligence Variable Cost:
  └─→ Typical usage: $110/month
  └─→ Range: $30-250/month

Total Monthly Cost: $226/month (Fixed + Typical Variable)
```

---

## 5. COST TRACKING & MONITORING

### 5.1 Database Schema for Cost Tracking

```sql
-- Track all costs by category
CREATE TABLE gv_cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Cost category
  cost_type TEXT NOT NULL CHECK (cost_type IN ('initial', 'fixed', 'variable')),
  cost_category TEXT NOT NULL, -- 'sso_monitoring', 'ai_chat', 'content_generation', etc.

  -- Cost details
  operation TEXT NOT NULL, -- Specific operation
  quantity INTEGER DEFAULT 1,
  cost_per_unit DECIMAL(10,4),
  total_cost DECIMAL(10,4),

  -- AI model used
  ai_model TEXT, -- 'gemini-flash-lite', 'perplexity', 'claude', 'openai'
  tokens_used INTEGER,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cost_tracking_brand ON gv_cost_tracking(brand_id);
CREATE INDEX idx_cost_tracking_type ON gv_cost_tracking(cost_type);
CREATE INDEX idx_cost_tracking_category ON gv_cost_tracking(cost_category);
CREATE INDEX idx_cost_tracking_date ON gv_cost_tracking(created_at);

-- Monthly cost summary view
CREATE OR REPLACE VIEW gv_monthly_cost_summary AS
SELECT
  brand_id,
  TO_CHAR(created_at, 'YYYY-MM') as month,
  cost_type,
  cost_category,
  SUM(total_cost) as total_cost,
  SUM(quantity) as total_operations,
  SUM(tokens_used) as total_tokens
FROM gv_cost_tracking
GROUP BY brand_id, TO_CHAR(created_at, 'YYYY-MM'), cost_type, cost_category
ORDER BY month DESC, cost_type, total_cost DESC;
```

### 5.2 Cost Alert System

```typescript
async function checkCostThresholds(brandId: string): Promise<void> {
  const currentMonth = getCurrentMonth();

  // Get current month costs
  const costs = await supabase
    .from('gv_monthly_cost_summary')
    .select('*')
    .eq('brand_id', brandId)
    .eq('month', currentMonth);

  // Calculate totals
  const fixedCost = costs.data
    .filter(c => c.cost_type === 'fixed')
    .reduce((sum, c) => sum + c.total_cost, 0);

  const variableCost = costs.data
    .filter(c => c.cost_type === 'variable')
    .reduce((sum, c) => sum + c.total_cost, 0);

  // Get brand tier
  const brand = await supabase
    .from('gv_brands')
    .select('tier')
    .eq('id', brandId)
    .single();

  // Expected fixed cost by tier
  const expectedFixed = {
    basic: 86,
    premium: 96,
    partner: 116
  }[brand.data.tier];

  // Alert if fixed cost exceeds expected by 20%
  if (fixedCost > expectedFixed * 1.2) {
    await sendCostAlert({
      brand_id: brandId,
      alert_type: 'fixed_cost_exceeded',
      expected: expectedFixed,
      actual: fixedCost,
      overage: fixedCost - expectedFixed
    });
  }

  // Alert if variable cost is unusually high
  if (variableCost > 250) {
    await sendCostAlert({
      brand_id: brandId,
      alert_type: 'high_variable_usage',
      amount: variableCost,
      breakdown: costs.data.filter(c => c.cost_type === 'variable')
    });
  }
}
```

---

## 6. CLIENT DASHBOARD - COST TRANSPARENCY

### 6.1 Cost Dashboard View

```typescript
interface CostDashboard {
  current_month: {
    fixed_cost: {
      total: 96.00,
      breakdown: {
        sso_monitoring: 43.50,
        geo_monitoring: 20.00,
        seo_monitoring: 24.00,
        system_maintenance: 8.50
      }
    },
    variable_cost: {
      total: 125.50,
      breakdown: {
        ai_chat: 12.00,
        content_generation: 35.00,
        competitor_analysis: 28.50,
        keyword_research: 15.00,
        custom_research: 20.00,
        automated_execution: 15.00
      }
    },
    total_cost: 221.50
  },

  cost_trend: {
    last_3_months: [
      { month: '2025-01', fixed: 96, variable: 125, total: 221 },
      { month: '2024-12', fixed: 96, variable: 98, total: 194 },
      { month: '2024-11', fixed: 96, variable: 110, total: 206 }
    ]
  },

  cost_per_feature: [
    { feature: 'AI Chat', usage: 80, cost: 12.00, avg_per_use: 0.15 },
    { feature: 'Content Generation', usage: 20, cost: 35.00, avg_per_use: 1.75 },
    { feature: 'Competitor Analysis', usage: 10, cost: 28.50, avg_per_use: 2.85 }
  ],

  optimization_tips: [
    'You used 250% more AI chat this month. Consider batching questions.',
    'Content generation cost can be reduced by using templates.',
    'Your variable cost is within typical range ($30-250).'
  ]
}
```

---

## 7. SUMMARY

### 7.1 Cost Structure Overview

| Category | What's Included | When Charged | Amount |
|----------|-----------------|--------------|--------|
| **Initial** | Brand onboarding, full discovery, setup | One-time | $20-50 |
| **Fixed** | Monitoring (SSO, GEO, SEO), system maintenance, self-learning | Monthly | $86-116 |
| **Variable** | AI chat, content generation, keywords, competitors, research | Per-usage | $30-250 |

### 7.2 Typical Monthly Cost by Tier

| Tier | Fixed | Variable (Typical) | Total/Month |
|------|-------|--------------------|-------------|
| Basic | $86 | $110 | **$196** |
| Premium | $96 | $110 | **$206** |
| Partner | $116 | $110 | **$226** |

### 7.3 Cost Predictability

✅ **Predictable (Fixed) 45%**:
- SSO monitoring
- GEO citation tracking
- SEO backlink monitoring
- System maintenance
- Self-learning

⚡ **Variable (Usage-Based) 55%**:
- AI Chat interactions
- Content generation
- Keyword research
- Competitor analysis
- Custom research

### 7.4 Cost Optimization Tips

1. **Batch AI Chat Questions**: Ask related questions together (saves 30%)
2. **Use Content Templates**: Pre-approved templates reduce generation cost
3. **Schedule Competitor Analysis**: Weekly vs daily saves 60%
4. **Leverage Self-Learning**: System gets smarter, reduces manual research needs
5. **Monitor Usage Dashboard**: Track which features cost most

---

## 8. IMPLEMENTATION

### 8.1 Cost Tracking Integration

```typescript
// Track every AI operation
async function trackAICost(
  brandId: string,
  costType: 'initial' | 'fixed' | 'variable',
  category: string,
  operation: string,
  model: string,
  tokensUsed: number,
  costPerUnit: number
): Promise<void> {
  await supabase.from('gv_cost_tracking').insert({
    brand_id: brandId,
    cost_type: costType,
    cost_category: category,
    operation,
    quantity: 1,
    cost_per_unit: costPerUnit,
    total_cost: costPerUnit,
    ai_model: model,
    tokens_used: tokensUsed,
    metadata: {
      tracked_at: new Date(),
      auto_tracked: true
    }
  });
}

// Example usage
await trackAICost(
  brandId,
  'variable',
  'ai_chat',
  'complex_question',
  'claude-sonnet-4',
  1500,
  0.50
);
```

---

**END OF DOCUMENT**
