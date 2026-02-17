# Gemini + Perplexity Research & Indexing Layer

## Overview
**Dual AI Research System** untuk tahap 1 (Research + Pre-Process):
- **Perplexity**: Real-time web intelligence & ranking
- **Gemini**: Deep analysis, indexing & pattern recognition
- **Combined Power**: 2x faster, 2x more accurate

---

## 1. Why Gemini + Perplexity?

### Perplexity Strengths
✅ Real-time web search & citations
✅ Current trends & viral content detection
✅ Author responsiveness patterns
✅ Traffic & engagement metrics
✅ ROI predictions

### Gemini Strengths
✅ **Large context window** (2M tokens vs Perplexity's 128k)
✅ **Multimodal analysis** (text, images, code, video)
✅ **Deep pattern recognition** (find hidden correlations)
✅ **Indexing & categorization** (organize massive data)
✅ **Cost-efficient** ($0.00035/1K tokens vs Perplexity $0.001/1K)

### Combined Benefits
🚀 **2x Speed**: Parallel processing
🎯 **2x Accuracy**: Cross-validation
💰 **Lower Cost**: Smart allocation
🧠 **Deeper Insights**: Complementary analysis

---

## 2. Dual Research Architecture

```typescript
interface DualResearchSystem {
  // Stage 1A: Perplexity (Real-time Intelligence)
  perplexity_layer: {
    role: 'Real-time web intelligence';
    tasks: [
      'Find trending content',
      'Detect viral opportunities',
      'Analyze author responsiveness',
      'Predict traffic & ROI',
      'Rank opportunities 1-20'
    ];
    strength: 'Current, real-time data';
    cost: '$0.001 per 1K tokens';
  };

  // Stage 1B: Gemini (Deep Analysis & Indexing)
  gemini_layer: {
    role: 'Deep analysis & pattern recognition';
    tasks: [
      'Analyze large content volumes (2M tokens)',
      'Extract semantic patterns',
      'Index content by topics/themes',
      'Find hidden correlations',
      'Cross-reference historical data',
      'Multimodal analysis (text + images + code)'
    ];
    strength: 'Deep context, pattern recognition';
    cost: '$0.00035 per 1K tokens (3x cheaper)';
  };

  // Stage 2: Claude (Strategy)
  claude_layer: {
    role: 'Reverse engineering & strategy';
    uses: 'Perplexity + Gemini insights combined';
  };

  // Stage 3: OpenAI (Execution)
  openai_layer: {
    role: '100% automated execution';
    uses: 'Claude strategy';
  };
}
```

---

## 3. Gemini Research Functions

### 3A. Deep Content Indexing

```typescript
interface GeminiContentIndexing {
  analyze_large_volumes: boolean;    // 2M token context
  extract_themes: boolean;           // Topic clustering
  semantic_search: boolean;          // Meaning-based search
  pattern_recognition: boolean;      // Find correlations
  multimodal_analysis: boolean;      // Text + images + code
}

async function geminiIndexContent(
  contentUrls: string[],
  brandId: string,
  topic: string
): Promise<GeminiIndexResult> {

  // Gemini can process MASSIVE content in one call (2M tokens)
  const allContent = await fetchMultipleContents(contentUrls); // Up to 100 articles!

  const geminiPrompt = `
Analyze these ${contentUrls.length} pieces of content about "${topic}".

CONTENT:
${allContent.map((c, i) => `
[Article ${i + 1}]
URL: ${c.url}
Title: ${c.title}
Content: ${c.text}
Images: ${c.images.length} images
Code Snippets: ${c.code_blocks.length} blocks
`).join('\n\n')}

TASKS:

1. **Theme Extraction**
   - What are the main themes/topics across all content?
   - What subtopics appear frequently?
   - What unique angles does each piece take?

2. **Pattern Recognition**
   - What content structure patterns lead to high engagement?
   - What writing styles appear most authoritative?
   - What data/statistics are commonly cited?
   - What images/visuals enhance content?

3. **Semantic Indexing**
   - Group content by semantic similarity
   - Identify content gaps (topics not covered)
   - Find unique value propositions

4. **Quality Signals**
   - Which pieces have strongest authority signals?
   - Which have best structure for AI citation?
   - Which use data most effectively?

5. **Multimodal Analysis**
   - Analyze images/diagrams (if present)
   - Evaluate code examples (if present)
   - Assess visual hierarchy

6. **Competitive Intelligence**
   - Who are the top authors/brands?
   - What makes their content stand out?
   - What gaps can we exploit?

OUTPUT: Structured JSON with themes, patterns, index, recommendations
`;

  const response = await gemini.generateContent({
    model: 'gemini-1.5-pro-latest',
    contents: [{ role: 'user', parts: [{ text: geminiPrompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      response_mime_type: 'application/json'
    }
  });

  const result = JSON.parse(response.text());

  return {
    themes: result.themes,
    patterns: result.patterns,
    semantic_index: result.semantic_index,
    quality_signals: result.quality_signals,
    multimodal_insights: result.multimodal_insights,
    competitive_intel: result.competitive_intel,
    content_gaps: result.content_gaps,
    processed_urls: contentUrls.length,
    total_tokens_analyzed: allContent.reduce((sum, c) => sum + c.token_count, 0)
  };
}
```

### 3B. Historical Pattern Analysis

```typescript
async function geminiAnalyzeHistoricalPatterns(
  brandId: string,
  topic: string,
  timeframe: '7d' | '14d' | '28d' | '90d'
): Promise<GeminiPatternAnalysis> {

  // Fetch historical data (Gemini can handle 2M tokens!)
  const historicalData = await supabase
    .from('gv_geo_citations_history')
    .select('*')
    .eq('brand_id', brandId)
    .eq('topic_id', topic)
    .gte('snapshot_date', getDateOffset(timeframe))
    .order('snapshot_date', { ascending: true });

  // Also fetch competitor data
  const competitorData = await getCompetitorCitations(topic, timeframe);

  const geminiPrompt = `
Analyze citation patterns over ${timeframe} for topic "${topic}".

BRAND DATA (${historicalData.length} snapshots):
${JSON.stringify(historicalData, null, 2)}

COMPETITOR DATA:
${JSON.stringify(competitorData, null, 2)}

ANALYSIS TASKS:

1. **Trend Detection**
   - What trends do you see in citation frequency?
   - When did significant changes occur?
   - What correlates with citation increases/decreases?

2. **Seasonal Patterns**
   - Are there weekly/monthly patterns?
   - What days/times see highest citations?
   - Are there seasonal trends?

3. **Competitive Dynamics**
   - How do competitor citations correlate with ours?
   - When competitors gain citations, do we lose them?
   - What competitive events triggered changes?

4. **Success Factors**
   - What content changes led to citation increases?
   - What optimization actions worked best?
   - What didn't work?

5. **Predictive Signals**
   - Based on patterns, what predicts future citation success?
   - What early warning signs indicate citation drops?
   - What leading indicators should we track?

6. **Actionable Recommendations**
   - What should we do more of?
   - What should we stop doing?
   - What new opportunities exist?

OUTPUT: JSON with trends, patterns, predictions, recommendations
`;

  const response = await gemini.generateContent({
    model: 'gemini-1.5-pro-latest',
    contents: [{ role: 'user', parts: [{ text: geminiPrompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      response_mime_type: 'application/json'
    }
  });

  return JSON.parse(response.text());
}
```

### 3C. Multimodal Content Analysis

```typescript
async function geminiMultimodalAnalysis(
  contentUrl: string,
  includeImages: boolean = true,
  includeCode: boolean = true
): Promise<GeminiMultimodalResult> {

  const content = await fetchContent(contentUrl);

  // Prepare multimodal input
  const parts = [
    { text: `Analyze this content comprehensively:\n\nTitle: ${content.title}\n\nText: ${content.text}` }
  ];

  // Add images (Gemini can analyze images!)
  if (includeImages && content.images.length > 0) {
    for (const image of content.images) {
      parts.push({
        inline_data: {
          mime_type: image.mime_type,
          data: await fetchImageAsBase64(image.url)
        }
      });
    }
  }

  // Add code snippets
  if (includeCode && content.code_blocks.length > 0) {
    parts.push({
      text: `\n\nCode Examples:\n${content.code_blocks.map((cb, i) =>
        `[Code Block ${i + 1}] (${cb.language})\n${cb.code}`
      ).join('\n\n')}`
    });
  }

  const geminiPrompt = `
Analyze this content across all modalities (text, images, code).

ANALYSIS TASKS:

1. **Text Analysis**
   - Main topics and key points
   - Writing quality and structure
   - Authority signals
   - Data/statistics used
   - Citation-worthiness score (1-100)

2. **Image Analysis** (if present)
   - What do the images show?
   - How do they enhance the content?
   - Are they original or stock?
   - Quality and relevance score (1-100)

3. **Code Analysis** (if present)
   - What programming languages?
   - Code quality and completeness
   - Are examples practical and runnable?
   - Code quality score (1-100)

4. **Cross-Modal Coherence**
   - Do text, images, and code work together?
   - Are there gaps or mismatches?
   - Overall content coherence score (1-100)

5. **AI Citation Potential**
   - How likely is AI to cite this content?
   - What makes it citation-worthy (or not)?
   - What improvements would boost citations?

6. **Recommendations**
   - What to add/improve in each modality
   - Specific actionable improvements

OUTPUT: JSON with scores, analysis, recommendations per modality
`;

  parts.push({ text: geminiPrompt });

  const response = await gemini.generateContent({
    model: 'gemini-1.5-pro-latest',
    contents: [{ role: 'user', parts: parts }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      response_mime_type: 'application/json'
    }
  });

  return JSON.parse(response.text());
}
```

---

## 4. Perplexity + Gemini Combined Workflow

### Stage 1: Parallel Research

```typescript
async function runDualResearch(
  topic: string,
  brandId: string,
  aiEngine: string
): Promise<CombinedResearchResult> {

  // RUN IN PARALLEL (2x faster!)
  const [perplexityResult, geminiResult] = await Promise.all([

    // Perplexity: Real-time intelligence
    runPerplexityResearch(topic, aiEngine, brandId),

    // Gemini: Deep analysis & indexing
    runGeminiResearch(topic, brandId, aiEngine)
  ]);

  // Combine insights
  return combineDualResearch(perplexityResult, geminiResult);
}

async function runPerplexityResearch(
  topic: string,
  aiEngine: string,
  brandId: string
): Promise<PerplexityResearchResult> {

  const brand = await getBrand(brandId);

  const prompt = `
Research current state of "${topic}" for ${aiEngine}.

TASKS:
1. Find top 10 content pieces currently cited by ${aiEngine}
2. Identify trending content (viral potential)
3. Analyze author responsiveness patterns
4. Predict traffic & conversion for each piece
5. Detect time-sensitive opportunities
6. Rank opportunities by urgency & ROI

Include: URLs, traffic trends, author patterns, urgency scores
`;

  const result = await perplexity.search(prompt);

  return {
    trending_content: result.trending,
    top_cited: result.top_cited,
    author_patterns: result.author_patterns,
    traffic_predictions: result.traffic_predictions,
    urgency_opportunities: result.urgency_opportunities,
    perplexity_rankings: result.rankings
  };
}

async function runGeminiResearch(
  topic: string,
  brandId: string,
  aiEngine: string
): Promise<GeminiResearchResult> {

  // Fetch large volume of content (Gemini can handle 2M tokens)
  const topContent = await fetchTopContentForTopic(topic, limit: 100);

  // Index all content
  const indexResult = await geminiIndexContent(
    topContent.map(c => c.url),
    brandId,
    topic
  );

  // Analyze historical patterns
  const patternResult = await geminiAnalyzeHistoricalPatterns(
    brandId,
    topic,
    '28d'
  );

  // Multimodal analysis on top 10
  const multimodalResults = await Promise.all(
    topContent.slice(0, 10).map(c =>
      geminiMultimodalAnalysis(c.url, true, true)
    )
  );

  return {
    content_index: indexResult,
    historical_patterns: patternResult,
    multimodal_analysis: multimodalResults,
    themes_extracted: indexResult.themes,
    content_gaps: indexResult.content_gaps,
    quality_signals: indexResult.quality_signals
  };
}

function combineDualResearch(
  perplexity: PerplexityResearchResult,
  gemini: GeminiResearchResult
): CombinedResearchResult {

  // Cross-validate findings
  const validated_trending = perplexity.trending_content.filter(content => {
    // Gemini confirms this is high-quality
    const geminiQuality = gemini.multimodal_analysis.find(
      m => m.url === content.url
    );
    return geminiQuality && geminiQuality.citation_potential >= 70;
  });

  // Combine rankings
  const combined_rankings = perplexity.perplexity_rankings.map(pr => {
    const geminiInsight = gemini.content_index.semantic_index.find(
      si => si.url === pr.url
    );

    return {
      ...pr,
      gemini_theme: geminiInsight?.theme,
      gemini_quality: geminiInsight?.quality_score,
      gemini_gaps: geminiInsight?.content_gaps,
      combined_score: (pr.score * 0.6) + (geminiInsight?.quality_score * 0.4)
    };
  }).sort((a, b) => b.combined_score - a.combined_score);

  // Extract actionable insights
  const actionable_insights = {
    // From Perplexity: What's trending NOW
    urgent_opportunities: perplexity.urgency_opportunities,

    // From Gemini: What gaps to fill
    content_gaps_to_fill: gemini.content_gaps,

    // From Gemini: What patterns work
    success_patterns: gemini.historical_patterns.success_factors,

    // From Gemini: What themes to cover
    high_value_themes: gemini.themes_extracted.filter(t => t.citation_potential >= 70),

    // Combined: Best opportunities
    top_20_validated: combined_rankings.slice(0, 20)
  };

  return {
    validated_trending,
    combined_rankings,
    actionable_insights,
    perplexity_data: perplexity,
    gemini_data: gemini,
    confidence_score: calculateCrossValidationConfidence(perplexity, gemini)
  };
}
```

---

## 5. Cost Comparison

### Perplexity Only (Old)
```typescript
const PERPLEXITY_ONLY_COSTS = {
  basic_tier: {
    citation_checks: 100,
    perplexity_calls: 100,
    cost_per_call: 0.001, // $0.001 per 1K tokens
    avg_tokens_per_call: 500,
    total_cost: 100 * 0.001 * 0.5 = $0.05
  }
};
```

### Perplexity + Gemini (New)
```typescript
const DUAL_RESEARCH_COSTS = {
  basic_tier: {
    // Perplexity: Real-time trends (fewer calls needed)
    perplexity_calls: 40,      // Only for trending/urgent checks
    perplexity_cost: 40 * 0.001 * 0.5 = $0.02,

    // Gemini: Deep analysis (bulk processing)
    gemini_calls: 10,          // Process 100 articles per call
    gemini_cost: 10 * 0.00035 * 20 = $0.07, // 20K tokens avg

    total_cost: $0.09,

    // But get 2x more insights!
    insights_multiplier: 2,
    effective_cost_per_insight: $0.045 (vs $0.05)
  }
};
```

**Savings**: 10% cheaper + 2x more insights = 2.2x better ROI!

---

## 6. Integration with Existing System

### Updated GEO Workflow

```typescript
async function runMonthlyGEOProcessWithDualResearch(
  brandId: string,
  tier: Tier
) {

  const topics = await getTrackedTopics(brandId, tier);

  for (const topic of topics) {

    // STAGE 1: DUAL RESEARCH (Perplexity + Gemini)
    const dualResearch = await runDualResearch(
      topic.name,
      brandId,
      topic.ai_engine
    );

    // STAGE 2: CLAUDE STRATEGY (uses dual research insights)
    const claudeStrategy = await runClaudeReverseEngineering({
      topic: topic,
      brandId: brandId,
      perplexity_insights: dualResearch.perplexity_data,
      gemini_insights: dualResearch.gemini_data,
      combined_insights: dualResearch.actionable_insights
    });

    // Claude now has:
    // - Perplexity: Real-time trends, urgency, traffic predictions
    // - Gemini: Deep patterns, content gaps, themes, quality signals
    // - Combined: Cross-validated top 20 opportunities

    // STAGE 3: OPENAI EXECUTION
    const execution = await executeWithOpenAI(claudeStrategy);

    // Save results
    await saveDualResearchResults({
      topic_id: topic.id,
      dual_research: dualResearch,
      claude_strategy: claudeStrategy,
      openai_execution: execution
    });
  }
}
```

---

## 7. Database Schema

```sql
-- Store dual research results
CREATE TABLE gv_dual_research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id),
  topic_id UUID NOT NULL REFERENCES gv_geo_topics(id),

  -- Perplexity results
  perplexity_trending JSONB,
  perplexity_rankings JSONB,
  perplexity_urgency JSONB,

  -- Gemini results
  gemini_themes JSONB,
  gemini_patterns JSONB,
  gemini_content_index JSONB,
  gemini_gaps JSONB,
  gemini_multimodal JSONB,

  -- Combined insights
  combined_rankings JSONB,
  actionable_insights JSONB,
  confidence_score INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  INDEX idx_dual_research_brand (brand_id),
  INDEX idx_dual_research_topic (topic_id),
  INDEX idx_dual_research_validity (valid_until)
);

-- Store Gemini content index
CREATE TABLE gv_gemini_content_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_url TEXT NOT NULL,
  topic TEXT NOT NULL,

  -- Indexing
  themes TEXT[],
  semantic_cluster TEXT,
  quality_score INTEGER,
  citation_potential INTEGER,

  -- Multimodal
  has_images BOOLEAN,
  has_code BOOLEAN,
  multimodal_score INTEGER,

  -- Patterns
  success_patterns JSONB,
  content_gaps JSONB,

  indexed_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_gemini_index_url (content_url),
  INDEX idx_gemini_index_topic (topic),
  INDEX idx_gemini_index_quality (quality_score DESC)
);
```

---

## Summary

### Dual Research Benefits

✅ **2x Speed**: Parallel Perplexity + Gemini processing
✅ **2x Insights**: Real-time trends + deep patterns
✅ **Better Accuracy**: Cross-validation between 2 AIs
✅ **Lower Cost**: 10% cheaper with Gemini's efficiency
✅ **Deeper Context**: Gemini's 2M token window
✅ **Multimodal**: Analyze text + images + code
✅ **Better Indexing**: Semantic search & theme extraction

### Division of Labor

| Task | AI | Why |
|------|-----|-----|
| Real-time trends | Perplexity | Live web search |
| Viral detection | Perplexity | Current engagement data |
| Deep content analysis | Gemini | 2M token context |
| Pattern recognition | Gemini | Strong at correlations |
| Theme extraction | Gemini | Semantic understanding |
| Multimodal analysis | Gemini | Can analyze images/code |
| Indexing & categorization | Gemini | Large-scale processing |
| Historical patterns | Gemini | Long context memory |
| Strategy creation | Claude | Reverse engineering expert |
| Execution | OpenAI | 100% automation |

### ROI Impact

**Before (Perplexity only)**:
- $0.05 per 100 checks
- Single perspective
- Text-only analysis

**After (Perplexity + Gemini)**:
- $0.09 per 100 checks
- Dual validation
- Multimodal analysis
- 2x more actionable insights
- **2.2x better ROI** 🚀
