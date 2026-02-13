import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  try {
    const { mode = 'test' } = await req.json();
    
    console.log('🚀 PHASE 6.1.4: MINDSHARE CALCULATION ORCHESTRATOR');
    console.log(`Mode: ${mode}`);
    
    // Get brands
    const { data: brands } = await supabase
      .from('gv_brand_universe')
      .select('id, brand_name, category')
      .eq('status', 'active')
      .order('priority_score', { ascending: false });
    
    console.log(`📊 Processing mindshare for ${brands?.length || 0} brands...`);
    
    const results = [];
    let totalInfluencers = 0;
    
    const brandsToProcess = mode === 'test' ? brands?.slice(0, 3) : brands;
    
    for (const brand of brandsToProcess || []) {
      console.log(`🔍 ${brand.brand_name}...`);
      
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/phase61-mindshare-calculator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brand.id,
          time_window: 30
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        results.push({
          brand: brand.brand_name,
          category: brand.category,
          influencers: data.inserted,
          summary: data.summary
        });
        
        totalInfluencers += data.inserted;
        console.log(`✅ ${brand.brand_name}: ${data.inserted} influencers`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Get final count
    const { count } = await supabase
      .from('gv_mindshare')
      .select('*', { count: 'exact', head: true });
    
    return new Response(JSON.stringify({
      success: true,
      mode: mode,
      brands_processed: brandsToProcess?.length || 0,
      total_influencer_records: totalInfluencers,
      records_in_database: count || 0,
      results: results
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});