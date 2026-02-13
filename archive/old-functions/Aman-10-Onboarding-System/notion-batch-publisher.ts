import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  try {
    const { asset_ids, notion_db_id } = await req.json();
    
    if (!asset_ids || !Array.isArray(asset_ids)) {
      return new Response(JSON.stringify({ error: 'asset_ids array required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!notion_db_id) {
      return new Response(JSON.stringify({ error: 'notion_db_id required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const results = [];
    const publishUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/publish-authority-asset`;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('🚀 Publishing', asset_ids.length, 'assets to Notion DB:', notion_db_id);
    
    for (const asset_id of asset_ids) {
      try {
        console.log('📤 Publishing asset:', asset_id);
        
        const response = await fetch(publishUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            asset_id,
            notion_parent: { type: 'database', id: notion_db_id },
            mode: 'publish'
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('✅ Published:', asset_id, '→', result.notion_page_id);
          results.push({ asset_id, success: true, ...result });
        } else {
          console.error('❌ Failed:', asset_id, result);
          results.push({ asset_id, success: false, ...result });
        }
        
        await new Promise(r => setTimeout(r, 500));
        
      } catch (err) {
        console.error('💥 Error:', asset_id, err.message);
        results.push({ asset_id, success: false, error: err.message });
      }
    }
    
    const published = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('📊 Summary: Published', published, '/ Failed', failed);
    
    return new Response(JSON.stringify({
      status: 'ok',
      published,
      failed,
      results
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    return new Response(JSON.stringify({
      status: 'error',
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});