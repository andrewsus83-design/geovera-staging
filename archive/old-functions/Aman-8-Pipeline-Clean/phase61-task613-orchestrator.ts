import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const CATEGORIES = [
  'FMCG', 'Beauty', 'F&B', 'Motorcycle', 'Fashion', 'Car',
  'Hotel/Travel', 'Health', 'Mom & Baby', 'Gadget', 'Shoes',
  'Finance', 'Kids', 'Real Estate', 'Creator Tools', 'Watches'
];

const TIERS = [
  { name: 'mega', per_category: 5 },    // 5 per category for demo
  { name: 'macro', per_category: 10 },  // 10 per category for demo
  { name: 'micro', per_category: 15 }   // 15 per category for demo
];

const PLATFORMS = ['instagram', 'tiktok'];

serve(async (req) => {
  try {
    const { mode } = await req.json();
    
    console.log('🚀 PHASE 6.1.3: CREATOR DISCOVERY ORCHESTRATOR');
    console.log(`Mode: ${mode || 'sample'}`);
    
    const results: any[] = [];
    let totalCreators = 0;
    
    if (mode === 'test') {
      // Test mode: 3 categories, 1 tier, 1 platform
      console.log('🧪 TEST MODE: Beauty category, micro tier, Instagram only');
      
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/phase61-creator-discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Beauty',
          tier: 'micro',
          platform: 'instagram',
          limit: 10
        })
      });
      
      const data = await response.json();
      results.push(data);
      totalCreators += data.inserted || 0;
      
    } else {
      // Sample mode: All 16 categories, 3 tiers, 2 platforms
      console.log('⚡ SAMPLE MODE: All categories, all tiers, both platforms');
      
      for (const category of CATEGORIES) {
        for (const tier of TIERS) {
          for (const platform of PLATFORMS) {
            console.log(`🔍 ${category} - ${tier.name} - ${platform}...`);
            
            const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/phase61-creator-discovery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                category: category,
                tier: tier.name,
                platform: platform,
                limit: tier.per_category
              })
            });
            
            const data = await response.json();
            results.push({
              category: category,
              tier: tier.name,
              platform: platform,
              inserted: data.inserted || 0
            });
            
            totalCreators += data.inserted || 0;
            
            console.log(`✅ ${category}/${tier.name}/${platform}: ${data.inserted} creators`);
            
            // Rate limit: 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }
    
    // Calculate rankings
    console.log('📊 Calculating rankings...');
    
    const today = new Date().toISOString().split('T')[0];
    const { data: rankingData } = await supabase.rpc('calculate_creator_rankings', {
      snapshot_date: today
    });
    
    // Get final count
    const { data: finalCount } = await supabase
      .from('gv_creator_leaderboards')
      .select('id', { count: 'exact', head: true });
    
    const summary = {
      success: true,
      mode: mode || 'sample',
      categories_processed: mode === 'test' ? 1 : CATEGORIES.length,
      creators_inserted: totalCreators,
      creators_in_database: finalCount || 0,
      rankings_calculated: rankingData ? true : false,
      breakdown: results
    };
    
    console.log('✅ PHASE 6.1.3 COMPLETE!');
    console.log(`Total creators in database: ${summary.creators_in_database}`);
    
    return new Response(JSON.stringify(summary, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});