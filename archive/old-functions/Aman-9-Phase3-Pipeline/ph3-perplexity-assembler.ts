import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// PH3 PERPLEXITY PAYLOAD ASSEMBLER
// TASK-26 Implementation
// ============================================================================
// Purpose: Assemble validated Perplexity payloads from normalized artifacts
// Output: gv_perplexity_payloads (ready for Perplexity Deep Research SOP v3)
// Compliance: Gold Standard SOP v1.0 (LOCKED)
// ============================================================================

interface AssemblyRequest {
  mode?: 'run' | 'health';
  brand_id: string;
  run_id: string;
  cycle_window?: '7d' | '14d' | '28d';
}

interface ValidationGate {
  gate_id: string;
  passed: boolean;
  message: string;
}

// ============================================================================
// Payload Assembly Logic
// ============================================================================

async function assemblePayload(
  supabase: any,
  brand_id: string,
  run_id: string,
  cycle_window: string
) {
  // Fetch normalized artifacts (clean + flagged only, no rejected)
  const { data: artifacts, error } = await supabase
    .from('gv_normalized_artifacts')
    .select('*')
    .eq('brand_id', brand_id)
    .eq('run_id', run_id)
    .in('hygiene_status', ['clean', 'flagged']);

  if (error) throw error;
  if (!artifacts || artifacts.length === 0) {
    throw new Error('No normalized artifacts found for this run');
  }

  // Separate by signal layer
  const layer0 = artifacts.filter(a => a.signal_layer === 0);
  const layer1 = artifacts.filter(a => a.signal_layer === 1);
  const layer2 = artifacts.filter(a => a.signal_layer === 2 && a.is_eligible_perplexity);
  const layer3 = artifacts.filter(a => a.signal_layer === 3);

  // ===================================================================
  // VALIDATION GATES (6 gates from TASK-26 spec)
  // ===================================================================
  const validation_gates: ValidationGate[] = [];

  // Gate 1: Minimum L2 signals (primary evidence)
  const gate1 = {
    gate_id: 'G1_MIN_L2',
    passed: layer2.length >= 3,
    message: layer2.length >= 3 
      ? `✓ ${layer2.length} L2 signals (min 3)` 
      : `✗ Only ${layer2.length} L2 signals (min 3 required)`,
  };
  validation_gates.push(gate1);

  // Gate 2: DQS threshold for L2
  const layer2_dqs = layer2.map(a => a.dqs_score_refined || 0);
  const avg_l2_dqs = layer2_dqs.length > 0 
    ? layer2_dqs.reduce((a, b) => a + b, 0) / layer2_dqs.length 
    : 0;
  const gate2 = {
    gate_id: 'G2_L2_DQS',
    passed: avg_l2_dqs >= 0.6,
    message: avg_l2_dqs >= 0.6 
      ? `✓ Avg L2 DQS ${avg_l2_dqs.toFixed(2)} (min 0.6)` 
      : `✗ Avg L2 DQS ${avg_l2_dqs.toFixed(2)} (min 0.6 required)`,
  };
  validation_gates.push(gate2);

  // Gate 3: Source diversity
  const sources = new Set(artifacts.map(a => a.source));
  const gate3 = {
    gate_id: 'G3_SOURCE_DIVERSITY',
    passed: sources.size >= 2,
    message: sources.size >= 2 
      ? `✓ ${sources.size} sources (min 2)` 
      : `✗ Only ${sources.size} source (min 2 required)`,
  };
  validation_gates.push(gate3);

  // Gate 4: No empty content in L2
  const l2_empty = layer2.filter(a => a.has_empty_content);
  const gate4 = {
    gate_id: 'G4_NO_EMPTY_L2',
    passed: l2_empty.length === 0,
    message: l2_empty.length === 0 
      ? `✓ No empty content in L2` 
      : `✗ ${l2_empty.length} L2 signals with empty content`,
  };
  validation_gates.push(gate4);

  // Gate 5: L3 annotation compliance
  const gate5 = {
    gate_id: 'G5_L3_ANNOTATED',
    passed: true, // Will be annotated below
    message: `✓ L3 signals will be annotated`,
  };
  validation_gates.push(gate5);

  // Gate 6: Research problem derivable
  const has_trend_data = artifacts.some(a => a.source === 'google_trends');
  const has_social_data = artifacts.some(a => a.source_category === 'social');
  const gate6 = {
    gate_id: 'G6_RESEARCH_PROBLEM',
    passed: has_trend_data || has_social_data,
    message: (has_trend_data || has_social_data) 
      ? `✓ Sufficient data for research problem derivation` 
      : `✗ Insufficient data types for research problem`,
  };
  validation_gates.push(gate6);

  // Overall validation status
  const all_passed = validation_gates.every(g => g.passed);
  const validation_status = all_passed ? 'passed' : 'failed';

  // ===================================================================
  // LAYER 2 SIGNALS (Primary Evidence)
  // ===================================================================
  const layer2_signals = layer2.map(artifact => ({
    artifact_id: artifact.id,
    source: artifact.source,
    signal_layer: 2,
    dqs_score: artifact.dqs_score_refined,
    payload: artifact.normalized_payload,
    collected_at: artifact.created_at,
  }));

  // ===================================================================
  // LAYER 3 CONTEXT (Annotated Wrapper)
  // ===================================================================
  const layer3_context = layer3.map(artifact => ({
    artifact_id: artifact.id,
    source: artifact.source,
    signal_layer: 3,
    annotation: {
      role: 'pulse_context',
      warning: 'Do not use as primary evidence - context only',
      temporal_note: 'Fast-changing signal - verify recency',
      usage: 'Enrich narrative, do not trigger insights independently',
    },
    payload: artifact.normalized_payload,
    collected_at: artifact.created_at,
  }));

  // ===================================================================
  // LAYER 1 BASELINE (Reference Only)
  // ===================================================================
  const layer1_baseline = layer1.map(artifact => ({
    artifact_id: artifact.id,
    source: artifact.source,
    signal_layer: 1,
    role: 'stability_baseline',
    payload: artifact.normalized_payload,
  }));

  // ===================================================================
  // RESEARCH PROBLEM & DECISION CONTEXT (from Perplexity SOP Section 5)
  // ===================================================================
  
  // Derive research problem from data
  const brand = await supabase.from('brands').select('brand_name').eq('id', brand_id).single();
  const brand_name = brand.data?.brand_name || 'Unknown Brand';

  // Count trust objections in L2
  const trust_signals = layer2.filter(a => {
    const text = JSON.stringify(a.normalized_payload).toLowerCase();
    return text.match(/trust|authentic|fake|scam|genuine|replica/);
  });

  const research_problem = trust_signals.length > 0
    ? `Market shows ${trust_signals.length} trust-related signals for ${brand_name}. What are the primary trust objections, how do competitors address them, and where are the authority gaps?`
    : `How is ${brand_name} perceived in the market across search, social, and competitive landscape? What strategic opportunities exist for authority building?`;

  const decision_context = `This research informs ${brand_name}'s ${cycle_window} strategy cycle. Decisions needed: (1) Priority objections to address, (2) Authority content gaps to fill, (3) Competitive positioning refinements.`;

  // ===================================================================
  // SOURCE DISTRIBUTION
  // ===================================================================
  const source_distribution: Record<string, number> = {};
  for (const artifact of artifacts) {
    source_distribution[artifact.source] = (source_distribution[artifact.source] || 0) + 1;
  }

  // ===================================================================
  // QUALITY METRICS
  // ===================================================================
  const all_dqs = artifacts.map(a => a.dqs_score_refined || 0);
  const avg_dqs = all_dqs.reduce((a, b) => a + b, 0) / all_dqs.length;
  const min_dqs = Math.min(...all_dqs);
  const max_dqs = Math.max(...all_dqs);

  // ===================================================================
  // ASSEMBLE FINAL PAYLOAD
  // ===================================================================
  const payload = {
    brand_id,
    run_id,
    cycle_window,
    research_problem,
    decision_context,
    layer2_signals,
    layer3_context,
    layer1_baseline,
    total_artifacts: artifacts.length,
    total_layer2: layer2.length,
    total_layer3: layer3.length,
    source_distribution,
    avg_dqs,
    min_dqs,
    max_dqs,
    assembly_version: 'PH3-A1',
    validation_status,
    validation_gates,
    payload_status: all_passed ? 'ready' : 'draft',
  };

  return payload;
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
    const body: AssemblyRequest = await req.json();
    const { mode = 'run', brand_id, run_id, cycle_window = '7d' } = body;

    // Health check
    if (mode === 'health') {
      return new Response(JSON.stringify({
        status: 'ok',
        function: 'ph3-perplexity-assembler',
        version: 'PH3-T02-v1.0',
        validation_gates: 6,
        compliance: 'Perplexity Deep Research SOP v3',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate required params
    if (!brand_id || !run_id) {
      return new Response(JSON.stringify({
        error: 'brand_id and run_id required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Check if payload already exists
    const { data: existing } = await supabase
      .from('gv_perplexity_payloads')
      .select('id, payload_status')
      .eq('brand_id', brand_id)
      .eq('run_id', run_id)
      .eq('cycle_window', cycle_window)
      .single();

    if (existing) {
      return new Response(JSON.stringify({
        message: 'Payload already exists',
        payload_id: existing.id,
        status: existing.payload_status,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Assemble payload
    const payload = await assemblePayload(supabase, brand_id, run_id, cycle_window);

    // Insert to database
    const { data: inserted, error: insertError } = await supabase
      .from('gv_perplexity_payloads')
      .insert(payload)
      .select('id, payload_status, validation_status')
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      payload_id: inserted.id,
      brand_id,
      run_id,
      cycle_window,
      validation_status: inserted.validation_status,
      payload_status: inserted.payload_status,
      duration_ms: Date.now() - startTime,
      total_layer2: payload.total_layer2,
      total_layer3: payload.total_layer3,
      avg_dqs: payload.avg_dqs,
      ready_for_perplexity: inserted.payload_status === 'ready',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Perplexity assembler error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
