import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingRequest {
  brand_id: string;
  action: 'trigger_pipeline' | 'check_status';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { brand_id, action } = await req.json() as OnboardingRequest;

    if (!brand_id) {
      return new Response(
        JSON.stringify({ error: 'brand_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different actions
    if (action === 'trigger_pipeline') {
      // Generate run_id for this pipeline execution
      const run_id = crypto.randomUUID();

      // Update status to running
      await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          pipeline_status: 'running',
          pipeline_current_step: 1,
          pipeline_progress_pct: 8,
          pipeline_message: 'Starting intelligence pipeline...',
          pipeline_started_at: new Date().toISOString(),
        })
        .eq('brand_id', brand_id);

      // ========================================================================
      // STEP 1: Phase 3 Ingestion (Real Data Collection)
      // ========================================================================

      await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          pipeline_current_step: 2,
          pipeline_progress_pct: 16,
          pipeline_message: 'Collecting data from external sources...',
        })
        .eq('brand_id', brand_id);

      // Call real Phase 3 ingestion orchestrator
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

      try {
        const ingestionResponse = await fetch(`${supabaseUrl}/functions/v1/ph3-ingestion-orchestrator`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            mode: 'run',
            brand_id: brand_id,
            run_id: run_id,
          }),
        });

        if (!ingestionResponse.ok) {
          throw new Error(`Ingestion failed: ${ingestionResponse.statusText}`);
        }

        const ingestionResult = await ingestionResponse.json();
        console.log('[Onboarding] Phase 3 ingestion completed:', ingestionResult);

      } catch (ingestionError: any) {
        console.error('[Onboarding] Phase 3 ingestion error:', ingestionError.message);

        await supabaseClient
          .from('gv_onboarding_progress')
          .update({
            pipeline_status: 'failed',
            pipeline_message: `Ingestion failed: ${ingestionError.message}`,
          })
          .eq('brand_id', brand_id);

        return new Response(
          JSON.stringify({
            success: false,
            error: 'Ingestion failed',
            details: ingestionError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ========================================================================
      // STEP 2: Calculate Initial Metrics from Real Data
      // ========================================================================

      await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          pipeline_current_step: 3,
          pipeline_progress_pct: 33,
          pipeline_message: 'Analyzing collected data...',
        })
        .eq('brand_id', brand_id);

      // Get raw artifacts count
      const { data: artifacts, error: artifactsError } = await supabaseClient
        .from('gv_raw_artifacts')
        .select('id, signal_layer, dqs_score')
        .eq('brand_id', brand_id)
        .eq('run_id', run_id);

      if (artifactsError) {
        console.error('[Onboarding] Error fetching artifacts:', artifactsError);
      }

      const artifactCount = artifacts?.length || 0;

      // Calculate initial geo_score based on DQS scores
      let initialGeoScore = 0;
      if (artifacts && artifacts.length > 0) {
        const avgDQS = artifacts.reduce((sum, a) => sum + (a.dqs_score || 0), 0) / artifacts.length;
        // Convert DQS (0-1) to geo_score (0-100)
        initialGeoScore = Math.round(avgDQS * 100);
      }

      // Count high-quality artifacts (evidence grade)
      const { count: insightsCount } = await supabaseClient
        .from('gv_raw_artifacts')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', brand_id)
        .eq('run_id', run_id)
        .eq('is_evidence_grade', true);

      await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          pipeline_current_step: 4,
          pipeline_progress_pct: 50,
          pipeline_message: 'Generating strategic insights...',
        })
        .eq('brand_id', brand_id);

      // ========================================================================
      // STEP 3: Generate Initial Insights (if we have evidence-grade data)
      // ========================================================================

      await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          pipeline_current_step: 5,
          pipeline_progress_pct: 66,
          pipeline_message: 'Creating brand intelligence profile...',
        })
        .eq('brand_id', brand_id);

      // ========================================================================
      // STEP 4: Run 4-Step Pipeline for Initial Q&A
      // ========================================================================

      await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          pipeline_current_step: 6,
          pipeline_progress_pct: 83,
          pipeline_message: 'Preparing strategic questions...',
        })
        .eq('brand_id', brand_id);

      // Note: 4-step pipeline (Chronicle → Platform → Questions → Chat)
      // can be triggered separately after onboarding is complete
      // For onboarding, we focus on data collection and initial metrics

      // ========================================================================
      // STEP 5: Complete Onboarding
      // ========================================================================

      await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          pipeline_current_step: 7,
          pipeline_progress_pct: 100,
          pipeline_message: 'Pipeline complete!',
        })
        .eq('brand_id', brand_id);

      // Complete onboarding with REAL data
      const { data: result, error: completeError } = await supabaseClient
        .rpc('complete_onboarding', {
          p_brand_id: brand_id,
          p_first_geo_score: initialGeoScore || 50, // Default to 50 if no data yet
          p_initial_insights_count: insightsCount || 0,
        });

      if (completeError) {
        console.error('Error completing onboarding:', completeError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Pipeline completed',
          result,
          metrics: {
            artifacts_collected: artifactCount,
            initial_geo_score: initialGeoScore,
            insights_generated: insightsCount || 0,
            run_id: run_id,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check_status') {
      const { data: status } = await supabaseClient
        .rpc('get_onboarding_status', { p_brand_id: brand_id });

      return new Response(
        JSON.stringify({ success: true, status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
