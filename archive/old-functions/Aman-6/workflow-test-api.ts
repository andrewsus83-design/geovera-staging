import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS });
  }

  try {
    const { action = 'full', brand_id } = await req.json().catch(() => ({}));

    if (action === 'health') {
      return new Response(JSON.stringify({ status: 'ok', ts: new Date().toISOString() }), { headers: CORS });
    }

    if (action === 'full') {
      // 1. Brands
      const { data: brands, error: e1 } = await supabase
        .from('brands')
        .select('id,brand_name,category,business_type,description,web_url,logo_url,subscription_tier,onboarding_completed')
        .not('brand_name', 'is', null)
        .order('created_at', { ascending: true })
        .limit(10);

      // 2. Design Tokens
      const { data: tokens, error: e2 } = await supabase
        .from('gv_design_tokens')
        .select('category,token_name,token_value,css_var,usage_notes')
        .eq('is_active', true)
        .order('category')
        .order('token_name');

      // 3. Subscription Tiers
      const { data: tiers, error: e3 } = await supabase
        .from('gv_subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      // 4. Insights
      const { data: insights, error: e4 } = await supabase
        .from('gv_insights')
        .select('id,brand_id,pillar,severity,confidence,title,summary,status,created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      // 5. Tasks
      const { data: tasks, error: e5 } = await supabase
        .from('gv_tasks')
        .select('id,brand_id,title,description,priority,status,category,priority_score,due_window')
        .order('priority_score', { ascending: false, nullsFirst: false })
        .limit(15);

      // 6. Content Assets
      const { data: content, error: e6 } = await supabase
        .from('gv_content_assets')
        .select('id,brand_id,content_type,platform,title,description,storytelling_score,status,is_master,created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // 7. Article Templates
      const { data: templates, error: e7 } = await supabase
        .from('gv_article_templates')
        .select('id,brand_id,template_name,template_slug,description,target_platform,target_word_count,target_tone,is_active')
        .limit(10);

      // 8. Runs
      const { data: runs, error: e8 } = await supabase
        .from('gv_runs')
        .select('id,brand_id,status,run_mode,pipeline_mode,cycle_window,created_at,cost_summary,questions_answered')
        .order('created_at', { ascending: false })
        .limit(10);

      // 9. Pillar Scores
      const { data: pillarScores, error: e9 } = await supabase
        .from('gv_pillar_scores')
        .select('id,brand_id,pillar,score,confidence,created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      // 10. Aggregate counts
      const counts: Record<string, number> = {};
      const tables = ['brands','gv_insights','gv_tasks','gv_content_assets','gv_design_tokens',
        'gv_runs','gv_pillar_scores','gv_raw_artifacts','gv_normalized_artifacts','gv_multi_ai_answers',
        'gv_smart_questions','gv_article_templates','gv_subscription_tiers'];
      for (const t of tables) {
        const { count } = await supabase.from(t).select('id', { count: 'exact', head: true });
        counts[t] = count || 0;
      }

      const errors = [
        e1 && `brands: ${e1.message}`,
        e2 && `tokens: ${e2.message}`,
        e3 && `tiers: ${e3.message}`,
        e4 && `insights: ${e4.message}`,
        e5 && `tasks: ${e5.message}`,
        e6 && `content: ${e6.message}`,
        e7 && `templates: ${e7.message}`,
        e8 && `runs: ${e8.message}`,
        e9 && `pillar: ${e9.message}`,
      ].filter(Boolean);

      return new Response(JSON.stringify({
        success: true,
        ts: new Date().toISOString(),
        counts,
        brands: brands || [],
        tokens: tokens || [],
        tiers: tiers || [],
        insights: insights || [],
        tasks: tasks || [],
        content: content || [],
        templates: templates || [],
        runs: runs || [],
        pillarScores: pillarScores || [],
        errors: errors.length > 0 ? errors : undefined
      }), { headers: CORS });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: CORS });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });
  }
});