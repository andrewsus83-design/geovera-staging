import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PerplexityRouterInput {
  brand_id: string;
  run_id: string;
  cycle_window: '7d' | '14d' | '28d';
  research_problem?: string;
  decision_context?: string;
}

Deno.serve(async (req: Request) => {
  try {
    const { brand_id, run_id, cycle_window, research_problem, decision_context }: PerplexityRouterInput = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // STEP 1: Check foundation gate
    const { data: validation, error: valError } = await supabase
      .from('gv_foundation_validations')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('run_id', run_id)
      .single();
    
    if (valError || !validation?.can_proceed_to_ai) {
      return new Response(JSON.stringify({
        validation_status: 'BLOCKED',
        blocked_reason: 'Foundation gate failed',
        payload_status: 'blocked',
        recommendations: validation?.recommendations || ['Run foundation validation first']
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // STEP 2: Load artifacts by layer
    
    // Layer 2: Primary strategic signals
    const { data: layer2, error: l2Error } = await supabase
      .from('gv_normalized_artifacts')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('run_id', run_id)
      .eq('signal_layer', 2)
      .eq('is_eligible_perplexity', true)
      .gte('dqs_score_refined', 0.6);
    
    if (l2Error) throw new Error(`Failed to load Layer 2 artifacts: ${l2Error.message}`);
    
    // Layer 1: Stability references (optional, top 10)
    const { data: layer1 } = await supabase
      .from('gv_normalized_artifacts')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('run_id', run_id)
      .eq('signal_layer', 1)
      .gte('dqs_score_refined', 0.7)
      .order('dqs_score_refined', { ascending: false })
      .limit(10);
    
    // Layer 3: Volatility context (limited to 5 most recent)
    const { data: layer3 } = await supabase
      .from('gv_normalized_artifacts')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('run_id', run_id)
      .eq('signal_layer', 3)
      .order('collected_at', { ascending: false })
      .limit(5);
    
    // STEP 3: Build evidence pack
    const evidence_pack = assembleEvidencePack({
      brand_id,
      run_id,
      cycle_window,
      layer2: layer2 || [],
      layer1: layer1 || [],
      layer3: layer3 || [],
      research_problem,
      decision_context
    });
    
    // STEP 4: Insert payload
    const { data: payload, error: insertError } = await supabase
      .from('gv_perplexity_payloads')
      .insert(evidence_pack)
      .select()
      .single();
    
    if (insertError) {
      return new Response(JSON.stringify({
        validation_status: 'BLOCKED',
        blocked_reason: insertError.message,
        payload_status: 'blocked'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      payload_id: payload.id,
      brand_id: payload.brand_id,
      run_id: payload.run_id,
      validation_status: 'PASS',
      layer2_count: payload.layer2_count,
      layer1_count: payload.layer1_count,
      layer3_count: payload.layer3_count,
      avg_dqs_layer2: payload.avg_dqs_layer2,
      evidence_grade_count: payload.evidence_grade_count,
      payload_status: payload.payload_status
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      validation_status: 'FAIL',
      payload_status: 'blocked'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

function assembleEvidencePack(input: any) {
  const { brand_id, run_id, cycle_window, layer2, layer1, layer3, research_problem, decision_context } = input;
  
  // Calculate Layer 2 DQS metrics
  const layer2_dqs = layer2.map((a: any) => a.dqs_score_refined || 0);
  const avg_dqs_layer2 = layer2_dqs.length > 0
    ? layer2_dqs.reduce((a: number, b: number) => a + b, 0) / layer2_dqs.length
    : 0;
  const min_dqs_layer2 = layer2_dqs.length > 0 ? Math.min(...layer2_dqs) : 0;
  
  const evidence_grade_count = layer2.filter((a: any) => a.is_evidence_grade).length;
  
  // Source distribution
  const source_distribution: any = {
    google_trends: layer2.filter((a: any) => a.source === 'google_trends').length,
    apify: layer2.filter((a: any) => a.source === 'apify').length,
    bright_data: layer2.filter((a: any) => a.source === 'bright_data').length,
    serpapi: layer2.filter((a: any) => a.source === 'serpapi').length
  };
  
  // Data point coverage
  const data_point_coverage: any = {};
  layer2.forEach((artifact: any) => {
    const point = artifact.normalized_payload?.metadata?.data_point_name;
    if (point) {
      data_point_coverage[point] = (data_point_coverage[point] || 0) + 1;
    }
  });
  
  // Research context
  const default_research_problem = `Analyze brand market position and strategic signals for ${cycle_window} cycle`;
  const default_decision_context = `Strategic planning and tactical execution for upcoming period`;
  
  return {
    brand_id,
    run_id,
    cycle_window,
    
    // Layer 2: Primary signals
    layer2_signals: layer2.map((a: any) => ({
      artifact_id: a.id,
      source: a.source,
      platform: a.platform,
      data_point_name: a.normalized_payload?.metadata?.data_point_name,
      signal_layer: a.signal_layer,
      dqs_score: a.dqs_score_refined,
      is_evidence_grade: a.is_evidence_grade,
      collected_at: a.collected_at,
      normalized_payload: a.normalized_payload
    })),
    layer2_count: layer2.length,
    
    // Layer 1: Stability references
    layer1_references: layer1.map((a: any) => ({
      artifact_id: a.id,
      source: a.source,
      data_point_name: a.normalized_payload?.metadata?.data_point_name,
      dqs_score: a.dqs_score_refined,
      normalized_payload: a.normalized_payload
    })),
    layer1_count: layer1.length,
    
    // Layer 3: Volatility context
    layer3_context: layer3.map((a: any) => ({
      artifact_id: a.id,
      source: a.source,
      data_point_name: a.normalized_payload?.metadata?.data_point_name,
      collected_at: a.collected_at,
      normalized_payload: a.normalized_payload
    })),
    layer3_count: layer3.length,
    layer3_annotation: "CONTEXT_ONLY: Layer 3 signals must NOT trigger standalone insights. Use only as momentum annotation.",
    
    // Metrics
    avg_dqs_layer2,
    min_dqs_layer2,
    evidence_grade_count,
    
    // Distribution
    source_distribution,
    data_point_coverage,
    
    // Context
    research_problem: research_problem || default_research_problem,
    decision_context: decision_context || default_decision_context,
    
    // Status
    payload_status: 'ready',
    assembled_at: new Date().toISOString(),
    assembly_version: 'PH3-PP1',
    artifact_ids: [
      ...layer2.map((a: any) => a.id),
      ...layer1.map((a: any) => a.id),
      ...layer3.map((a: any) => a.id)
    ]
  };
}
