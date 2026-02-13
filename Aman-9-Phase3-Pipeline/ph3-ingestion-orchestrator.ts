import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";

// ============================================================================
// PH3 INGESTION ORCHESTRATOR
// TASK-25 Implementation
// ============================================================================
// Purpose: Pull data from 4 external sources and store in gv_raw_artifacts
// Sources: Google Trends, Apify, Bright Data, SERPAPI
// Compliance: Gold Standard SOP v1.0 (LOCKED)
// ============================================================================

interface IngestionRequest {
  mode?: 'run' | 'health' | 'config';
  brand_id?: string;
  run_id?: string;
  sources?: string[]; // Filter specific sources
  force?: boolean; // Ignore frequency policy
}

interface IngestionConfig {
  id: string;
  brand_id: string;
  source: string;
  is_enabled: boolean;
  frequency: string;
  max_items_per_run: number;
  rate_limit_per_hour: number;
  credential_key: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  consecutive_failures: number;
}

interface RawArtifact {
  brand_id: string;
  run_id: string | null;
  source: string;
  platform: string | null;
  source_category: string;
  signal_layer: number;
  impact_level: string;
  change_rate: string;
  raw_payload: Record<string, unknown>;
  payload_hash: string;
  collected_at: string;
  cycle_window: string;
  ingestion_version: string;
  dqs_score: number | null;
  dqs_authenticity: number | null;
  dqs_consistency: number | null;
  dqs_corroboration: number | null;
  is_eligible_perplexity: boolean;
  is_evidence_grade: boolean;
}

// ============================================================================
// Source Adapters (Stub Implementation - Replace with actual API calls)
// ============================================================================

class GoogleTrendsAdapter {
  async fetch(config: IngestionConfig): Promise<any[]> {
    // TODO: Implement actual Google Trends API call
    // For now, return mock data structure
    console.log(`[GoogleTrends] Fetching for brand ${config.brand_id}`);
    
    return [
      {
        keyword: "luxury watches",
        timeframe: "now 7-d",
        interest_over_time: [85, 87, 90, 88, 92],
        related_queries: ["swiss watches", "rolex alternative"],
        rising_queries: ["affordable luxury watches"],
        geo: "US",
      }
    ];
  }
  
  classifySignalLayer(item: any): { layer: number; impact: string; change: string } {
    // Historical trend = L1, Rising demand = L2
    if (item.rising_queries && item.rising_queries.length > 0) {
      return { layer: 2, impact: 'high', change: 'slow' }; // L2: Rising demand
    }
    return { layer: 1, impact: 'low', change: 'very_stable' }; // L1: Historical baseline
  }
}

class ApifyAdapter {
  async fetch(config: IngestionConfig): Promise<any[]> {
    // TODO: Implement actual Apify API call
    console.log(`[Apify] Fetching for brand ${config.brand_id}`);
    
    return [
      {
        platform: "tiktok",
        post_id: "mock_123",
        author: "user123",
        text: "Love this watch! Looks authentic",
        likes: 1500,
        comments: 45,
        shares: 20,
        created_at: new Date().toISOString(),
      }
    ];
  }
  
  classifySignalLayer(item: any): { layer: number; impact: string; change: string } {
    // High engagement velocity = L3, Trust mentions = L2
    if (item.likes > 1000 || item.text.toLowerCase().includes('viral')) {
      return { layer: 3, impact: 'low', change: 'fast' }; // L3: Engagement velocity
    }
    if (item.text.toLowerCase().match(/authentic|fake|real|trust|scam/)) {
      return { layer: 2, impact: 'high', change: 'slow' }; // L2: Trust objections
    }
    return { layer: 3, impact: 'low', change: 'fast' }; // Default L3: Pulse
  }
}

class BrightDataAdapter {
  async fetch(config: IngestionConfig): Promise<any[]> {
    // TODO: Implement actual Bright Data API call
    console.log(`[BrightData] Fetching for brand ${config.brand_id}`);
    
    return [
      {
        platform: "instagram",
        post_id: "mock_456",
        author: "user456",
        text: "Is this genuine or replica?",
        engagement_score: 0.75,
        sentiment: "neutral",
        created_at: new Date().toISOString(),
      }
    ];
  }
  
  classifySignalLayer(item: any): { layer: number; impact: string; change: string } {
    // Trust questions = L2, General sentiment = L3
    if (item.text.toLowerCase().match(/genuine|replica|authentic|original/)) {
      return { layer: 2, impact: 'high', change: 'slow' }; // L2: Trust objections
    }
    return { layer: 3, impact: 'low', change: 'fast' }; // L3: Sentiment pulse
  }
}

class SERPAPIAdapter {
  async fetch(config: IngestionConfig): Promise<any[]> {
    // TODO: Implement actual SERPAPI call
    console.log(`[SERPAPI] Fetching for brand ${config.brand_id}`);
    
    return [
      {
        query: "best luxury watches 2026",
        position: 5,
        domain: "example.com",
        title: "Top 10 Luxury Watches",
        snippet: "Comprehensive guide to luxury timepieces",
        competitors_above: 4,
      }
    ];
  }
  
  classifySignalLayer(item: any): { layer: number; impact: string; change: string } {
    // SERP dominance = L2
    return { layer: 2, impact: 'high', change: 'slow' }; // L2: SERP entity dominance
  }
}

// ============================================================================
// DQS Calculator (Initial Scoring)
// ============================================================================

function calculateInitialDQS(
  source: string,
  layer: number,
  payload: Record<string, unknown>
): {
  dqs_score: number;
  dqs_authenticity: number;
  dqs_consistency: number;
  dqs_corroboration: number;
} {
  // Initial DQS is rough estimate - refined in TASK-26
  
  // Authenticity: Higher for sources with account verification
  const authenticity = source === 'apify' || source === 'bright_data' ? 0.7 : 0.8;
  
  // Consistency: Higher for stable layers (L0, L1)
  const consistency = layer <= 1 ? 0.8 : 0.6;
  
  // Corroboration: Single source = 0.5, will improve with cross-source checks
  const corroboration = 0.5;
  
  // DQS = geometric mean
  const dqs_score = Math.pow(authenticity * consistency * corroboration, 1/3);
  
  return {
    dqs_score: Math.round(dqs_score * 100) / 100,
    dqs_authenticity: authenticity,
    dqs_consistency: consistency,
    dqs_corroboration: corroboration,
  };
}

// ============================================================================
// Hash Generator (Idempotency)
// ============================================================================

async function generatePayloadHash(payload: Record<string, unknown>): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const msgUint8 = new TextEncoder().encode(payloadStr);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req) => {
  // CORS headers
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
    const body: IngestionRequest = await req.json();
    const { mode = 'run', brand_id, run_id, sources, force = false } = body;

    // ========================================================================
    // MODE: Health Check
    // ========================================================================
    if (mode === 'health') {
      return new Response(JSON.stringify({
        status: 'ok',
        function: 'ph3-ingestion-orchestrator',
        version: 'PH3-T01-v1.0',
        sources_available: ['google_trends', 'apify', 'bright_data', 'serpapi'],
        compliance: 'Gold Standard SOP v1.0 (LOCKED)',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================================================
    // MODE: Config Check
    // ========================================================================
    if (mode === 'config') {
      const { data: configs, error } = await supabase
        .from('gv_ingestion_config')
        .select('*')
        .order('brand_id, source');

      if (error) throw error;

      return new Response(JSON.stringify({
        total_configs: configs?.length || 0,
        configs,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========================================================================
    // MODE: Run Ingestion
    // ========================================================================
    
    if (!brand_id) {
      return new Response(JSON.stringify({
        error: 'brand_id required for ingestion',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch ingestion configs
    let query = supabase
      .from('gv_ingestion_config')
      .select('*')
      .eq('brand_id', brand_id)
      .eq('is_enabled', true);

    if (sources && sources.length > 0) {
      query = query.in('source', sources);
    }

    const { data: configs, error: configError } = await query;

    if (configError) throw configError;
    if (!configs || configs.length === 0) {
      return new Response(JSON.stringify({
        message: 'No enabled sources found for this brand',
        brand_id,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize adapters
    const adapters = {
      google_trends: new GoogleTrendsAdapter(),
      apify: new ApifyAdapter(),
      bright_data: new BrightDataAdapter(),
      serpapi: new SERPAPIAdapter(),
    };

    const results = [];

    // Process each source
    for (const config of configs as IngestionConfig[]) {
      const logId = crypto.randomUUID();
      const startTime = Date.now();

      try {
        console.log(`[${config.source}] Starting ingestion...`);

        // Fetch data from source
        const adapter = adapters[config.source as keyof typeof adapters];
        if (!adapter) {
          throw new Error(`No adapter for source: ${config.source}`);
        }

        const items = await adapter.fetch(config);
        console.log(`[${config.source}] Fetched ${items.length} items`);

        const artifacts: RawArtifact[] = [];
        let skipped = 0;

        // Transform each item to raw artifact
        for (const item of items) {
          // Classify signal layer
          const classification = adapter.classifySignalLayer(item);

          // Calculate initial DQS
          const dqs = calculateInitialDQS(
            config.source,
            classification.layer,
            item
          );

          // Generate payload hash for idempotency
          const payload_hash = await generatePayloadHash(item);

          // Determine source category
          const source_category = config.source === 'google_trends' ? 'trends'
            : config.source === 'serpapi' ? 'serp'
            : config.source === 'apify' || config.source === 'bright_data' ? 'social'
            : 'open_api';

          // Determine platform
          const platform = item.platform || 
            (config.source === 'google_trends' ? 'google' : 
             config.source === 'serpapi' ? 'google' : null);

          const artifact: RawArtifact = {
            brand_id: config.brand_id,
            run_id: run_id || null,
            source: config.source,
            platform,
            source_category,
            signal_layer: classification.layer,
            impact_level: classification.impact,
            change_rate: classification.change,
            raw_payload: item,
            payload_hash,
            collected_at: new Date().toISOString(),
            cycle_window: '7d', // Default, can be parameterized
            ingestion_version: 'PH3',
            dqs_score: dqs.dqs_score,
            dqs_authenticity: dqs.dqs_authenticity,
            dqs_consistency: dqs.dqs_consistency,
            dqs_corroboration: dqs.dqs_corroboration,
            is_eligible_perplexity: dqs.dqs_score >= 0.6,
            is_evidence_grade: dqs.dqs_score >= 0.8,
          };

          artifacts.push(artifact);
        }

        // Bulk insert with conflict handling (idempotency)
        const { data: inserted, error: insertError } = await supabase
          .from('gv_raw_artifacts')
          .insert(artifacts)
          .select('id');

        if (insertError) {
          // Check if it's duplicate error (idempotency guard triggered)
          if (insertError.code === '23505') {
            skipped = artifacts.length;
            console.log(`[${config.source}] All items skipped (duplicates)`);
          } else {
            throw insertError;
          }
        }

        const ingested = inserted?.length || 0;

        // Log ingestion
        await supabase.from('gv_ingestion_logs').insert({
          brand_id: config.brand_id,
          run_id: run_id || null,
          source: config.source,
          status: 'success',
          items_ingested: ingested,
          items_skipped: skipped,
          items_failed: 0,
          retry_count: 0,
          started_at: new Date(startTime).toISOString(),
          finished_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
          api_calls_made: 1,
          estimated_cost: 0, // TODO: Calculate based on source
        });

        // Update config last_success_at
        await supabase
          .from('gv_ingestion_config')
          .update({ 
            last_success_at: new Date().toISOString(),
            consecutive_failures: 0,
          })
          .eq('id', config.id);

        results.push({
          source: config.source,
          status: 'success',
          ingested,
          skipped,
        });

      } catch (error: any) {
        console.error(`[${config.source}] Error:`, error.message);

        // Log failure
        await supabase.from('gv_ingestion_logs').insert({
          brand_id: config.brand_id,
          run_id: run_id || null,
          source: config.source,
          status: 'failed',
          items_ingested: 0,
          items_skipped: 0,
          items_failed: 0,
          retry_count: 0,
          error_code: error.code || 'UNKNOWN',
          error_message: error.message,
          started_at: new Date(startTime).toISOString(),
          finished_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        });

        // Update config consecutive failures
        await supabase
          .from('gv_ingestion_config')
          .update({ 
            last_failure_at: new Date().toISOString(),
            consecutive_failures: config.consecutive_failures + 1,
          })
          .eq('id', config.id);

        results.push({
          source: config.source,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return new Response(JSON.stringify({
      brand_id,
      run_id,
      sources_processed: results.length,
      results,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Ingestion orchestrator error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
