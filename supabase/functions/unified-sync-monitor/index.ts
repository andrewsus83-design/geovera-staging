// Unified Sync Monitor - Anti-Redundancy System
// Ensures GEO ↔ SEO ↔ SSO sync with zero duplication

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    console.log('[Sync Monitor] Starting redundancy check');

    const results = {
      checked: 0,
      duplicates_found: 0,
      enrichments_made: 0,
      alerts: [] as string[],
    };

    // Check URL index for duplicates
    results.checked++;
    const urlDuplicates = await checkURLDuplicates();
    results.duplicates_found += urlDuplicates.length;

    if (urlDuplicates.length > 0) {
      results.alerts.push(`Found ${urlDuplicates.length} duplicate URLs across systems`);
      await deduplicateURLs(urlDuplicates);
    }

    // Check research index
    results.checked++;
    const researchDuplicates = await checkResearchDuplicates();
    results.duplicates_found += researchDuplicates.length;

    if (researchDuplicates.length > 0) {
      results.alerts.push(`Found ${researchDuplicates.length} duplicate research operations`);
    }

    // Perform cross-enrichment
    const enriched = await performCrossEnrichment();
    results.enrichments_made = enriched;

    // Check sync health
    const syncHealth = await checkSyncHealth();
    if (!syncHealth.healthy) {
      results.alerts.push(...syncHealth.issues);
    }

    console.log(`[Sync Monitor] Completed. ${results.duplicates_found} duplicates, ${results.enrichments_made} enrichments`);

    return new Response(JSON.stringify({ success: true, ...results }), {
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
// CHECK URL DUPLICATES
// ============================================

async function checkURLDuplicates() {
  // Get all URLs from different systems
  const { data: seoUrls } = await supabase
    .from('gv_backlink_opportunities')
    .select('url, brand_id');

  const { data: ssoUrls } = await supabase.from('gv_sso_sites').select('url, category_id');

  if (!seoUrls || !ssoUrls) return [];

  // Find duplicates
  const duplicates = [];
  const urlMap = new Map();

  seoUrls.forEach((item) => {
    if (!urlMap.has(item.url)) {
      urlMap.set(item.url, []);
    }
    urlMap.get(item.url).push({ system: 'seo', ...item });
  });

  ssoUrls.forEach((item) => {
    if (!urlMap.has(item.url)) {
      urlMap.set(item.url, []);
    }
    urlMap.get(item.url).push({ system: 'sso', ...item });
  });

  urlMap.forEach((items, url) => {
    if (items.length > 1) {
      duplicates.push({ url, instances: items });
    }
  });

  return duplicates;
}

async function deduplicateURLs(duplicates: any[]) {
  for (const dup of duplicates) {
    // Keep in unified index, mark in individual systems
    await supabase.from('gv_unified_url_index').upsert({
      url: dup.url,
      in_seo: dup.instances.some((i: any) => i.system === 'seo'),
      in_geo: false,
      in_sso: dup.instances.some((i: any) => i.system === 'sso'),
      last_synced: new Date().toISOString(),
    });
  }
}

// ============================================
// CHECK RESEARCH DUPLICATES
// ============================================

async function checkResearchDuplicates() {
  // Check if same research performed multiple times
  const { data: research } = await supabase
    .from('gv_unified_research_index')
    .select('research_query, count')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (!research) return [];

  const duplicates = research.filter((r) => r.count > 1);
  return duplicates;
}

// ============================================
// CROSS-ENRICHMENT
// ============================================

async function performCrossEnrichment() {
  let enrichments = 0;

  // GEO → SEO enrichment
  const { data: citations } = await supabase
    .from('gv_geo_citations')
    .select('*')
    .eq('citation_found', true)
    .gte('citation_frequency', 50)
    .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (citations) {
    for (const citation of citations) {
      // Add high-frequency GEO topics as SEO keywords
      const { error } = await supabase.from('gv_seo_keywords').upsert({
        brand_id: citation.brand_id,
        keyword: citation.topic,
        source: 'geo_citation',
        priority: 'high',
      });

      if (!error) enrichments++;
    }
  }

  // SEO → GEO enrichment
  const { data: keywords } = await supabase
    .from('gv_seo_keywords')
    .select('*')
    .gte('search_volume', 1000)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (keywords) {
    for (const keyword of keywords) {
      // Check high-volume SEO keywords in GEO
      const { data: existing } = await supabase
        .from('gv_geo_citations')
        .select('id')
        .eq('brand_id', keyword.brand_id)
        .eq('topic', keyword.keyword)
        .single();

      if (!existing) {
        // Add to GEO tracking
        await supabase.from('gv_geo_citations').insert({
          brand_id: keyword.brand_id,
          topic: keyword.keyword,
          citation_found: false,
          source: 'seo_keyword',
        });

        enrichments++;
      }
    }
  }

  // SSO → SEO enrichment
  const { data: mentions } = await supabase
    .from('gv_sso_mentions')
    .select('*')
    .eq('sentiment', 'positive')
    .gte('reach', 10000)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (mentions) {
    for (const mention of mentions) {
      // High-reach positive mentions → SEO opportunities
      const { data: creator } = await supabase
        .from('gv_sso_creators')
        .select('*')
        .eq('id', mention.creator_id)
        .single();

      if (creator) {
        await supabase.from('gv_backlink_opportunities').upsert({
          brand_id: mention.brand_id,
          platform: creator.platform,
          url: mention.url || creator.profile_url,
          title: `Collaboration with ${creator.name}`,
          opportunity_type: 'influencer_collaboration',
          status: 'pending',
          source: 'sso_mention',
        });

        enrichments++;
      }
    }
  }

  return enrichments;
}

// ============================================
// CHECK SYNC HEALTH
// ============================================

async function checkSyncHealth() {
  const issues = [];

  // Check if GEO-SEO sync is working
  const { data: geoSeoSync } = await supabase
    .from('gv_geo_seo_sync')
    .select('*')
    .gte('synced_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

  if (!geoSeoSync || geoSeoSync.length === 0) {
    issues.push('No GEO-SEO sync events in last hour - check triggers');
  }

  // Check unified indexes are up-to-date
  const { data: urlIndex } = await supabase
    .from('gv_unified_url_index')
    .select('*')
    .lt('last_synced', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (urlIndex && urlIndex.length > 100) {
    issues.push(`${urlIndex.length} URLs not synced in 24h - index may be stale`);
  }

  // Check for sync failures
  const { data: failures } = await supabase
    .from('gv_geo_seo_sync')
    .select('*')
    .eq('status', 'failed')
    .gte('synced_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (failures && failures.length > 0) {
    issues.push(`${failures.length} sync failures in last 24h`);
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
}
