import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const CATEGORIES = [
  { category: 'FMCG', target: 100 },
  { category: 'Beauty', target: 90 },
  { category: 'F&B', target: 80 },
  { category: 'Motorcycle', target: 70 },
  { category: 'Fashion', target: 70 },
  { category: 'Car', target: 60 },
  { category: 'Hotel/Travel', target: 60 },
  { category: 'Health', target: 50 },
  { category: 'Mom & Baby', target: 50 },
  { category: 'Gadget', target: 40 },
  { category: 'Shoes', target: 40 },
  { category: 'Finance', target: 30 },
  { category: 'Kids', target: 30 },
  { category: 'Real Estate', target: 20 },
  { category: 'Creator Tools', target: 10 },
  { category: 'Watches', target: 10 }
];

serve(async (req) => {
  try {
    const { mode } = await req.json();
    
    console.log('🚀 PHASE 6.1.2: BRAND POPULATION ORCHESTRATOR');
    console.log(`Mode: ${mode || 'full'}`);
    
    const results: any[] = [];
    let totalBrands = 0;
    
    if (mode === 'test') {
      // Test mode: just first 3 categories, 10 brands each
      console.log('🧪 TEST MODE: First 3 categories, 10 brands each');
      
      for (const cat of CATEGORIES.slice(0, 3)) {
        console.log(`🔍 Processing ${cat.category}...`);
        
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/phase61-brand-discovery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: cat.category, count: 10 })
        });
        
        const data = await response.json();
        results.push(data);
        totalBrands += data.inserted || 0;
        
        // Rate limit: 2 seconds between categories
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      // Full mode: all 16 categories
      console.log('⚡ FULL MODE: All 16 categories, 800 brands total');
      
      for (const cat of CATEGORIES) {
        console.log(`🔍 Processing ${cat.category} (${cat.target} brands)...`);
        
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/phase61-brand-discovery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: cat.category, count: cat.target })
        });
        
        const data = await response.json();
        results.push(data);
        totalBrands += data.inserted || 0;
        
        console.log(`✅ ${cat.category}: ${data.inserted}/${cat.target} brands`);
        
        // Rate limit: 3 seconds between categories
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Get final count from database
    const { data: finalCount } = await supabase
      .from('gv_brand_universe')
      .select('id', { count: 'exact', head: true });
    
    const summary = {
      success: true,
      mode: mode || 'full',
      categories_processed: results.length,
      brands_inserted: totalBrands,
      brands_in_database: finalCount || 0,
      results: results
    };
    
    console.log('✅ PHASE 6.1.2 COMPLETE!');
    console.log(`Total brands in database: ${summary.brands_in_database}`);
    
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