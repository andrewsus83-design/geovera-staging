# GEO Citation Process: Pre-Filtering & Reverse Engineering Strategy

## Overview
Sistem GEO citation detection yang efisien dan actionable dengan:
- **Perplexity Pre-Filter**: Identifikasi high-potential content sebelum Claude analysis
- **Cache Validation**: Zero redundancy, zero gaps
- **Claude Reverse Engineering**: "HOW to rank #1" methodology (internal strategy)
- **OpenAI Execution**: Auto-execute strategies recommended by Claude
- **Client Dashboard**: Simple view - "Who's #1? What topic?" (strategy hidden from client)

---

## Client View vs Internal Strategy

### What Client Sees (Simple Dashboard)
```typescript
interface ClientCitationView {
  topic: string;                    // "AI-powered SEO tools"
  rank_one: string;                 // "Ahrefs"
  your_brand_rank: number | null;   // null (not cited)
  citation_frequency: string;       // "New Opportunity" (<30%)
  status: 'performing_well' | 'needs_improvement' | 'new_opportunity';

  // Simple metrics
  total_citations_this_month: number;
  citations_change: string;         // "+12% vs last month"
}
```

### What GeoVera Does Internally (Hidden from Client)
```typescript
interface InternalReverseEngineering {
  // Claude's strategic analysis
  claude_strategy: {
    gap_analysis: string[];
    path_to_number_one: Action[];
    success_probability: number;
    timeline_estimate: string;
  };

  // OpenAI's execution plan
  openai_execution: {
    automated_actions: AutomatedAction[];
    manual_actions_required: ManualAction[];
    execution_status: 'pending' | 'in_progress' | 'completed';
  };
}
```

**Key Principle**: Client hanya tahu "siapa rank 1, topic apa" — GeoVera yang jalankan strategi reverse engineering di background!

---

## 1. Pre-Citation Perplexity Filter

### Purpose
Gunakan Perplexity untuk **filtering dan prioritization** sebelum expensive Claude analysis.

### Workflow

```typescript
interface PerplexityPreFilter {
  content_url: string;
  brand_keywords: string[];
  competitor_presence: boolean;
  content_freshness: 'recent' | 'medium' | 'old'; // <7d, <30d, >30d
  citation_probability: number; // 0-100
  recommended_action: 'analyze_now' | 'queue_later' | 'skip';
  reasoning: string;
}

async function runPerplexityPreFilter(
  topicId: string,
  aiEngine: string,
  brandId: string
): Promise<PerplexityPreFilter> {

  // Step 1: Perplexity searches for the topic
  const perplexityPrompt = `
    Search for: "${topic.name}" using ${aiEngine}

    Tasks:
    1. Identify top 5 content sources currently cited
    2. Check if "${brand.name}" is mentioned
    3. Analyze competitor presence
    4. Evaluate content freshness and authority
    5. Predict citation probability for "${brand.name}"

    Return: JSON with URLs, brand presence, competitors, freshness, citation probability
  `;

  const result = await perplexity.search(perplexityPrompt);

  // Step 2: Prioritization logic
  const action = determineAction({
    brandPresent: result.brand_mentioned,
    citationProbability: result.citation_probability,
    competitorCount: result.competitors.length,
    freshness: result.content_freshness
  });

  return {
    content_url: result.top_source_url,
    brand_keywords: result.brand_keywords_found,
    competitor_presence: result.competitors.length > 0,
    content_freshness: result.freshness,
    citation_probability: result.citation_probability,
    recommended_action: action,
    reasoning: generateReasoning(result)
  };
}

function determineAction(data: FilterData): Action {
  // HIGH PRIORITY: Brand mentioned + high probability
  if (data.brandPresent && data.citationProbability >= 70) {
    return 'analyze_now'; // Claude reverse engineering
  }

  // MEDIUM: Not mentioned but high potential
  if (!data.brandPresent && data.citationProbability >= 60) {
    return 'analyze_now'; // Find gap, opportunity
  }

  // LOW: Old content, low probability, many competitors
  if (data.freshness === 'old' && data.citationProbability < 30) {
    return 'skip'; // Not worth the cost
  }

  // QUEUE: Medium potential, check later
  return 'queue_later';
}
```

### Benefits
- **60% cost reduction**: Skip low-probability content
- **Focus Claude**: Only on high-value analysis
- **Real-time intelligence**: Perplexity knows current AI behavior

---

## 2. Cache Validation Logic (Zero Redundancy, Zero Gaps)

### The Problem
- **Redundancy**: Checking content that hasn't changed
- **Gaps**: Missing new citations because of cache assumptions

### The Solution: Two-Stage Validation

```typescript
interface CacheValidationResult {
  check_type: 'cached' | 'delta_recheck' | 'new_content' | 'forced_recheck';
  needs_perplexity_filter: boolean;
  needs_claude_analysis: boolean;
  reason: string;
  cached_data?: CitationCheck;
}

async function validateCacheStatus(
  contentUrl: string,
  topicId: string,
  brandId: string,
  checkDate: Date
): Promise<CacheValidationResult> {

  // STAGE 1: Check if content exists in cache
  const cached = await supabase
    .from('gv_geo_content_cache')
    .select('*')
    .eq('content_url', contentUrl)
    .eq('brand_id', brandId)
    .single();

  // NEW CONTENT: Never checked before
  if (!cached.data) {
    return {
      check_type: 'new_content',
      needs_perplexity_filter: true,
      needs_claude_analysis: false, // Depends on Perplexity result
      reason: 'Content never analyzed, run Perplexity pre-filter first'
    };
  }

  // STAGE 2: Validate cached content
  const currentContent = await fetchContent(contentUrl);
  const currentHash = generateHash(currentContent);
  const previousHash = cached.data.content_hash;

  // CONTENT CHANGED: Delta detected
  if (currentHash !== previousHash) {
    return {
      check_type: 'delta_recheck',
      needs_perplexity_filter: true,
      needs_claude_analysis: false, // Depends on Perplexity
      reason: `Content changed (hash: ${previousHash.slice(0,8)} → ${currentHash.slice(0,8)})`
    };
  }

  // STAGE 3: Check scheduled recheck interval
  const daysSinceCheck = daysBetween(cached.data.last_checked_at, checkDate);
  const recheckInterval = getRecheckInterval(cached.data.check_priority);

  if (daysSinceCheck >= recheckInterval) {
    return {
      check_type: 'forced_recheck',
      needs_perplexity_filter: true,
      needs_claude_analysis: false,
      reason: `Scheduled recheck (${daysSinceCheck}d since last check, interval: ${recheckInterval}d)`
    };
  }

  // CACHED: Use existing data
  return {
    check_type: 'cached',
    needs_perplexity_filter: false,
    needs_claude_analysis: false,
    reason: `Content unchanged, last checked ${daysSinceCheck}d ago`,
    cached_data: cached.data.last_citation_result
  };
}

function getRecheckInterval(priority: 'gold' | 'silver' | 'bronze'): number {
  return {
    gold: 14,    // Every 2 weeks
    silver: 30,  // Monthly
    bronze: 60   // Every 2 months
  }[priority];
}
```

### Validation Flow Chart

```
START
  ├─> Is content in cache?
  │     ├─> NO → NEW_CONTENT → Run Perplexity Pre-Filter
  │     └─> YES → Continue
  │
  ├─> Has content changed (hash)?
  │     ├─> YES → DELTA_RECHECK → Run Perplexity Pre-Filter
  │     └─> NO → Continue
  │
  ├─> Time since last check >= recheck interval?
  │     ├─> YES → FORCED_RECHECK → Run Perplexity Pre-Filter
  │     └─> NO → CACHED → Use cached data, skip checks
  │
END
```

### Guarantees
✅ **No Redundancy**: Content only rechecked if changed or scheduled
✅ **No Gaps**: New content and deltas always caught
✅ **Cost Efficient**: 60-70% fewer API calls

---

## 3. Claude Reverse Engineering Methodology (Internal Strategy)

### From "What Ranks" to "HOW to Rank #1"

**Client Sees**:
```json
{
  "topic": "AI-powered SEO tools",
  "rank_one": "Ahrefs",
  "your_rank": null,
  "status": "new_opportunity"
}
```

**GeoVera's Internal Strategy (Claude Analysis)**:

```typescript
interface ClaudeReverseEngineering {
  // Current State
  current_analysis: {
    brand_rank: number | null;
    cited_brands: string[];
    citation_context: string;
    ai_engine_behavior: string;
  };

  // Gap Analysis (WHY competitors win)
  gap_analysis: {
    why_competitors_win: string[];
    brand_weaknesses: string[];
    missing_elements: string[];
  };

  // Reverse Engineering: HOW to Rank #1
  path_to_number_one: {
    priority: 'high' | 'medium' | 'low';

    // Actionable Steps (for OpenAI to execute)
    content_actions: {
      action_id: string;
      what: string;
      why: string;
      difficulty: 'easy' | 'medium' | 'hard';
      expected_impact: number; // 0-100
      automation_type: 'openai_auto' | 'manual_required';
    }[];

    authority_actions: {
      action_id: string;
      what: string;
      why: string;
      difficulty: 'easy' | 'medium' | 'hard';
      expected_impact: number;
      automation_type: 'openai_auto' | 'manual_required';
    }[];

    technical_actions: {
      action_id: string;
      what: string;
      why: string;
      difficulty: 'easy' | 'medium' | 'hard';
      expected_impact: number;
      automation_type: 'openai_auto' | 'manual_required';
    }[];

    // Specific Prompt Engineering
    prompt_optimization: {
      current_prompt_patterns: string[];
      recommended_prompt_triggers: string[];
      phrases_to_seed: string[];
    };
  };

  // Success Prediction
  success_prediction: {
    probability_reach_top_3: number; // 0-100
    estimated_timeline: string; // "2-4 weeks", "1-2 months"
    confidence_level: 'high' | 'medium' | 'low';
    reasoning: string;
  };
}
```

### Claude Analysis Prompt Template

```typescript
const claudeReverseEngineeringPrompt = `
CONTEXT:
- AI Engine: ${aiEngine}
- Topic/Query: "${topic}"
- Brand: ${brandName}
- Current Citations: ${currentCitations}
- Competitors: ${competitors.join(', ')}

TASK: Reverse Engineering Analysis

You are NOT analyzing "what ranks" but "HOW this brand can rank #1".

## 1. Current State Analysis
- Where does ${brandName} appear (if at all)?
- What context/phrases does ${aiEngine} use when citing competitors?
- What is ${aiEngine}'s citation pattern for this topic?

## 2. Gap Analysis
WHY do competitors win?
- Content depth/quality differences
- Authority signals (backlinks, mentions, reviews)
- Technical factors (schema, freshness, load speed)
- Brand recognition in ${aiEngine}'s training data

What is ${brandName} MISSING?

## 3. Reverse Engineering: PATH TO #1

For EACH action, specify:
- automation_type: "openai_auto" if OpenAI can execute automatically
- automation_type: "manual_required" if requires human intervention

### Content Actions
Specific, actionable content improvements:
- "Add X section covering Y because ${aiEngine} prioritizes Z"
  automation_type: "openai_auto" (OpenAI can generate content)
- "Expand keyword coverage to include [specific terms]"
  automation_type: "openai_auto"

### Authority Actions
How to build signals that ${aiEngine} recognizes:
- "Get cited by [specific high-authority site]"
  automation_type: "manual_required" (requires outreach)
- "Increase mentions in [specific context]"
  automation_type: "openai_auto" (can create content for mentions)

### Technical Actions
Technical optimizations for ${aiEngine}:
- "Add structured data for [specific schema]"
  automation_type: "openai_auto" (can generate schema code)
- "Improve [specific metric] from X to Y"
  automation_type: "manual_required"

### Prompt Optimization
CRITICAL: What prompt patterns trigger citations?
- Current patterns that work: [list]
- Recommended trigger phrases: [list]
- Content phrases to seed: [list]
  automation_type: "openai_auto" (can integrate into content)

## 4. Success Prediction
- Probability of reaching top 3: X%
- Timeline estimate: "Y weeks/months"
- Confidence: High/Medium/Low
- Reasoning: Why this timeline and probability

OUTPUT FORMAT: JSON matching ClaudeReverseEngineering interface

Be SPECIFIC and ACTIONABLE. Mark which actions OpenAI can auto-execute.
`;
```

---

## 4. OpenAI Execution Layer (Auto-Execute Strategy)

### Purpose
Claude creates the strategy, OpenAI executes automatically.

```typescript
interface OpenAIExecutionPlan {
  strategy_id: string;
  brand_id: string;
  topic_id: string;

  automated_actions: {
    action_id: string;
    action_type: 'content_generation' | 'schema_creation' | 'content_optimization' | 'prompt_seeding';

    // What OpenAI will do
    execution_prompt: string;
    expected_output: string;

    // Status tracking
    status: 'pending' | 'executing' | 'completed' | 'failed';
    executed_at?: Date;
    result?: string;
  }[];

  manual_actions: {
    action_id: string;
    action_type: 'outreach' | 'technical_implementation' | 'approval_required';

    // Human todo
    description: string;
    assigned_to?: string;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
}

async function executeClaudeStrategy(
  claudeAnalysis: ClaudeReverseEngineering,
  brandId: string,
  topicId: string
): Promise<OpenAIExecutionPlan> {

  const automatedActions = [];
  const manualActions = [];

  // Parse all actions from Claude's analysis
  const allActions = [
    ...claudeAnalysis.path_to_number_one.content_actions,
    ...claudeAnalysis.path_to_number_one.authority_actions,
    ...claudeAnalysis.path_to_number_one.technical_actions
  ];

  for (const action of allActions) {
    if (action.automation_type === 'openai_auto') {
      // OpenAI can execute automatically
      automatedActions.push({
        action_id: action.action_id,
        action_type: determineActionType(action),
        execution_prompt: generateOpenAIPrompt(action),
        expected_output: action.what,
        status: 'pending'
      });
    } else {
      // Requires manual intervention
      manualActions.push({
        action_id: action.action_id,
        action_type: 'manual_implementation',
        description: action.what,
        status: 'pending'
      });
    }
  }

  // Execute automated actions
  for (const autoAction of automatedActions) {
    await executeWithOpenAI(autoAction);
  }

  return {
    strategy_id: generateId(),
    brand_id: brandId,
    topic_id: topicId,
    automated_actions: automatedActions,
    manual_actions: manualActions
  };
}

async function executeWithOpenAI(action: AutomatedAction): Promise<void> {
  action.status = 'executing';

  try {
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a content optimization specialist executing GEO strategies.'
        },
        {
          role: 'user',
          content: action.execution_prompt
        }
      ],
      temperature: 0.7
    });

    const result = openaiResponse.choices[0].message.content;

    // Save result
    action.result = result;
    action.status = 'completed';
    action.executed_at = new Date();

    // Store in database
    await supabase.from('gv_geo_action_executions').insert({
      action_id: action.action_id,
      execution_result: result,
      executed_at: new Date()
    });

  } catch (error) {
    action.status = 'failed';
    console.error(`OpenAI execution failed for action ${action.action_id}:`, error);
  }
}

function generateOpenAIPrompt(action: Action): string {
  const promptTemplates = {
    'content_generation': `
      Generate SEO-optimized content:

      Goal: ${action.what}
      Reason: ${action.why}

      Requirements:
      - Include target keywords naturally
      - Optimize for AI citation (structured, authoritative tone)
      - Length: 800-1200 words
      - Include relevant examples and data

      Output format: Markdown
    `,

    'schema_creation': `
      Generate JSON-LD structured data:

      Goal: ${action.what}
      Schema type: ${action.schema_type || 'Article/SoftwareApplication'}

      Requirements:
      - Valid schema.org markup
      - Include all required properties
      - Optimize for rich results

      Output format: JSON-LD code block
    `,

    'content_optimization': `
      Optimize existing content:

      Goal: ${action.what}
      Current content: ${action.current_content}

      Improvements needed:
      ${action.why}

      Output: Revised content with changes highlighted
    `,

    'prompt_seeding': `
      Create prompt-optimized content phrases:

      Goal: ${action.what}
      Target phrases: ${action.target_phrases}

      Requirements:
      - Natural integration into content
      - Trigger AI citation patterns
      - Maintain readability

      Output: 5-10 optimized sentences to insert into content
    `
  };

  return promptTemplates[action.action_type] || action.what;
}
```

---

## 5. Complete Workflow Integration

### Monthly GEO Citation Process

```typescript
async function runMonthlyGEOProcess(brandId: string, tier: Tier) {
  const config = getTierConfig(tier);
  const topics = await getTrackedTopics(brandId, config.tracked_topics);
  const engines = allocateAIEngines(config.citation_checks_per_month);

  const clientResults = []; // Simple view for client
  const internalStrategies = []; // Hidden strategies

  for (const topic of topics) {
    for (const engine of engines) {

      // STEP 1: Cache Validation
      const cacheStatus = await validateCacheStatus(
        topic.url,
        topic.id,
        brandId,
        new Date()
      );

      // STEP 2: Use cached data if valid
      if (cacheStatus.check_type === 'cached') {
        clientResults.push({
          topic: topic.name,
          engine: engine.name,
          source: 'cache',
          data: cacheStatus.cached_data.client_view // Simple view only
        });
        continue;
      }

      // STEP 3: Run Perplexity Pre-Filter
      if (cacheStatus.needs_perplexity_filter) {
        const perplexityFilter = await runPerplexityPreFilter(
          topic.id,
          engine.name,
          brandId
        );

        // STEP 4: Decide based on Perplexity recommendation
        if (perplexityFilter.recommended_action === 'skip') {
          await logSkippedCheck(topic, engine, perplexityFilter.reasoning);
          continue;
        }

        if (perplexityFilter.recommended_action === 'queue_later') {
          await addToBronzeQueue(topic, engine, perplexityFilter);
          continue;
        }

        // STEP 5: Run Claude Reverse Engineering (analyze_now)
        const claudeAnalysis = await runClaudeReverseEngineering(
          topic,
          engine,
          brandId,
          perplexityFilter
        );

        // STEP 6: Execute Strategy with OpenAI
        const executionPlan = await executeClaudeStrategy(
          claudeAnalysis,
          brandId,
          topic.id
        );

        // STEP 7: Save results
        await saveCitationCheck({
          topic_id: topic.id,
          ai_engine: engine.name,
          brand_id: brandId,

          // Client view (simple)
          client_view: {
            topic: topic.name,
            rank_one: claudeAnalysis.current_analysis.cited_brands[0],
            your_rank: claudeAnalysis.current_analysis.brand_rank,
            status: determineStatus(claudeAnalysis),
            citations_change: calculateChange(topic.id)
          },

          // Internal strategy (hidden)
          claude_strategy: claudeAnalysis,
          openai_execution: executionPlan,

          perplexity_filter: perplexityFilter,
          content_hash: generateHash(perplexityFilter.content_url),
          check_priority: determineQueuePriority(claudeAnalysis),
          checked_at: new Date()
        });

        // Add to client results (simple view only)
        clientResults.push({
          topic: topic.name,
          engine: engine.name,
          rank_one: claudeAnalysis.current_analysis.cited_brands[0],
          your_rank: claudeAnalysis.current_analysis.brand_rank,
          status: determineStatus(claudeAnalysis)
        });

        // Track internal strategy (hidden from client)
        internalStrategies.push({
          topic: topic.name,
          engine: engine.name,
          claude_strategy: claudeAnalysis,
          openai_execution: executionPlan
        });
      }
    }
  }

  // STEP 8: Generate reports
  return {
    client_report: generateClientReport(clientResults, brandId), // Simple
    internal_report: generateInternalReport(internalStrategies, brandId) // Detailed strategy
  };
}
```

---

## 6. Database Schema

### Client-Facing Table (Simple View)

```sql
CREATE TABLE gv_geo_client_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id),
  topic_id UUID NOT NULL REFERENCES gv_geo_topics(id),
  ai_engine TEXT NOT NULL,

  -- Simple metrics (what client sees)
  rank_one_brand TEXT,
  your_brand_rank INTEGER,
  citation_frequency_percentage INTEGER CHECK(citation_frequency_percentage BETWEEN 0 AND 100),
  status TEXT CHECK(status IN ('performing_well', 'needs_improvement', 'new_opportunity')),
  citations_this_month INTEGER DEFAULT 0,
  citations_change_percentage INTEGER,

  checked_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_client_citations_brand (brand_id),
  INDEX idx_client_citations_status (status)
);
```

### Internal Strategy Tables (Hidden from Client)

```sql
-- Perplexity Pre-Filter Results
CREATE TABLE gv_geo_perplexity_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id),
  topic_id UUID NOT NULL REFERENCES gv_geo_topics(id),
  ai_engine TEXT NOT NULL,

  content_url TEXT NOT NULL,
  brand_keywords TEXT[],
  competitor_presence BOOLEAN,
  competitors_found TEXT[],
  content_freshness TEXT CHECK(content_freshness IN ('recent', 'medium', 'old')),
  citation_probability INTEGER CHECK(citation_probability BETWEEN 0 AND 100),
  recommended_action TEXT CHECK(recommended_action IN ('analyze_now', 'queue_later', 'skip')),
  reasoning TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_perplexity_brand_topic (brand_id, topic_id)
);

-- Claude Reverse Engineering Strategies
CREATE TABLE gv_geo_claude_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id),
  topic_id UUID NOT NULL REFERENCES gv_geo_topics(id),
  ai_engine TEXT NOT NULL,
  perplexity_filter_id UUID REFERENCES gv_geo_perplexity_filters(id),

  -- Claude's analysis (full strategy)
  current_analysis JSONB NOT NULL,
  gap_analysis JSONB NOT NULL,
  path_to_number_one JSONB NOT NULL,
  success_prediction JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_claude_strategies_brand (brand_id),
  INDEX idx_claude_success_prob ((success_prediction->>'probability_reach_top_3')::INTEGER)
);

-- OpenAI Execution Results
CREATE TABLE gv_geo_openai_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES gv_geo_claude_strategies(id),
  action_id TEXT NOT NULL,
  action_type TEXT NOT NULL,

  -- Execution details
  execution_prompt TEXT NOT NULL,
  execution_result TEXT,
  status TEXT CHECK(status IN ('pending', 'executing', 'completed', 'failed')),

  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_openai_executions_strategy (strategy_id),
  INDEX idx_openai_executions_status (status)
);

-- Manual Actions (requires human intervention)
CREATE TABLE gv_geo_manual_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES gv_geo_claude_strategies(id),
  action_id TEXT NOT NULL,
  action_type TEXT NOT NULL,

  description TEXT NOT NULL,
  assigned_to UUID REFERENCES gv_users(id),
  status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',

  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_manual_actions_strategy (strategy_id),
  INDEX idx_manual_actions_status (status)
);

-- Content Cache
CREATE TABLE gv_geo_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_url TEXT NOT NULL,
  brand_id UUID NOT NULL REFERENCES gv_brands(id),

  content_hash TEXT NOT NULL,
  check_priority TEXT CHECK(check_priority IN ('gold', 'silver', 'bronze')) DEFAULT 'silver',

  last_checked_at TIMESTAMPTZ NOT NULL,
  last_citation_result JSONB,
  last_perplexity_filter_id UUID REFERENCES gv_geo_perplexity_filters(id),

  UNIQUE(content_url, brand_id),
  INDEX idx_cache_brand_url (brand_id, content_url),
  INDEX idx_cache_priority (check_priority)
);
```

---

## 7. API Endpoints

### Client-Facing API (Simple)

```typescript
// GET /api/brands/:brandId/geo/citations
// Returns simple view for client dashboard
{
  citations: [
    {
      topic: "AI-powered SEO tools",
      ai_engine: "ChatGPT",
      rank_one: "Ahrefs",
      your_rank: null,
      status: "new_opportunity",
      citation_frequency: "<30%",
      citations_this_month: 0,
      citations_change: "—"
    },
    {
      topic: "Content optimization tools",
      ai_engine: "Claude",
      rank_one: "Your Brand",
      your_rank: 1,
      status: "performing_well",
      citation_frequency: "85%",
      citations_this_month: 17,
      citations_change: "+23%"
    }
  ],
  summary: {
    total_topics: 20,
    performing_well: 5,
    needs_improvement: 8,
    new_opportunities: 7,
    total_citations_this_month: 45,
    change_vs_last_month: "+12%"
  }
}
```

### Internal API (Strategy Access - Admin Only)

```typescript
// GET /api/internal/brands/:brandId/geo/strategies
// Returns full Claude + OpenAI execution details
{
  strategies: [
    {
      topic: "AI-powered SEO tools",
      ai_engine: "ChatGPT",

      claude_analysis: {
        gap_analysis: ["Ahrefs has 500+ blog posts", "..."],
        path_to_number_one: {
          content_actions: [...],
          authority_actions: [...],
          technical_actions: [...]
        },
        success_prediction: {
          probability_reach_top_3: 78,
          estimated_timeline: "6-8 weeks"
        }
      },

      openai_execution: {
        automated_actions: [
          {
            action_type: "content_generation",
            status: "completed",
            result: "Generated 1200-word article on GEO vs SEO"
          }
        ],
        manual_actions: [
          {
            action_type: "outreach",
            description: "Get featured in Search Engine Journal",
            status: "pending"
          }
        ]
      }
    }
  ]
}
```

---

## 8. Cost & Efficiency Metrics

### Before Optimization
```
Monthly Citation Checks: 200 (Premium tier)
- Perplexity: 0 calls
- Claude: 200 calls × $0.02 = $4.00
- OpenAI: 0 (no auto-execution)

Total: $4.00
Manual work: 100% of strategy execution
```

### After Optimization (Month 2+)
```
Monthly Citation Checks: 200
- Cache hits: 140 (70%)
- Perplexity pre-filter: 60 × $0.005 = $0.30
- Claude strategy: 24 × $0.02 = $0.48
- OpenAI execution: 24 strategies × avg 3 actions × $0.01 = $0.72

Total: $1.50 (62% cost savings)
Automated execution: 70% of strategy actions
Manual work: 30% (outreach, approvals only)
```

---

## Summary

### Three-Layer Architecture

```
┌─────────────────────────────────────┐
│   CLIENT DASHBOARD (Simple View)    │
│  "Rank 1: Ahrefs | Your Rank: N/A"  │
│     "Status: New Opportunity"        │
└─────────────────────────────────────┘
                  ▲
                  │ (only simple metrics)
                  │
┌─────────────────────────────────────┐
│  GEOVERA STRATEGY LAYER (Hidden)    │
│                                      │
│  Perplexity → Filter & Prioritize    │
│  Claude → Reverse Engineering        │
│  OpenAI → Auto-Execute Strategy      │
└─────────────────────────────────────┘
                  ▲
                  │ (full analysis, actions)
                  │
┌─────────────────────────────────────┐
│   INTERNAL ADMIN VIEW (Full Access) │
│  Gap analysis, action plans,         │
│  execution status, success metrics   │
└─────────────────────────────────────┘
```

### Key Principles
✅ **Client sees**: Simple ranking ("Who's #1? What topic?")
✅ **GeoVera does**: Complex reverse engineering + auto-execution
✅ **Perplexity First**: Filter before expensive analysis
✅ **Zero Redundancy**: Smart caching with delta detection
✅ **Zero Gaps**: New content always caught
✅ **Prescriptive Strategy**: "HOW to rank #1" not "what ranks"
✅ **Automated Execution**: OpenAI executes 70% of strategies
✅ **Measurable Outcomes**: Track success of every action

### Expected Results
- **62% cost reduction** after month 2
- **70% automation** of strategy execution
- **3x more actionable insights** (reverse engineering vs simple ranking)
- **Client simplicity** + **GeoVera intelligence** = competitive advantage
- **Clear ROI**: Every strategy tracked and measured
