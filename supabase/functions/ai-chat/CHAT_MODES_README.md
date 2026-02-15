# AI Chat - Specialized Modes for SEO, GEO & Social

## Overview
AI Chat now supports **4 specialized modes** to provide expert-level guidance for different marketing channels:

1. **SEO Mode** - Traditional search engine optimization (Google, Bing)
2. **GEO Mode** - Generative Engine Optimization (ChatGPT, Gemini, Claude, Perplexity)
3. **Social Mode** - Social media search optimization (TikTok, Instagram, YouTube)
4. **General Mode** - General marketing and brand strategy (default)

---

## Chat Modes

### 🔍 **SEO Mode** (`chat_mode: "seo"`)

**Purpose**: Expert guidance on traditional search engine optimization

**Topics Covered**:
- ✅ Keyword research and optimization
- ✅ Google Search rankings
- ✅ Backlink strategies
- ✅ Domain authority
- ✅ Meta tags and on-page SEO
- ✅ Search volume analysis
- ✅ SERP features (Featured Snippets, People Also Ask)
- ✅ Technical SEO (site speed, mobile optimization, schema markup)

**Example Questions**:
```
"How can I improve my Google ranking for 'best skincare Indonesia'?"
"What are the most important on-page SEO factors?"
"How do I optimize meta descriptions for better CTR?"
"Should I focus on backlinks or content quality first?"
```

**Boundaries**:
- ❌ Will NOT answer questions about ChatGPT or AI platforms
- ❌ Will NOT answer questions about social media marketing
- ✅ Redirects to appropriate mode when out of scope

---

### 🤖 **GEO Mode** (`chat_mode: "geo"`)

**Purpose**: Expert guidance on AI platform optimization (Generative Engine Optimization)

**Topics Covered**:
- ✅ ChatGPT visibility optimization
- ✅ Google Gemini ranking strategies
- ✅ Claude.ai mentions
- ✅ Perplexity AI citations
- ✅ Entity recognition in AI responses
- ✅ Prompt engineering for brand mentions
- ✅ AI-generated content analysis
- ✅ Semantic search optimization

**Example Questions**:
```
"How do I get my brand mentioned in ChatGPT responses?"
"What's the difference between SEO and GEO?"
"How can I improve citations in Perplexity AI?"
"Why doesn't Gemini mention my brand when asked about skincare?"
```

**Boundaries**:
- ❌ Will NOT answer questions about Google or traditional SEO
- ❌ Will NOT answer questions about social media platforms
- ✅ Focuses ONLY on AI platforms (ChatGPT, Gemini, Claude, Perplexity)

---

### 📱 **Social Mode** (`chat_mode: "social"`)

**Purpose**: Expert guidance on social media search optimization

**Topics Covered**:
- ✅ TikTok search and hashtags
- ✅ Instagram search discovery
- ✅ YouTube search optimization
- ✅ Pinterest SEO
- ✅ LinkedIn content visibility
- ✅ Hashtag strategy
- ✅ Social media algorithms
- ✅ Viral content analysis
- ✅ Influencer collaboration

**Example Questions**:
```
"How do I rank higher on TikTok search?"
"What hashtags should I use for skincare content?"
"How does Instagram's search algorithm work?"
"How can I optimize YouTube video titles for better discovery?"
```

**Boundaries**:
- ❌ Will NOT answer questions about Google or web SEO
- ❌ Will NOT answer questions about AI platforms like ChatGPT
- ✅ Focuses ONLY on social media platforms

---

### 💡 **General Mode** (`chat_mode: "general"`)

**Purpose**: General marketing and brand strategy guidance (default)

**Topics Covered**:
- ✅ Marketing strategy questions
- ✅ Brand positioning
- ✅ Campaign planning
- ✅ General business advice
- ✅ Platform feature guidance

**Example Questions**:
```
"What's the best marketing strategy for a new skincare brand?"
"How do I define my target audience?"
"Should I focus on SEO, GEO, or Social first?"
"How does GeoVera's analytics work?"
```

**Mode Recommendations**:
- If user asks SEO-specific questions → Suggests "SEO Mode"
- If user asks about AI platforms → Suggests "GEO Mode"
- If user asks about social media → Suggests "Social Mode"

---

## API Usage

### Request Format
```json
POST /ai-chat
{
  "brand_id": "uuid",
  "session_id": "uuid", // Optional: reuse existing session
  "message": "How do I improve my Google ranking?",
  "chat_mode": "seo" // Optional: seo | geo | social | general
}
```

### Response Format
```json
{
  "success": true,
  "session_id": "uuid",
  "message_id": "uuid",
  "response": "To improve your Google ranking, focus on these factors...",
  "chat_mode": "seo",
  "metadata": {
    "ai_provider": "openai",
    "model_used": "gpt-3.5-turbo",
    "tokens_used": 250,
    "cost_usd": 0.0005,
    "prompt_tokens": 150,
    "completion_tokens": 100
  }
}
```

---

## Frontend Integration

### **Option 1: Mode Selector Tabs**
```html
<div class="chat-modes">
  <button class="mode-btn" data-mode="general">💡 General</button>
  <button class="mode-btn active" data-mode="seo">🔍 SEO</button>
  <button class="mode-btn" data-mode="geo">🤖 GEO</button>
  <button class="mode-btn" data-mode="social">📱 Social</button>
</div>
```

### **Option 2: Auto-Detect Mode**
Let the general chat detect what the user is asking about and suggest mode switch:

```javascript
// User asks: "How do I rank on ChatGPT?"
// General mode response:
{
  response: "For AI platform optimization questions like this, I recommend switching to GEO mode for expert guidance. Would you like me to help with that?",
  suggested_mode: "geo"
}
```

---

## Database Changes

### **conversation_type Field**
Now stores the chat mode instead of generic "chat":

```sql
-- Old value
conversation_type = 'chat'

-- New values (specific modes)
conversation_type = 'seo'
conversation_type = 'geo'
conversation_type = 'social'
conversation_type = 'general'
```

This allows analytics:
```sql
-- Count questions per mode
SELECT conversation_type, COUNT(*)
FROM gv_ai_conversations
WHERE brand_id = 'uuid'
GROUP BY conversation_type;

-- Results:
-- seo: 45 questions
-- geo: 23 questions
-- social: 12 questions
-- general: 8 questions
```

---

## Daily Limits (Per Tier)

**Limits apply across ALL modes combined**:

| Tier | Daily Questions | Monthly Total |
|------|----------------|---------------|
| Basic | 5/day | 150/month |
| Premium | 10/day | 300/month |
| Partner | 20/day | 600/month |

**Example**:
- User asks 3 SEO questions + 2 GEO questions = **5 questions used**
- Premium tier user has **5 remaining** for the day
- Resets at midnight (daily reset)

---

## Benefits of Specialized Modes

### **1. Better Answers**
- Each mode has expert-level knowledge in its domain
- No generic "marketing advice" - specific, actionable guidance
- Understands technical terminology for each channel

### **2. Clear Boundaries**
- Users know exactly what each mode is for
- No confusion between SEO vs GEO vs Social
- Redirects users to correct mode when needed

### **3. Better Analytics**
- Track which channels users need most help with
- Identify knowledge gaps (e.g., many GEO questions = need more GEO education)
- Personalize dashboard based on usage patterns

### **4. Educational Value**
- Teaches users the difference between SEO/GEO/Social
- Builds understanding of GeoVera's intelligence system
- Encourages correct terminology usage

---

## Example Conversations

### **SEO Mode Example**:
```
User: "How do I rank for 'best skincare Indonesia'?"

AI (SEO Mode):
"To rank for 'best skincare Indonesia' on Google:

1. **Keyword Optimization**:
   - Include the exact phrase in your title tag
   - Use it naturally in H1 and first paragraph
   - Current search volume: 5,400/month

2. **Content Quality**:
   - Create comprehensive buying guide (2000+ words)
   - Include product comparisons
   - Add local Indonesian context

3. **Backlinks**:
   - Target DA 40+ Indonesian beauty blogs
   - Get featured in local roundup articles
   - Consider Indonesian influencer partnerships

4. **Technical SEO**:
   - Ensure mobile-friendly (70% of searches are mobile)
   - Improve page speed (target <3 seconds)
   - Add Indonesian schema markup

Current ranking: #15. With these optimizations, you could reach #5-8 within 3 months."
```

### **GEO Mode Example**:
```
User: "How do I get ChatGPT to mention my brand?"

AI (GEO Mode):
"To improve your brand's visibility in ChatGPT responses:

1. **Authority Building**:
   - Get cited in authoritative sources (news, research)
   - Build strong Wikipedia presence
   - Ensure consistent NAP (Name, Address, Phone) across web

2. **Entity Recognition**:
   - Use semantic SEO on your website
   - Implement schema.org markup for brand entity
   - Build knowledge graph connections

3. **Citation Strategy**:
   - Create in-depth expert content
   - Get featured in trade publications
   - Develop thought leadership articles

4. **Prompt Engineering**:
   - Optimize for common query patterns
   - Target informational queries in your niche
   - Build associative keywords

Current GEO visibility: 35% mention rate. With these strategies, you could reach 60%+ within 6 months."
```

### **Social Mode Example**:
```
User: "How do I rank on TikTok search?"

AI (Social Mode):
"To rank higher on TikTok search:

1. **Video Optimization**:
   - Use target keyword in first 3 seconds of video
   - Include keyword in caption (first 100 characters)
   - Add to video text overlay

2. **Hashtag Strategy**:
   - Mix of broad (#skincare) + niche (#skincareIndonesia)
   - Include trending sounds related to your topic
   - 3-5 hashtags maximum for best performance

3. **Engagement Signals**:
   - Watch time is crucial - hook viewers in first 3 seconds
   - Encourage comments with questions
   - Respond to comments within 1 hour

4. **Posting Strategy**:
   - Post when audience is active (7-9 PM Jakarta time)
   - Consistency matters - minimum 3x per week
   - Use TikTok's SEO keywords tool

Current hashtag ranking: #15 for #skincareIndonesia. You're competing with 2.5M videos. Focus on long-tail keywords like #organicskincareIndonesia for faster wins."
```

---

## Testing

### Test All Modes:
```bash
# SEO Mode
curl -X POST https://your-project.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "uuid",
    "message": "How do I improve Google rankings?",
    "chat_mode": "seo"
  }'

# GEO Mode
curl -X POST https://your-project.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "uuid",
    "message": "How do I get mentioned in ChatGPT?",
    "chat_mode": "geo"
  }'

# Social Mode
curl -X POST https://your-project.supabase.co/functions/v1/ai-chat \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type": application/json" \
  -d '{
    "brand_id": "uuid",
    "message": "How do I rank on TikTok search?",
    "chat_mode": "social"
  }'
```

---

## Summary

✅ **4 Specialized Modes**: SEO, GEO, Social, General
✅ **Clear Boundaries**: Each mode focuses on its expertise area
✅ **Better Answers**: Expert-level, specific, actionable guidance
✅ **Educational**: Teaches users the difference between channels
✅ **Analytics**: Track which channels users need most help with
✅ **Same Daily Limits**: Limits apply across all modes combined

**Next Steps**:
1. Deploy updated ai-chat function
2. Update frontend with mode selector
3. Add mode analytics to dashboard
4. Create user education content about SEO vs GEO vs Social
