# REVISED QA SYSTEM - PLATFORM & BRAND LEVEL
## 1000 QA Every 2 Weeks (Platform) + Daily Questions (Tier-Based Variable Cost)

---

## OVERVIEW

**Two-Tier QA System**:

1. **Platform QA Pool** (Fixed Cost): 1,000 Q&A pairs setiap 2 minggu, shared across all brands
2. **Brand Daily Questions** (Variable Cost): Tier-based daily questions specific ke brand

---

## 1. PLATFORM QA POOL (FIXED COST - SHARED)

### 1.1 Platform-Level QA Generation

```typescript
interface PlatformQAPool {
  // Generation frequency
  generation_frequency: '2_weeks', // Every 2 weeks
  qa_pairs_per_batch: 1000,

  // Categories covered
  categories: [
    'seo_general',           // 150 Q&A
    'geo_optimization',      // 150 Q&A
    'social_search',         // 150 Q&A
    'content_marketing',     // 150 Q&A
    'competitor_analysis',   // 100 Q&A
    'keyword_research',      // 100 Q&A
    'backlink_strategy',     // 100 Q&A
    'analytics_insights',    // 100 Q&A
  ],

  // AI generation process
  generation_process: {
    // Step 1: Claude generates questions (based on industry trends)
    question_generation: {
      model: 'claude-sonnet-4',
      prompt: 'Generate 1000 relevant SEO/GEO/SSO questions based on latest trends',
      input_tokens: 2000,
      output_tokens: 15000, // 1000 questions × ~15 tokens
      cost: 0.08 // $0.08
    },

    // Step 2: Perplexity researches latest answers
    answer_research: {
      model: 'perplexity-sonar-pro',
      queries: 100, // Batch questions for efficiency
      cost_per_query: 0.005,
      total_cost: 0.50 // $0.50
    },

    // Step 3: Claude formats and validates
    answer_formatting: {
      model: 'claude-sonnet-4',
      input_tokens: 50000, // Research results
      output_tokens: 30000, // 1000 answers
      cost: 0.65 // $0.65
    },

    // Step 4: Quality check (sample)
    quality_check: {
      sample_size: 100, // Check 10% of Q&A
      cost: 0.05 // $0.05
    },

    total_generation_cost: 1.28 // $1.28 per batch
  },

  // Frequency cost
  monthly_cost: {
    batches_per_month: 2, // Every 2 weeks = 2x/month
    cost_per_batch: 1.28,
    total: 2.56 // $2.56/month for platform QA pool
  },

  // Storage
  database_storage: {
    qa_pairs: 2000, // Keep last 2 batches (1 month)
    rotation: 'rolling', // New batch replaces oldest
    storage_cost: 0.10 // $0.10/month (negligible)
  },

  total_platform_qa_cost: 2.66 // ~$2.66/month
}
```

### 1.2 Platform QA Database Schema

```sql
-- Platform QA pool (shared across all brands)
CREATE TABLE gv_platform_qa_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Q&A content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Category
  category TEXT NOT NULL, -- 'seo_general', 'geo_optimization', etc.

  -- Tags for relevance matching
  tags JSONB, -- ['keyword-research', 'competitor-analysis', 'on-page-seo']
  keywords JSONB, -- ['keywords', 'ranking', 'optimization']

  -- Quality metrics
  quality_score DECIMAL(5,2) DEFAULT 100.00,
  accuracy_verified BOOLEAN DEFAULT false,

  -- Metadata
  batch_id TEXT NOT NULL, -- '2025-01-batch-1'
  generated_by TEXT DEFAULT 'claude-sonnet-4',
  researched_by TEXT DEFAULT 'perplexity-sonar-pro',

  -- Lifecycle
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- After 30 days
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_qa_category ON gv_platform_qa_pool(category);
CREATE INDEX idx_platform_qa_tags ON gv_platform_qa_pool USING GIN(tags);
CREATE INDEX idx_platform_qa_active ON gv_platform_qa_pool(is_active);
CREATE INDEX idx_platform_qa_expires ON gv_platform_qa_pool(expires_at);

-- QA usage tracking
CREATE TABLE gv_platform_qa_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qa_id UUID REFERENCES gv_platform_qa_pool(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Usage context
  used_in TEXT CHECK (used_in IN ('suggested', 'search', 'chat')),
  was_helpful BOOLEAN, -- User feedback

  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qa_usage_qa ON gv_platform_qa_usage(qa_id);
CREATE INDEX idx_qa_usage_brand ON gv_platform_qa_usage(brand_id);
```

### 1.3 How Brands Access Platform QA Pool

```typescript
// Brands access QA pool based on relevance to their industry/keywords
async function getSuggestedQAForBrand(
  brandId: string,
  limit: number = 10
): Promise<QAPair[]> {
  // Get brand context
  const brand = await supabase
    .from('gv_brands')
    .select('*, industry, keywords, topics')
    .eq('id', brandId)
    .single();

  // Find relevant Q&A from platform pool
  const relevantQA = await supabase
    .from('gv_platform_qa_pool')
    .select('*')
    .eq('is_active', true)
    .or(`
      tags @> '["${brand.data.industry}"]'::jsonb,
      keywords && ARRAY[${brand.data.keywords.map(k => `'${k}'`).join(',')}]
    `)
    .order('quality_score', { descending: true })
    .limit(limit);

  // Track usage (no cost - just tracking)
  await supabase.from('gv_platform_qa_usage').insert(
    relevantQA.data.map(qa => ({
      qa_id: qa.id,
      brand_id: brandId,
      used_in: 'suggested'
    }))
  );

  return relevantQA.data;
}
```

---

## 2. BRAND DAILY QUESTIONS (VARIABLE COST - TIER-BASED)

### 2.1 Tier-Based Daily Question Limits

```typescript
interface BrandDailyQuestions {
  // Daily question limits by tier
  tier_limits: {
    basic: {
      daily_questions: 3,     // 3 questions per day
      monthly_total: 90,      // 3 × 30 days
      question_types: ['simple', 'medium']
    },
    premium: {
      daily_questions: 10,    // 10 questions per day
      monthly_total: 300,     // 10 × 30 days
      question_types: ['simple', 'medium', 'complex']
    },
    partner: {
      daily_questions: 30,    // 30 questions per day
      monthly_total: 900,     // 30 × 30 days
      question_types: ['simple', 'medium', 'complex', 'research']
    }
  };

  // Cost per question type
  cost_structure: {
    simple: {
      description: 'Quick lookup from platform QA pool or basic data',
      example: 'What is my current GEO rank for "project management"?',
      ai_model: 'claude-haiku',
      avg_tokens: 500,
      cost: 0.01 // $0.01
    },

    medium: {
      description: 'Requires analysis of brand data + context',
      example: 'Why did my citation frequency drop last week?',
      ai_model: 'claude-sonnet-4',
      avg_tokens: 1500,
      cost: 0.05 // $0.05
    },

    complex: {
      description: 'Deep analysis with Perplexity research',
      example: 'Create a strategy to outrank competitor X for topic Y',
      ai_model: 'claude-sonnet-4 + perplexity',
      avg_tokens: 3000,
      cost: 0.15 // $0.15
    },

    research: {
      description: 'Full research with Gemini + Perplexity + Claude',
      example: 'Analyze market trends and create 6-month roadmap',
      ai_model: 'claude + perplexity + gemini',
      avg_tokens: 10000,
      cost: 0.50 // $0.50
    }
  };

  // Typical monthly usage patterns
  typical_usage: {
    basic: {
      simple: 70,    // 70 simple questions × $0.01 = $0.70
      medium: 20,    // 20 medium questions × $0.05 = $1.00
      total_cost: 1.70 // $1.70/month
    },
    premium: {
      simple: 180,   // 180 × $0.01 = $1.80
      medium: 90,    // 90 × $0.05 = $4.50
      complex: 30,   // 30 × $0.15 = $4.50
      total_cost: 10.80 // $10.80/month
    },
    partner: {
      simple: 450,   // 450 × $0.01 = $4.50
      medium: 300,   // 300 × $0.05 = $15.00
      complex: 120,  // 120 × $0.15 = $18.00
      research: 30,  // 30 × $0.50 = $15.00
      total_cost: 52.50 // $52.50/month
    }
  }
}
```

### 2.2 Daily Question Tracking Schema

```sql
-- Brand daily questions (variable cost)
CREATE TABLE gv_brand_daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Question
  question TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('simple', 'medium', 'complex', 'research')),

  -- Answer
  answer TEXT,
  answer_source TEXT, -- 'platform_qa_pool', 'claude_analysis', 'perplexity_research', etc.

  -- Context
  context JSONB, -- Brand-specific context used to answer
  related_data JSONB, -- Links to GEO topics, SEO keywords, etc.

  -- Cost tracking
  cost DECIMAL(10,4),
  ai_model TEXT,
  tokens_used INTEGER,

  -- Usage
  asked_by UUID REFERENCES auth.users(id),
  was_helpful BOOLEAN,
  follow_up_questions JSONB, -- If user asked follow-ups

  -- Lifecycle
  asked_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_daily_questions_brand ON gv_brand_daily_questions(brand_id);
CREATE INDEX idx_brand_daily_questions_type ON gv_brand_daily_questions(question_type);
CREATE INDEX idx_brand_daily_questions_date ON gv_brand_daily_questions(asked_at);

-- Daily question quota tracking
CREATE TABLE gv_brand_daily_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Date tracking
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Quota
  tier TEXT NOT NULL,
  daily_limit INTEGER NOT NULL,
  questions_used INTEGER DEFAULT 0,
  questions_remaining INTEGER,

  -- Cost tracking
  total_cost_today DECIMAL(10,4) DEFAULT 0.00,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, date)
);

CREATE INDEX idx_daily_quota_brand_date ON gv_brand_daily_quota(brand_id, date);

-- Auto-update remaining questions
CREATE OR REPLACE FUNCTION update_daily_quota()
RETURNS TRIGGER AS $$
BEGIN
  NEW.questions_remaining := NEW.daily_limit - NEW.questions_used;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_quota
BEFORE INSERT OR UPDATE OF questions_used ON gv_brand_daily_quota
FOR EACH ROW
EXECUTE FUNCTION update_daily_quota();
```

### 2.3 Daily Question Flow

```typescript
// User asks a question
async function askDailyQuestion(
  brandId: string,
  question: string,
  userId: string
): Promise<Answer> {
  // Step 1: Check daily quota
  const today = new Date().toISOString().split('T')[0];

  let quota = await supabase
    .from('gv_brand_daily_quota')
    .select('*')
    .eq('brand_id', brandId)
    .eq('date', today)
    .maybeSingle();

  if (!quota.data) {
    // Create quota for today
    const brand = await supabase
      .from('gv_brands')
      .select('tier')
      .eq('id', brandId)
      .single();

    const dailyLimit = {
      basic: 3,
      premium: 10,
      partner: 30
    }[brand.data.tier];

    quota = await supabase
      .from('gv_brand_daily_quota')
      .insert({
        brand_id: brandId,
        date: today,
        tier: brand.data.tier,
        daily_limit: dailyLimit,
        questions_used: 0
      })
      .select()
      .single();
  }

  // Check if quota exceeded
  if (quota.data.questions_used >= quota.data.daily_limit) {
    throw new Error(`Daily question limit reached (${quota.data.daily_limit}). Upgrade tier for more questions.`);
  }

  // Step 2: Classify question complexity
  const questionType = await classifyQuestion(question);

  // Step 3: Check if answer exists in platform QA pool (free!)
  const poolAnswer = await searchPlatformQAPool(question, brandId);

  if (poolAnswer) {
    // Answer found in platform pool - no cost!
    await saveAnswer(brandId, question, poolAnswer, 'platform_qa_pool', 0.00);

    // Update quota (no cost)
    await updateQuota(quota.data.id, 0.00);

    return poolAnswer;
  }

  // Step 4: Generate brand-specific answer (variable cost)
  const answer = await generateBrandAnswer(question, questionType, brandId);

  // Step 5: Save and track cost
  await saveAnswer(
    brandId,
    question,
    answer.text,
    answer.source,
    answer.cost
  );

  // Update quota
  await updateQuota(quota.data.id, answer.cost);

  // Track in cost tracking
  await trackVariableCost(
    brandId,
    'variable',
    'daily_questions',
    `question_${questionType}`,
    answer.cost
  );

  return answer;
}

// Classify question complexity
async function classifyQuestion(question: string): Promise<QuestionType> {
  // Use Claude Haiku for quick classification (cheap)
  const classification = await anthropic.messages.create({
    model: 'claude-haiku-20240307',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Classify this question as: simple, medium, complex, or research.

Question: "${question}"

Simple: Quick lookup or basic data retrieval
Medium: Requires analysis of existing data
Complex: Needs deep analysis + external research
Research: Comprehensive research with multiple sources

Answer with just the classification word.`
    }]
  });

  const type = classification.content[0].text.trim().toLowerCase();
  return type as QuestionType;
}

// Generate brand-specific answer
async function generateBrandAnswer(
  question: string,
  type: QuestionType,
  brandId: string
): Promise<{ text: string; source: string; cost: number }> {
  // Get brand context
  const brandContext = await getBrandContext(brandId);

  switch (type) {
    case 'simple':
      // Use Claude Haiku + brand data
      const simpleAnswer = await anthropic.messages.create({
        model: 'claude-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Brand: ${brandContext.brand_name}
Industry: ${brandContext.industry}

Question: ${question}

Provide a concise answer using the brand's existing data.`
        }]
      });

      return {
        text: simpleAnswer.content[0].text,
        source: 'claude_haiku',
        cost: 0.01
      };

    case 'medium':
      // Use Claude Sonnet + brand analysis
      const mediumAnswer = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Analyze this question for ${brandContext.brand_name}:

${question}

Brand data:
- GEO Topics: ${JSON.stringify(brandContext.geo_topics)}
- SEO Keywords: ${JSON.stringify(brandContext.seo_keywords)}
- Recent Performance: ${JSON.stringify(brandContext.recent_metrics)}

Provide detailed analysis.`
        }]
      });

      return {
        text: mediumAnswer.content[0].text,
        source: 'claude_sonnet_analysis',
        cost: 0.05
      };

    case 'complex':
      // Use Claude + Perplexity research
      const research = await perplexity.chat({
        model: 'sonar-pro',
        messages: [{
          role: 'user',
          content: `Research: ${question}`
        }]
      });

      const complexAnswer = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `Create strategy for ${brandContext.brand_name}:

Question: ${question}

Research findings:
${research.choices[0].message.content}

Brand context:
${JSON.stringify(brandContext)}

Provide comprehensive strategy.`
        }]
      });

      return {
        text: complexAnswer.content[0].text,
        source: 'claude_perplexity_research',
        cost: 0.15
      };

    case 'research':
      // Full research with all AIs
      const [perplexityRes, geminiRes] = await Promise.all([
        perplexity.chat({ model: 'sonar-pro', messages: [{ role: 'user', content: question }] }),
        gemini.generateContent({ contents: [{ role: 'user', parts: [{ text: question }] }] })
      ]);

      const fullAnswer = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5000,
        messages: [{
          role: 'user',
          content: `Comprehensive research for ${brandContext.brand_name}:

Question: ${question}

Perplexity research: ${perplexityRes.choices[0].message.content}
Gemini analysis: ${geminiRes.response.text()}
Brand context: ${JSON.stringify(brandContext)}

Create detailed roadmap with actionable recommendations.`
        }]
      });

      return {
        text: fullAnswer.content[0].text,
        source: 'full_research',
        cost: 0.50
      };
  }
}
```

---

## 3. UPDATED COST STRUCTURE

### 3.1 Platform Fixed Cost (QA Pool)

```typescript
interface UpdatedPlatformFixedCost {
  // Previous fixed cost
  previous_sso_monitoring: 500.00,

  // Add QA pool generation
  qa_pool_generation: 2.66, // 1000 Q&A every 2 weeks

  // Updated total platform fixed cost
  total_platform_fixed: 502.66, // ~$503/month

  // Round to
  rounded_total: 500.00, // Keep at $500 (QA cost negligible)

  // Cost per brand (200 brands)
  cost_per_brand: 2.50 // $500 / 200 = $2.50
}
```

### 3.2 Variable Cost (Daily Questions)

```typescript
interface UpdatedVariableCost {
  // Existing variable costs (from previous)
  existing_variable: {
    allocation: 5.00,
    on_demand_views: 24.50,
    content_generation: 12.80,
    keyword_intelligence: 7.50,
    competitor_intelligence: 26.00,
    // ... etc
  },

  // NEW: Daily questions (tier-based)
  daily_questions: {
    basic: 1.70,      // 90 questions/month typical
    premium: 10.80,   // 300 questions/month typical
    partner: 52.50    // 900 questions/month typical
  },

  // Updated total variable per tier
  updated_total_variable: {
    basic: 47.70,     // Was $45, now $47.70 (+$1.70)
    premium: 70.80,   // Was $60, now $70.80 (+$10.80)
    partner: 132.50   // Was $80, now $132.50 (+$52.50)
  }
}
```

### 3.3 Final Pricing (Updated with Daily Questions)

| Tier | Fixed | Variable (Typical) | Total/Month |
|------|-------|--------------------|-------------|
| Basic | $26 | $47.70 | **$73.70** |
| Premium | $36 | $70.80 | **$106.80** |
| Partner | $56 | $132.50 | **$188.50** |

---

## 4. FEATURE COMPARISON

### 4.1 QA Features by Tier

| Feature | Basic | Premium | Partner |
|---------|-------|---------|---------|
| **Platform QA Pool Access** | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| **Daily Questions** | 3/day | 10/day | 30/day |
| **Monthly Total** | 90 | 300 | 900 |
| **Question Types** | Simple, Medium | Simple, Medium, Complex | All types + Research |
| **Average Cost/Month** | $1.70 | $10.80 | $52.50 |
| **Cost Per Question** | $0.019 | $0.036 | $0.058 |

### 4.2 Platform QA Pool Benefits

✅ **Shared Knowledge**: 1,000 fresh Q&A every 2 weeks
✅ **Zero Cost**: Accessing platform pool is free
✅ **Always Updated**: Refreshed every 2 weeks with latest trends
✅ **High Quality**: Claude + Perplexity generated
✅ **Broad Coverage**: 8 categories covered

---

## 5. DASHBOARD IMPLEMENTATION

### 5.1 Daily Questions Widget

```typescript
interface DailyQuestionsWidget {
  // Quota display
  quota: {
    tier: 'premium',
    daily_limit: 10,
    used_today: 7,
    remaining: 3,
    resets_in: '5 hours'
  },

  // Recent questions
  recent_questions: [
    {
      question: 'Why did my citation frequency drop?',
      type: 'medium',
      cost: 0.05,
      answered_at: '2 hours ago',
      was_helpful: true
    }
  ],

  // Suggested from platform pool (free!)
  suggested_qa: [
    {
      question: 'How to improve SEO rankings in 2025?',
      source: 'platform_qa_pool',
      cost: 0.00, // FREE
      category: 'seo_general'
    }
  ],

  // Cost tracking
  cost_today: 0.45,
  cost_this_month: 8.75,
  estimated_month_total: 10.80
}
```

### 5.2 UI Example

```
Daily Questions - Premium Tier
┌─────────────────────────────────────────────────┐
│ Today's Quota: 7/10 used (3 remaining)         │
│ Resets in: 5 hours                              │
│                                                  │
│ Ask a question:                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ What should I focus on this week?           │ │
│ └─────────────────────────────────────────────┘ │
│ [Ask] (Est. cost: $0.05 - medium question)     │
│                                                  │
│ 💡 Suggested from GeoVera Knowledge (Free!)    │
│ ├─ How to optimize GEO citations?              │
│ ├─ What are the best backlink platforms?       │
│ └─ How to track competitor rankings?           │
│                                                  │
│ Recent Questions Today:                         │
│ ├─ Why did citations drop? ($0.05) 👍         │
│ ├─ Top competitor strategies? ($0.15) 👍       │
│ └─ Keyword opportunities? ($0.05) 👍           │
│                                                  │
│ Cost today: $0.45 / Monthly: $8.75              │
└─────────────────────────────────────────────────┘
```

---

## 6. COST OPTIMIZATION TIPS

### 6.1 For Brands

✅ **Check Platform Pool First**: 1,000 free Q&A updated every 2 weeks
✅ **Use Simple Questions**: When possible, ask simpler questions ($0.01 vs $0.50)
✅ **Batch Related Questions**: Ask follow-ups in same thread (context reuse)
✅ **Upgrade Strategically**: Only upgrade if you need more daily questions

### 6.2 For GeoVera

✅ **Smart Question Classification**: Auto-classify to optimize cost
✅ **Platform Pool Matching**: Try to answer from pool first (free)
✅ **Context Caching**: Reuse brand context across questions
✅ **Quality Monitoring**: Track which questions are most valuable

---

## 7. IMPLEMENTATION CHECKLIST

### 7.1 Platform QA Pool

- [ ] Create database tables (`gv_platform_qa_pool`, `gv_platform_qa_usage`)
- [ ] Build Q&A generation cron job (every 2 weeks)
- [ ] Implement platform pool search function
- [ ] Add expiration/rotation logic (keep 30 days)
- [ ] Create admin dashboard for pool management

### 7.2 Brand Daily Questions

- [ ] Create database tables (`gv_brand_daily_questions`, `gv_brand_daily_quota`)
- [ ] Implement question classification function
- [ ] Build answer generation system (multi-AI)
- [ ] Add quota checking and enforcement
- [ ] Create user dashboard widget
- [ ] Implement cost tracking per question

### 7.3 Integration

- [ ] Connect daily questions to existing cost tracking
- [ ] Add real-time quota updates
- [ ] Implement suggested Q&A from platform pool
- [ ] Add analytics (most common questions, cost per tier)
- [ ] Create reporting for admins

---

## 8. SUMMARY

### Key Changes

✅ **Platform QA Pool**: 1,000 Q&A every 2 weeks (fixed cost: $2.66/month)
✅ **Daily Questions**: Tier-based limits (3/10/30 per day)
✅ **Variable Cost**: Questions are variable cost, not fixed
✅ **Smart Classification**: Auto-classify question complexity
✅ **Platform Pool First**: Try to answer from pool (free) before generating

### Updated Pricing

| Tier | Daily Limit | Monthly Questions | Typical Cost | Total Monthly |
|------|-------------|-------------------|--------------|---------------|
| Basic | 3/day | ~90 | $1.70 | **$73.70** |
| Premium | 10/day | ~300 | $10.80 | **$106.80** |
| Partner | 30/day | ~900 | $52.50 | **$188.50** |

### Benefits

✅ **Scalable**: Platform pool shared across all brands
✅ **Cost-Effective**: Try platform pool first (free)
✅ **Flexible**: Tier-based limits for different needs
✅ **Transparent**: Clear cost per question type
✅ **Always Fresh**: Platform pool updated every 2 weeks

---

**END OF DOCUMENT**
