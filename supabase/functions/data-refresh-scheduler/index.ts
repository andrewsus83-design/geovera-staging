// Data Refresh Scheduler - 3D/7D/14D/28D Cron
// Manages update windows for all systems (SEO, GEO, SSO)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { window } = await req.json(); // '3d', '7d', '14d', '28d'

    console.log(`[Scheduler] Running ${window} refresh cycle`);

    const results = {
      window,
      started_at: new Date().toISOString(),
      seo: { processed: 0 },
      geo: { processed: 0 },
      sso: { processed: 0 },
      total_cost: 0,
    };

    // SEO Refresh
    if (window === '7d' || window === '14d' || window === '28d') {
      results.seo = await refreshSEO(window);
      results.total_cost += results.seo.cost || 0;
    }

    // GEO Refresh
    if (window === '7d' || window === '14d') {
      results.geo = await refreshGEO(window);
      results.total_cost += results.geo.cost || 0;
    }

    // SSO Refresh
    if (window === '3d') {
      // Only top 100 creators
      results.sso = await refreshSSO('platinum');
      results.total_cost += results.sso.cost || 0;
    } else if (window === '7d') {
      results.sso = await refreshSSO('gold');
      results.total_cost += results.sso.cost || 0;
    } else if (window === '14d') {
      results.sso = await refreshSSO('silver');
      results.total_cost += results.sso.cost || 0;
    } else if (window === '28d') {
      results.sso = await refreshSSO('bronze');
      results.total_cost += results.sso.cost || 0;
    }

    results.completed_at = new Date().toISOString();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function refreshSEO(window: string) {
  // Get all brands
  const { data: brands } = await supabase.from('gv_brands').select('id, category_id');

  if (!brands) return { processed: 0, cost: 0 };

  let processed = 0;
  let cost = 0;

  for (const brand of brands) {
    // Discover new backlinks
    const response = await fetch(`${SUPABASE_URL}/functions/v1/discover-backlinks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        brand_id: brand.id,
        category: brand.category_id,
        tier: 'basic', // Will be filtered by tier limits
      }),
    });

    if (response.ok) {
      const result = await response.json();
      processed++;
      cost += result.cost || 0;
    }
  }

  return { processed, cost };
}

async function refreshGEO(window: string) {
  const { data: brands } = await supabase.from('gv_brands').select('id');

  if (!brands) return { processed: 0, cost: 0 };

  let processed = 0;
  let cost = 0;

  for (const brand of brands) {
    // Get topics to check
    const { data: topics } = await supabase
      .from('gv_geo_citations')
      .select('topic')
      .eq('brand_id', brand.id)
      .order('citation_frequency', { ascending: false })
      .limit(window === '7d' ? 20 : 80); // Top 20 weekly, rest bi-weekly

    if (topics && topics.length > 0) {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/geo-citation-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          brand_id: brand.id,
          topics: topics.map((t) => t.topic),
          tier: 'basic',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        processed++;
        cost += result.cost || 0;
      }
    }
  }

  return { processed, cost };
}

async function refreshSSO(priority: string) {
  const { data: categories } = await supabase.from('gv_sso_categories').select('id');

  if (!categories) return { processed: 0, cost: 0 };

  let processed = 0;
  let cost = 0;

  for (const category of categories) {
    // Process creators based on priority
    const response = await fetch(`${SUPABASE_URL}/functions/v1/sso-queue-processor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        action: 'process_creators',
        category_id: category.id,
        batch_size: priority === 'platinum' ? 100 : 400,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      processed += result.total_processed || 0;
      cost += result.total_cost || 0;
    }
  }

  return { processed, cost };
}
