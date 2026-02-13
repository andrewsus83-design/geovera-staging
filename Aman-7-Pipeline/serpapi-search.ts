import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

/**
 * SerpAPI Integration
 * Google Search scraping for brand visibility analysis
 */

interface SerpAPIRequest {
  brand_id: string
  config_id: string
  search_type: 'organic' | 'news' | 'shopping' | 'images' | 'videos'
  queries: string[]
  location?: string
  language?: string
}

interface SerpAPIResult {
  query: string
  position: number
  title: string
  link: string
  snippet: string
  source?: string
  date?: string
  visibility_score: number
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'POST method required' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload: SerpAPIRequest = await req.json()
    const { brand_id, config_id, search_type, queries, location, language } = payload

    // Get SerpAPI config from Supabase secrets or config
    const serpApiKey = Deno.env.get('SERPAPI_KEY')
    if (!serpApiKey) {
      throw new Error('SERPAPI_KEY not configured in Supabase secrets')
    }

    // Get brand info for tracking
    const { data: brand } = await supabaseClient
      .from('brands')
      .select('name')
      .eq('id', brand_id)
      .single()

    const results = []
    let totalCost = 0

    for (const query of queries) {
      try {
        // Call SerpAPI (using Authorization header instead of URL parameter)
        const serpUrl = new URL('https://serpapi.com/search')
        serpUrl.searchParams.set('q', query)
        serpUrl.searchParams.set('engine', 'google')

        if (search_type === 'news') {
          serpUrl.searchParams.set('tbm', 'nws')
        } else if (search_type === 'shopping') {
          serpUrl.searchParams.set('tbm', 'shop')
        } else if (search_type === 'images') {
          serpUrl.searchParams.set('tbm', 'isch')
        } else if (search_type === 'videos') {
          serpUrl.searchParams.set('tbm', 'vid')
        }

        if (location) serpUrl.searchParams.set('location', location)
        if (language) serpUrl.searchParams.set('hl', language)

        const response = await fetch(serpUrl.toString(), {
          headers: {
            'Authorization': `Bearer ${serpApiKey}`
          }
        })
        const data = await response.json()

        // Parse results based on search type
        let parsedResults: SerpAPIResult[] = []

        if (search_type === 'organic') {
          parsedResults = (data.organic_results || []).map((r: any, idx: number) => ({
            query,
            position: r.position || idx + 1,
            title: r.title,
            link: r.link,
            snippet: r.snippet || '',
            visibility_score: calculateVisibilityScore(r.position || idx + 1),
          }))
        } else if (search_type === 'news') {
          parsedResults = (data.news_results || []).map((r: any, idx: number) => ({
            query,
            position: idx + 1,
            title: r.title,
            link: r.link,
            snippet: r.snippet || '',
            source: r.source,
            date: r.date,
            visibility_score: calculateVisibilityScore(idx + 1),
          }))
        }

        // Check if brand is mentioned in results
        const brandName = brand?.name || ''
        const brandMentions = parsedResults.filter(r => 
          r.title.toLowerCase().includes(brandName.toLowerCase()) ||
          r.snippet.toLowerCase().includes(brandName.toLowerCase())
        )

        // Calculate brand visibility metrics
        const topPosition = brandMentions.length > 0 
          ? Math.min(...brandMentions.map(m => m.position))
          : null

        const avgPosition = brandMentions.length > 0
          ? brandMentions.reduce((sum, m) => sum + m.position, 0) / brandMentions.length
          : null

        const totalVisibilityScore = brandMentions.reduce((sum, m) => sum + m.visibility_score, 0)

        // Store in gv_search_visibility table
        await supabaseClient.from('gv_search_visibility').insert({
          brand_id,
          config_id,
          search_type,
          query,
          location: location || 'US',
          language: language || 'en',
          total_results: parsedResults.length,
          brand_mentions_count: brandMentions.length,
          top_position: topPosition,
          avg_position: avgPosition,
          visibility_score: totalVisibilityScore,
          search_results: parsedResults,
          scraped_at: new Date().toISOString(),
        })

        results.push({
          query,
          total_results: parsedResults.length,
          brand_mentions: brandMentions.length,
          top_position: topPosition,
          avg_position: avgPosition ? Math.round(avgPosition * 10) / 10 : null,
          visibility_score: Math.round(totalVisibilityScore * 10) / 10,
        })

        // SerpAPI costs ~$0.001 per search
        totalCost += 0.001

      } catch (error) {
        console.error(`Error searching for ${query}:`, error)
        results.push({
          query,
          error: error.message,
        })
      }
    }

    // Update config spend
    const { data: config } = await supabaseClient
      .from('gv_brightdata_config')
      .select('current_month_spend_usd')
      .eq('id', config_id)
      .single()

    if (config) {
      await supabaseClient
        .from('gv_brightdata_config')
        .update({
          current_month_spend_usd: (config.current_month_spend_usd || 0) + totalCost,
          last_run_at: new Date().toISOString(),
        })
        .eq('id', config_id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        search_type,
        queries_processed: queries.length,
        total_cost: Math.round(totalCost * 1000) / 1000,
        results,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Calculate visibility score based on search position
// Position 1 = 100, Position 10 = 10, Position 20+ = 1
function calculateVisibilityScore(position: number): number {
  if (position === 1) return 100
  if (position <= 3) return 80 - (position - 1) * 10
  if (position <= 10) return 60 - (position - 4) * 5
  if (position <= 20) return 30 - (position - 11) * 2
  return 1
}