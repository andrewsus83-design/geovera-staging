# GeoVera AI Chat System - Detailed Explanation
**Date:** February 15, 2026
**Version:** 2.0 (Revised)

---

## 🎯 SYSTEM OVERVIEW

GeoVera AI Chat menggunakan dual-purpose system:
1. **User-facing daily limits** - Yang user lihat dan experience
2. **Backend 300 monthly queries** - Yang Claude gunakan untuk generate suggested questions

---

## 👤 USER-FACING LIMITS (DAILY ONLY)

### Daily Question Limits per Tier:
| Tier | Daily Questions | Reset Time |
|------|----------------|------------|
| **Basic** | 5 questions | Midnight (00:00) |
| **Premium** | 10 questions | Midnight (00:00) |
| **Partner** | 20 questions | Midnight (00:00) |

### Key Points:
- ✅ Users ONLY see daily limits (5/10/20)
- ✅ No monthly limit shown to users
- ✅ Daily counter resets at midnight automatically
- ✅ Usage displayed as: "Today: 3/5 questions"
- ✅ Progress bar shows daily usage percentage
- ✅ Modal shows: "Daily Limit Reached - Resets at midnight"

### User Experience:
```
User opens AI Chat → Sees "Today: 0/5 questions"
User asks 3 questions → Sees "Today: 3/5 questions"
User asks 2 more → Sees "Today: 5/5 questions"
User tries to ask more → Modal: "Daily limit reached. Resets at midnight."
Next day (00:00) → Auto-reset to "Today: 0/5 questions"
```

---

## 🤖 BACKEND SYSTEM (300 MONTHLY QUERIES)

### Claude's Monthly Budget:
- **300 queries per month** - Claude's allocation to generate insights
- **Purpose:** Generate 5/10/20 daily suggested questions for each tier
- **Impact:** Enriches LLM SEO, GEO, Social Search capabilities

### How It Works:
1. **Every month, Claude receives 300 queries budget**
2. **Claude uses these queries to:**
   - Research trending topics in user's country + category
   - Analyze competitor strategies
   - Discover viral content patterns
   - Track social media trends
   - Monitor search behavior

3. **Output: Daily Suggested Questions**
   - Basic tier: 5 suggested questions/day
   - Premium tier: 10 suggested questions/day
   - Partner tier: 20 suggested questions/day

4. **Data Flow:**
```
300 Monthly Queries (Claude's Budget)
          ↓
Research: SEO trends, GEO data, Social Search patterns
          ↓
Generate Insights for user's [Country] + [Category]
          ↓
Output: Daily Suggested Questions (5/10/20 per tier)
          ↓
User sees smart, relevant questions to ask AI
```

### Example for Fashion Brand in Indonesia:

**Claude's 300 Monthly Queries (Background):**
1. Query 1: "Trending fashion keywords Indonesia January 2026"
2. Query 2: "Top Instagram fashion influencers Jakarta engagement rates"
3. Query 3: "TikTok fashion viral challenges Indonesia this week"
4. Query 4: "Fashion brand competitor analysis Indonesia SEO rankings"
5. Query 5: "Indonesian fashion consumer search behavior patterns"
... (continues for 300 queries)

**Claude's Output → User Sees (Daily Suggested Questions):**

**For Basic Tier (5 daily suggestions):**
1. "What are the top 3 trending fashion styles in Indonesia this week?"
2. "Which Jakarta fashion influencers have the highest engagement rates?"
3. "How can I optimize my fashion brand's Instagram for Indonesian audiences?"
4. "What fashion keywords are Indonesian consumers searching for?"
5. "What's the best time to post fashion content in Indonesia?"

**For Premium Tier (10 daily suggestions):**
- All 5 from Basic tier, PLUS:
6. "How are my competitors ranking for 'fashion Jakarta' on Google?"
7. "Which TikTok fashion challenges are going viral in Indonesia?"
8. "What's the ideal price point for fashion items in Indonesian market?"
9. "How can I improve my fashion brand's local SEO in Indonesia?"
10. "What content formats work best for Indonesian fashion audiences?"

**For Partner Tier (20 daily suggestions):**
- All 10 from Premium tier, PLUS:
11. "Detailed competitor analysis: Top 5 fashion brands in Indonesia"
12. "Social media strategy recommendations for Indonesian fashion market"
13. "Trending fashion colors and patterns in Indonesia this season"
14. "How to collaborate with Indonesian fashion micro-influencers?"
15. "Best practices for fashion e-commerce in Indonesia"
... (up to 20 suggestions)

---

## 📊 IMPLEMENTATION DETAILS

### Frontend (chat.html):

**1. Usage Data Structure:**
```javascript
let usageData = {
    dailyCurrent: 0,    // User's questions today (0-5/10/20)
    dailyLimit: 5       // Based on tier (5/10/20)
};
```

**2. Tier Limits Configuration:**
```javascript
const tierLimits = {
    'basic': 5,      // 5 questions/day
    'premium': 10,   // 10 questions/day
    'partner': 20    // 20 questions/day
};
```

**3. Daily Reset Logic:**
```javascript
const today = new Date().toDateString();
const lastReset = localStorage.getItem('chat_daily_reset');

if (lastReset !== today) {
    // New day - reset counter
    usageData.dailyCurrent = 0;
    localStorage.setItem('chat_daily_reset', today);
    localStorage.setItem('chat_daily_count', '0');
}
```

**4. Usage Display:**
```javascript
count.textContent = `Today: ${usageData.dailyCurrent}/${usageData.dailyLimit} questions`;
```

**5. Limit Check (Only Daily):**
```javascript
function checkUsageLimit() {
    if (usageData.dailyCurrent >= usageData.dailyLimit) {
        showLimitModal(); // "Daily limit reached"
        return false;
    }
    return true;
}
```

### Backend (gv_usage table):

**Recommended Schema:**
```sql
CREATE TABLE gv_usage (
    user_id UUID REFERENCES gv_users(id),

    -- User daily questions (user-facing)
    chat_messages_today INT DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,

    -- Claude's monthly budget (backend process)
    claude_queries_used INT DEFAULT 0,
    claude_queries_limit INT DEFAULT 300,
    claude_last_reset DATE DEFAULT CURRENT_DATE,

    -- Suggested questions generated
    suggested_questions_generated INT DEFAULT 0,

    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 SUGGESTED QUESTIONS GENERATION FLOW

### Step 1: Claude's Monthly Research (300 Queries)
**Triggered:** 1st of each month
**Process:**
```javascript
// Backend Edge Function (runs monthly)
async function generateMonthlySuggestions() {
    for each active user:
        // Get user's brand profile
        const brand = await getBrandProfile(user.id);
        const country = brand.brand_country;
        const category = brand.brand_category;

        // Claude uses 300 queries to research
        const insights = await claudeResearch({
            country: country,
            category: category,
            queries: 300,
            focus: ['SEO trends', 'GEO data', 'Social Search', 'Competitors']
        });

        // Generate daily suggested questions
        const suggestions = await generateDailySuggestions(insights, user.tier);

        // Store suggestions for daily delivery
        await storeSuggestedQuestions(user.id, suggestions);
}
```

### Step 2: Daily Suggested Questions Delivery
**Triggered:** When user opens AI Chat
**Process:**
```javascript
// Frontend loads suggested questions
async function loadSuggestedQuestions() {
    const { data: suggestions } = await supabase
        .from('gv_suggested_questions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(dailyLimit); // 5/10/20 based on tier

    displaySuggestedQuestions(suggestions);
}
```

### Step 3: User Interaction
```javascript
// User clicks on suggested question
function useSuggestedQuestion(questionText) {
    // Auto-fill input
    messageInput.value = questionText;

    // User can edit or send directly
    // This counts against their daily limit (5/10/20)
}
```

---

## 📈 METRICS & ANALYTICS

### User Metrics (Visible to User):
- Daily questions used today: `3/5`
- Daily limit based on tier: `5/10/20`
- Time until reset: `Resets in 8 hours`

### Backend Metrics (Admin Dashboard):
- Claude's monthly queries used: `127/300`
- Suggested questions generated: `1,450 this month`
- Average questions per user: `4.2/day`
- Most popular suggested topics: `['SEO optimization', 'Competitor analysis', 'Content strategy']`

---

## 🎨 UI/UX DESIGN

### Usage Indicator:
```
┌─────────────────────────────────────┐
│ Today: 3/5 questions                │
│ ████████████░░░░░░░░░░ (60%)        │
│ Basic tier                          │
└─────────────────────────────────────┘
```

### Suggested Questions Section:
```
┌─────────────────────────────────────┐
│ 💡 Suggested Questions for You      │
├─────────────────────────────────────┤
│ • What are trending fashion styles  │
│   in Indonesia?                     │
│                                     │
│ • How can I improve my Instagram    │
│   engagement in Jakarta?            │
│                                     │
│ • Which influencers should I        │
│   collaborate with?                 │
│                                     │
│ [View All 5 Suggestions]            │
└─────────────────────────────────────┘
```

### Limit Reached Modal:
```
┌──────────────────────────────────────┐
│  ⚠️  Daily Limit Reached             │
│                                      │
│  You've used all 5 daily questions   │
│  for the Basic tier.                 │
│                                      │
│  Your limit resets at midnight.      │
│                                      │
│  Tier Comparison:                    │
│  • Basic: 5 questions/day            │
│  • Premium: 10 questions/day         │
│  • Partner: 20 questions/day         │
│                                      │
│  [Maybe Later]  [Upgrade Now]        │
└──────────────────────────────────────┘
```

---

## 🔐 SECURITY & RATE LIMITING

### User Rate Limiting:
- Daily limits enforced: 5/10/20 questions
- Reset at midnight (server timezone)
- LocalStorage + Database sync
- Prevent abuse with IP tracking

### Claude's Rate Limiting:
- Monthly budget: 300 queries
- Distributed across all users
- Priority queue for Partner tier
- Fallback to cached suggestions if quota exceeded

---

## 🚀 FUTURE ENHANCEMENTS

### Phase 2 (Q2 2026):
1. **Smart Suggestions:**
   - Personalized based on user's past questions
   - Time-sensitive (morning/afternoon/evening topics)
   - Trend-aware (breaking news, viral topics)

2. **Question Templates:**
   - Category-specific templates
   - Country-specific best practices
   - Competitor analysis frameworks

3. **Analytics Dashboard:**
   - Most asked questions
   - Trending topics in user's market
   - Suggested questions effectiveness

### Phase 3 (Q3 2026):
1. **Voice Input:**
   - Ask questions via voice
   - Voice-to-text integration

2. **Multi-language:**
   - Auto-detect user language
   - Translate suggested questions

3. **Collaborative Mode:**
   - Share questions with team
   - Team question quota

---

## 📚 REFERENCES

**Related Documentation:**
- `TIER_FEATURES_COMPLETE.md` - Full tier features breakdown
- `FRONTEND_STATUS_FEB15_UPDATED.md` - Latest audit report
- `chat.html` - Frontend implementation

**Database Tables:**
- `gv_users` - User accounts
- `gv_brands` - Brand profiles (country + category)
- `gv_subscriptions` - Active subscriptions
- `gv_usage` - Usage tracking
- `gv_suggested_questions` - Generated suggestions

**Edge Functions:**
- `/functions/v1/ai-chat` - Main chat endpoint
- `/functions/v1/generate-suggestions` - Monthly suggestion generator
- `/functions/v1/daily-suggestions` - Daily suggestion fetcher

---

## ✅ IMPLEMENTATION CHECKLIST

**Frontend (chat.html):**
- [x] Remove monthly limit from user view
- [x] Keep daily limits only (5/10/20)
- [x] Update usage display: "Today: X/Y questions"
- [x] Update modal: "Daily Limit Reached"
- [x] Remove monthly counter increment
- [x] Update tier comparison table

**Backend (To-Do):**
- [ ] Create `gv_suggested_questions` table
- [ ] Build monthly suggestion generator Edge Function
- [ ] Implement Claude's 300-query research logic
- [ ] Create daily suggestion fetcher API
- [ ] Add admin dashboard for monitoring

**Database:**
- [ ] Update `gv_usage` schema
- [ ] Add `claude_queries_used` column
- [ ] Add `suggested_questions_generated` column
- [ ] Create indexes for performance

---

**Last Updated:** February 15, 2026
**Status:** Frontend Complete ✅ | Backend Pending ⏳
**Next Step:** Build suggested questions generation system

---

*GeoVera Intelligence Platform - AI-Powered Brand Intelligence*
