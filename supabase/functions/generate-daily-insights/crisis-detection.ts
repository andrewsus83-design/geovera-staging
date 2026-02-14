// Crisis detection system

import { CrisisAlert, RadarData, SearchData } from './types.ts';
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export async function detectCrises(
  supabase: SupabaseClient,
  brandId: string,
  radarData: RadarData,
  searchData: SearchData
): Promise<CrisisAlert[]> {
  const crises: CrisisAlert[] = [];

  // Crisis Type 1: Ranking Drop (Severe)
  const rankingCrises = await detectRankingDrop(supabase, brandId, radarData);
  crises.push(...rankingCrises);

  // Crisis Type 2: Competitor Surge
  const competitorCrises = await detectCompetitorSurge(supabase, brandId, radarData);
  crises.push(...competitorCrises);

  // Crisis Type 3: Sentiment Spike
  const sentimentCrises = await detectSentimentSpike(supabase, brandId);
  crises.push(...sentimentCrises);

  // Crisis Type 4: Keyword Ranking Crash
  const keywordCrises = await detectKeywordRankingCrash(searchData);
  crises.push(...keywordCrises);

  return crises;
}

// Detect severe ranking drops in creator mindshare
export async function detectRankingDrop(
  supabase: SupabaseClient,
  brandId: string,
  radarData: RadarData
): Promise<CrisisAlert[]> {
  const crises: CrisisAlert[] = [];

  if (!radarData.creatorRankings || radarData.creatorRankings.length === 0) {
    return crises;
  }

  // Get current and previous rankings
  const latestRanking = radarData.creatorRankings[0];
  const previousRanking = radarData.creatorRankings.find(
    (r) => r.snapshot_date !== latestRanking.snapshot_date
  );

  if (!previousRanking) {
    return crises;
  }

  const rankDrop = latestRanking.rank_position - previousRanking.rank_position;

  // Threshold: Drop of 5+ positions
  if (rankDrop >= 5) {
    crises.push({
      type: 'ranking_crash',
      severity: rankDrop >= 10 ? 'critical' : 'high',
      title: `CRISIS: Mindshare ranking dropped ${rankDrop} positions`,
      description: `Your brand dropped from #${previousRanking.rank_position} to #${latestRanking.rank_position} in creator mindshare. This affects visibility and brand awareness.`,
      detectedAt: new Date(),
      metrics: {
        currentRank: latestRanking.rank_position,
        previousRank: previousRanking.rank_position,
        rankDrop: rankDrop,
        mindsharePercentage: latestRanking.mindshare_percentage,
      },
      recommendedActions: [
        'Identify root cause of ranking drop',
        'Increase content collaborations with top creators',
        'Audit recent brand activities',
        'Review competitor activities',
        'Boost social media presence',
      ],
    });
  }

  return crises;
}

// Detect competitor surge
export async function detectCompetitorSurge(
  supabase: SupabaseClient,
  brandId: string,
  radarData: RadarData
): Promise<CrisisAlert[]> {
  const crises: CrisisAlert[] = [];

  if (!radarData.competitorBrands || radarData.competitorBrands.length === 0) {
    return crises;
  }

  // Check each competitor's growth rate
  for (const competitor of radarData.competitorBrands) {
    // Get competitor's marketshare growth over last 7 days
    const { data: marketshareData } = await supabase
      .from('gv_brand_marketshare')
      .select('*')
      .eq('brand_name', competitor.name)
      .gte('snapshot_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('snapshot_date', { ascending: false });

    if (!marketshareData || marketshareData.length < 2) {
      continue;
    }

    const latestShare = marketshareData[0].marketshare_percentage;
    const previousShare = marketshareData[marketshareData.length - 1].marketshare_percentage;
    const growthRate = ((latestShare - previousShare) / previousShare) * 100;

    // Threshold: 40%+ growth in 7 days
    if (growthRate > 40) {
      crises.push({
        type: 'competitor_surge',
        severity: growthRate > 60 ? 'critical' : 'high',
        title: `CRISIS: Competitor '${competitor.name}' gained ${growthRate.toFixed(1)}% marketshare in 7 days`,
        description: `Rapid competitor growth detected. ${competitor.name} is gaining significant market presence, threatening your competitive position.`,
        detectedAt: new Date(),
        metrics: {
          competitorName: competitor.name,
          competitorId: competitor.id,
          marketshareGrowth: growthRate,
          currentMarketshare: latestShare,
          previousMarketshare: previousShare,
        },
        recommendedActions: [
          `Deep-dive competitor analysis: ${competitor.name}`,
          'Identify competitive gaps in brand strategy',
          'Accelerate content production',
          'Explore counter-partnerships with key creators',
          'Adjust marketing budget allocation',
        ],
      });
    }
  }

  return crises;
}

// Detect sentiment spikes
export async function detectSentimentSpike(
  supabase: SupabaseClient,
  brandId: string
): Promise<CrisisAlert[]> {
  const crises: CrisisAlert[] = [];

  // Get sentiment data for last 48 hours vs previous 48 hours
  const { data: recentContent } = await supabase
    .from('gv_creator_content')
    .select('sentiment_score')
    .contains('brand_mentions', [brandId])
    .gte('posted_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .not('sentiment_score', 'is', null);

  const { data: previousContent } = await supabase
    .from('gv_creator_content')
    .select('sentiment_score')
    .contains('brand_mentions', [brandId])
    .gte('posted_at', new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString())
    .lt('posted_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .not('sentiment_score', 'is', null);

  if (!recentContent || !previousContent || recentContent.length === 0 || previousContent.length === 0) {
    return crises;
  }

  // Calculate average sentiment
  const recentAvg = recentContent.reduce((sum, c) => sum + (c.sentiment_score || 0), 0) / recentContent.length;
  const previousAvg = previousContent.reduce((sum, c) => sum + (c.sentiment_score || 0), 0) / previousContent.length;
  const percentChange = ((recentAvg - previousAvg) / Math.abs(previousAvg)) * 100;

  // Threshold: +/- 30% sentiment change
  if (Math.abs(percentChange) > 30) {
    const direction = percentChange < 0 ? 'negative' : 'positive';

    crises.push({
      type: direction === 'negative' ? 'sentiment_crash' : 'sentiment_surge',
      severity: direction === 'negative' ? 'high' : 'medium',
      title:
        direction === 'negative'
          ? `CRISIS: Brand sentiment dropped ${Math.abs(percentChange).toFixed(1)}% in 48h`
          : `ALERT: Brand sentiment surged +${percentChange.toFixed(1)}% in 48h`,
      description:
        direction === 'negative'
          ? 'Rapid negative sentiment shift detected. Brand perception crisis possible.'
          : 'Positive sentiment spike detected. Capitalize on this momentum immediately.',
      detectedAt: new Date(),
      metrics: {
        currentSentiment: recentAvg,
        previousSentiment: previousAvg,
        percentChange: percentChange,
        mentionCount: recentContent.length,
      },
      recommendedActions:
        direction === 'negative'
          ? [
              'Identify root cause of sentiment shift',
              'Audit recent brand activities for missteps',
              'Prepare crisis communication plan',
              'Engage PR team immediately',
              'Monitor social channels continuously',
            ]
          : [
              'Amplify positive momentum with additional content',
              'Engage with positive commenters',
              'Document success for case studies',
              'Increase ad spend to capitalize on positive sentiment',
            ],
    });
  }

  return crises;
}

// Detect keyword ranking crashes
export async function detectKeywordRankingCrash(searchData: SearchData): Promise<CrisisAlert[]> {
  const crises: CrisisAlert[] = [];

  if (!searchData.keywordPerformance || searchData.keywordPerformance.length === 0) {
    return crises;
  }

  // Check for severe ranking drops
  for (const keyword of searchData.keywordPerformance) {
    // Only check priority keywords
    if (keyword.priority !== 'high') {
      continue;
    }

    // Threshold: -5 positions
    if (keyword.rank_change && keyword.rank_change <= -5) {
      crises.push({
        type: 'ranking_crash',
        severity: keyword.rank_change <= -10 ? 'critical' : 'high',
        title: `CRISIS: Keyword '${keyword.keyword}' dropped ${Math.abs(keyword.rank_change)} positions`,
        description: `Severe ranking drop detected for priority keyword. Algorithm penalty or competitor surge possible.`,
        detectedAt: new Date(),
        metrics: {
          keyword: keyword.keyword,
          currentRank: keyword.rank,
          previousRank: keyword.rank - keyword.rank_change,
          rankDrop: Math.abs(keyword.rank_change),
          searchVolume: keyword.search_volume || 0,
        },
        recommendedActions: [
          'Audit page for technical SEO issues',
          'Check for Google algorithm updates',
          'Analyze competitor changes',
          'Review content quality and relevance',
          'Implement emergency SEO optimization',
        ],
      });
    }
  }

  return crises;
}
