import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  try {
    // Parse request
    const { asset_ids, notion_db_id } = await req.json();
    
    if (!asset_ids || !Array.isArray(asset_ids)) {
      return new Response(JSON.stringify({ error: 'asset_ids array required' }), { status: 400 });
    }
    
    if (!notion_db_id) {
      return new Response(JSON.stringify({ error: 'notion_db_id required' }), { status: 400 });
    }
    
    const results = [];
    const publishUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/publish-authority-asset`;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Publish each asset
    for (const asset_id of asset_ids) {
      try {
        const response = await fetch(publishUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            asset_id,
            notion_parent: {
              type: 'database',
              id: notion_db_id
            },
            mode: 'publish'
          })
        });
        
        const result = await response.json();
        results.push({
          asset_id,
          success: response.ok,
          ...result
        });
        
      } catch (err) {
        results.push({
          asset_id,
          success: false,
          error: err.message
        });
      }
    }
    
    return new Response(JSON.stringify({
      status: 'ok',
      published: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({
      status: 'error',
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});