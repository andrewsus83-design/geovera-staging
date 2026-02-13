import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface FoundationGateInput {
  brand_id: string;
  run_id: string;
  cycle_window: '7d' | '14d' | '28d';
}

Deno.serve(async (req: Request) => {
  const start_time = Date.now();
  
  try {
    const { brand_id, run_id, cycle_window }: FoundationGateInput = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Load eligible artifacts (Layer 2, eligible for Perplexity)
    const { data: artifacts, error } = await supabase
      .from('gv_normalized_artifacts')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('run_id', run_id)
      .eq('is_eligible_perplexity', true)
      .eq('signal_layer', 2);
    
    if (error) {
      throw new Error(`Failed to load artifacts: ${error.message}`);
    }
    
    const recommendations: string[] = [];
    
    // GATE 1: Artifact Count (minimum 20)
    const artifact_count = artifacts?.length || 0;
    const gate1_passed = artifact_count >= 20;
    if (!gate1_passed) {
      recommendations.push(`Need ${20 - artifact_count} more eligible Layer 2 artifacts`);
    }
    
    // GATE 2: DQS Quality (avg >= 0.7, min >= 0.6)
    const dqs_scores = artifacts?.map(a => a.dqs_score_refined || 0) || [];
    const avg_dqs = dqs_scores.length > 0
      ? dqs_scores.reduce((a, b) => a + b, 0) / dqs_scores.length
      : 0;
    const min_dqs = dqs_scores.length > 0 ? Math.min(...dqs_scores) : 0;
    const gate2_passed = avg_dqs >= 0.7 && min_dqs >= 0.6;
    if (!gate2_passed) {
      recommendations.push(
        `DQS quality insufficient: avg=${avg_dqs.toFixed(2)} (need 0.7), min=${min_dqs.toFixed(2)} (need 0.6)`
      );
    }
    
    // GATE 3: Source Diversity (minimum 2 sources)
    const sources = new Set(artifacts?.map(a => a.source) || []);
    const source_count = sources.size;
    const gate3_passed = source_count >= 2;
    if (!gate3_passed) {
      recommendations.push(
        `Need artifacts from ${2 - source_count} more source(s). Current: ${Array.from(sources).join(', ') || 'none'}`
      );
    }
    
    // GATE 4: Data Point Coverage (minimum 5 strategic data points)
    const data_points = new Set(
      artifacts?.map(a => a.normalized_payload?.metadata?.data_point_name).filter(Boolean) || []
    );
    const coverage_count = data_points.size;
    const gate4_passed = coverage_count >= 5;
    if (!gate4_passed) {
      recommendations.push(`Need ${5 - coverage_count} more strategic data points covered`);
    }
    
    // GATE 5: Temporal Freshness (oldest artifact < 30 days)
    const now = new Date();
    const oldest_artifact = artifacts?.reduce((oldest, current) => {
      const curr_date = new Date(current.collected_at);
      const old_date = new Date(oldest.collected_at);
      return curr_date < old_date ? current : oldest;
    }, artifacts[0]);
    
    const oldest_days = oldest_artifact
      ? Math.floor(
          (now.getTime() - new Date(oldest_artifact.collected_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
    const gate5_passed = oldest_days <= 30;
    if (!gate5_passed) {
      recommendations.push(
        `Oldest artifact is ${oldest_days} days old (max: 30). Consider fresh ingestion.`
      );
    }
    
    // GATE 6: Brand Isolation (all artifacts must belong to same brand)
    const brand_ids = new Set(artifacts?.map(a => a.brand_id) || []);
    const gate6_passed = brand_ids.size === 1 && brand_ids.has(brand_id);
    const violations = gate6_passed ? 0 : brand_ids.size - 1;
    if (!gate6_passed) {
      recommendations.push(
        `CRITICAL: Brand isolation violation detected. Found ${brand_ids.size} brands in run.`
      );
    }
    
    // Calculate final status
    const gates_passed = [
      gate1_passed,
      gate2_passed,
      gate3_passed,
      gate4_passed,
      gate5_passed,
      gate6_passed
    ].filter(Boolean).length;
    
    const gates_failed = 6 - gates_passed;
    const validation_status = gates_passed === 6 ? 'PASS' : 'FAIL';
    const can_proceed_to_ai = validation_status === 'PASS';
    
    // Insert validation record
    const { data: validation, error: insertError } = await supabase
      .from('gv_foundation_validations')
      .insert({
        brand_id,
        run_id,
        validation_status,
        gates_passed,
        gates_failed,
        gate1_artifact_count_passed: gate1_passed,
        gate1_artifact_count: artifact_count,
        gate2_dqs_quality_passed: gate2_passed,
        gate2_avg_dqs: avg_dqs,
        gate2_min_dqs: min_dqs,
        gate3_source_diversity_passed: gate3_passed,
        gate3_source_count: source_count,
        gate4_coverage_passed: gate4_passed,
        gate4_data_points_covered: coverage_count,
        gate5_freshness_passed: gate5_passed,
        gate5_oldest_artifact_days: oldest_days,
        gate6_isolation_passed: gate6_passed,
        gate6_violations: violations,
        eligible_artifact_count: artifact_count,
        can_proceed_to_ai,
        processing_time_ms: Date.now() - start_time,
        recommendations,
        validated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({
          error: 'Validation already exists for this run',
          validation_status: 'BLOCKED'
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw insertError;
    }
    
    // Return validation result
    return new Response(JSON.stringify({
      validation_id: validation.id,
      brand_id,
      run_id,
      validation_status,
      gates_passed,
      gates_failed,
      gate_results: {
        artifact_count: { passed: gate1_passed, value: artifact_count, threshold: 20 },
        dqs_quality: { passed: gate2_passed, avg_dqs, min_threshold: 0.6 },
        source_diversity: { passed: gate3_passed, sources: source_count, min_sources: 2 },
        data_point_coverage: { passed: gate4_passed, points: coverage_count, min_points: 5 },
        temporal_freshness: { passed: gate5_passed, oldest_days, max_days: 30 },
        brand_isolation: { passed: gate6_passed, violations }
      },
      eligible_artifact_count: artifact_count,
      can_proceed_to_ai,
      recommendations,
      processing_time_ms: Date.now() - start_time
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      validation_status: 'FAIL',
      can_proceed_to_ai: false
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
