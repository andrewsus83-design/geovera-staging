import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ClassificationInput {
  brand_id: string;
  run_id: string;
  batch_size?: number;
}

interface ClassificationOutput {
  run_id: string;
  brand_id: string;
  total_processed: number;
  layer_distribution: {
    layer_0: number;
    layer_1: number;
    layer_2: number;
    layer_3: number;
  };
  dqs_stats: {
    avg_dqs: number;
    min_dqs: number;
    max_dqs: number;
  };
  eligible_count: number;
  blocked_count: number;
  processing_time_ms: number;
  status: 'completed' | 'failed' | 'partial';
  errors?: string[];
}

Deno.serve(async (req: Request) => {
  const start_time = Date.now();
  
  try {
    // Parse input
    const { brand_id, run_id, batch_size = 100 }: ClassificationInput = await req.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Create classification log entry
    const { data: log, error: logError } = await supabase
      .from('gv_classification_logs')
      .insert({
        brand_id,
        run_id,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (logError) throw new Error(`Failed to create log: ${logError.message}`);
    
    // Load signal layer registry
    const { data: registry, error: regError } = await supabase
      .from('gv_signal_layer_registry')
      .select('data_point_name, signal_layer, impact_level, change_rate');
    
    if (regError || !registry || registry.length === 0) {
      throw new Error('Signal layer registry empty or failed to load');
    }
    
    // Build registry lookup map
    const registryMap = new Map(
      registry.map(r => [r.data_point_name, r])
    );
    
    // Load normalized artifacts
    const { data: artifacts, error: artError } = await supabase
      .from('gv_normalized_artifacts')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('run_id', run_id)
      .eq('hygiene_status', 'clean')
      .limit(batch_size);
    
    if (artError) throw new Error(`Failed to load artifacts: ${artError.message}`);
    if (!artifacts || artifacts.length === 0) {
      throw new Error('No clean artifacts found for classification');
    }
    
    // Process each artifact
    const layer_counts = { layer_0: 0, layer_1: 0, layer_2: 0, layer_3: 0 };
    const dqs_scores: number[] = [];
    let eligible_count = 0;
    let blocked_count = 0;
    const errors: string[] = [];
    
    for (const artifact of artifacts) {
      try {
        // Extract data point name from normalized payload
        const data_point_name = artifact.normalized_payload?.metadata?.data_point_name;
        
        // Lookup in registry
        const registry_entry = data_point_name ? registryMap.get(data_point_name) : null;
        
        if (!registry_entry) {
          errors.push(`Data point '${data_point_name}' not found in registry for artifact ${artifact.id}`);
          continue;
        }
        
        // Assign signal layer
        const signal_layer = registry_entry.signal_layer;
        const impact_level = registry_entry.impact_level;
        const change_rate = registry_entry.change_rate;
        
        // Calculate DQS components (deterministic rules)
        const authenticity = calculateAuthenticity(artifact, signal_layer);
        const consistency = calculateConsistency(change_rate);
        const corroboration = calculateCorroboration(artifact.source_category);
        
        const dqs_score = authenticity * consistency * corroboration;
        
        // Determine eligibility
        let is_eligible_perplexity = false;
        let is_evidence_grade = false;
        
        if (signal_layer === 2 && dqs_score >= 0.8) {
          is_eligible_perplexity = true;
          is_evidence_grade = true;
          eligible_count++;
        } else if (signal_layer === 2 && dqs_score >= 0.6) {
          is_eligible_perplexity = true;
          eligible_count++;
        } else {
          blocked_count++;
        }
        
        // Update artifact
        const { error: updateError } = await supabase
          .from('gv_normalized_artifacts')
          .update({
            signal_layer,
            impact_level,
            change_rate,
            dqs_score_refined: dqs_score,
            dqs_authenticity_r: authenticity,
            dqs_consistency_r: consistency,
            dqs_corroboration_r: corroboration,
            is_eligible_perplexity,
            is_evidence_grade,
            updated_at: new Date().toISOString()
          })
          .eq('id', artifact.id);
        
        if (updateError) {
          errors.push(`Failed to update artifact ${artifact.id}: ${updateError.message}`);
          continue;
        }
        
        // Track metrics
        layer_counts[`layer_${signal_layer}` as keyof typeof layer_counts]++;
        dqs_scores.push(dqs_score);
        
      } catch (err) {
        errors.push(`Error processing artifact ${artifact.id}: ${err.message}`);
      }
    }
    
    // Calculate DQS statistics
    const avg_dqs = dqs_scores.length > 0
      ? dqs_scores.reduce((a, b) => a + b, 0) / dqs_scores.length
      : 0;
    const min_dqs = dqs_scores.length > 0 ? Math.min(...dqs_scores) : 0;
    const max_dqs = dqs_scores.length > 0 ? Math.max(...dqs_scores) : 0;
    
    // Update classification log
    const processing_time_ms = Date.now() - start_time;
    const status = errors.length === 0 ? 'completed' : (errors.length < artifacts.length ? 'partial' : 'failed');
    
    await supabase
      .from('gv_classification_logs')
      .update({
        total_artifacts: artifacts.length,
        layer_0_count: layer_counts.layer_0,
        layer_1_count: layer_counts.layer_1,
        layer_2_count: layer_counts.layer_2,
        layer_3_count: layer_counts.layer_3,
        avg_dqs,
        min_dqs,
        max_dqs,
        eligible_count,
        blocked_count,
        finished_at: new Date().toISOString(),
        duration_ms: processing_time_ms,
        status,
        error_message: errors.length > 0 ? errors.join('; ') : null
      })
      .eq('id', log.id);
    
    // Build response
    const output: ClassificationOutput = {
      run_id,
      brand_id,
      total_processed: artifacts.length,
      layer_distribution: layer_counts,
      dqs_stats: { avg_dqs, min_dqs, max_dqs },
      eligible_count,
      blocked_count,
      processing_time_ms,
      status,
      errors: errors.length > 0 ? errors : undefined
    };
    
    return new Response(JSON.stringify(output), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// DQS Component Calculation Functions (Deterministic)

function calculateAuthenticity(artifact: any, signal_layer: number): number {
  // Layer 0 sources get maximum authenticity
  if (signal_layer === 0) return 1.0;
  
  // Official verified sources
  const source = artifact.source;
  const has_verification = artifact.normalized_payload?.verified === true;
  
  if (has_verification) return 0.9;
  if (['google_trends', 'serpapi'].includes(source)) return 0.85;
  if (source === 'bright_data') return 0.8;
  if (source === 'apify') return 0.75;
  
  return 0.7; // Default
}

function calculateConsistency(change_rate: string): number {
  // Based on data stability
  if (change_rate === 'very_stable') return 1.0;
  if (change_rate === 'slow') return 0.8;
  if (change_rate === 'fast') return 0.5;
  
  return 0.7; // Default
}

function calculateCorroboration(source_category: string): number {
  // Based on source category reliability
  if (source_category === 'trends') return 0.9;
  if (source_category === 'serp') return 0.85;
  if (source_category === 'social') return 0.75;
  if (source_category === 'open_api') return 0.8;
  
  return 0.7; // Default
}
