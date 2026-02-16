# Cross-Feature Enrichment Synchronization
## GeoVera Intelligence System - Feature Integration

## Overview
Single enriched crawl data (Gemini + Claude dual AI) syncs automatically to 7 dashboard features, eliminating data silos and providing consistent intelligence across all user touchpoints.

**Core Principle**: Crawl Once, Enrich Everywhere

---

## 1. Unified Enriched Data Model

```typescript
interface UnifiedEnrichedData {
  // Source metadata
  url: string;
  domain: string;
  crawled_at: string;

  // Brand Intelligence
  brand_mentions: BrandMention[];
  competitor_mentions: CompetitorMention[];

  // Impact & Quality Scores
  impact_scores: {
    seo_impact: number;           // 1-100
    geo_impact: number;           // 1-100 (AI citation potential)
    social_impact: number;        // 1-100 (viral potential)
    conversion_impact: number;    // 1-100
  };

  quality_scores: {
    content_quality: number;      // 1-100
    seo_strength: number;         // 1-100
    authority_score: number;      // 1-100
    backlink_worthiness: number;  // 1-100
  };

  // Probability Models
  probabilities: {
    ranking_probability: number;      // 0-1
    citation_probability: number;     // 0-1 (GEO)
    conversion_probability: number;   // 0-1
    viral_probability: number;        // 0-1 (Social)
    partnership_probability: number;  // 0-1
  };

  // Opportunities
  opportunities: Opportunity[];

  // Strategic Insights
  strategic_insights: {
    content_gaps: ContentGap[];
    backlink_opportunities: BacklinkOpp[];
    partnership_potential: Partnership[];
    trending_topics: Topic[];
    sentiment_analysis: SentimentData;
  };

  // Context Data
  keywords_found: string[];
  entities_extracted: Entity[];
  topics_covered: string[];
}

interface BrandMention {
  mention_text: string;
  context: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  impact_score: number;
  citation_type: 'direct' | 'indirect' | 'comparative';
}

interface Opportunity {
  type: 'content_gap' | 'backlink' | 'partnership' | 'keyword' | 'trend';
  title: string;
  description: string;
  actionable_steps: string[];
  estimated_roi: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority_score: number;
}
```

---

## 2. AI Chat - Context-Aware Conversations

### Data Sync Flow
Enriched data → `gv_ai_chat_context` table → AI Chat feature

### Implementation

```typescript
// /supabase/functions/sync-to-ai-chat/index.ts

interface AIChatContext {
  brand_id: string;
  context_type: 'brand_intelligence' | 'competitor_intel' | 'market_trends';
  context_data: {
    // From enriched crawl
    recent_mentions: BrandMention[];
    top_opportunities: Opportunity[];
    trending_topics: Topic[];
    competitor_activities: CompetitorMention[];
    sentiment_summary: {
      positive_count: number;
      negative_count: number;
      neutral_count: number;
      overall_sentiment: number; // -100 to +100
    };
  };
  updated_at: string;
}

async function syncToAIChat(enrichedData: UnifiedEnrichedData, brandId: string) {
  // 1. Extract conversation-relevant insights
  const chatContext: AIChatContext = {
    brand_id: brandId,
    context_type: 'brand_intelligence',
    context_data: {
      recent_mentions: enrichedData.brand_mentions
        .filter(m => m.impact_score > 70)
        .slice(0, 10), // Top 10 high-impact mentions

      top_opportunities: enrichedData.opportunities
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, 5), // Top 5 opportunities

      trending_topics: enrichedData.strategic_insights.trending_topics
        .filter(t => t.trend_velocity > 0.7)
        .slice(0, 5),

      competitor_activities: enrichedData.competitor_mentions
        .filter(c => c.threat_level === 'high'),

      sentiment_summary: calculateSentimentSummary(enrichedData.brand_mentions)
    },
    updated_at: new Date().toISOString()
  };

  // 2. Store in AI Chat context table
  await supabase
    .from('gv_ai_chat_context')
    .upsert(chatContext, { onConflict: 'brand_id,context_type' });

  // 3. Pre-generate smart suggestions
  const suggestions = await generateChatSuggestions(chatContext);

  await supabase
    .from('gv_ai_chat_suggestions')
    .insert(suggestions.map(s => ({
      brand_id: brandId,
      suggestion_text: s.text,
      suggestion_type: s.type,
      priority: s.priority,
      context_source: 'enriched_crawl'
    })));
}

async function generateChatSuggestions(context: AIChatContext) {
  const suggestions = [];

  // Example smart suggestions based on enriched data
  if (context.context_data.sentiment_summary.negative_count > 3) {
    suggestions.push({
      text: "You have 3 negative brand mentions this week. Would you like me to draft response strategies?",
      type: 'reputation_management',
      priority: 'high'
    });
  }

  if (context.context_data.top_opportunities.length > 0) {
    const topOpp = context.context_data.top_opportunities[0];
    suggestions.push({
      text: `I found a ${topOpp.difficulty} opportunity: ${topOpp.title}. Want to explore this?`,
      type: 'opportunity_alert',
      priority: 'medium'
    });
  }

  if (context.context_data.trending_topics.length > 0) {
    suggestions.push({
      text: `Trending topic detected: "${context.context_data.trending_topics[0].name}". Create content about this?`,
      type: 'content_idea',
      priority: 'medium'
    });
  }

  return suggestions;
}
```

### AI Chat User Experience

```
User: "How is my brand performing?"

AI Chat (powered by enriched data):
"Based on this week's intelligence:

📊 Brand Mentions: 47 mentions detected
   ✅ 32 positive (68%)
   ⚠️ 3 negative (6%)
   ➖ 12 neutral (26%)

🔥 Top Opportunity:
   "Content gap in 'sustainable packaging' (ROI: 85/100)
   3 easy steps to capitalize on this"

📈 Trending Topic:
   "Eco-friendly materials" - velocity 0.82
   Your competitors are talking about this"

Would you like me to:
1. Draft responses to negative mentions
2. Create content brief for the opportunity
3. Add trending topic to your content calendar
```

---

## 3. Content Studio - AI-Powered Content Briefs

### Data Sync Flow
Enriched data → `gv_content_briefs` + `gv_content_ideas` → Content Studio

### Implementation

```typescript
// /supabase/functions/sync-to-content-studio/index.ts

interface ContentBrief {
  brand_id: string;
  title: string;
  content_type: 'blog' | 'social' | 'press_release' | 'email';

  // From enriched data
  target_keywords: string[];
  target_topics: string[];

  // AI-generated sections
  suggested_outline: OutlineSection[];
  talking_points: string[];
  competitor_angles: CompetitorAngle[];

  // Intelligence from enriched crawl
  seo_recommendations: {
    primary_keyword: string;
    secondary_keywords: string[];
    ranking_probability: number;
    estimated_traffic: number;
  };

  geo_recommendations: {
    citation_targets: string[]; // Sites likely to cite
    citation_probability: number;
    recommended_format: string;
  };

  social_recommendations: {
    viral_potential: number;
    optimal_platform: 'twitter' | 'linkedin' | 'facebook';
    suggested_hooks: string[];
  };

  priority_score: number;
  estimated_impact: number;
}

async function syncToContentStudio(enrichedData: UnifiedEnrichedData, brandId: string) {
  // 1. Identify content opportunities from enriched data
  const contentOpportunities = enrichedData.opportunities
    .filter(opp => opp.type === 'content_gap')
    .sort((a, b) => b.priority_score - a.priority_score);

  for (const opportunity of contentOpportunities.slice(0, 10)) {
    // 2. Generate content brief using Claude
    const brief = await generateContentBrief(opportunity, enrichedData);

    // 3. Store in Content Studio
    await supabase
      .from('gv_content_briefs')
      .insert({
        brand_id: brandId,
        title: brief.title,
        content_type: brief.content_type,
        target_keywords: brief.target_keywords,
        target_topics: brief.target_topics,
        suggested_outline: brief.suggested_outline,
        talking_points: brief.talking_points,
        competitor_angles: brief.competitor_angles,
        seo_recommendations: brief.seo_recommendations,
        geo_recommendations: brief.geo_recommendations,
        social_recommendations: brief.social_recommendations,
        priority_score: brief.priority_score,
        estimated_impact: brief.estimated_impact,
        source: 'enriched_crawl',
        status: 'suggested'
      });
  }

  // 4. Generate quick social content ideas from trending topics
  for (const topic of enrichedData.strategic_insights.trending_topics.slice(0, 5)) {
    await supabase
      .from('gv_content_ideas')
      .insert({
        brand_id: brandId,
        idea_type: 'social_post',
        topic: topic.name,
        angle: topic.recommended_angle,
        viral_probability: enrichedData.probabilities.viral_probability,
        optimal_timing: topic.optimal_timing,
        source: 'enriched_crawl'
      });
  }
}

async function generateContentBrief(
  opportunity: Opportunity,
  enrichedData: UnifiedEnrichedData
): Promise<ContentBrief> {
  // Use Claude to generate comprehensive content brief
  const prompt = `Generate a content brief for: ${opportunity.title}

Context:
- Keywords found: ${enrichedData.keywords_found.join(', ')}
- Topics covered: ${enrichedData.topics_covered.join(', ')}
- Content gaps identified: ${JSON.stringify(enrichedData.strategic_insights.content_gaps)}

Provide:
1. Suggested outline (H2, H3 structure)
2. Key talking points
3. Competitor angles to differentiate from
4. SEO, GEO, and Social recommendations`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  const briefContent = parseClaudeResponse(response);

  return {
    brand_id: enrichedData.brand_id,
    title: opportunity.title,
    content_type: determineContentType(opportunity),
    target_keywords: enrichedData.keywords_found.slice(0, 5),
    target_topics: enrichedData.topics_covered.slice(0, 3),
    suggested_outline: briefContent.outline,
    talking_points: briefContent.talking_points,
    competitor_angles: briefContent.competitor_angles,
    seo_recommendations: {
      primary_keyword: enrichedData.keywords_found[0],
      secondary_keywords: enrichedData.keywords_found.slice(1, 4),
      ranking_probability: enrichedData.probabilities.ranking_probability,
      estimated_traffic: estimateTraffic(enrichedData.probabilities.ranking_probability)
    },
    geo_recommendations: {
      citation_targets: identifyCitationTargets(enrichedData),
      citation_probability: enrichedData.probabilities.citation_probability,
      recommended_format: enrichedData.probabilities.citation_probability > 0.7
        ? 'data-driven_research'
        : 'thought_leadership'
    },
    social_recommendations: {
      viral_potential: enrichedData.probabilities.viral_probability * 100,
      optimal_platform: determineOptimalPlatform(enrichedData),
      suggested_hooks: generateSocialHooks(enrichedData)
    },
    priority_score: opportunity.priority_score,
    estimated_impact: opportunity.estimated_roi
  };
}
```

### Content Studio User Experience

```
Content Studio Dashboard:

📝 AI-Generated Content Briefs (10 new)

[High Priority] "Sustainable Packaging Solutions for E-commerce"
   🎯 Ranking Probability: 78%
   🤖 Citation Probability: 82% (5 authority sites likely to cite)
   🔥 Viral Potential: 67%

   Outline:
   - Introduction: The packaging crisis
   - 5 sustainable alternatives
   - Cost-benefit analysis
   - Implementation roadmap

   SEO: Target "sustainable ecommerce packaging" (800 searches/mo)
   GEO: Format as data-driven research for AI citations
   Social: LinkedIn performs best for this topic

   [Generate Full Draft] [Add to Calendar] [Assign to Writer]
```

---

## 4. Radar - Competitor Intelligence

### Data Sync Flow
Enriched data → `gv_competitor_activities` + `gv_competitive_alerts` → Radar

### Implementation

```typescript
// /supabase/functions/sync-to-radar/index.ts

interface CompetitorActivity {
  brand_id: string;
  competitor_domain: string;
  competitor_name: string;

  activity_type: 'content_published' | 'backlink_gained' | 'ranking_change' | 'mention';
  activity_data: any;

  // From enriched data
  threat_level: 'low' | 'medium' | 'high';
  impact_score: number;

  // Strategic context
  what_they_did: string;
  why_it_matters: string;
  recommended_response: string[];

  detected_at: string;
}

async function syncToRadar(enrichedData: UnifiedEnrichedData, brandId: string) {
  // 1. Extract competitor activities from enriched data
  for (const competitorMention of enrichedData.competitor_mentions) {
    const activity: CompetitorActivity = {
      brand_id: brandId,
      competitor_domain: competitorMention.domain,
      competitor_name: competitorMention.name,
      activity_type: 'mention',
      activity_data: {
        url: enrichedData.url,
        context: competitorMention.context,
        mention_type: competitorMention.mention_type
      },
      threat_level: competitorMention.threat_level,
      impact_score: competitorMention.impact_score,
      what_they_did: `${competitorMention.name} was mentioned in context: "${competitorMention.context}"`,
      why_it_matters: competitorMention.strategic_implication,
      recommended_response: competitorMention.recommended_actions,
      detected_at: new Date().toISOString()
    };

    // 2. Store in Radar
    await supabase
      .from('gv_competitor_activities')
      .insert(activity);

    // 3. Create alert if high threat
    if (competitorMention.threat_level === 'high') {
      await supabase
        .from('gv_competitive_alerts')
        .insert({
          brand_id: brandId,
          alert_type: 'high_threat_activity',
          competitor_name: competitorMention.name,
          message: `⚠️ High-threat activity: ${activity.what_they_did}`,
          recommended_actions: activity.recommended_response,
          priority: 'high',
          read: false
        });
    }
  }

  // 4. Detect competitive gaps (opportunities where competitors are weak)
  const competitiveGaps = enrichedData.strategic_insights.content_gaps
    .filter(gap => gap.competitor_coverage === 'weak');

  for (const gap of competitiveGaps) {
    await supabase
      .from('gv_competitive_alerts')
      .insert({
        brand_id: brandId,
        alert_type: 'competitive_gap',
        message: `💡 Opportunity: Competitors are weak in "${gap.topic}"`,
        recommended_actions: [`Create authoritative content about ${gap.topic}`,
                             `Target keyword: ${gap.target_keyword}`,
                             `Estimated ROI: ${gap.estimated_roi}/100`],
        priority: 'medium',
        read: false
      });
  }
}
```

### Radar User Experience

```
Radar Dashboard:

🎯 Competitive Intelligence

Recent Activity (Last 7 Days):
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ HIGH THREAT                                              │
│ Competitor.com published "Ultimate Guide to SEO"            │
│                                                             │
│ Why it matters:                                             │
│ • Targets your primary keyword "SEO guide"                  │
│ • Already ranking #3 on Google                              │
│ • Has 2.5K backlinks                                        │
│                                                             │
│ Recommended Response:                                       │
│ 1. Update your existing guide with 2024 data                │
│ 2. Add interactive tools (our differentiator)               │
│ 3. Reach out to 15 sites linking to their guide             │
│                                                             │
│ [Create To-Do] [Generate Content Brief] [Dismiss]           │
└─────────────────────────────────────────────────────────────┘

💡 Competitive Gaps (3 opportunities)
• "AI-powered SEO tools" - competitors have weak coverage
• "Local SEO for SaaS" - no competitor content found
• "SEO automation" - outdated competitor content (2022)
```

---

## 5. Insights - Opportunity Detection

### Data Sync Flow
Enriched data → `gv_daily_insights` + `gv_opportunity_tracker` → Insights

### Implementation

```typescript
// /supabase/functions/sync-to-insights/index.ts

interface InsightRecord {
  brand_id: string;
  insight_type: 'opportunity' | 'threat' | 'trend' | 'achievement';
  channel: 'seo' | 'geo' | 'social' | 'overall';

  title: string;
  description: string;

  // From enriched data
  priority: number; // 1-100
  impact_score: number; // 1-100
  confidence_score: number; // 0-1

  // Actionability
  actionable_steps: string[];
  estimated_effort: 'low' | 'medium' | 'high';
  estimated_roi: number;

  // Context
  supporting_data: any;
  related_urls: string[];

  suggested: boolean; // Auto-suggested by AI
  created_at: string;
}

async function syncToInsights(enrichedData: UnifiedEnrichedData, brandId: string) {
  const insights: InsightRecord[] = [];

  // 1. Convert opportunities to insights
  for (const opp of enrichedData.opportunities) {
    insights.push({
      brand_id: brandId,
      insight_type: 'opportunity',
      channel: determineChannel(opp.type),
      title: opp.title,
      description: opp.description,
      priority: opp.priority_score,
      impact_score: opp.estimated_roi,
      confidence_score: calculateConfidence(enrichedData),
      actionable_steps: opp.actionable_steps,
      estimated_effort: opp.difficulty,
      estimated_roi: opp.estimated_roi,
      supporting_data: {
        opportunity_type: opp.type,
        source_url: enrichedData.url,
        discovered_at: enrichedData.crawled_at
      },
      related_urls: [enrichedData.url],
      suggested: true,
      created_at: new Date().toISOString()
    });
  }

  // 2. Detect trending opportunities
  if (enrichedData.strategic_insights.trending_topics.length > 0) {
    const topTrend = enrichedData.strategic_insights.trending_topics[0];
    insights.push({
      brand_id: brandId,
      insight_type: 'trend',
      channel: 'overall',
      title: `Trending: ${topTrend.name}`,
      description: `This topic is gaining momentum (velocity: ${topTrend.trend_velocity.toFixed(2)})`,
      priority: 80,
      impact_score: 75,
      confidence_score: topTrend.trend_velocity,
      actionable_steps: [
        `Create content about ${topTrend.name}`,
        `Target optimal timing: ${topTrend.optimal_timing}`,
        `Expected viral potential: ${(enrichedData.probabilities.viral_probability * 100).toFixed(0)}%`
      ],
      estimated_effort: 'medium',
      estimated_roi: 70,
      supporting_data: topTrend,
      related_urls: [enrichedData.url],
      suggested: true,
      created_at: new Date().toISOString()
    });
  }

  // 3. Sentiment-based insights
  const negativeMentions = enrichedData.brand_mentions.filter(m => m.sentiment === 'negative');
  if (negativeMentions.length > 0) {
    insights.push({
      brand_id: brandId,
      insight_type: 'threat',
      channel: 'overall',
      title: `${negativeMentions.length} Negative Brand Mentions Detected`,
      description: 'Potential reputation risk requiring attention',
      priority: 90,
      impact_score: 85,
      confidence_score: 0.95,
      actionable_steps: [
        'Review negative mentions',
        'Draft response strategy',
        'Monitor sentiment trend'
      ],
      estimated_effort: 'medium',
      estimated_roi: 80,
      supporting_data: { mentions: negativeMentions },
      related_urls: negativeMentions.map(m => enrichedData.url),
      suggested: true,
      created_at: new Date().toISOString()
    });
  }

  // 4. Store all insights
  await supabase
    .from('gv_daily_insights')
    .insert(insights);

  // 5. Track opportunity progression
  for (const insight of insights.filter(i => i.insight_type === 'opportunity')) {
    await supabase
      .from('gv_opportunity_tracker')
      .insert({
        brand_id: brandId,
        opportunity_id: generateOpportunityId(insight),
        opportunity_title: insight.title,
        discovery_date: new Date().toISOString(),
        status: 'discovered',
        estimated_roi: insight.estimated_roi,
        priority_score: insight.priority,
        source: 'enriched_crawl'
      });
  }
}
```

### Insights User Experience

```
Insights Dashboard:

📊 This Week's Intelligence (38 insights)

🔥 Top Opportunities (5 suggested)
┌─────────────────────────────────────────────────────────────┐
│ 1. Content Gap: "AI-powered analytics"                      │
│    Priority: 92/100 | ROI: 88/100 | Effort: Medium         │
│                                                             │
│    Why this matters:                                        │
│    • 3 competitors have weak coverage                       │
│    • Ranking probability: 76%                               │
│    • Citation probability: 81% (GEO opportunity!)           │
│                                                             │
│    Next Steps:                                              │
│    ✓ Create data-driven guide (2000+ words)                │
│    ✓ Target "ai analytics tools" (1.2K searches/mo)        │
│    ✓ Reach out to 8 potential citation sources             │
│                                                             │
│    [Create Content Brief] [Add to To-Do] [Track Progress]  │
└─────────────────────────────────────────────────────────────┘

📈 Trending (2 new)
• "Predictive analytics" - velocity 0.89 - Act now!
• "Data visualization" - velocity 0.72

⚠️ Threats (1 urgent)
• 3 negative brand mentions detected - Review needed
```

---

## 6. To-Do - Action Item Generation

### Data Sync Flow
Enriched data → `gv_todos` (auto-generated) → To-Do feature

### Implementation

```typescript
// /supabase/functions/sync-to-todo/index.ts

interface TodoItem {
  brand_id: string;
  title: string;
  description: string;

  // From enriched data
  category: 'seo' | 'content' | 'outreach' | 'monitoring' | 'reputation';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Actionability
  actionable_steps: string[];
  estimated_time: string; // "30 minutes", "2 hours", etc.
  difficulty: 'easy' | 'medium' | 'hard';

  // Context
  source_insight_id?: string;
  source_opportunity_id?: string;
  related_urls: string[];

  // Metadata
  auto_generated: boolean;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

async function syncToTodo(enrichedData: UnifiedEnrichedData, brandId: string) {
  const todos: TodoItem[] = [];

  // 1. Generate To-Dos from opportunities
  for (const opp of enrichedData.opportunities) {
    // Create primary task
    todos.push({
      brand_id: brandId,
      title: opp.title,
      description: opp.description,
      category: mapOpportunityToCategory(opp.type),
      priority: opp.priority_score > 80 ? 'high' :
                opp.priority_score > 60 ? 'medium' : 'low',
      actionable_steps: opp.actionable_steps,
      estimated_time: estimateTime(opp.difficulty),
      difficulty: opp.difficulty,
      source_opportunity_id: generateOpportunityId(opp),
      related_urls: [enrichedData.url],
      auto_generated: true,
      status: 'pending',
      created_at: new Date().toISOString()
    });

    // Create sub-tasks for each actionable step
    for (let i = 0; i < opp.actionable_steps.length; i++) {
      todos.push({
        brand_id: brandId,
        title: `Step ${i + 1}: ${opp.actionable_steps[i]}`,
        description: `Sub-task for: ${opp.title}`,
        category: mapOpportunityToCategory(opp.type),
        priority: 'medium',
        actionable_steps: [opp.actionable_steps[i]],
        estimated_time: estimateStepTime(opp.actionable_steps[i]),
        difficulty: 'easy',
        source_opportunity_id: generateOpportunityId(opp),
        related_urls: [enrichedData.url],
        auto_generated: true,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }
  }

  // 2. Generate To-Dos from backlink opportunities
  for (const backlinkOpp of enrichedData.strategic_insights.backlink_opportunities) {
    todos.push({
      brand_id: brandId,
      title: `Backlink Outreach: ${backlinkOpp.target_domain}`,
      description: backlinkOpp.rationale,
      category: 'outreach',
      priority: backlinkOpp.link_value > 80 ? 'high' : 'medium',
      actionable_steps: [
        `Research contact info for ${backlinkOpp.target_domain}`,
        `Draft personalized outreach email`,
        `Send outreach email`,
        `Follow up in 7 days if no response`
      ],
      estimated_time: '1 hour',
      difficulty: backlinkOpp.acquisition_difficulty,
      related_urls: [backlinkOpp.target_url],
      auto_generated: true,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  }

  // 3. Generate To-Dos from negative sentiment
  const negativeMentions = enrichedData.brand_mentions.filter(m => m.sentiment === 'negative');
  if (negativeMentions.length > 0) {
    todos.push({
      brand_id: brandId,
      title: `Address ${negativeMentions.length} Negative Brand Mentions`,
      description: 'Reputation management task',
      category: 'reputation',
      priority: 'urgent',
      actionable_steps: [
        'Review all negative mentions',
        'Categorize by severity',
        'Draft response strategy',
        'Implement responses',
        'Monitor resolution'
      ],
      estimated_time: '3 hours',
      difficulty: 'medium',
      related_urls: negativeMentions.map(m => enrichedData.url),
      auto_generated: true,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  }

  // 4. Generate To-Dos from trending topics
  for (const trend of enrichedData.strategic_insights.trending_topics.slice(0, 3)) {
    if (trend.trend_velocity > 0.75) { // High-velocity trends only
      todos.push({
        brand_id: brandId,
        title: `Create Content: ${trend.name}`,
        description: `Capitalize on trending topic (velocity: ${trend.trend_velocity.toFixed(2)})`,
        category: 'content',
        priority: 'high',
        actionable_steps: [
          `Generate content brief for "${trend.name}"`,
          `Write article/post`,
          `Optimize for SEO`,
          `Publish and promote`,
          `Monitor performance`
        ],
        estimated_time: '4 hours',
        difficulty: 'medium',
        related_urls: [enrichedData.url],
        auto_generated: true,
        due_date: trend.optimal_timing,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }
  }

  // 5. Store all To-Dos
  await supabase
    .from('gv_todos')
    .insert(todos);

  return todos;
}

function mapOpportunityToCategory(oppType: string): string {
  const mapping = {
    'content_gap': 'content',
    'backlink': 'outreach',
    'partnership': 'outreach',
    'keyword': 'seo',
    'trend': 'content'
  };
  return mapping[oppType] || 'seo';
}

function estimateTime(difficulty: string): string {
  const timeEstimates = {
    'easy': '1-2 hours',
    'medium': '3-5 hours',
    'hard': '1-2 days'
  };
  return timeEstimates[difficulty] || '2-3 hours';
}

function estimateStepTime(step: string): string {
  if (step.includes('research') || step.includes('analyze')) return '1 hour';
  if (step.includes('write') || step.includes('create')) return '2 hours';
  if (step.includes('outreach') || step.includes('contact')) return '30 minutes';
  return '1 hour';
}
```

### To-Do User Experience

```
To-Do Dashboard:

✅ Action Items (12 auto-generated, 3 manual)

🔥 Urgent (1)
┌─────────────────────────────────────────────────────────────┐
│ Address 3 Negative Brand Mentions                           │
│ Category: Reputation | Est. Time: 3 hours                   │
│                                                             │
│ Steps:                                                      │
│ ☐ Review all negative mentions                             │
│ ☐ Categorize by severity                                   │
│ ☐ Draft response strategy                                  │
│ ☐ Implement responses                                      │
│ ☐ Monitor resolution                                       │
│                                                             │
│ Source: Auto-generated from enriched crawl                 │
│ [Start Task] [View Context] [Delegate]                     │
└─────────────────────────────────────────────────────────────┘

⚡ High Priority (5)
• Content Gap: "AI-powered analytics" (Est: 4 hours)
  └─ Step 1: Generate content brief ☐
  └─ Step 2: Write 2000+ word guide ☐
  └─ Step 3: Optimize for SEO ☐

• Backlink Outreach: example.com (Est: 1 hour)
  └─ Research contact info ☐
  └─ Draft outreach email ☐

📅 This Week (3)
• Create Content: "Predictive analytics" (Due: Feb 18)
• Monitor competitor activity on "SEO tools"
• Update existing guide with 2024 data
```

---

## 7. GEO (Generative Engine Optimization) - AI Citation Tracking

### Data Sync Flow
Enriched data → `gv_geo_citations` + `gv_geo_opportunities` → GEO feature

### Implementation

```typescript
// /supabase/functions/sync-to-geo/index.ts

interface GEOCitation {
  brand_id: string;

  // Citation context
  source_url: string;
  source_domain: string;
  source_authority: number;

  // Citation details
  citation_text: string;
  citation_context: string;
  citation_type: 'direct' | 'indirect' | 'comparative';

  // From enriched data
  ai_visibility_score: number; // How visible to AI engines
  citation_quality: number; // 1-100

  // Strategic value
  estimated_ai_impressions: number;
  strategic_value: 'high' | 'medium' | 'low';

  detected_at: string;
}

interface GEOOpportunity {
  brand_id: string;

  opportunity_type: 'citation_gap' | 'format_optimization' | 'authority_building';

  title: string;
  description: string;

  // From enriched data
  target_topic: string;
  target_format: 'data_driven' | 'how_to' | 'comparison' | 'research';
  citation_probability: number; // 0-1

  // Actionability
  recommended_actions: string[];
  estimated_effort: string;
  estimated_impact: number;

  priority_score: number;
}

async function syncToGEO(enrichedData: UnifiedEnrichedData, brandId: string) {
  // 1. Track citations from enriched data
  for (const mention of enrichedData.brand_mentions) {
    if (mention.citation_type) {
      const citation: GEOCitation = {
        brand_id: brandId,
        source_url: enrichedData.url,
        source_domain: enrichedData.domain,
        source_authority: enrichedData.quality_scores.authority_score,
        citation_text: mention.mention_text,
        citation_context: mention.context,
        citation_type: mention.citation_type,
        ai_visibility_score: calculateAIVisibility(enrichedData),
        citation_quality: mention.impact_score,
        estimated_ai_impressions: estimateAIImpressions(
          enrichedData.quality_scores.authority_score,
          mention.impact_score
        ),
        strategic_value: mention.impact_score > 80 ? 'high' :
                        mention.impact_score > 60 ? 'medium' : 'low',
        detected_at: new Date().toISOString()
      };

      await supabase
        .from('gv_geo_citations')
        .insert(citation);
    }
  }

  // 2. Identify GEO opportunities from enriched data
  const opportunities: GEOOpportunity[] = [];

  // Opportunity: High citation probability content gaps
  const highCitationOpps = enrichedData.opportunities
    .filter(opp =>
      opp.type === 'content_gap' &&
      enrichedData.probabilities.citation_probability > 0.7
    );

  for (const opp of highCitationOpps) {
    opportunities.push({
      brand_id: brandId,
      opportunity_type: 'citation_gap',
      title: `High Citation Potential: ${opp.title}`,
      description: `This content gap has ${(enrichedData.probabilities.citation_probability * 100).toFixed(0)}% probability of being cited by AI engines`,
      target_topic: opp.title,
      target_format: determineOptimalFormat(enrichedData),
      citation_probability: enrichedData.probabilities.citation_probability,
      recommended_actions: [
        'Create data-driven research content',
        'Include statistics and citations',
        'Structure with clear headings',
        'Add expert quotes',
        'Publish on high-authority domain'
      ],
      estimated_effort: opp.difficulty === 'easy' ? '2-3 days' :
                        opp.difficulty === 'medium' ? '1 week' : '2 weeks',
      estimated_impact: Math.round(enrichedData.probabilities.citation_probability * 100),
      priority_score: opp.priority_score
    });
  }

  // Opportunity: Format optimization for existing content
  if (enrichedData.probabilities.citation_probability > 0.6 &&
      enrichedData.quality_scores.content_quality < 70) {
    opportunities.push({
      brand_id: brandId,
      opportunity_type: 'format_optimization',
      title: 'Optimize Content Format for AI Citations',
      description: 'Current content has citation potential but needs format improvements',
      target_topic: enrichedData.topics_covered[0],
      target_format: 'data_driven',
      citation_probability: enrichedData.probabilities.citation_probability,
      recommended_actions: [
        'Add statistical data and research findings',
        'Restructure with clear H2/H3 headings',
        'Include expert quotes and attributions',
        'Add structured data markup',
        'Improve content depth and authority signals'
      ],
      estimated_effort: '1-2 days',
      estimated_impact: 75,
      priority_score: 70
    });
  }

  // 3. Store GEO opportunities
  await supabase
    .from('gv_geo_opportunities')
    .insert(opportunities);

  return { citations: enrichedData.brand_mentions.length, opportunities: opportunities.length };
}

function calculateAIVisibility(enrichedData: UnifiedEnrichedData): number {
  // Factors that influence AI visibility:
  // - Domain authority
  // - Content quality
  // - Structured data
  // - Citation worthiness

  const authorityWeight = enrichedData.quality_scores.authority_score * 0.3;
  const qualityWeight = enrichedData.quality_scores.content_quality * 0.3;
  const citationWeight = enrichedData.probabilities.citation_probability * 100 * 0.4;

  return Math.round(authorityWeight + qualityWeight + citationWeight);
}

function estimateAIImpressions(authority: number, impact: number): number {
  // Rough estimation based on domain authority and citation quality
  const baseImpressions = 1000;
  const authorityMultiplier = authority / 50; // 50 is baseline
  const impactMultiplier = impact / 50;

  return Math.round(baseImpressions * authorityMultiplier * impactMultiplier);
}

function determineOptimalFormat(enrichedData: UnifiedEnrichedData): string {
  if (enrichedData.probabilities.citation_probability > 0.8) {
    return 'data_driven'; // Research-backed content
  } else if (enrichedData.keywords_found.some(k => k.includes('how to'))) {
    return 'how_to'; // Tutorial format
  } else if (enrichedData.competitor_mentions.length > 2) {
    return 'comparison'; // Comparison content
  }
  return 'research';
}
```

### GEO User Experience

```
GEO Dashboard:

🤖 AI Citation Intelligence

Citation Performance:
┌─────────────────────────────────────────────────────────────┐
│ Total Citations: 47                                         │
│ AI Visibility Score: 78/100                                 │
│ Est. AI Impressions: 12,400/month                           │
│                                                             │
│ Top Cited Content:                                          │
│ 1. "Ultimate Guide to SEO" - 12 citations (High value)     │
│    └─ Sources: Wikipedia, Forbes, TechCrunch                │
│    └─ Est. impressions: 3,200/month                         │
│                                                             │
│ 2. "AI Marketing Trends 2024" - 8 citations (High value)   │
│    └─ Sources: HubSpot, MarketingProfs, Moz                 │
│    └─ Est. impressions: 2,100/month                         │
└─────────────────────────────────────────────────────────────┘

🎯 Citation Opportunities (3 new)

[High Priority] "Sustainable Packaging Research"
   Citation Probability: 82%
   Estimated Impact: 82/100

   Why this will get cited:
   • Data-driven topic (AI engines love data)
   • Low competition (citation gap)
   • High search demand

   Recommended Format:
   ✓ Research study with statistics
   ✓ Expert quotes and attributions
   ✓ Clear data visualizations
   ✓ Structured with H2/H3 headings

   Estimated AI Impressions: 4,500/month

   [Generate Content Brief] [Add to Calendar] [Track]

Format Optimization Needed:
• "Your Product Guide" has 67% citation potential but needs:
  - Add statistical data
  - Include expert quotes
  - Improve heading structure
```

---

## 8. Social Search - Viral Potential Tracking

### Data Sync Flow
Enriched data → `gv_social_mentions` + `gv_viral_opportunities` → Social Search

### Implementation

```typescript
// /supabase/functions/sync-to-social-search/index.ts

interface SocialMention {
  brand_id: string;

  // Source
  platform: 'twitter' | 'linkedin' | 'facebook' | 'reddit' | 'other';
  source_url: string;
  author: string;

  // Mention details
  mention_text: string;
  mention_context: string;
  sentiment: 'positive' | 'neutral' | 'negative';

  // From enriched data
  viral_potential: number; // 0-100
  engagement_signals: {
    likes?: number;
    shares?: number;
    comments?: number;
    reach_estimate?: number;
  };

  // Strategic value
  influencer_score: number; // 1-100
  amplification_opportunity: boolean;

  detected_at: string;
}

interface ViralOpportunity {
  brand_id: string;

  opportunity_type: 'trending_topic' | 'viral_content' | 'influencer_mention' | 'conversation_gap';

  title: string;
  description: string;

  // From enriched data
  topic: string;
  optimal_platform: 'twitter' | 'linkedin' | 'facebook' | 'tiktok';
  viral_probability: number; // 0-1

  // Timing
  optimal_timing: string;
  urgency: 'high' | 'medium' | 'low';

  // Actionability
  suggested_content: string[];
  hashtags: string[];
  target_audience: string;

  estimated_reach: number;
  priority_score: number;
}

async function syncToSocialSearch(enrichedData: UnifiedEnrichedData, brandId: string) {
  // 1. Extract social mentions from enriched data
  for (const mention of enrichedData.brand_mentions) {
    const platform = detectPlatform(enrichedData.url);

    if (platform) {
      const socialMention: SocialMention = {
        brand_id: brandId,
        platform: platform,
        source_url: enrichedData.url,
        author: extractAuthor(enrichedData),
        mention_text: mention.mention_text,
        mention_context: mention.context,
        sentiment: mention.sentiment,
        viral_potential: Math.round(enrichedData.probabilities.viral_probability * 100),
        engagement_signals: extractEngagementSignals(enrichedData),
        influencer_score: calculateInfluencerScore(enrichedData),
        amplification_opportunity:
          mention.sentiment === 'positive' &&
          enrichedData.probabilities.viral_probability > 0.6,
        detected_at: new Date().toISOString()
      };

      await supabase
        .from('gv_social_mentions')
        .insert(socialMention);
    }
  }

  // 2. Identify viral opportunities from trending topics
  const viralOpportunities: ViralOpportunity[] = [];

  for (const trend of enrichedData.strategic_insights.trending_topics) {
    if (trend.trend_velocity > 0.7) { // High-velocity trends
      viralOpportunities.push({
        brand_id: brandId,
        opportunity_type: 'trending_topic',
        title: `Trending: ${trend.name}`,
        description: `High-velocity trend with ${(trend.trend_velocity * 100).toFixed(0)}% momentum`,
        topic: trend.name,
        optimal_platform: determineOptimalPlatform(enrichedData),
        viral_probability: enrichedData.probabilities.viral_probability,
        optimal_timing: trend.optimal_timing,
        urgency: trend.trend_velocity > 0.85 ? 'high' : 'medium',
        suggested_content: await generateSocialContentIdeas(trend, enrichedData),
        hashtags: generateHashtags(trend.name),
        target_audience: identifyTargetAudience(enrichedData),
        estimated_reach: estimateViralReach(
          enrichedData.probabilities.viral_probability,
          trend.trend_velocity
        ),
        priority_score: Math.round(trend.trend_velocity * 100)
      });
    }
  }

  // 3. Identify influencer mention opportunities
  const influencerMentions = enrichedData.brand_mentions
    .filter(m =>
      m.sentiment === 'positive' &&
      calculateInfluencerScore(enrichedData) > 70
    );

  for (const mention of influencerMentions) {
    viralOpportunities.push({
      brand_id: brandId,
      opportunity_type: 'influencer_mention',
      title: `Influencer Mention Opportunity`,
      description: `High-influence account mentioned your brand positively`,
      topic: mention.context,
      optimal_platform: detectPlatform(enrichedData.url) || 'twitter',
      viral_probability: enrichedData.probabilities.viral_probability,
      optimal_timing: 'within 24 hours',
      urgency: 'high',
      suggested_content: [
        'Thank the influencer publicly',
        'Amplify their content',
        'Engage with their audience',
        'Build ongoing relationship'
      ],
      hashtags: [],
      target_audience: 'Influencer\'s followers',
      estimated_reach: estimateInfluencerReach(calculateInfluencerScore(enrichedData)),
      priority_score: 85
    });
  }

  // 4. Store viral opportunities
  await supabase
    .from('gv_viral_opportunities')
    .insert(viralOpportunities);

  return {
    mentions: enrichedData.brand_mentions.length,
    opportunities: viralOpportunities.length
  };
}

function detectPlatform(url: string): string | null {
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('facebook.com')) return 'facebook';
  if (url.includes('reddit.com')) return 'reddit';
  return null;
}

function calculateInfluencerScore(enrichedData: UnifiedEnrichedData): number {
  // Based on domain authority, social signals, etc.
  const authorityWeight = enrichedData.quality_scores.authority_score * 0.6;
  const socialWeight = enrichedData.impact_scores.social_impact * 0.4;

  return Math.round(authorityWeight + socialWeight);
}

function determineOptimalPlatform(enrichedData: UnifiedEnrichedData): string {
  // Analyze content type and audience
  const keywords = enrichedData.keywords_found.join(' ').toLowerCase();

  if (keywords.includes('b2b') || keywords.includes('professional')) {
    return 'linkedin';
  } else if (keywords.includes('news') || keywords.includes('breaking')) {
    return 'twitter';
  } else if (keywords.includes('visual') || keywords.includes('video')) {
    return 'tiktok';
  }

  return 'twitter'; // Default
}

async function generateSocialContentIdeas(
  trend: Topic,
  enrichedData: UnifiedEnrichedData
): Promise<string[]> {
  return [
    `Thread: "Why ${trend.name} matters for [industry]"`,
    `Infographic: Key statistics about ${trend.name}`,
    `Poll: "How are you using ${trend.name}?"`,
    `Case study: Our experience with ${trend.name}`,
    `Hot take: Contrarian view on ${trend.name}`
  ];
}

function generateHashtags(topic: string): string[] {
  const words = topic.split(' ');
  const hashtags = [
    `#${topic.replace(/\s+/g, '')}`,
    ...words.filter(w => w.length > 4).map(w => `#${w}`)
  ];
  return hashtags.slice(0, 5);
}

function identifyTargetAudience(enrichedData: UnifiedEnrichedData): string {
  // Analyze entities and topics to determine audience
  const topics = enrichedData.topics_covered.join(' ').toLowerCase();

  if (topics.includes('developer') || topics.includes('technical')) {
    return 'Developers and technical professionals';
  } else if (topics.includes('marketing')) {
    return 'Marketing professionals and agencies';
  } else if (topics.includes('business') || topics.includes('executive')) {
    return 'Business leaders and executives';
  }

  return 'General professional audience';
}

function estimateViralReach(viralProbability: number, trendVelocity: number): number {
  const baseReach = 5000;
  const probabilityMultiplier = viralProbability * 10;
  const velocityMultiplier = trendVelocity * 5;

  return Math.round(baseReach * probabilityMultiplier * velocityMultiplier);
}

function estimateInfluencerReach(influencerScore: number): number {
  // Estimate based on influencer score
  if (influencerScore > 90) return 100000; // Macro influencer
  if (influencerScore > 75) return 50000;  // Mid-tier influencer
  if (influencerScore > 60) return 10000;  // Micro influencer
  return 5000; // Nano influencer
}

function extractEngagementSignals(enrichedData: UnifiedEnrichedData): any {
  // Parse engagement data from crawled content
  return {
    reach_estimate: Math.round(
      enrichedData.quality_scores.authority_score *
      enrichedData.probabilities.viral_probability *
      1000
    )
  };
}

function extractAuthor(enrichedData: UnifiedEnrichedData): string {
  // Extract author from entities or metadata
  const authorEntity = enrichedData.entities_extracted
    ?.find(e => e.type === 'PERSON');

  return authorEntity?.name || 'Unknown';
}
```

### Social Search User Experience

```
Social Search Dashboard:

🔥 Viral Intelligence

Social Mentions (Last 7 Days): 23 mentions
┌─────────────────────────────────────────────────────────────┐
│ ✅ POSITIVE (18)  ⚠️ NEUTRAL (3)  ❌ NEGATIVE (2)           │
│                                                             │
│ Top Mention:                                                │
│ @TechInfluencer (45K followers) on Twitter                  │
│ "Just tried [YourBrand] - game changer for analytics!"     │
│                                                             │
│ Viral Potential: 78/100                                    │
│ Influencer Score: 82/100                                   │
│ Estimated Reach: 38,000                                    │
│                                                             │
│ Recommended Action:                                         │
│ ⚡ Amplify within 24 hours for maximum impact               │
│                                                             │
│ [Thank Publicly] [Retweet] [Engage] [Add to Campaign]     │
└─────────────────────────────────────────────────────────────┘

🎯 Viral Opportunities (4 new)

[HIGH URGENCY] Trending: "AI-powered analytics"
   Trend Velocity: 89% (Act now!)
   Viral Probability: 76%
   Optimal Platform: LinkedIn
   Best Timing: Within 48 hours
   Estimated Reach: 45,000

   Suggested Content:
   • Thread: "Why AI-powered analytics matters for marketers"
   • Infographic: Key statistics about AI analytics adoption
   • Poll: "How are you using AI in analytics?"

   Hashtags: #AIAnalytics #MarketingAI #DataScience
   Target: Marketing professionals and data analysts

   [Generate Post] [Schedule] [Add to Content Calendar]

[MEDIUM] Influencer Mention Opportunity
   @DataExpert mentioned you positively (12K followers)
   Viral Potential: 67%

   Action: Thank them publicly and amplify their content
   Estimated Reach: 15,000

   [Draft Response] [Engage]
```

---

## 9. Cost Analysis

### Monthly Costs Per Tier

```typescript
// Cost breakdown for cross-feature sync

const MONTHLY_COSTS = {
  basic: {
    enriched_crawl: 1.025,        // Gemini + Claude
    ai_chat_sync: 0.10,           // Context updates
    content_studio_sync: 0.15,    // Brief generation
    radar_sync: 0.05,             // Competitor tracking
    insights_sync: 0.08,          // Opportunity detection
    todo_sync: 0.03,              // Task generation
    geo_sync: 0.12,               // Citation tracking
    social_sync: 0.10,            // Viral monitoring
    total: 1.645                  // Per brand
  },

  premium: {
    enriched_crawl: 1.025,
    ai_chat_sync: 0.15,
    content_studio_sync: 0.25,
    radar_sync: 0.10,
    insights_sync: 0.12,
    todo_sync: 0.05,
    geo_sync: 0.18,
    social_sync: 0.15,
    total: 2.00
  },

  partner: {
    enriched_crawl: 1.025,
    ai_chat_sync: 0.25,
    content_studio_sync: 0.40,
    radar_sync: 0.20,
    insights_sync: 0.20,
    todo_sync: 0.08,
    geo_sync: 0.30,
    social_sync: 0.25,
    total: 2.70
  }
};
```

**Key Insight**: Single enriched crawl ($1.025) powers all 7 features. Additional costs are just for sync operations and feature-specific processing.

---

## 10. Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- ✅ Set up unified data model
- ✅ Implement enriched crawl pipeline
- ✅ Create database tables

### Phase 2: Core Features (Week 3-4)
- ✅ AI Chat sync
- ✅ Content Studio sync
- ✅ Insights sync

### Phase 3: Advanced Features (Week 5-6)
- ✅ Radar sync
- ✅ To-Do sync
- ✅ GEO sync
- ✅ Social Search sync

### Phase 4: Testing & Optimization (Week 7-8)
- Load testing
- Cost optimization
- User feedback integration

---

## Summary

**Single Source of Truth**: One enriched crawl (Gemini + Claude) feeds 7 features simultaneously

**No Data Silos**: All features work from the same unified intelligence

**Cost Efficient**: $1.025 base crawl cost + minimal sync costs = Maximum ROI

**User Experience**: Consistent insights across all touchpoints - AI Chat knows what Content Studio suggests, Radar threats auto-generate To-Dos, GEO opportunities sync to Insights, etc.

**Competitive Moat**: This unified intelligence system is extremely difficult for competitors to replicate, especially with the self-learning layer that improves accuracy over time.
