// Data collection from all sources

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { RadarData, SearchData, HubData, ChatData } from './types.ts';

export async function fetchRadarData(
  supabase: SupabaseClient,
  brandId: string,
  days: number = 7
): Promise<RadarData> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch creator rankings
  const { data: creatorRankings } = await supabase
    .from('gv_creator_rankings')
    .select('*')
    .eq('brand_id', brandId)
    .gte('snapshot_date', startDate)
    .order('snapshot_date', { ascending: false });

  // Fetch brand marketshare
  const { data: brandData } = await supabase.from('gv_brands').select('category').eq('id', brandId).single();

  const { data: brandMarketshare } = await supabase
    .from('gv_brand_marketshare')
    .select('*')
    .eq('category', brandData?.category || '')
    .gte('snapshot_date', startDate);

  // Fetch active trends
  const { data: activeTrends } = await supabase
    .from('gv_trends')
    .select('*')
    .eq('category', brandData?.category || '')
    .in('status', ['rising', 'peak'])
    .gte('first_detected_at', startDate);

  // Fetch top creator content
  const { data: topCreatorContent } = await supabase
    .from('gv_creator_content')
    .select('*')
    .contains('brand_mentions', [brandId])
    .gte('posted_at', startDate)
    .order('engagement_total', { ascending: false })
    .limit(50);

  // Fetch competitor brands
  const { data: competitorBrands } = await supabase
    .from('gv_discovered_brands')
    .select('*')
    .eq('brand_id', brandId)
    .eq('is_competitor', true);

  return {
    creatorRankings: creatorRankings || [],
    brandMarketshare: brandMarketshare || [],
    activeTrends: activeTrends || [],
    topCreatorContent: topCreatorContent || [],
    competitorBrands: competitorBrands || [],
  };
}

export async function fetchSearchData(
  supabase: SupabaseClient,
  brandId: string,
  days: number = 7
): Promise<SearchData> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch keyword performance
  const { data: keywords } = await supabase.from('gv_keywords').select('*').eq('brand_id', brandId);

  const keywordPerformance = [];
  if (keywords) {
    for (const keyword of keywords) {
      const { data: history } = await supabase
        .from('gv_keyword_history')
        .select('*')
        .eq('keyword_id', keyword.id)
        .gte('tracked_date', startDate)
        .order('tracked_date', { ascending: false })
        .limit(2);

      if (history && history.length > 0) {
        const latest = history[0];
        const previous = history[1];
        keywordPerformance.push({
          ...keyword,
          rank: latest.rank,
          rank_change: previous ? latest.rank - previous.rank : 0,
          trend: latest.trend,
        });
      }
    }
  }

  // Fetch GEO scores
  const { data: geoScores } = await supabase
    .from('gv_geo_scores')
    .select('*')
    .eq('brand_id', brandId)
    .gte('tracked_date', startDate);

  // Fetch search results
  const { data: searchResults } = await supabase
    .from('gv_search_results')
    .select('*')
    .eq('brand_id', brandId)
    .gte('search_date', startDate);

  // Fetch competitors
  const { data: competitors } = await supabase
    .from('gv_competitors')
    .select('*')
    .eq('brand_id', brandId)
    .eq('active', true);

  return {
    keywordPerformance: keywordPerformance || [],
    geoScores: geoScores || [],
    searchResults: searchResults || [],
    competitors: competitors || [],
  };
}

export async function fetchHubData(
  supabase: SupabaseClient,
  brandId: string,
  days: number = 7
): Promise<HubData> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch published articles
  const { data: articles } = await supabase
    .from('gv_hub_articles')
    .select('*')
    .eq('brand_id', brandId)
    .gte('published_at', startDate)
    .order('view_count', { ascending: false });

  // Fetch article analytics
  const { data: analytics } = await supabase
    .from('gv_hub_analytics')
    .select('article_id, count(*) as views, avg(time_on_page) as avg_time')
    .eq('event_type', 'view')
    .gte('event_timestamp', startDate)
    .group('article_id');

  // Fetch pending articles
  const { data: pendingArticles } = await supabase
    .from('gv_hub_generation_queue')
    .select('*')
    .eq('brand_id', brandId)
    .eq('status', 'pending');

  // Get daily quota
  const { data: quotaData } = await supabase.rpc('get_hub_daily_quota', { p_brand_id: brandId });

  return {
    articles: articles || [],
    analytics: analytics || [],
    pendingArticles: pendingArticles || [],
    quota: quotaData || { remaining_quota: 0 },
  };
}

export async function fetchChatData(
  supabase: SupabaseClient,
  brandId: string,
  days: number = 7
): Promise<ChatData> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch recent conversations
  const { data: conversations } = await supabase
    .from('gv_ai_conversations')
    .select('*')
    .eq('brand_id', brandId)
    .gte('created_at', startDate)
    .order('created_at', { ascending: false });

  // Fetch AI insights
  const { data: insights } = await supabase
    .from('gv_ai_insights')
    .select('*')
    .eq('brand_id', brandId)
    .eq('action_taken', false)
    .gte('discovered_at', startDate)
    .order('priority', { ascending: false });

  // Fetch daily briefs
  const { data: briefs } = await supabase
    .from('gv_daily_briefs')
    .select('*')
    .eq('brand_id', brandId)
    .gte('brief_date', startDate);

  return {
    conversations: conversations || [],
    insights: insights || [],
    briefs: briefs || [],
  };
}
