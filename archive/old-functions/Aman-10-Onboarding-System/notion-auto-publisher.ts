/**
 * Notion Publisher - Auto-detect workspace and create pages
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type'
      }
    });
  }

  try {
    const { asset_ids } = await req.json();
    
    if (!asset_ids || !Array.isArray(asset_ids)) {
      return new Response(JSON.stringify({ error: 'asset_ids array required' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const notionToken = Deno.env.get('NOTION_API_KEY')!;
    
    // First, search for accessible pages/databases
    console.log('🔍 Searching for accessible Notion pages...');
    
    const searchResp = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: { property: 'object', value: 'page' },
        page_size: 10
      })
    });
    
    const searchData = await searchResp.json();
    console.log('📄 Search results:', JSON.stringify(searchData).slice(0, 300));
    
    let parentId = null;
    
    if (searchData.results && searchData.results.length > 0) {
      // Use first accessible page as parent
      parentId = searchData.results[0].id;
      console.log('✅ Found accessible page:', parentId);
    } else {
      console.log('⚠️ No accessible pages found - will create without parent');
    }
    
    const results = [];
    
    for (const asset_id of asset_ids) {
      try {
        console.log('📥 Fetching asset:', asset_id);
        
        const { data: asset, error } = await supabase
          .from('gv_authority_assets')
          .select('*')
          .eq('id', asset_id)
          .single();
        
        if (error || !asset) {
          console.error('❌ Asset not found:', asset_id);
          results.push({ asset_id, success: false, error: 'Asset not found' });
          continue;
        }
        
        console.log('✅ Asset found:', asset.title);
        
        // Build Notion payload
        const notionPayload: any = {
          properties: {
            title: {
              title: [{ text: { content: asset.title } }]
            }
          },
          children: [
            {
              object: 'block',
              type: 'callout',
              callout: {
                icon: { emoji: '📘' },
                rich_text: [{
                  type: 'text',
                  text: { content: asset.summary },
                  annotations: { bold: true }
                }]
              }
            },
            {
              object: 'block',
              type: 'divider',
              divider: {}
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ text: { content: asset.content_body.slice(0, 2000) } }]
              }
            },
            {
              object: 'block',
              type: 'divider',
              divider: {}
            },
            {
              object: 'block',
              type: 'callout',
              callout: {
                icon: { emoji: '🤖' },
                rich_text: [{
                  text: {
                    content: `GeoVera | Type: ${asset.asset_type} | Confidence: ${asset.confidence}`
                  }
                }],
                color: 'gray_background'
              }
            }
          ]
        };
        
        // Add parent if found
        if (parentId) {
          notionPayload.parent = { page_id: parentId };
        }
        
        console.log('📤 Creating Notion page...');
        
        const notionResp = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${notionToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notionPayload)
        });
        
        const respText = await notionResp.text();
        
        if (!notionResp.ok) {
          console.error('❌ Notion API error:', respText.slice(0, 300));
          results.push({ 
            asset_id, 
            success: false, 
            error: respText.slice(0, 200)
          });
          continue;
        }
        
        const notionPage = JSON.parse(respText);
        console.log('✅ Page created:', notionPage.id);
        
        // Update DB
        await supabase
          .from('gv_authority_assets')
          .update({
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', asset_id);
        
        console.log('✅ DB updated');
        
        results.push({ 
          asset_id, 
          success: true, 
          notion_page_id: notionPage.id,
          notion_url: notionPage.url
        });
        
      } catch (err) {
        console.error('💥 Error:', asset_id, err.message);
        results.push({ asset_id, success: false, error: err.message });
      }
    }
    
    return new Response(JSON.stringify({
      status: 'ok',
      published: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      accessible_pages: searchData.results?.length || 0,
      results
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error('💥 Fatal:', err.message);
    return new Response(JSON.stringify({ 
      status: 'error',
      error: err.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});