/**
 * Notion Database Inspector - Check database properties and access
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type'
      }
    });
  }

  try {
    const { notion_db_id } = await req.json();
    
    const notionToken = Deno.env.get('NOTION_API_KEY');
    
    if (!notionToken) {
      return new Response(JSON.stringify({ 
        error: 'NOTION_API_KEY not configured in secrets'
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('🔍 Checking database:', notion_db_id);
    
    // Try to retrieve database
    const dbResp = await fetch(`https://api.notion.com/v1/databases/${notion_db_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    const dbData = await dbResp.json();
    
    console.log('Database response status:', dbResp.status);
    console.log('Database response:', JSON.stringify(dbData).slice(0, 500));
    
    if (!dbResp.ok) {
      return new Response(JSON.stringify({
        success: false,
        status: dbResp.status,
        error: dbData,
        suggestion: dbData.code === 'object_not_found' 
          ? 'Database not found or integration not shared. Please share the database with your integration.'
          : 'Check if integration has proper permissions.'
      }, null, 2), {
        status: dbResp.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extract properties
    const properties = dbData.properties || {};
    const propertyNames = Object.keys(properties);
    const titleProperty = Object.entries(properties).find(([_, prop]: [string, any]) => prop.type === 'title');
    
    console.log('✅ Database accessible!');
    console.log('Properties found:', propertyNames);
    console.log('Title property:', titleProperty ? titleProperty[0] : 'NOT FOUND');
    
    return new Response(JSON.stringify({
      success: true,
      database_id: notion_db_id,
      database_title: dbData.title?.[0]?.plain_text || 'Untitled',
      properties: propertyNames,
      title_property: titleProperty ? titleProperty[0] : null,
      property_details: Object.entries(properties).map(([name, prop]: [string, any]) => ({
        name,
        type: prop.type
      })),
      is_shared: true,
      ready_to_publish: !!titleProperty
    }, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    console.error('💥 Error:', err.message);
    return new Response(JSON.stringify({ 
      success: false,
      error: err.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});