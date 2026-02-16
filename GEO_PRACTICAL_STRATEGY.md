# GEO (Generative Engine Optimization) - Practical Strategy
## Best Practices for AI Citation Tracking & Optimization

---

## 🎯 Executive Summary

**Key Insight**: GEO doesn't need separate tracking infrastructure. **Leverage existing SEO data + enriched crawl results** to identify citation opportunities and track AI visibility.

**Recommended Approach**:
- ✅ Reuse SEO keyword tracking (existing infrastructure)
- ✅ Add AI citation detection layer (lightweight)
- ✅ Use Perplexity to score citation probability
- ✅ Provide actionable content optimization suggestions

**Cost**: ~$0.15-0.30/month per brand (minimal incremental cost)

---

## 1. GEO Strategy Overview

### What is GEO?

**Traditional SEO**: Optimize for Google search rankings
**GEO**: Optimize for AI engine citations (ChatGPT, Claude, Perplexity, Gemini, etc.)

**Key Difference**:
- SEO: "Rank #1 on Google for 'marketing analytics'"
- GEO: "Get cited by ChatGPT when users ask about marketing analytics"

### Why GEO Matters (2024-2026)

```
User Behavior Shift:
┌────────────────────────────────────────┐
│ 2022: Google Search     │ 85%          │
│       AI Engines        │ 15%          │
├────────────────────────────────────────┤
│ 2024: Google Search     │ 60%          │
│       AI Engines        │ 40%          │
├────────────────────────────────────────┤
│ 2026: Google Search     │ 40%          │ (projected)
│       AI Engines        │ 60%          │
└────────────────────────────────────────┘

Key Stats:
• ChatGPT: 100M+ weekly active users
• Perplexity: 10M+ monthly users (growing 50%/month)
• Google SGE: Rolling out globally
• Result: 40-60% of info queries now go to AI engines
```

---

## 2. Practical GEO Implementation (Leveraging Existing Data)

### Option A: Lightweight Approach (Recommended for MVP)

**Use existing SEO keyword tracking + add citation detection**

```typescript
// /supabase/functions/geo-citation-detection/index.ts

interface GEODetectionConfig {
  brand_id: string;
  brand_name: string;

  // Reuse from existing SEO tracking
  tracked_keywords: string[]; // Already tracking for SEO!
  target_urls: string[];      // Brand's own content URLs

  tier: 'basic' | 'premium' | 'partner';
}

const GEO_TIER_LIMITS = {
  basic: {
    citation_checks_per_month: 100,      // Check 100 times/month
    tracked_topics: 20,                   // Monitor 20 topics
    optimization_suggestions: 10,         // 10 suggestions per month
    ai_engines: 'all',                    // All major engines, different allocation
    engine_allocation: null               // Will be determined by Perplexity research
  },
  premium: {
    citation_checks_per_month: 200,      // Check 200 times/month
    tracked_topics: 40,                   // Monitor 40 topics
    optimization_suggestions: 20,         // 20 suggestions per month
    ai_engines: 'all',                    // All major engines, different allocation
    engine_allocation: null               // Will be determined by Perplexity research
  },
  partner: {
    citation_checks_per_month: 400,      // Check 400 times/month
    tracked_topics: 80,                   // Monitor 80 topics
    optimization_suggestions: 40,         // 40 suggestions per month
    ai_engines: 'all',                    // All major engines, different allocation
    engine_allocation: null               // Will be determined by Perplexity research
  }
};

// Step 1: Research AI Engine Usage with Perplexity (Run Once Monthly)
async function researchAIEnginePopularity(): Promise<EngineAllocation> {
  const perplexityQuery = `
    Based on 2024-2026 data, what percentage of users use each AI engine for information search?
    Analyze: ChatGPT, Claude, Gemini, Perplexity, Meta AI (Llama), Grok, Copilot.

    Provide current market share and usage patterns.
    Format as JSON with platform name and usage percentage.
  `;

  const result = await perplexity.search(perplexityQuery);

  // Parse and store allocation percentages
  const allocation = parseEngineAllocation(result);

  // Store for monthly reuse
  await supabase
    .from('gv_ai_engine_allocation')
    .insert({
      allocation_data: allocation,
      researched_at: new Date().toISOString(),
      valid_until: addMonths(new Date(), 1) // Valid for 1 month
    });

  return allocation;
}

interface EngineAllocation {
  chatgpt: number;      // e.g., 45% of checks
  claude: number;       // e.g., 18%
  gemini: number;       // e.g., 15%
  perplexity: number;   // e.g., 12%
  meta_ai: number;      // e.g., 6%
  copilot: number;      // e.g., 3%
  grok: number;         // e.g., 1%
}

// Step 2: Intelligent Citation Detection with Platform Allocation
async function detectCitations(config: GEODetectionConfig) {
  const citations = [];

  // Get current AI engine allocation (from monthly research)
  const engineAllocation = await getCurrentEngineAllocation();

  // Strategy: Use EXISTING enriched crawl data!
  const enrichedCrawls = await supabase
    .from('gv_enriched_crawls')
    .select('*')
    .eq('brand_id', config.brand_id)
    .gte('crawled_at', thirtyDaysAgo())
    .contains('brand_mentions', [{ brand_id: config.brand_id }]);

  // Filter for high-authority sources (potential AI citations)
  const citationSources = enrichedCrawls.filter(crawl => {
    return crawl.quality_scores.authority_score > 70 &&
           crawl.quality_scores.content_quality > 75 &&
           crawl.probabilities.citation_probability > 0.6;
  });

  // Allocate checks intelligently across AI engines
  const checksPerEngine = allocateChecksToEngines(
    config.tier_limits.citation_checks_per_month,
    engineAllocation
  );

  // Check each AI engine based on allocation
  for (const [engine, checkCount] of Object.entries(checksPerEngine)) {
    const sourcesToCheck = citationSources.slice(0, checkCount);

    for (const source of sourcesToCheck) {
      const citationResult = await verifyAICitation(source, config, engine);

      if (citationResult.is_cited) {
        citations.push({
          brand_id: config.brand_id,

          // Source info
          source_url: source.url,
          source_domain: source.domain,
          source_authority: source.quality_scores.authority_score,

          // Citation details
          citation_type: source.brand_mentions[0].citation_type,
          citation_text: source.brand_mentions[0].mention_text,
          citation_context: source.brand_mentions[0].context,

          // AI engine info
          ai_engine: engine,
          mentioned_in_prompts: citationResult.prompt_topics, // NEW!
          citation_frequency: citationResult.frequency,        // NEW!

          // Scores
          ai_visibility_score: calculateAIVisibility(source),
          estimated_monthly_impressions: estimateAIImpressions(source),

          // Status classification (NEW!)
          citation_status: classifyCitationStatus(citationResult),

          detected_at: new Date().toISOString()
        });
      }
    }
  }

  return citations;
}

// Allocate citation checks based on AI engine popularity
function allocateChecksToEngines(
  totalChecks: number,
  allocation: EngineAllocation
): Record<string, number> {
  // Example: Basic tier = 100 checks
  // ChatGPT (45%) = 45 checks
  // Claude (18%) = 18 checks
  // Gemini (15%) = 15 checks
  // Perplexity (12%) = 12 checks
  // Meta AI (6%) = 6 checks
  // Copilot (3%) = 3 checks
  // Grok (1%) = 1 check

  return {
    chatgpt: Math.round(totalChecks * allocation.chatgpt / 100),
    claude: Math.round(totalChecks * allocation.claude / 100),
    gemini: Math.round(totalChecks * allocation.gemini / 100),
    perplexity: Math.round(totalChecks * allocation.perplexity / 100),
    meta_ai: Math.round(totalChecks * allocation.meta_ai / 100),
    copilot: Math.round(totalChecks * allocation.copilot / 100),
    grok: Math.round(totalChecks * allocation.grok / 100)
  };
}

// Enhanced citation verification with prompt topic analysis
interface CitationResult {
  is_cited: boolean;
  prompt_topics: string[];  // What topics/prompts trigger the citation
  frequency: number;        // How often cited (1-100)
  sample_prompts: string[]; // Example prompts that cite this
}

async function verifyAICitation(
  source: any,
  config: GEODetectionConfig,
  aiEngine: string
): Promise<CitationResult> {

  // Use Perplexity to check citation across different query types
  const testPrompts = [
    `What are the best ${config.industry} solutions?`,
    `How to choose ${config.industry} tools?`,
    `${config.brand_name} vs competitors`,
    `Latest trends in ${config.industry}`,
    `${source.primary_topic} guide`
  ];

  const citedInPrompts: string[] = [];
  const promptTopics: string[] = [];

  for (const prompt of testPrompts) {
    const query = `When ${aiEngine} answers "${prompt}", does it cite ${source.domain}?`;

    const result = await perplexity.search(query);

    if (result.answer.includes(source.domain)) {
      citedInPrompts.push(prompt);
      promptTopics.push(extractTopic(prompt));
    }
  }

  const isCited = citedInPrompts.length > 0;
  const frequency = (citedInPrompts.length / testPrompts.length) * 100;

  return {
    is_cited: isCited,
    prompt_topics: [...new Set(promptTopics)],
    frequency: Math.round(frequency),
    sample_prompts: citedInPrompts
  };
}

// Classify citation into 3 categories
function classifyCitationStatus(result: CitationResult): string {
  if (result.frequency >= 70) {
    return 'performing_well';      // Already great!
  } else if (result.frequency >= 30) {
    return 'needs_improvement';    // Has potential, needs optimization
  } else {
    return 'new_opportunity';      // Low citation, big opportunity
  }
}
```

### Why This Approach Works

**✅ No new crawling infrastructure needed**
- Reuse enriched crawl data (already crawling for backlinks!)
- Just add citation detection layer

**✅ Cost-efficient**
- Basic: 50 citation checks/month × $0.001 = $0.05
- Premium: 150 checks × $0.001 = $0.15
- Partner: 300 checks × $0.001 = $0.30

**✅ Actionable insights**
- Know which content is cited by AI
- Identify citation gaps
- Get optimization recommendations

---

## 3. GEO Content Optimization Strategy

### What Makes Content "Citation-Worthy" for AI?

Based on 2024 AI citation patterns:

```typescript
interface CitationWorthyContent {
  // 1. Data-Driven (Most Important!)
  has_statistics: boolean;        // "75% of marketers..."
  has_research_findings: boolean; // "According to study..."
  has_expert_quotes: boolean;     // "John Smith, CEO, says..."

  // 2. Structure (AI loves clear structure)
  has_clear_headings: boolean;    // H2, H3 hierarchy
  has_definitions: boolean;        // "X is defined as..."
  has_how_to_steps: boolean;      // "Step 1, Step 2..."
  has_comparisons: boolean;       // "X vs Y"

  // 3. Authority Signals
  author_expertise: boolean;      // Author credentials
  publication_authority: number;  // Domain Authority > 70
  citation_count: number;         // Cited by others

  // 4. Recency
  published_within_2_years: boolean; // AI prefers recent data

  // 5. Depth
  word_count: number;             // 1500+ words ideal
  topic_coverage: number;         // Comprehensive (1-100)
}

// Score content for citation probability
function scoreCitationProbability(content: CitationWorthyContent): number {
  const weights = {
    has_statistics: 25,           // Highest weight!
    has_research_findings: 20,
    has_expert_quotes: 15,
    has_clear_headings: 10,
    publication_authority: 15,
    recency: 10,
    depth: 5
  };

  let score = 0;

  if (content.has_statistics) score += weights.has_statistics;
  if (content.has_research_findings) score += weights.has_research_findings;
  if (content.has_expert_quotes) score += weights.has_expert_quotes;
  if (content.has_clear_headings) score += weights.has_clear_headings;
  if (content.publication_authority > 70) score += weights.publication_authority;
  if (content.published_within_2_years) score += weights.recency;
  if (content.word_count > 1500) score += weights.depth;

  return Math.min(score, 100);
}
```

### Practical GEO Optimization Checklist

```typescript
interface GEOOptimization {
  content_url: string;
  current_citation_probability: number;
  recommendations: GEORecommendation[];
  estimated_impact: number; // How much probability will improve
}

interface GEORecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  impact: number; // +5%, +10%, etc.
  effort: 'easy' | 'medium' | 'hard';
}

// Generate optimization recommendations
async function generateGEORecommendations(
  contentUrl: string,
  brandId: string
): Promise<GEOOptimization> {

  // 1. Analyze current content
  const content = await analyzeCitationWorthiness(contentUrl);

  const recommendations: GEORecommendation[] = [];

  // 2. Critical: Add statistics (biggest impact!)
  if (!content.has_statistics) {
    recommendations.push({
      priority: 'critical',
      action: 'Add 3-5 statistics with sources',
      reason: 'AI engines heavily favor data-backed content. Statistics increase citation probability by 25%.',
      impact: 25,
      effort: 'medium'
    });
  }

  // 3. High: Add research findings
  if (!content.has_research_findings) {
    recommendations.push({
      priority: 'high',
      action: 'Include research studies or survey data',
      reason: 'Research findings add credibility. Cite 2-3 authoritative studies.',
      impact: 20,
      effort: 'medium'
    });
  }

  // 4. High: Add expert quotes
  if (!content.has_expert_quotes) {
    recommendations.push({
      priority: 'high',
      action: 'Add 2-3 expert quotes with credentials',
      reason: 'Expert attribution increases AI trust. Include job titles and companies.',
      impact: 15,
      effort: 'easy'
    });
  }

  // 5. Medium: Improve structure
  if (!content.has_clear_headings) {
    recommendations.push({
      priority: 'medium',
      action: 'Add clear H2/H3 headings',
      reason: 'AI engines parse structured content better. Use descriptive headings.',
      impact: 10,
      effort: 'easy'
    });
  }

  // 6. Medium: Add definitions
  if (!content.has_definitions) {
    recommendations.push({
      priority: 'medium',
      action: 'Define key terms explicitly',
      reason: 'AI looks for clear definitions. Format: "X is defined as..."',
      impact: 8,
      effort: 'easy'
    });
  }

  // 7. Low: Increase depth (if too short)
  if (content.word_count < 1500) {
    recommendations.push({
      priority: 'low',
      action: `Add ${1500 - content.word_count} more words of depth`,
      reason: 'Comprehensive content (1500+ words) ranks better for AI citations.',
      impact: 5,
      effort: 'hard'
    });
  }

  // Calculate total potential impact
  const totalImpact = recommendations.reduce((sum, r) => sum + r.impact, 0);

  return {
    content_url: contentUrl,
    current_citation_probability: content.citation_probability,
    recommendations: recommendations.sort((a, b) => b.impact - a.impact),
    estimated_impact: Math.min(
      content.citation_probability + totalImpact,
      95 // Max 95% probability
    )
  };
}
```

---

## 4. GEO Dashboard Implementation

### Key Metrics to Display

```typescript
interface GEODashboardData {
  // Overview metrics
  metrics: {
    total_citations: number;           // How many times cited
    ai_visibility_score: number;       // 1-100 overall score
    predicted_monthly_impressions: number;
    trending_citations: number;        // Citations gained this week
  };

  // AI Engine Breakdown (NEW!)
  engine_breakdown: {
    chatgpt: {
      citations: number;
      percentage: number;  // % of total checks
      top_prompts: string[];  // What prompts trigger citations
    };
    claude: { citations: number; percentage: number; top_prompts: string[] };
    gemini: { citations: number; percentage: number; top_prompts: string[] };
    perplexity: { citations: number; percentage: number; top_prompts: string[] };
    meta_ai: { citations: number; percentage: number; top_prompts: string[] };
    copilot: { citations: number; percentage: number; top_prompts: string[] };
    grok: { citations: number; percentage: number; top_prompts: string[] };
  };

  // Citation Status Breakdown (NEW!)
  citation_status: {
    performing_well: {
      count: number;
      content: CitationContent[];
      avg_frequency: number;  // 70-100%
    };
    needs_improvement: {
      count: number;
      content: CitationContent[];
      avg_frequency: number;  // 30-69%
    };
    new_opportunity: {
      count: number;
      content: CitationContent[];
      avg_frequency: number;  // 0-29%
    };
  };

  // Top cited content
  top_cited_content: {
    id: string;
    title: string;
    url: string;
    citation_count: number;
    citation_frequency: number;  // NEW: 1-100%
    cited_by_engines: string[];  // NEW: ['chatgpt', 'claude', ...]
    mentioned_in_prompts: string[];  // NEW: Topic categories
    sample_prompts: string[];    // NEW: Example prompts
    ai_visibility_score: number;
    estimated_monthly_impressions: number;
    strategic_value: 'high' | 'medium' | 'low';
    status: 'performing_well' | 'needs_improvement' | 'new_opportunity'; // NEW!
  }[];

  // Citation opportunities (content to optimize)
  citation_opportunities: {
    id: string;
    title: string;
    url: string;
    current_citation_probability: number;
    current_citation_frequency: number;  // NEW: How often currently cited
    potential_citation_frequency: number; // NEW: After optimization
    recommendations: GEORecommendation[];
    priority: number; // 1-100
    status: 'needs_improvement' | 'new_opportunity'; // Only these 2
  }[];

  // Prompt Topic Analysis (NEW!)
  prompt_topics: {
    topic: string;
    citation_count: number;
    top_cited_content: string[];  // URLs
    opportunity_score: number;     // 1-100
  }[];
}

interface CitationContent {
  url: string;
  title: string;
  frequency: number;
  engines: string[];
}
```

### Practical Dashboard Sections

**1. Citation Performance Overview**
```
📊 AI Citation Tracking (Last 30 Days)

┌──────────────────────────────────────┐
│ Total Citations: 47                  │
│ AI Visibility Score: 78/100          │
│ Est. AI Impressions: 12,400/month    │
│ Trending: +5 citations this week ↑   │
└──────────────────────────────────────┘

🤖 AI Engine Breakdown
┌────────────────────────────────────────────────────┐
│ ChatGPT      ████████████████░░░░  45% (21 cites) │
│ Claude       ███████░░░░░░░░░░░░░  18% (8 cites)  │
│ Gemini       ██████░░░░░░░░░░░░░░  15% (7 cites)  │
│ Perplexity   █████░░░░░░░░░░░░░░░  12% (6 cites)  │
│ Meta AI      ███░░░░░░░░░░░░░░░░░   6% (3 cites)  │
│ Copilot      █░░░░░░░░░░░░░░░░░░░   3% (1 cite)   │
│ Grok         ░░░░░░░░░░░░░░░░░░░░   1% (1 cite)   │
└────────────────────────────────────────────────────┘
```

**2. Citation Status Breakdown (NEW!)**
```
📊 Performance by Category

┌─────────────────────────────────────────────────────┐
│ ✅ PERFORMING WELL (12 content pieces)              │
│ Avg Citation Frequency: 82%                         │
├─────────────────────────────────────────────────────┤
│ These are already being cited frequently by AI.     │
│ Keep them updated and monitor performance.          │
│                                                     │
│ Top Performers:                                     │
│ • "SEO Guide 2024" - 94% frequency                 │
│   Cited in: "best seo practices", "seo tips"       │
│   Engines: ChatGPT, Claude, Gemini                 │
│                                                     │
│ • "Analytics Tutorial" - 87% frequency             │
│   Cited in: "analytics tools", "data analysis"     │
│   Engines: ChatGPT, Perplexity                     │
│                                                     │
│ [View All 12] [Monitor Trends]                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ⚠️ NEEDS IMPROVEMENT (8 content pieces)             │
│ Avg Citation Frequency: 52%                         │
├─────────────────────────────────────────────────────┤
│ These have potential but need optimization.         │
│ Priority: Optimize these for quick wins.            │
│                                                     │
│ Top Opportunity:                                    │
│ • "Product Guide" - 58% frequency                  │
│   Currently cited in: "product comparisons"        │
│   Missing from: "best tools", "how to choose"      │
│                                                     │
│   Quick Wins:                                       │
│   ✓ Add comparison table [+15% frequency]         │
│   ✓ Add statistics [+12% frequency]               │
│   ✓ Add expert quotes [+8% frequency]             │
│                                                     │
│   Potential: 58% → 93% frequency                   │
│                                                     │
│ [View All 8] [Start Optimizing]                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 💡 NEW OPPORTUNITIES (5 content pieces)             │
│ Avg Citation Frequency: 18%                         │
├─────────────────────────────────────────────────────┤
│ These have low citation but HIGH potential.         │
│ Priority: Focus optimization efforts here.          │
│                                                     │
│ Biggest Opportunity:                                │
│ • "Marketing Trends 2024" - 22% frequency          │
│   Rarely cited, but topic is trending!             │
│   Competitors cited 45% more often                 │
│                                                     │
│   What's Missing:                                   │
│   ❌ No statistics or data                         │
│   ❌ No expert quotes                              │
│   ❌ Poor structure (weak headings)                │
│   ❌ Content too shallow (only 800 words)          │
│                                                     │
│   If Optimized:                                     │
│   Potential: 22% → 75% frequency (+341%)           │
│   Est. Impact: +2,400 AI impressions/month         │
│                                                     │
│ [View All 5] [Create Optimization Plan]            │
└─────────────────────────────────────────────────────┘
```

**3. Prompt Topic Analysis (NEW!)**
```
🎯 What Topics Trigger Your Citations?

┌─────────────────────────────────────────────────────┐
│ Top Performing Topics:                              │
│                                                     │
│ 1. "SEO best practices" - 18 citations             │
│    Your content cited: "SEO Guide 2024"            │
│    Engines: ChatGPT (8x), Claude (5x), Gemini (5x) │
│    Sample prompts:                                  │
│    • "What are the best SEO practices in 2024?"    │
│    • "How to improve SEO rankings?"                │
│    [Maintain Performance]                           │
│                                                     │
│ 2. "Analytics tools comparison" - 12 citations     │
│    Your content cited: "Analytics Tutorial"        │
│    Engines: ChatGPT (6x), Perplexity (4x)          │
│    Sample prompts:                                  │
│    • "Best analytics tools for marketing?"         │
│    • "Compare analytics platforms"                 │
│    [Maintain Performance]                           │
├─────────────────────────────────────────────────────┤
│ Opportunity Topics (Not Yet Cited):                │
│                                                     │
│ 🔥 "AI-powered marketing" - 0 citations            │
│    Competitors cited: 12x                          │
│    Opportunity Score: 95/100                       │
│    Action: Create comprehensive guide with data    │
│    [Create Content Brief]                           │
│                                                     │
│ 🔥 "Marketing automation ROI" - 2 citations        │
│    Low frequency, high search volume               │
│    Opportunity Score: 88/100                       │
│    Action: Add statistics + case studies           │
│    [Optimize Existing Content]                      │
└─────────────────────────────────────────────────────┘
```

**4. Top Cited Content (Detailed View)**
```
🏆 Your Most Cited Content

┌─────────────────────────────────────────────────────┐
│ 1. "Ultimate Guide to SEO" - 94% citation frequency│
│                                                     │
│ Status: ✅ PERFORMING WELL                          │
│                                                     │
│ Citation Details:                                   │
│ • Total Citations: 12                              │
│ • Cited by Engines: ChatGPT (7), Claude (3), Gem(2)│
│ • AI Visibility: 92/100                            │
│ • Est. Impressions: 3,200/month                    │
│                                                     │
│ Mentioned in These Prompts:                         │
│ • "What are SEO best practices?" (ChatGPT, Claude) │
│ • "How to improve SEO rankings?" (ChatGPT, Gemini) │
│ • "SEO guide for beginners" (Claude)               │
│ • "Latest SEO trends 2024" (ChatGPT)               │
│                                                     │
│ Why It Performs Well:                              │
│ ✓ Comprehensive (3,500 words)                      │
│ ✓ Data-rich (15 statistics cited)                  │
│ ✓ Expert quotes (5 industry experts)               │
│ ✓ Clear structure (H2/H3 hierarchy)                │
│ ✓ Recently updated (Jan 2024)                      │
│                                                     │
│ [Monitor Performance] [View Citation Sources]      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 2. "Product Guide" - 58% citation frequency        │
│                                                     │
│ Status: ⚠️ NEEDS IMPROVEMENT                        │
│                                                     │
│ Citation Details:                                   │
│ • Total Citations: 6                               │
│ • Cited by Engines: ChatGPT (4), Perplexity (2)    │
│ • AI Visibility: 68/100                            │
│ • Est. Impressions: 1,400/month                    │
│                                                     │
│ Currently Mentioned in:                             │
│ • "Product comparisons" (ChatGPT)                  │
│ • "Feature comparison" (ChatGPT)                   │
│                                                     │
│ NOT Mentioned in (Opportunity!):                   │
│ ❌ "Best marketing tools" (competitors cited)      │
│ ❌ "How to choose analytics platform"              │
│ ❌ "Top-rated marketing software"                  │
│                                                     │
│ Optimization Plan (Potential: 58% → 93%):          │
│ 1. Add comparison table [+15% frequency]          │
│ 2. Add 5 statistics with sources [+12%]           │
│ 3. Add 3 expert testimonials [+8%]                │
│ 4. Improve heading structure [+5%]                │
│ 5. Increase depth to 2000+ words [+5%]            │
│                                                     │
│ Estimated Impact: +1,200 impressions/month         │
│                                                     │
│ [Start Optimization] [Create Content Brief]        │
└─────────────────────────────────────────────────────┘
```

---

## 5. GEO Practical Workflow

### Monthly GEO Process (Automated)

```typescript
// /supabase/functions/monthly-geo-optimization/index.ts

async function monthlyGEOProcess(brandId: string) {

  // Week 1: Citation Detection
  console.log('🔍 Week 1: Detecting AI citations...');
  const citations = await detectCitations(brandId);
  await storeCitations(brandId, citations);

  // Week 2: Analyze Top Performers
  console.log('📊 Week 2: Analyzing what gets cited...');
  const topCited = await analyzeTopCitedContent(brandId);
  const patterns = extractCitationPatterns(topCited);
  // Learn: What makes content citation-worthy?

  // Week 3: Identify Opportunities
  console.log('💡 Week 3: Finding optimization opportunities...');
  const allContent = await getBrandContent(brandId);
  const opportunities = await identifyGEOOpportunities(allContent, patterns);

  // Week 4: Generate Recommendations
  console.log('✨ Week 4: Creating action plan...');
  for (const opp of opportunities.slice(0, 10)) {
    const recommendations = await generateGEORecommendations(opp.url, brandId);
    await storeGEORecommendations(brandId, recommendations);

    // Auto-sync to Content Studio
    await createContentBriefForGEO(brandId, recommendations);
  }

  // Send summary to user
  await sendGEOMonthlyReport(brandId, {
    citations_found: citations.length,
    opportunities_identified: opportunities.length,
    estimated_impact: calculatePotentialImpact(opportunities)
  });
}
```

### User Workflow (Simple!)

**For Users:**

1. **View Dashboard** → See citation performance
2. **Review Opportunities** → Top 5-10 content pieces to optimize
3. **Follow Recommendations** → Clear checklist (add stats, add quotes, etc.)
4. **Track Results** → See citation probability increase

**Example User Experience:**
```
User logs in Monday morning:

📧 GEO Weekly Summary
"You have 3 quick wins this week!"

1. Add statistics to "Product Guide" (+25% citation probability)
   Time: 1 hour | Impact: High
   [Start Now]

2. Add expert quotes to "Analytics Tutorial" (+15%)
   Time: 30 min | Impact: Medium
   [Start Now]

User clicks [Start Now]:
→ Opens Content Studio with pre-filled brief
→ Shows exactly what to add (templates provided)
→ Tracks progress
```

---

## 6. Recommended GEO Configuration

### Tier-Based GEO Limits (Updated)

```typescript
const GEO_CONFIGURATION = {
  basic: {
    // Detection
    citation_checks_per_month: 100,
    tracked_topics: 20,
    ai_engines: 'all', // All 7 engines, intelligent allocation

    // Engine allocation (based on monthly Perplexity research)
    // Example allocation (will be updated monthly):
    engine_allocation: {
      chatgpt: 45,      // 45 checks
      claude: 18,       // 18 checks
      gemini: 15,       // 15 checks
      perplexity: 12,   // 12 checks
      meta_ai: 6,       // 6 checks
      copilot: 3,       // 3 checks
      grok: 1           // 1 check
      // Total: 100 checks
    },

    // Optimization
    optimization_suggestions: 10,  // Top 10 opportunities per month
    auto_briefs: 5,                 // Create 5 content briefs/month

    // Cost
    monthly_cost: 0.20,  // $0.002 per check × 100
    perplexity_research: 0.05  // Monthly engine allocation research
  },

  premium: {
    // Detection
    citation_checks_per_month: 200,
    tracked_topics: 40,
    ai_engines: 'all', // All 7 engines, intelligent allocation

    // Engine allocation (proportional to usage)
    engine_allocation: {
      chatgpt: 90,      // 45% of 200
      claude: 36,       // 18% of 200
      gemini: 30,       // 15% of 200
      perplexity: 24,   // 12% of 200
      meta_ai: 12,      // 6% of 200
      copilot: 6,       // 3% of 200
      grok: 2           // 1% of 200
      // Total: 200 checks
    },

    // Optimization
    optimization_suggestions: 20,  // Top 20 opportunities per month
    auto_briefs: 10,                // Create 10 content briefs/month

    // Cost
    monthly_cost: 0.40,  // $0.002 per check × 200
    perplexity_research: 0.05  // Monthly engine allocation research (shared)
  },

  partner: {
    // Detection
    citation_checks_per_month: 400,
    tracked_topics: 80,
    ai_engines: 'all', // All 7 engines, intelligent allocation

    // Engine allocation
    engine_allocation: {
      chatgpt: 180,     // 45% of 400
      claude: 72,       // 18% of 400
      gemini: 60,       // 15% of 400
      perplexity: 48,   // 12% of 400
      meta_ai: 24,      // 6% of 400
      copilot: 12,      // 3% of 400
      grok: 4           // 1% of 400
      // Total: 400 checks
    },

    // Optimization
    optimization_suggestions: 40,  // Top 40 opportunities per month
    auto_briefs: 20,                // Create 20 content briefs/month

    // Cost
    monthly_cost: 0.80,  // $0.002 per check × 400
    perplexity_research: 0.05  // Monthly engine allocation research (shared)
  }
};

// Monthly research updates allocation percentages automatically
async function updateEngineAllocation() {
  // Runs once per month for ALL tiers
  // Cost: $0.05 (shared across all brands)

  const currentAllocation = await researchAIEnginePopularity();

  // Update all tier allocations based on new data
  for (const tier of ['basic', 'premium', 'partner']) {
    const config = GEO_CONFIGURATION[tier];
    const totalChecks = config.citation_checks_per_month;

    config.engine_allocation = {
      chatgpt: Math.round(totalChecks * currentAllocation.chatgpt / 100),
      claude: Math.round(totalChecks * currentAllocation.claude / 100),
      gemini: Math.round(totalChecks * currentAllocation.gemini / 100),
      perplexity: Math.round(totalChecks * currentAllocation.perplexity / 100),
      meta_ai: Math.round(totalChecks * currentAllocation.meta_ai / 100),
      copilot: Math.round(totalChecks * currentAllocation.copilot / 100),
      grok: Math.round(totalChecks * currentAllocation.grok / 100)
    };
  }

  console.log('✅ Engine allocation updated for all tiers');
}
```

### Total Monthly Costs

```typescript
const TOTAL_GEO_COSTS = {
  basic: {
    citation_checks: 0.20,        // 100 checks × $0.002
    perplexity_research: 0.05,    // Monthly allocation research
    total: 0.25                    // per brand
  },

  premium: {
    citation_checks: 0.40,        // 200 checks × $0.002
    perplexity_research: 0.05,    // Monthly allocation research
    total: 0.45                    // per brand
  },

  partner: {
    citation_checks: 0.80,        // 400 checks × $0.002
    perplexity_research: 0.05,    // Monthly allocation research
    total: 0.85                    // per brand
  }
};
```

---

## 7. Key Recommendations (TL;DR)

### ✅ DO:

1. **Reuse SEO infrastructure** - Don't build separate GEO tracking
2. **Focus on citation probability** - Not just detection
3. **Provide actionable recommendations** - "Add 3 stats" not "improve content"
4. **Prioritize by impact** - Show top 5-10 opportunities
5. **Auto-create Content Studio briefs** - Make it easy to act

### ❌ DON'T:

1. **Don't build separate crawler** - Use enriched crawl data
2. **Don't track every mention** - Focus on high-authority citations
3. **Don't over-complicate** - Keep it simple and actionable
4. **Don't check AI engines directly** - Use Perplexity as proxy (cheaper)
5. **Don't track 100+ topics** - Quality > quantity

### Best Practice Formula:

```
GEO Success = (High-Authority Citations × Citation Probability) + Actionable Recommendations

Focus on:
1. Find content with citation probability 40-70% (improvable!)
2. Show exactly what to add (stats, quotes, structure)
3. Track improvement over time
4. Keep it simple and actionable
```

---

## 8. Implementation Timeline

### Phase 1: MVP (Week 1-2)
✅ Citation detection using enriched crawl data
✅ Basic dashboard (citations count, top cited content)
✅ Simple optimization checklist

### Phase 2: Optimization (Week 3-4)
✅ Citation probability scoring
✅ Automated recommendations
✅ Content Studio integration

### Phase 3: Intelligence (Week 5-6)
✅ Pattern learning (what gets cited?)
✅ Competitive gap analysis
✅ Monthly GEO reports

---

## Summary

**Recommended GEO Strategy:**

1. **Leverage existing data** - Reuse SEO keywords + enriched crawls
2. **Focus on probability** - Identify content with 40-70% citation probability (improvable)
3. **Actionable recommendations** - Tell users exactly what to add
4. **Keep it lightweight** - $0.15-0.50/month incremental cost
5. **Auto-sync to Content Studio** - Make optimization easy

**Numbers to Use:**
- Basic: 10 tracked topics, 5 optimization suggestions
- Premium: 25 topics, 15 suggestions
- Partner: 50 topics, 30 suggestions

**Key Metrics:**
- Total citations
- AI visibility score (1-100)
- Citation probability per content
- Estimated monthly AI impressions

**This approach is practical, cost-efficient, and provides actionable value without building complex infrastructure!** 🚀
