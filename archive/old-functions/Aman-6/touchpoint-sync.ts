import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SyncRequest {
  brand_id: string;
  sync_sources?: string[]; // ['social', 'ai', 'chat']
}

serve(async (req: Request) => {
  const startTime = Date.now();

  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, content-type'
        }
      });
    }

    const { brand_id, sync_sources = ['social', 'ai', 'chat'] }: SyncRequest = await req.json();

    if (!brand_id) {
      return new Response(JSON.stringify({ error: 'brand_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: any = {
      social_synced: 0,
      ai_synced: 0,
      chat_synced: 0
    };

    // Sync social mentions as touchpoints
    if (sync_sources.includes('social')) {
      const socialCount = await syncSocialTouchpoints(supabase, brand_id);
      results.social_synced = socialCount;
    }

    // Sync AI mentions as touchpoints
    if (sync_sources.includes('ai')) {
      const aiCount = await syncAITouchpoints(supabase, brand_id);
      results.ai_synced = aiCount;
    }

    // Sync chat sessions as conversions
    if (sync_sources.includes('chat')) {
      const chatCount = await syncChatConversions(supabase, brand_id);
      results.chat_synced = chatCount;
    }

    const processingTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        brand_id,
        synced: results,
        total_touchpoints: results.social_synced + results.ai_synced,
        total_conversions: results.chat_synced,
        processing_time_ms: processingTime
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Touchpoint sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});

async function syncSocialTouchpoints(supabase: any, brandId: string): Promise<number> {
  const { data: mentions } = await supabase
    .from('gv_pulse_signals')
    .select('*')
    .eq('brand_id', brandId)
    .gte('posted_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .order('posted_at', { ascending: false })
    .limit(200);

  if (!mentions || mentions.length === 0) return 0;

  const touchpoints = mentions.map(m => ({
    brand_id: brandId,
    channel: m.platform,
    touchpoint_type: 'mention',
    content_snippet: m.content_text?.substring(0, 500),
    content_hash: hashContent(m.content_text),
    source_url: m.post_url,
    source_platform_id: m.post_id,
    author_username: m.author_username,
    author_platform_id: m.author_username,
    author_influence_score: calculateAuthorInfluence(m),
    topic_tags: m.topics || [],
    mentioned_features: extractFeatures(m.content_text),
    mentioned_competitors: m.mentioned_brands || [],
    sentiment_score: sentimentToScore(m.sentiment),
    engagement_score: m.engagement_rate || 0,
    reach_score: m.author_followers || 0,
    virality_score: m.viral_score || 0,
    occurred_at: m.posted_at
  }));

  const { error } = await supabase
    .from('gv_dark_funnel_touchpoints')
    .upsert(touchpoints, {
      onConflict: 'brand_id,channel,source_platform_id',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('Error syncing social touchpoints:', error);
    return 0;
  }

  return touchpoints.length;
}

async function syncAITouchpoints(supabase: any, brandId: string): Promise<number> {
  const { data: aiMentions } = await supabase
    .from('gv_multi_ai_answers')
    .select('*, gv_question_sets!inner(brand_id, question_text)')
    .eq('gv_question_sets.brand_id', brandId)
    .eq('brand_mentioned', true)
    .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(200);

  if (!aiMentions || aiMentions.length === 0) return 0;

  const touchpoints = aiMentions.map(m => ({
    brand_id: brandId,
    channel: m.model_name,
    touchpoint_type: m.is_recommendation ? 'recommendation' : 'mention',
    content_snippet: m.answer_text?.substring(0, 500),
    content_hash: hashContent(m.answer_text),
    source_platform_id: m.id,
    author_username: m.model_name,
    author_platform_id: m.model_name,
    author_influence_score: getAIPlatformInfluence(m.model_name),
    topic_tags: extractTopics(m.gv_question_sets?.question_text),
    mentioned_features: extractFeatures(m.answer_text),
    mentioned_competitors: m.competitors_mentioned || [],
    sentiment_score: m.sentiment_score || 0.5,
    engagement_score: m.is_recommendation ? 1.0 : 0.5,
    occurred_at: m.created_at
  }));

  const { error } = await supabase
    .from('gv_dark_funnel_touchpoints')
    .upsert(touchpoints, {
      onConflict: 'brand_id,channel,source_platform_id',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('Error syncing AI touchpoints:', error);
    return 0;
  }

  return touchpoints.length;
}

async function syncChatConversions(supabase: any, brandId: string): Promise<number> {
  const { data: chatSessions } = await supabase
    .from('gv_chat_sessions')
    .select('*')
    .eq('brand_id', brandId)
    .eq('lead_captured', true)
    .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('started_at', { ascending: false })
    .limit(100);

  if (!chatSessions || chatSessions.length === 0) return 0;

  const conversions = [];

  for (const session of chatSessions) {
    // Get chat messages for signal extraction
    const { data: messages } = await supabase
      .from('gv_chat_logs')
      .select('user_message')
      .eq('session_id', session.id)
      .limit(10);

    const userMessages = messages?.map(m => m.user_message).filter(Boolean) || [];

    conversions.push({
      brand_id: brandId,
      conversion_type: 'lead',
      conversion_value: 0, // Could be estimated based on average deal size
      user_email: session.user_email,
      session_id: session.id,
      visitor_id: session.id, // Use session as visitor ID
      referrer_url: session.source_url || null,
      landing_page: session.source_url || null,
      first_questions_asked: extractQuestions(userMessages),
      mentioned_keywords: extractKeywords(userMessages.join(' ')),
      pain_points_discussed: extractPainPoints(userMessages.join(' ')),
      features_interested: extractFeatures(userMessages.join(' ')),
      device_type: session.device_type || 'unknown',
      converted_at: session.started_at
    });
  }

  const { error } = await supabase
    .from('gv_conversions')
    .upsert(conversions, {
      onConflict: 'brand_id,session_id',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('Error syncing chat conversions:', error);
    return 0;
  }

  return conversions.length;
}

function hashContent(content: string): string {
  if (!content) return '';
  // Simple hash for deduplication
  let hash = 0;
  for (let i = 0; i < Math.min(content.length, 100); i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function calculateAuthorInfluence(mention: any): number {
  const followers = mention.author_followers || 0;
  const verified = mention.author_verified ? 1.5 : 1.0;
  const engagement = mention.engagement_rate || 0;

  const followerScore = Math.min(50, (followers / 50000) * 50);
  const engagementScore = engagement * 30;
  const verifiedBonus = verified === 1.5 ? 20 : 0;

  return Math.min(100, followerScore + engagementScore + verifiedBonus);
}

function getAIPlatformInfluence(platform: string): number {
  const influence: Record<string, number> = {
    'chatgpt': 95,
    'claude': 92,
    'gemini': 90,
    'perplexity': 88,
    'grok': 85
  };
  return influence[platform.toLowerCase()] || 80;
}

function sentimentToScore(sentiment: string): number {
  const scores: Record<string, number> = {
    'positive': 0.8,
    'neutral': 0.5,
    'negative': -0.5
  };
  return scores[sentiment?.toLowerCase()] || 0.5;
}

function extractTopics(text: string): string[] {
  if (!text) return [];
  // Simple keyword extraction (in production, use NLP)
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4);
  return [...new Set(words)].slice(0, 10);
}

function extractFeatures(text: string): string[] {
  if (!text) return [];
  const featureKeywords = [
    'integration', 'api', 'dashboard', 'analytics', 'reporting',
    'automation', 'workflow', 'notification', 'export', 'import',
    'search', 'filter', 'permission', 'security', 'pricing'
  ];
  
  const lowerText = text.toLowerCase();
  return featureKeywords.filter(kw => lowerText.includes(kw));
}

function extractQuestions(messages: string[]): string[] {
  return messages
    .filter(m => m && m.includes('?'))
    .map(m => m.substring(0, 200))
    .slice(0, 5);
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3);
  
  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }
  
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function extractPainPoints(text: string): string[] {
  const painKeywords = [
    'difficult', 'hard', 'problem', 'issue', 'slow', 'expensive',
    'confusing', 'complex', 'missing', 'lacking', 'need', 'want'
  ];
  
  const lowerText = text.toLowerCase();
  return painKeywords.filter(kw => lowerText.includes(kw));
}
