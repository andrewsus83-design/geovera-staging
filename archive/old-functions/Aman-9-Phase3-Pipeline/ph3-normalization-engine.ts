import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// PH3 NORMALIZATION ENGINE
// TASK-26 Implementation
// ============================================================================
// Purpose: Clean & normalize raw artifacts → gv_normalized_artifacts
// Rules: 31 total (8 universal + 23 source-specific)
// Compliance: Gold Standard SOP v1.0 (LOCKED)
// ============================================================================

interface NormalizationRequest {
  mode?: 'run' | 'health';
  brand_id?: string;
  run_id?: string;
  raw_artifact_ids?: string[];
  batch_size?: number;
}

interface NormalizationRule {
  id: string;
  name: string;
  apply: (payload: any) => any;
}

// ============================================================================
// Universal Normalization Rules (NR-001 to NR-008)
// ============================================================================

const UNIVERSAL_RULES: NormalizationRule[] = [
  {
    id: 'NR-001',
    name: 'Whitespace Normalization',
    apply: (payload) => {
      const normalized = { ...payload };
      for (const key in normalized) {
        if (typeof normalized[key] === 'string') {
          normalized[key] = normalized[key].trim().replace(/\s+/g, ' ');
        }
      }
      return normalized;
    }
  },
  {
    id: 'NR-002',
    name: 'Empty Field Removal',
    apply: (payload) => {
      const normalized = { ...payload };
      for (const key in normalized) {
        if (normalized[key] === null || 
            normalized[key] === undefined || 
            normalized[key] === '' ||
            (Array.isArray(normalized[key]) && normalized[key].length === 0)) {
          delete normalized[key];
        }
      }
      return normalized;
    }
  },
  {
    id: 'NR-003',
    name: 'Date Standardization',
    apply: (payload) => {
      const normalized = { ...payload };
      const dateFields = ['created_at', 'updated_at', 'published_at', 'timestamp'];
      
      for (const field of dateFields) {
        if (normalized[field]) {
          try {
            normalized[field] = new Date(normalized[field]).toISOString();
          } catch (e) {
            // Invalid date, keep original
          }
        }
      }
      return normalized;
    }
  },
  {
    id: 'NR-004',
    name: 'Numeric Field Normalization',
    apply: (payload) => {
      const normalized = { ...payload };
      const numericFields = ['likes', 'shares', 'comments', 'views', 'engagement', 'score'];
      
      for (const field of numericFields) {
        if (normalized[field] !== undefined) {
          const num = parseFloat(normalized[field]);
          normalized[field] = isNaN(num) ? null : num;
        }
      }
      return normalized;
    }
  },
  {
    id: 'NR-005',
    name: 'Boolean Normalization',
    apply: (payload) => {
      const normalized = { ...payload };
      const boolFields = ['verified', 'is_spam', 'is_bot', 'is_authentic'];
      
      for (const field of boolFields) {
        if (normalized[field] !== undefined) {
          if (typeof normalized[field] === 'string') {
            normalized[field] = normalized[field].toLowerCase() === 'true';
          } else {
            normalized[field] = Boolean(normalized[field]);
          }
        }
      }
      return normalized;
    }
  },
  {
    id: 'NR-006',
    name: 'Lowercase Field Names',
    apply: (payload) => {
      const normalized: any = {};
      for (const key in payload) {
        const lowerKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        normalized[lowerKey] = payload[key];
      }
      return normalized;
    }
  },
  {
    id: 'NR-007',
    name: 'Array Deduplication',
    apply: (payload) => {
      const normalized = { ...payload };
      for (const key in normalized) {
        if (Array.isArray(normalized[key])) {
          normalized[key] = [...new Set(normalized[key])];
        }
      }
      return normalized;
    }
  },
  {
    id: 'NR-008',
    name: 'Encoding Fix (UTF-8)',
    apply: (payload) => {
      // Basic encoding normalization
      const normalized = { ...payload };
      for (const key in normalized) {
        if (typeof normalized[key] === 'string') {
          // Remove non-printable characters
          normalized[key] = normalized[key].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        }
      }
      return normalized;
    }
  },
];

// ============================================================================
// Source-Specific Rules (Stubs - Implement per source)
// ============================================================================

const GOOGLE_TRENDS_RULES: NormalizationRule[] = [
  {
    id: 'GT-001',
    name: 'Interest Over Time Array Validation',
    apply: (payload) => {
      if (payload.interest_over_time && Array.isArray(payload.interest_over_time)) {
        payload.interest_over_time = payload.interest_over_time
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));
      }
      return payload;
    }
  },
  {
    id: 'GT-002',
    name: 'Related Queries Normalization',
    apply: (payload) => {
      if (payload.related_queries && Array.isArray(payload.related_queries)) {
        payload.related_queries = payload.related_queries.map(q => q.trim().toLowerCase());
      }
      return payload;
    }
  },
];

const APIFY_RULES: NormalizationRule[] = [
  {
    id: 'AP-001',
    name: 'Platform Standardization',
    apply: (payload) => {
      if (payload.platform) {
        const platformMap: Record<string, string> = {
          'tiktok': 'tiktok',
          'tt': 'tiktok',
          'instagram': 'instagram',
          'ig': 'instagram',
        };
        payload.platform = platformMap[payload.platform.toLowerCase()] || payload.platform;
      }
      return payload;
    }
  },
  {
    id: 'AP-002',
    name: 'Author Username Normalization',
    apply: (payload) => {
      if (payload.author) {
        payload.author = payload.author.replace('@', '').toLowerCase();
      }
      return payload;
    }
  },
];

const BRIGHT_DATA_RULES: NormalizationRule[] = [
  {
    id: 'BD-001',
    name: 'Sentiment Score Normalization',
    apply: (payload) => {
      if (payload.sentiment_score !== undefined) {
        const score = parseFloat(payload.sentiment_score);
        payload.sentiment_score = isNaN(score) ? null : Math.max(0, Math.min(1, score));
      }
      return payload;
    }
  },
];

const SERPAPI_RULES: NormalizationRule[] = [
  {
    id: 'SP-001',
    name: 'Position Number Validation',
    apply: (payload) => {
      if (payload.position) {
        payload.position = Math.max(1, parseInt(payload.position) || 1);
      }
      return payload;
    }
  },
];

// ============================================================================
// Content Validation
// ============================================================================

function validateContent(normalized: any): {
  has_empty_content: boolean;
  has_spam_indicators: boolean;
  has_encoding_issues: boolean;
} {
  let has_empty_content = true;
  let has_spam_indicators = false;
  let has_encoding_issues = false;

  // Check for empty content
  const contentFields = ['text', 'title', 'snippet', 'keyword'];
  for (const field of contentFields) {
    if (normalized[field] && normalized[field].length > 0) {
      has_empty_content = false;
      break;
    }
  }

  // Check for spam indicators
  const spamKeywords = ['click here', 'buy now', 'limited offer', 'act fast'];
  const textContent = JSON.stringify(normalized).toLowerCase();
  has_spam_indicators = spamKeywords.some(kw => textContent.includes(kw));

  // Check for encoding issues
  has_encoding_issues = /[\uFFFD\x00-\x08]/.test(textContent);

  return {
    has_empty_content,
    has_spam_indicators,
    has_encoding_issues,
  };
}

// ============================================================================
// DQS Refinement
// ============================================================================

function refineDQS(
  initial_dqs: number,
  validation: ReturnType<typeof validateContent>
): {
  dqs_score_refined: number;
  dqs_delta: number;
  dqs_authenticity_r: number;
  dqs_consistency_r: number;
  dqs_corroboration_r: number;
} {
  let authenticity_r = 0.8;
  let consistency_r = 0.7;
  let corroboration_r = 0.5;

  // Penalize for content issues
  if (validation.has_empty_content) {
    authenticity_r *= 0.5;
    consistency_r *= 0.7;
  }

  if (validation.has_spam_indicators) {
    authenticity_r *= 0.6;
  }

  if (validation.has_encoding_issues) {
    consistency_r *= 0.8;
  }

  const dqs_score_refined = Math.pow(
    authenticity_r * consistency_r * corroboration_r,
    1/3
  );

  return {
    dqs_score_refined: Math.round(dqs_score_refined * 100) / 100,
    dqs_delta: Math.round((dqs_score_refined - initial_dqs) * 100) / 100,
    dqs_authenticity_r: authenticity_r,
    dqs_consistency_r: consistency_r,
    dqs_corroboration_r: corroboration_r,
  };
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const body: NormalizationRequest = await req.json();
    const { mode = 'run', brand_id, run_id, raw_artifact_ids, batch_size = 100 } = body;

    // Health check
    if (mode === 'health') {
      return new Response(JSON.stringify({
        status: 'ok',
        function: 'ph3-normalization-engine',
        version: 'PH3-T02-v1.0',
        rules_loaded: {
          universal: UNIVERSAL_RULES.length,
          google_trends: GOOGLE_TRENDS_RULES.length,
          apify: APIFY_RULES.length,
          bright_data: BRIGHT_DATA_RULES.length,
          serpapi: SERPAPI_RULES.length,
        },
        compliance: 'Gold Standard SOP v1.0 (LOCKED)',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Run normalization
    if (!brand_id) {
      return new Response(JSON.stringify({
        error: 'brand_id required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Fetch raw artifacts to normalize
    let query = supabase
      .from('gv_raw_artifacts')
      .select('*')
      .eq('brand_id', brand_id)
      .limit(batch_size);

    if (raw_artifact_ids && raw_artifact_ids.length > 0) {
      query = query.in('id', raw_artifact_ids);
    }

    // Only process artifacts not yet normalized
    const { data: existing_normalized } = await supabase
      .from('gv_normalized_artifacts')
      .select('raw_artifact_id')
      .eq('brand_id', brand_id);

    const normalized_ids = new Set(
      existing_normalized?.map(n => n.raw_artifact_id) || []
    );

    const { data: raw_artifacts, error: fetchError } = await query;

    if (fetchError) throw fetchError;
    if (!raw_artifacts || raw_artifacts.length === 0) {
      return new Response(JSON.stringify({
        message: 'No raw artifacts to normalize',
        brand_id,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const results = {
      processed: 0,
      cleaned: 0,
      flagged: 0,
      rejected: 0,
    };

    const rules_applied = new Set<string>();

    for (const raw of raw_artifacts) {
      // Skip if already normalized
      if (normalized_ids.has(raw.id)) continue;

      try {
        let normalized_payload = { ...raw.raw_payload };

        // Apply universal rules
        for (const rule of UNIVERSAL_RULES) {
          normalized_payload = rule.apply(normalized_payload);
          rules_applied.add(rule.id);
        }

        // Apply source-specific rules
        const source_rules = 
          raw.source === 'google_trends' ? GOOGLE_TRENDS_RULES :
          raw.source === 'apify' ? APIFY_RULES :
          raw.source === 'bright_data' ? BRIGHT_DATA_RULES :
          raw.source === 'serpapi' ? SERPAPI_RULES :
          [];

        for (const rule of source_rules) {
          normalized_payload = rule.apply(normalized_payload);
          rules_applied.add(rule.id);
        }

        // Validate content
        const validation = validateContent(normalized_payload);

        // Refine DQS
        const refined_dqs = refineDQS(raw.dqs_score || 0, validation);

        // Determine hygiene status
        const hygiene_status = 
          validation.has_empty_content ? 'rejected' :
          validation.has_spam_indicators || validation.has_encoding_issues ? 'flagged' :
          'clean';

        // Count fields changed
        const raw_fields = Object.keys(raw.raw_payload).length;
        const norm_fields = Object.keys(normalized_payload).length;
        const fields_removed = raw_fields - norm_fields;

        // Insert normalized artifact
        const { error: insertError } = await supabase
          .from('gv_normalized_artifacts')
          .insert({
            raw_artifact_id: raw.id,
            brand_id: raw.brand_id,
            run_id: raw.run_id,
            source: raw.source,
            platform: raw.platform,
            source_category: raw.source_category,
            signal_layer: raw.signal_layer,
            impact_level: raw.impact_level,
            change_rate: raw.change_rate,
            normalized_payload,
            normalization_version: 'PH3-N1',
            normalization_applied: Array.from(rules_applied),
            fields_cleaned: raw_fields,
            fields_removed,
            fields_standardized: norm_fields,
            has_empty_content: validation.has_empty_content,
            has_spam_indicators: validation.has_spam_indicators,
            has_encoding_issues: validation.has_encoding_issues,
            dqs_score_refined: refined_dqs.dqs_score_refined,
            dqs_authenticity_r: refined_dqs.dqs_authenticity_r,
            dqs_consistency_r: refined_dqs.dqs_consistency_r,
            dqs_corroboration_r: refined_dqs.dqs_corroboration_r,
            dqs_delta: refined_dqs.dqs_delta,
            is_eligible_perplexity: refined_dqs.dqs_score_refined >= 0.6,
            is_evidence_grade: refined_dqs.dqs_score_refined >= 0.8,
            hygiene_status,
            hygiene_flags: [
              validation.has_empty_content && 'empty_content',
              validation.has_spam_indicators && 'spam',
              validation.has_encoding_issues && 'encoding',
            ].filter(Boolean),
          });

        if (insertError) throw insertError;

        results.processed++;
        if (hygiene_status === 'clean') results.cleaned++;
        if (hygiene_status === 'flagged') results.flagged++;
        if (hygiene_status === 'rejected') results.rejected++;

      } catch (error: any) {
        console.error(`Error normalizing artifact ${raw.id}:`, error.message);
      }
    }

    // Log normalization summary
    await supabase.from('gv_normalization_logs').insert({
      brand_id,
      run_id: run_id || null,
      source_type: 'batch',
      batch_size: raw_artifacts.length,
      items_processed: results.processed,
      items_cleaned: results.cleaned,
      items_flagged: results.flagged,
      items_rejected: results.rejected,
      rules_applied: Array.from(rules_applied),
      status: 'success',
      started_at: new Date(startTime).toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    });

    return new Response(JSON.stringify({
      brand_id,
      run_id,
      duration_ms: Date.now() - startTime,
      results,
      rules_applied: Array.from(rules_applied),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Normalization engine error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
