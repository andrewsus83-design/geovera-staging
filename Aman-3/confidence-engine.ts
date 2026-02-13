import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * Confidence Engine
 * Calculates confidence scores for content, insights, and data quality
 * Uses multi-factor scoring: authenticity, consistency, corroboration
 */

interface ConfidenceRequest {
  brand_id: string
  content_id?: string
  run_id?: string
  artifact_ids?: string[]
}

interface ComponentScores {
  authenticity: number      // Source reliability (0-100)
  consistency: number       // Cross-source agreement (0-100)
  corroboration: number    // Multiple source verification (0-100)
  recency: number          // Data freshness (0-100)
  weakest_link: string     // Which component scored lowest
}

interface ConfidenceResult {
  overall_confidence: number  // Final score (0-100)
  component_scores: ComponentScores
  confidence_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  recommendation: string
  factors: string[]
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { brand_id, content_id, run_id, artifact_ids }: ConfidenceRequest = await req.json()

    if (!brand_id) {
      throw new Error('brand_id is required')
    }

    console.log(`🎯 Calculating confidence score for brand: ${brand_id}`)

    // Initialize scores
    let authenticityScore = 0
    let consistencyScore = 0
    let corroborationScore = 0
    let recencyScore = 0
    const factors: string[] = []

    // 1. Get artifacts to analyze
    let artifacts: any[] = []

    if (artifact_ids && artifact_ids.length > 0) {
      const { data } = await supabaseClient
        .from('gv_raw_artifacts')
        .select('*')
        .in('id', artifact_ids)
      artifacts = data || []
    } else if (run_id) {
      const { data } = await supabaseClient
        .from('gv_raw_artifacts')
        .select('*')
        .eq('run_id', run_id)
      artifacts = data || []
    } else {
      throw new Error('Either artifact_ids or run_id is required')
    }

    if (artifacts.length === 0) {
      throw new Error('No artifacts found for analysis')
    }

    // 2. Calculate Authenticity Score (source reliability)
    const platformReliability: Record<string, number> = {
      'instagram': 85,
      'tiktok': 80,
      'youtube': 90,
      'google': 95,
      'web': 70
    }

    const avgAuthenticity = artifacts.reduce((sum, a) => {
      const reliability = platformReliability[a.platform] || 50
      return sum + reliability
    }, 0) / artifacts.length

    authenticityScore = avgAuthenticity
    factors.push(`${artifacts.length} sources analyzed`)

    // 3. Calculate Corroboration Score (multiple sources)
    const uniquePlatforms = new Set(artifacts.map(a => a.platform)).size

    if (uniquePlatforms >= 3) {
      corroborationScore = 90
      factors.push('Strong cross-platform verification')
    } else if (uniquePlatforms === 2) {
      corroborationScore = 70
      factors.push('Moderate cross-platform verification')
    } else {
      corroborationScore = 40
      factors.push('Single platform source (limited verification)')
    }

    // 4. Calculate Consistency Score (data agreement)
    // Check if artifacts have similar engagement patterns
    const engagements = artifacts
      .map(a => a.payload?.engagement_score || a.payload?.likes || 0)
      .filter(e => e > 0)

    if (engagements.length >= 2) {
      const avg = engagements.reduce((a, b) => a + b, 0) / engagements.length
      const variance = engagements.reduce((sum, e) => sum + Math.pow(e - avg, 2), 0) / engagements.length
      const stdDev = Math.sqrt(variance)
      const coefficientOfVariation = stdDev / avg

      if (coefficientOfVariation < 0.3) {
        consistencyScore = 90
        factors.push('Highly consistent engagement patterns')
      } else if (coefficientOfVariation < 0.6) {
        consistencyScore = 70
        factors.push('Moderately consistent engagement patterns')
      } else {
        consistencyScore = 50
        factors.push('Variable engagement patterns')
      }
    } else {
      consistencyScore = 60
      factors.push('Insufficient data for consistency check')
    }

    // 5. Calculate Recency Score (data freshness)
    const now = new Date()
    const artifactAges = artifacts.map(a => {
      const createdAt = new Date(a.created_at)
      const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      return ageHours
    })

    const avgAgeHours = artifactAges.reduce((a, b) => a + b, 0) / artifactAges.length

    if (avgAgeHours < 24) {
      recencyScore = 100
      factors.push('Very recent data (<24h)')
    } else if (avgAgeHours < 72) {
      recencyScore = 85
      factors.push('Recent data (<3 days)')
    } else if (avgAgeHours < 168) {
      recencyScore = 70
      factors.push('Moderately recent data (<1 week)')
    } else {
      recencyScore = 50
      factors.push(`Older data (${Math.floor(avgAgeHours / 24)} days old)`)
    }

    // 6. Calculate Overall Confidence (weighted average)
    const weights = {
      authenticity: 0.25,
      consistency: 0.25,
      corroboration: 0.30,
      recency: 0.20
    }

    const overallConfidence = Math.round(
      authenticityScore * weights.authenticity +
      consistencyScore * weights.consistency +
      corroborationScore * weights.corroboration +
      recencyScore * weights.recency
    )

    // 7. Determine weakest link
    const scores = {
      authenticity: authenticityScore,
      consistency: consistencyScore,
      corroboration: corroborationScore,
      recency: recencyScore
    }
    const weakestLink = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b)[0]

    // 8. Determine confidence level
    let confidenceLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
    let recommendation: string

    if (overallConfidence >= 85) {
      confidenceLevel = 'very_high'
      recommendation = 'Highly reliable data. Safe to use for strategic decisions.'
    } else if (overallConfidence >= 70) {
      confidenceLevel = 'high'
      recommendation = 'Reliable data. Good for most use cases.'
    } else if (overallConfidence >= 55) {
      confidenceLevel = 'medium'
      recommendation = 'Moderate reliability. Consider additional verification.'
    } else if (overallConfidence >= 40) {
      confidenceLevel = 'low'
      recommendation = 'Low reliability. Use with caution or gather more data.'
    } else {
      confidenceLevel = 'very_low'
      recommendation = 'Very low reliability. Do not use for important decisions.'
    }

    const result: ConfidenceResult = {
      overall_confidence: overallConfidence,
      component_scores: {
        authenticity: Math.round(authenticityScore),
        consistency: Math.round(consistencyScore),
        corroboration: Math.round(corroborationScore),
        recency: Math.round(recencyScore),
        weakest_link: weakestLink
      },
      confidence_level: confidenceLevel,
      recommendation,
      factors
    }

    // 9. Optionally save to database
    if (content_id) {
      await supabaseClient
        .from('gv_content_assets')
        .update({
          confidence_score: overallConfidence,
          confidence_details: result.component_scores,
          updated_at: new Date().toISOString()
        })
        .eq('id', content_id)
    }

    console.log(`✅ Confidence score: ${overallConfidence}% (${confidenceLevel})`)

    return new Response(JSON.stringify({
      success: true,
      result,
      metadata: {
        brand_id,
        artifacts_analyzed: artifacts.length,
        unique_platforms: uniquePlatforms
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Confidence engine error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
