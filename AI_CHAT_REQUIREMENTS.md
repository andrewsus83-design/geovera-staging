# GeoVera AI Chat - Technical Requirements & Architecture

## Overview
Multi-AI orchestration system untuk deep brand intelligence dengan proactive daily insights.

---

## 1. DATABASE SCHEMA

### New Tables Required:

```sql
-- AI Conversations (chat history)
CREATE TABLE gv_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),

  -- AI Provider tracking
  ai_provider TEXT CHECK (ai_provider IN ('gemini', 'openai', 'perplexity', 'claude')),
  model_used TEXT, -- e.g., 'gpt-4', 'gemini-pro', 'claude-3-opus'

  -- Context & metadata
  conversation_type TEXT CHECK (conversation_type IN ('chat', 'daily_brief', 'insight', 'research')),
  parent_message_id UUID REFERENCES gv_ai_conversations(id), -- for threading

  -- Token usage tracking
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES gv_brands(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX idx_ai_conversations_brand ON gv_ai_conversations(brand_id);
CREATE INDEX idx_ai_conversations_user ON gv_ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created ON gv_ai_conversations(created_at DESC);


-- Daily AI Briefs (proactive intelligence)
CREATE TABLE gv_daily_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Brief date
  brief_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Section A: Competitor Intelligence
  competitor_questions JSONB, -- [{question: "...", frequency: 100, brands: ["..."]}]
  competitor_strategies JSONB, -- [{strategy: "...", brands: ["..."], impact: "high"}]

  -- Section B: Consumer Insights
  customer_questions JSONB, -- [{question: "...", volume: 340, sentiment: "positive"}]
  brand_visibility JSONB, -- {search_rank: 5, mentions: 120, reach: 50000}
  trending_topics JSONB, -- [{topic: "...", volume: 1000, trend: "up"}]

  -- Section C: Gap Analysis (Blue Ocean)
  untapped_opportunities JSONB, -- [{topic: "...", volume: 5000, competition: "low"}]

  -- Generation metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  ai_providers_used TEXT[], -- ['gemini', 'perplexity', 'openai']
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Delivery status
  delivered BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  UNIQUE(brand_id, brief_date)
);

CREATE INDEX idx_daily_briefs_brand ON gv_daily_briefs(brand_id);
CREATE INDEX idx_daily_briefs_date ON gv_daily_briefs(brief_date DESC);


-- AI Insights (specific findings)
CREATE TABLE gv_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Insight details
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'competitor_strategy',
    'customer_question',
    'gap_opportunity',
    'trend_alert',
    'seo_recommendation',
    'content_idea'
  )),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB, -- Full insight data

  -- Actionability
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  actionable BOOLEAN DEFAULT TRUE,
  action_taken BOOLEAN DEFAULT FALSE,
  action_notes TEXT,

  -- Source tracking
  ai_provider TEXT NOT NULL,
  source_urls TEXT[], -- Reference links
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00

  -- Timestamps
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For time-sensitive insights

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_brand ON gv_ai_insights(brand_id);
CREATE INDEX idx_ai_insights_type ON gv_ai_insights(insight_type);
CREATE INDEX idx_ai_insights_priority ON gv_ai_insights(priority);


-- AI Provider API Keys & Usage Tracking
CREATE TABLE gv_ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL CHECK (provider IN ('gemini', 'openai', 'perplexity', 'claude')),

  -- API Configuration
  api_key_encrypted TEXT NOT NULL, -- Encrypted with Supabase vault
  endpoint_url TEXT,
  model_default TEXT NOT NULL,

  -- Usage tracking (monthly)
  current_month DATE DEFAULT DATE_TRUNC('month', NOW()),
  requests_this_month INTEGER DEFAULT 0,
  tokens_this_month BIGINT DEFAULT 0,
  cost_this_month_usd DECIMAL(10, 2) DEFAULT 0,

  -- Limits
  monthly_budget_usd DECIMAL(10, 2) DEFAULT 100,
  rate_limit_rpm INTEGER DEFAULT 60, -- requests per minute

  -- Status
  active BOOLEAN DEFAULT TRUE,
  last_error TEXT,
  last_success_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Chat Sessions (for grouping conversations)
CREATE TABLE gv_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title TEXT DEFAULT 'New Chat',
  summary TEXT,

  -- Metadata
  message_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_chat_sessions_brand ON gv_chat_sessions(brand_id);
CREATE INDEX idx_chat_sessions_user ON gv_chat_sessions(user_id);
```

---

## 2. SUPABASE EDGE FUNCTIONS NEEDED

### Function 1: `ai-chat` (Main chat interface)
**Path:** `/supabase/functions/ai-chat/index.ts`

**Purpose:** Handle user messages, route to appropriate AI provider, return responses

**Endpoints:**
- `POST /ai-chat` - Send message, get AI response

**Request:**
```json
{
  "brand_id": "uuid",
  "session_id": "uuid", // optional
  "message": "How can I improve my SEO?",
  "context": "seo_optimization" // optional hint for AI selection
}
```

**Response:**
```json
{
  "message_id": "uuid",
  "ai_response": "Here are 5 ways to improve...",
  "ai_provider": "gemini",
  "model_used": "gemini-pro",
  "tokens_used": 450,
  "suggestions": ["Create blog content", "Optimize meta tags"],
  "related_insights": ["insight_id_1", "insight_id_2"]
}
```

**AI Router Logic:**
- SEO questions → Gemini
- Content creation → OpenAI
- Deep research → Perplexity
- Complex analysis → Claude

---

### Function 2: `generate-daily-brief` (Proactive intelligence)
**Path:** `/supabase/functions/generate-daily-brief/index.ts`

**Purpose:** Generate daily intelligence briefing for each brand

**Trigger:** Cron job (daily at 6 AM UTC)

**Process:**
1. Fetch all active brands
2. For each brand:
   - **Gemini**: Analyze SEO trends, keywords
   - **Perplexity**: Deep research on competitor strategies
   - **OpenAI**: Synthesize customer questions from social/search data
   - **Claude**: Complex multi-step gap analysis
3. Combine into structured brief
4. Save to `gv_daily_briefs`
5. Send in-app notification

**Output Structure:**
```json
{
  "brief_date": "2024-02-13",
  "competitor_questions": [
    {
      "question": "How to scale Instagram ads for fashion brands?",
      "frequency": 340,
      "brands": ["Nike", "Adidas", "Zara"],
      "source": "perplexity"
    }
  ],
  "customer_questions": [
    {
      "question": "Is vegan leather durable?",
      "volume": 1200,
      "sentiment": "curious",
      "current_brand_rank": null,
      "source": "gemini"
    }
  ],
  "untapped_opportunities": [
    {
      "topic": "sustainable packaging alternatives",
      "monthly_searches": 5000,
      "current_competition": "low",
      "estimated_difficulty": 3,
      "recommended_action": "Create content series",
      "source": "claude"
    }
  ]
}
```

---

### Function 3: `ai-insight-generator` (Specific insights)
**Path:** `/supabase/functions/ai-insight-generator/index.ts`

**Purpose:** Generate specific actionable insights

**Triggers:**
- User request (manual)
- Scheduled (daily/weekly)
- Event-based (trend detected)

**Types:**
1. **SEO Opportunities** (Gemini)
   - Keywords to target
   - Content gaps
   - Technical SEO issues

2. **Content Ideas** (OpenAI)
   - Blog post topics
   - Social media captions
   - Video scripts

3. **Competitor Analysis** (Perplexity)
   - Strategy changes
   - New campaigns
   - Market positioning

4. **Strategic Recommendations** (Claude)
   - Multi-channel campaigns
   - Long-term positioning
   - Crisis management

---

### Function 4: `ai-research` (Deep research tool)
**Path:** `/supabase/functions/ai-research/index.ts`

**Purpose:** Perplexity-powered deep research on specific topics

**Request:**
```json
{
  "brand_id": "uuid",
  "research_query": "Latest trends in sustainable fashion 2024",
  "depth": "comprehensive", // quick | moderate | comprehensive
  "include_sources": true
}
```

**Response:**
```json
{
  "research_id": "uuid",
  "findings": "Detailed research summary...",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "source_urls": ["url1", "url2"],
  "related_topics": ["topic1", "topic2"],
  "confidence": 0.92
}
```

---

## 3. EXTERNAL API INTEGRATIONS

### Required API Keys (Environment Variables):

```env
# Gemini (Google AI)
GOOGLE_AI_API_KEY=your_key_here
GEMINI_MODEL=gemini-pro

# OpenAI
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4-turbo

# Perplexity
PERPLEXITY_API_KEY=your_key_here
PERPLEXITY_MODEL=sonar-medium-online

# Claude (Anthropic)
ANTHROPIC_API_KEY=your_key_here
CLAUDE_MODEL=claude-3-opus-20240229

# Rate limits
AI_RATE_LIMIT_RPM=60
AI_MONTHLY_BUDGET_USD=500
```

### API Usage Pattern:

```typescript
// Example: Gemini for SEO
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_API_KEY'));
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const result = await model.generateContent(prompt);
const response = result.response.text();
```

---

## 4. FRONTEND REQUIREMENTS

### New Pages:

1. **`/chat`** - Main AI chat interface
2. **`/insights`** - Daily briefs & insights dashboard
3. **`/research`** - Deep research tool

### UI Components:

1. **Chat Sidebar** (always visible on dashboard)
   - Recent conversations
   - Quick actions
   - Daily brief notification

2. **Daily Brief Card** (dashboard widget)
   - Show latest brief summary
   - "View Full Brief" CTA
   - Read/Unread status

3. **Insight Cards** (dashboard feed)
   - Priority badge
   - Action buttons
   - Source attribution

---

## 5. CRON JOB SCHEDULE

### Daily Brief Generation:
```bash
# Supabase Edge Function Cron
# Trigger: Every day at 6:00 AM UTC

SELECT cron.schedule(
  'generate-daily-briefs',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-daily-brief',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## 6. COST ESTIMATION

### Per Brand Per Month:

| AI Provider | Usage | Cost |
|-------------|-------|------|
| Gemini | 30 daily briefs + 100 SEO queries | ~$5 |
| OpenAI | 50 content ideas + 200 chat messages | ~$15 |
| Perplexity | 30 deep research queries | ~$10 |
| Claude | 10 complex analyses | ~$20 |
| **TOTAL** | | **~$50/mo** |

### Scaling:
- 100 brands = $5,000/mo
- 1,000 brands = $50,000/mo

**Revenue vs Cost:**
- Basic tier ($399/mo) → ~$349 profit after AI costs
- Premium tier ($699/mo) → ~$649 profit after AI costs
- Partner tier ($1,099/mo) → ~$1,049 profit after AI costs

---

## 7. IMPLEMENTATION PRIORITY

### Phase 1 (MVP - Week 1-2):
1. ✅ Database schema setup
2. ✅ `ai-chat` Edge Function (OpenAI only for MVP)
3. ✅ Basic chat UI at `/chat`
4. ✅ Chat history storage

### Phase 2 (Week 3-4):
1. ✅ Add Gemini integration
2. ✅ AI router logic
3. ✅ Daily brief generation (manual trigger)
4. ✅ Daily brief UI

### Phase 3 (Week 5-6):
1. ✅ Add Perplexity & Claude
2. ✅ Automated daily brief cron
3. ✅ Insight generation & storage
4. ✅ Research tool

### Phase 4 (Week 7-8):
1. ✅ Cost optimization
2. ✅ Advanced features (voice input, image analysis)
3. ✅ Export & reporting
4. ✅ Team collaboration

---

## 8. SECURITY & COMPLIANCE

### API Key Management:
- Store in Supabase Vault (encrypted)
- Rotate quarterly
- Rate limiting per user
- Monitor for abuse

### Data Privacy:
- All conversations encrypted at rest
- GDPR compliant data retention (90 days)
- User can delete chat history
- No training on user data

### RLS Policies:
```sql
-- Users can only access their own brand's chats
CREATE POLICY "Users access own brand chats"
  ON gv_ai_conversations
  FOR ALL
  USING (
    brand_id IN (
      SELECT brand_id FROM user_brands
      WHERE user_id = auth.uid()
    )
  );
```

---

## 9. NEXT STEPS

**Immediate Actions:**
1. [ ] Setup database schema (run migrations)
2. [ ] Create API keys for all 4 AI providers
3. [ ] Build `ai-chat` Edge Function (OpenAI MVP)
4. [ ] Create basic chat UI at `/chat`
5. [ ] Test end-to-end chat flow

**Questions for User:**
1. Should we start with OpenAI-only MVP first, then add others?
2. Daily brief delivery time: 6 AM UTC okay? (or user timezone?)
3. In-app notification vs email delivery for daily brief?
4. Budget limit per brand per month for AI costs?

---

## 10. MOCK DATA FOR TESTING

```javascript
// Mock Daily Brief
const mockBrief = {
  brief_date: "2024-02-13",
  competitor_questions: [
    {
      question: "How to improve Instagram engagement for fashion brands?",
      frequency: 450,
      brands: ["Nike", "Adidas"],
      source: "perplexity"
    }
  ],
  customer_questions: [
    {
      question: "Is sustainable fashion more expensive?",
      volume: 2400,
      sentiment: "curious",
      current_brand_rank: 15,
      source: "gemini"
    }
  ],
  untapped_opportunities: [
    {
      topic: "eco-friendly shoe materials",
      monthly_searches: 8500,
      current_competition: "low",
      recommended_action: "Create educational content series"
    }
  ]
};
```

---

**Ready to implement?** Let me know if you want to:
1. Start with database migration
2. Build OpenAI MVP first
3. Create UI mockups
4. Setup all API integrations simultaneously
