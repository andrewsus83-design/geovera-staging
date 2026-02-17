// =====================================================
// REAL-TIME GEO-SEO SYNC EDGE FUNCTION
// Bidirectional enrichment between GEO and SEO
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  sync_id?: string; // Process existing sync event
  sync_direction: 'geo_to_seo' | 'seo_to_geo';
  source_type: string;
  source_id: string;
  brand_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role for full access
    );

    // Parse request
    const { sync_id, sync_direction, source_type, source_id, brand_id }: SyncRequest = await req.json();

    let syncRecord;

    // If sync_id provided, fetch existing sync event
    if (sync_id) {
      const { data, error } = await supabaseClient
        .from('gv_geo_seo_sync')
        .select('*')
        .eq('id', sync_id)
        .single();

      if (error || !data) {
        throw new Error('Sync record not found');
      }

      syncRecord = data;
    } else {
      // Create new sync record
      const { data, error } = await supabaseClient
        .from('gv_geo_seo_sync')
        .insert({
          brand_id,
          sync_direction,
          source_type,
          source_id,
          destination_type: sync_direction === 'geo_to_seo' ? 'keyword' : 'topic',
          sync_action: sync_direction === 'geo_to_seo' ? 'citation_to_keyword' : 'keyword_to_topic',
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) throw error;
      syncRecord = data;
    }

    // Execute sync based on direction
    let enrichmentResults;

    if (syncRecord.sync_direction === 'geo_to_seo') {
      enrichmentResults = await syncGEOtoSEO(supabaseClient, syncRecord);
    } else {
      enrichmentResults = await syncSEOtoGEO(supabaseClient, syncRecord);
    }

    // Update sync record with results
    await supabaseClient
      .from('gv_geo_seo_sync')
      .update({
        enrichment_actions: enrichmentResults.actions,
        enrichment_results: enrichmentResults.results,
        destination_id: enrichmentResults.destination_id,
        status: 'completed',
        synced_at: new Date().toISOString(),
      })
      .eq('id', syncRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncRecord.id,
        enrichment: enrichmentResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in GEO-SEO sync:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// =====================================================
// GEO → SEO SYNC
// =====================================================

async function syncGEOtoSEO(supabase: any, syncRecord: any) {
  const actions: string[] = [];
  const results: any = {};

  // Get GEO citation data
  const { data: citation } = await supabase
    .from('gv_geo_citations')
    .select(`
      *,
      topic:gv_geo_tracked_topics(*),
      ai_engine:gv_geo_ai_engines(*)
    `)
    .eq('id', syncRecord.source_id)
    .single();

  if (!citation) {
    throw new Error('Citation not found');
  }

  const topic = citation.topic.topic;
  const citationFrequency = citation.topic.overall_frequency || 0;

  // Action 1: Add topic as SEO keyword (if doesn't exist)
  actions.push('add_seo_keyword');

  const { data: existingKeyword } = await supabase
    .from('gv_seo_keywords')
    .select('id')
    .eq('brand_id', syncRecord.brand_id)
    .eq('keyword', topic)
    .maybeSingle();

  if (!existingKeyword) {
    const { data: newKeyword, error: keywordError } = await supabase
      .from('gv_seo_keywords')
      .insert({
        brand_id: syncRecord.brand_id,
        keyword: topic,
        source: 'geo_citation',
        priority: citationFrequency >= 70 ? 'high' : citationFrequency >= 40 ? 'medium' : 'low',
        geo_citation_id: citation.id,
        metadata: {
          citation_frequency: citationFrequency,
          ai_engine: citation.ai_engine?.engine_name,
          rank_position: citation.rank_position,
        },
      })
      .select()
      .single();

    if (!keywordError && newKeyword) {
      results.keyword_added = { id: newKeyword.id, keyword: topic };
      results.destination_id = newKeyword.id;
    }
  } else {
    results.keyword_exists = { id: existingKeyword.id, keyword: topic };
    results.destination_id = existingKeyword.id;
  }

  // Action 2: Find backlink opportunities if citation frequency is high
  if (citationFrequency >= 50) {
    actions.push('find_backlink_opportunities');

    // Trigger backlink discovery (call another Edge Function)
    const backlinksResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/discover-backlinks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          brand_id: syncRecord.brand_id,
          topic,
          source: 'geo_sync',
          limit: 10,
        }),
      }
    );

    if (backlinksResponse.ok) {
      const backlinksData = await backlinksResponse.json();
      results.backlinks_found = backlinksData.count || 0;
    }
  }

  // Action 3: Add competitor if rank #1 is identified
  if (citation.rank_one_competitor) {
    actions.push('sync_competitor');

    const { data: competitor } = await supabase
      .from('gv_competitors')
      .upsert({
        brand_id: syncRecord.brand_id,
        competitor_name: citation.rank_one_competitor,
        discovered_from: 'geo_citation',
        topic,
        metadata: {
          geo_rank_position: 1,
          our_rank_position: citation.rank_position,
          ai_engine: citation.ai_engine?.engine_name,
        },
      }, {
        onConflict: 'brand_id,competitor_name',
      })
      .select()
      .single();

    if (competitor) {
      results.competitor_synced = { id: competitor.id, name: citation.rank_one_competitor };
    }
  }

  // Action 4: Auto-generate SEO content if citation frequency is very high
  if (citationFrequency >= 70) {
    actions.push('generate_seo_content');

    // Trigger content generation (call another Edge Function)
    const contentResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/openai-auto-content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          brand_id: syncRecord.brand_id,
          content_type: 'seo_article',
          topic,
          reason: 'high_geo_citation_frequency',
          citation_context: citation.citation_context,
        }),
      }
    );

    if (contentResponse.ok) {
      const contentData = await contentResponse.json();
      results.content_generated = { id: contentData.content_id };
    }
  }

  return {
    actions,
    results,
    destination_id: results.destination_id,
  };
}

// =====================================================
// SEO → GEO SYNC
// =====================================================

async function syncSEOtoGEO(supabase: any, syncRecord: any) {
  const actions: string[] = [];
  const results: any = {};

  // Get SEO keyword data
  const { data: keyword } = await supabase
    .from('gv_seo_keywords')
    .select('*')
    .eq('id', syncRecord.source_id)
    .single();

  if (!keyword) {
    throw new Error('Keyword not found');
  }

  // Action 1: Add to GEO tracked topics (if doesn't exist)
  actions.push('add_geo_topic');

  const { data: existingTopic } = await supabase
    .from('gv_geo_tracked_topics')
    .select('id')
    .eq('brand_id', syncRecord.brand_id)
    .eq('topic', keyword.keyword)
    .maybeSingle();

  if (!existingTopic) {
    // Determine priority based on SEO performance
    let queuePriority = 'bronze';
    if (keyword.rank_position && keyword.rank_position <= 3) {
      queuePriority = 'gold';
    } else if (keyword.rank_position && keyword.rank_position <= 10) {
      queuePriority = 'silver';
    }

    const { data: newTopic, error: topicError } = await supabase
      .from('gv_geo_tracked_topics')
      .insert({
        brand_id: syncRecord.brand_id,
        topic: keyword.keyword,
        queue_priority: queuePriority,
        check_interval_days: queuePriority === 'gold' ? 7 : queuePriority === 'silver' ? 14 : 28,
        next_check_at: new Date(Date.now() + (queuePriority === 'gold' ? 7 : queuePriority === 'silver' ? 14 : 28) * 24 * 60 * 60 * 1000).toISOString(),
        source: 'seo_keyword',
        seo_keyword_id: keyword.id,
      })
      .select()
      .single();

    if (!topicError && newTopic) {
      results.topic_added = { id: newTopic.id, topic: keyword.keyword };
      results.destination_id = newTopic.id;

      // Action 2: Immediately test citations for this new topic
      actions.push('test_citations');

      const citationResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/geo-citation-check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            brand_id: syncRecord.brand_id,
            topic_id: newTopic.id,
            reason: 'seo_keyword_success',
          }),
        }
      );

      if (citationResponse.ok) {
        const citationData = await citationResponse.json();
        results.citations_tested = citationData.checks_completed || 0;
      }
    }
  } else {
    results.topic_exists = { id: existingTopic.id, topic: keyword.keyword };
    results.destination_id = existingTopic.id;
  }

  // Action 3: Update prompt templates with SEO keyword variations
  if (keyword.related_keywords && keyword.related_keywords.length > 0) {
    actions.push('update_prompt_templates');

    await supabase
      .from('gv_geo_prompt_templates')
      .insert({
        brand_id: syncRecord.brand_id,
        topic: keyword.keyword,
        variations: keyword.related_keywords,
        source: 'seo_keyword',
      });

    results.prompt_templates_updated = true;
  }

  return {
    actions,
    results,
    destination_id: results.destination_id,
  };
}
