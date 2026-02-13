/**
 * Notion Publisher - FINAL VERSION with correct property name
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
    const { asset_ids, notion_db_id } = await req.json();
    
    if (!asset_ids || !Array.isArray(asset_ids)) {
      return new Response(JSON.stringify({ error: 'asset_ids array required' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!notion_db_id) {
      return new Response(JSON.stringify({ error: 'notion_db_id required' }), { 
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const notionToken = Deno.env.get('NOTION_API_KEY')!;
    
    console.log('🚀 Publishing', asset_ids.length, 'assets to database:', notion_db_id);
    
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
        
        // Build Notion payload with LOWERCASE "geovera" property
        const notionPayload = {
          parent: { database_id: notion_db_id },
          properties: {
            geovera: {
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
              type: 'heading_1',
              heading_1: {
                rich_text: [{ text: { content: 'Content' } }]
              }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ text: { content: asset.content_body.slice(0, 2000) } }]
              }
            }
          ]
        };
        
        // Add more content if needed
        if (asset.content_body.length > 2000) {
          const remaining = asset.content_body.slice(2000, 4000);
          notionPayload.children.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: remaining } }]
            }
          });
        }
        
        if (asset.content_body.length > 4000) {
          const remaining2 = asset.content_body.slice(4000, 6000);
          notionPayload.children.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: remaining2 } }]
            }
          });
        }
        
        // Add footer
        notionPayload.children.push(
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
                  content: `GeoVera | Type: ${asset.asset_type} | Confidence: ${asset.confidence} | Evidence: ${asset.evidence_refs?.length || 0} refs`
                }
              }],
              color: 'gray_background'
            }
          }
        );
        
        console.log('📤 Calling Notion API...');
        
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
        console.log('Notion response status:', notionResp.status);
        
        if (!notionResp.ok) {
          console.error('❌ Notion error:', respText.slice(0, 300));
          results.push({ 
            asset_id, 
            success: false, 
            error: respText.slice(0, 200)
          });
          continue;
        }
        
        const notionPage = JSON.parse(respText);
        console.log('✅ Notion page created:', notionPage.id);
        console.log('Notion URL:', notionPage.url);
        
        // Update database
        const { error: updateError } = await supabase
          .from('gv_authority_assets')
          .update({
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', asset_id);
        
        if (updateError) {
          console.warn('⚠️ DB update failed:', updateError);
        } else {
          console.log('✅ DB updated to published status');
        }
        
        results.push({ 
          asset_id, 
          success: true, 
          notion_page_id: notionPage.id,
          notion_url: notionPage.url
        });
        
        // Small delay between requests
        await new Promise(r => setTimeout(r, 1000));
        
      } catch (err) {
        console.error('💥 Error:', asset_id, err.message);
        results.push({ asset_id, success: false, error: err.message });
      }
    }
    
    const summary = {
      status: 'ok',
      published: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
    
    console.log('🎉 DONE! Published:', summary.published, '/ Failed:', summary.failed);
    
    return new Response(JSON.stringify(summary, null, 2), {
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