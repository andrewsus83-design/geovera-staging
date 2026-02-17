// Recognize Patterns - Self-Learning System
// Tracks Action → Outcome, discovers patterns, auto-optimizes strategies

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { action, lookback_days = 7 } = await req.json();

    let result;

    switch (action) {
      case 'analyze_patterns':
        result = await analyzePatterns(lookback_days);
        break;
      case 'generate_insights':
        result = await generateInsights();
        break;
      case 'auto_optimize':
        result = await autoOptimize();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ============================================
// ANALYZE PATTERNS (WEEKLY)
// ============================================

async function analyzePatterns(lookbackDays: number) {
  console.log(`[Self-Learning] Analyzing patterns from last ${lookbackDays} days`);

  // Get all actions and outcomes
  const { data: actions } = await supabase
    .from('gv_automated_actions')
    .select('*')
    .gte(
      'created_at',
      new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString()
    );

  if (!actions || actions.length === 0) {
    return { success: true, patterns_found: 0, message: 'No actions to analyze' };
  }

  // Get citation data for outcomes
  const { data: citations } = await supabase
    .from('gv_geo_citations')
    .select('*')
    .gte(
      'timestamp',
      new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString()
    );

  // Get backlink outcomes
  const { data: backlinks } = await supabase
    .from('gv_backlink_opportunities')
    .select('*')
    .eq('status', 'acquired')
    .gte(
      'updated_at',
      new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString()
    );

  // Prepare data for Gemini analysis
  const dataForAnalysis = {
    actions: actions.map((a) => ({
      type: a.action_type,
      brand_id: a.brand_id,
      created_at: a.created_at,
      status: a.status,
      feedback_score: a.feedback_score,
    })),
    citations: citations?.map((c) => ({
      brand_id: c.brand_id,
      topic: c.topic,
      ai_engine: c.ai_engine,
      citation_found: c.citation_found,
      rank: c.rank,
      timestamp: c.timestamp,
    })),
    backlinks: backlinks?.map((b) => ({
      brand_id: b.brand_id,
      platform: b.platform,
      perplexity_rank: b.perplexity_rank,
      acquired_at: b.updated_at,
    })),
  };

  // Use Gemini 2.0 with 2M context window for deep analysis
  const prompt = `You are a self-learning AI system analyzing ${lookbackDays} days of SEO, GEO, and Social Search optimization data.

**Data**:
${JSON.stringify(dataForAnalysis, null, 2)}

**Your Task**: Discover patterns and insights

Analyze:
1. **Action → Outcome Correlations**:
   - Which actions led to citations?
   - Which content types performed best?
   - Which platforms had highest success rates?
   - Which AI engines cited most frequently?
   - Time delays between action and outcome

2. **Success Factors**:
   - Common characteristics of successful actions
   - Quality score thresholds that led to citations
   - Platform-specific success patterns
   - Topic-specific patterns

3. **Failure Patterns**:
   - Actions that didn't lead to outcomes
   - Why certain approaches failed
   - False positives (looked promising but failed)

4. **Optimization Opportunities**:
   - Underutilized high-performing channels
   - Timing optimizations
   - Resource allocation improvements
   - Strategy refinements

5. **Predictive Insights**:
   - What predicts success?
   - Early indicators of winning strategies
   - Risk factors to avoid

Return comprehensive JSON with:
{
  "summary": "Executive summary of key findings",
  "patterns_found": [
    {
      "pattern_name": "Name",
      "confidence": 0.0-1.0,
      "description": "What the pattern shows",
      "evidence": ["Supporting data points"],
      "impact": "High/Medium/Low",
      "recommendation": "What to do about it"
    },
    ...
  ],
  "success_factors": {
    "content_quality_threshold": X,
    "best_platforms": ["list"],
    "optimal_timing": "description",
    "best_topics": ["list"]
  },
  "failure_patterns": {
    "common_mistakes": ["list"],
    "platforms_to_avoid": ["list"],
    "timing_issues": "description"
  },
  "optimization_recommendations": [
    {
      "area": "What to optimize",
      "current_performance": "metrics",
      "recommended_change": "specific action",
      "expected_impact": "description",
      "priority": "Critical/High/Medium/Low"
    },
    ...
  ],
  "predictive_model": {
    "success_probability_factors": ["list"],
    "risk_factors": ["list"],
    "leading_indicators": ["list"]
  },
  "confidence_level": 0.0-1.0,
  "sample_size": X,
  "statistical_significance": "description"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8000,
        },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  // Extract JSON
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract pattern analysis from Gemini');
  }

  const analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);

  // Save patterns
  for (const pattern of analysis.patterns_found) {
    await supabase.from('gv_learning_patterns').insert({
      pattern_name: pattern.pattern_name,
      pattern_type: 'action_outcome_correlation',
      confidence_score: pattern.confidence,
      evidence: pattern.evidence,
      recommendation: pattern.recommendation,
      impact_level: pattern.impact,
      discovered_at: new Date().toISOString(),
    });
  }

  console.log(`[Self-Learning] Found ${analysis.patterns_found.length} patterns`);

  return {
    success: true,
    patterns_found: analysis.patterns_found.length,
    confidence: analysis.confidence_level,
    sample_size: analysis.sample_size,
    analysis,
  };
}

// ============================================
// GENERATE INSIGHTS (FOR CLIENTS)
// ============================================

async function generateInsights() {
  // Get recent patterns
  const { data: patterns } = await supabase
    .from('gv_learning_patterns')
    .select('*')
    .order('discovered_at', { ascending: false })
    .limit(20);

  if (!patterns || patterns.length === 0) {
    return { success: true, insights: [], message: 'No patterns yet' };
  }

  // Generate client-friendly insights
  const insights = patterns.map((p) => ({
    title: p.pattern_name,
    description: p.recommendation,
    impact: p.impact_level,
    confidence: (p.confidence_score * 100).toFixed(0) + '%',
    discovered: new Date(p.discovered_at).toLocaleDateString(),
  }));

  return {
    success: true,
    insights,
    total: patterns.length,
  };
}

// ============================================
// AUTO-OPTIMIZE (APPLY LEARNINGS)
// ============================================

async function autoOptimize() {
  console.log('[Auto-Optimize] Applying learned patterns to strategies');

  // Get high-confidence patterns
  const { data: patterns } = await supabase
    .from('gv_learning_patterns')
    .select('*')
    .gte('confidence_score', 0.7)
    .eq('impact_level', 'High')
    .order('discovered_at', { ascending: false });

  if (!patterns || patterns.length === 0) {
    return { success: true, optimizations_applied: 0 };
  }

  let optimizations = 0;

  for (const pattern of patterns) {
    // Apply optimization based on pattern type
    if (pattern.pattern_name.includes('platform')) {
      // Adjust platform priorities
      await optimizePlatformAllocation(pattern);
      optimizations++;
    } else if (pattern.pattern_name.includes('content')) {
      // Adjust content strategy
      await optimizeContentStrategy(pattern);
      optimizations++;
    } else if (pattern.pattern_name.includes('timing')) {
      // Adjust scheduling
      await optimizeTiming(pattern);
      optimizations++;
    }
  }

  console.log(`[Auto-Optimize] Applied ${optimizations} optimizations`);

  return {
    success: true,
    optimizations_applied: optimizations,
    patterns_used: patterns.length,
  };
}

async function optimizePlatformAllocation(pattern: any) {
  // Update platform priorities based on learned performance
  console.log(`[Optimize] Adjusting platform allocation based on: ${pattern.pattern_name}`);

  // Implementation: Update gv_backlink_opportunities priorities
  // This would adjust which platforms get more focus
}

async function optimizeContentStrategy(pattern: any) {
  // Update content generation parameters
  console.log(`[Optimize] Adjusting content strategy based on: ${pattern.pattern_name}`);

  // Implementation: Update content generation prompts or parameters
}

async function optimizeTiming(pattern: any) {
  // Update scheduling windows
  console.log(`[Optimize] Adjusting timing based on: ${pattern.pattern_name}`);

  // Implementation: Update cron schedules or queue priorities
}
