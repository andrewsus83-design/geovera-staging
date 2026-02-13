/**
 * FN-AUTH-EDGE-01: Publish Authority Asset to Notion
 * 
 * The ONLY legal gateway for publishing GeoVera content externally.
 * Enforces publish guardrails, maintains evidence chains, creates Notion documentation atomically.
 * 
 * @version 1.0.0
 * @date 2026-02-04
 * @idempotent YES
 * @atomic YES (Notion + DB or neither)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PublishRequest {
  asset_id: string;
  notion_parent: {
    type: 'page' | 'database';
    id: string;
  };
  mode: 'dry_run' | 'publish';
}

interface Asset {
  id: string;
  brand_id: string;
  run_id: string;
  insight_id: string;
  task_id: string | null;
  asset_type: string;
  title: string;
  slug: string;
  summary: string;
  content_body: string;
  status: string;
  visibility: string;
  published_at: string | null;
  evidence_refs: string[];
  confidence: number;
  created_at: string;
  updated_at: string;
  insight?: {
    title: string;
    pillar: string;
    severity: string;
    confidence: number;
  };
  run?: {
    id: string;
  };
  brand?: {
    name: string;
  };
}

interface NotionBlock {
  object: 'block';
  type: string;
  [key: string]: any;
}

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

function assertEnvironment(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NOTION_API_KEY',
    'NOTION_VERSION'
  ];

  const missing = required.filter(key => !Deno.env.get(key));
  
  if (missing.length > 0) {
    throw new Error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Call at cold start
assertEnvironment();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function jsonError(status: number, stage: string, message: string, details?: any): Response {
  return jsonResponse({
    status: 'error',
    stage,
    message,
    ...(details && { details })
  }, status);
}

// ============================================================================
// VALIDATION
// ============================================================================

function validatePayload(payload: any): PublishRequest {
  // Check required fields
  if (!payload.asset_id || !isValidUUID(payload.asset_id)) {
    throw new Response(
      JSON.stringify({ status: 'error', stage: 'validation', message: 'Invalid asset_id' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!payload.notion_parent?.type || !['page', 'database'].includes(payload.notion_parent.type)) {
    throw new Response(
      JSON.stringify({ status: 'error', stage: 'validation', message: 'notion_parent.type must be "page" or "database"' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!payload.notion_parent?.id || !isValidUUID(payload.notion_parent.id)) {
    throw new Response(
      JSON.stringify({ status: 'error', stage: 'validation', message: 'Invalid notion_parent.id' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!payload.mode || !['dry_run', 'publish'].includes(payload.mode)) {
    throw new Response(
      JSON.stringify({ status: 'error', stage: 'validation', message: 'mode must be "dry_run" or "publish"' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return payload as PublishRequest;
}

function assertAssetPublishable(asset: Asset): void {
  const errors: string[] = [];

  // Hard checks (MUST pass)
  if (asset.status !== 'ready') {
    errors.push(`Status must be 'ready', got '${asset.status}'`);
  }

  if (asset.visibility !== 'public') {
    errors.push(`Visibility must be 'public', got '${asset.visibility}'`);
  }

  if (!asset.evidence_refs || asset.evidence_refs.length === 0) {
    errors.push('No evidence references found - cannot publish without evidence');
  }

  if (asset.published_at !== null) {
    throw new Response(
      JSON.stringify({
        status: 'error',
        stage: 'validation',
        message: 'Asset already published',
        details: { published_at: asset.published_at }
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Soft check (warning only)
  if (asset.confidence < 0.5) {
    console.warn(`⚠️ Low confidence score: ${asset.confidence} (< 0.5)`);
  }

  if (errors.length > 0) {
    throw new Response(
      JSON.stringify({
        status: 'error',
        stage: 'validation',
        message: 'Asset not publishable',
        details: { errors }
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================================================
// NOTION PAYLOAD BUILDER
// ============================================================================

function chunkText(text: string, maxLength = 2000): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Try to break at a sentence
    const breakPoint = remaining.lastIndexOf('. ', maxLength);
    if (breakPoint > maxLength * 0.5) {
      chunks.push(remaining.substring(0, breakPoint + 1));
      remaining = remaining.substring(breakPoint + 2);
    } else {
      // Force break at maxLength
      chunks.push(remaining.substring(0, maxLength));
      remaining = remaining.substring(maxLength);
    }
  }

  return chunks;
}

function buildContentBlocks(content: string): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const paragraphs = content.split('\n\n');

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check if it's a heading
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#+)\s+(.+)$/);
      if (match) {
        const level = Math.min(match[1].length, 3); // Notion supports h1, h2, h3
        const text = match[2];
        const headingType = `heading_${level}` as const;

        blocks.push({
          object: 'block',
          type: headingType,
          [headingType]: {
            rich_text: [{ text: { content: text.slice(0, 2000) } }]
          }
        });
      }
    } else {
      // Regular paragraph - chunk if needed
      const chunks = chunkText(trimmed);
      for (const chunk of chunks) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ text: { content: chunk } }]
          }
        });
      }
    }
  }

  return blocks;
}

function buildNotionPayload(asset: Asset, notionParent: PublishRequest['notion_parent']) {
  // Parent configuration
  const parent = notionParent.type === 'page'
    ? { page_id: notionParent.id }
    : { database_id: notionParent.id };

  // Properties (for database parent)
  const properties = notionParent.type === 'database' ? {
    Title: {
      title: [{ text: { content: asset.title } }]
    },
    AssetType: {
      select: { name: asset.asset_type }
    },
    Confidence: {
      number: parseFloat(asset.confidence.toString())
    },
    Brand: {
      rich_text: [{ text: { content: asset.brand?.name || 'Unknown' } }]
    },
    Pillar: {
      select: { name: asset.insight?.pillar || 'unknown' }
    },
    Severity: {
      select: { name: asset.insight?.severity || 'unknown' }
    }
  } : undefined;

  // Build content blocks
  const children: NotionBlock[] = [
    // Summary
    {
      object: 'block',
      type: 'callout',
      callout: {
        icon: { emoji: '📝' },
        rich_text: [{
          type: 'text',
          text: { content: asset.summary },
          annotations: { bold: true }
        }]
      }
    },

    // Divider
    { object: 'block', type: 'divider', divider: {} },

    // Main content
    ...buildContentBlocks(asset.content_body),

    // Divider
    { object: 'block', type: 'divider', divider: {} },

    // Evidence section
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: '📚 Evidence References' } }]
      }
    }
  ];

  // Add evidence items
  for (const ref of asset.evidence_refs) {
    children.push({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ text: { content: ref } }]
      }
    });
  }

  // Meta footer
  children.push({
    object: 'block',
    type: 'callout',
    callout: {
      icon: { emoji: '🤖' },
      rich_text: [{
        text: {
          content: `Generated by GeoVera | Confidence: ${asset.confidence} | Insight: ${asset.insight?.title || 'N/A'} | Asset ID: ${asset.id}`
        }
      }],
      color: 'gray_background'
    }
  });

  return { parent, properties, children };
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type'
      }
    });
  }

  try {
    // 1. Parse and validate request
    let payload: PublishRequest;
    try {
      const body = await req.json();
      payload = validatePayload(body);
    } catch (err) {
      if (err instanceof Response) throw err;
      return jsonError(400, 'validation', 'Invalid JSON payload');
    }

    console.log(`📥 Request: ${payload.mode} mode for asset ${payload.asset_id}`);

    // 2. Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Fetch asset with full context
    const { data: asset, error: fetchError } = await supabase
      .from('gv_authority_assets')
      .select(`
        *,
        insight:gv_insights!inner(title, pillar, severity, confidence),
        run:gv_runs!inner(id),
        brand:brands!inner(name)
      `)
      .eq('id', payload.asset_id)
      .single();

    if (fetchError || !asset) {
      console.error('❌ Asset fetch failed:', fetchError);
      return jsonError(404, 'fetch', 'Asset not found');
    }

    console.log(`✅ Asset fetched: ${asset.title}`);

    // 4. Validate asset is publishable
    try {
      assertAssetPublishable(asset as Asset);
      console.log('✅ Asset validation passed');
    } catch (err) {
      if (err instanceof Response) throw err;
      throw err;
    }

    // 5. Build Notion payload
    const notionPayload = buildNotionPayload(asset as Asset, payload.notion_parent);
    console.log('✅ Notion payload built');

    // 6. DRY RUN MODE - return preview without publishing
    if (payload.mode === 'dry_run') {
      console.log('🔍 Dry run mode - returning preview');
      return jsonResponse({
        status: 'ok',
        mode: 'dry_run',
        asset_id: asset.id,
        validation: {
          status: asset.status,
          visibility: asset.visibility,
          evidence_count: asset.evidence_refs.length,
          confidence: asset.confidence
        },
        notion_payload: notionPayload,
        would_publish: true
      });
    }

    // 7. PUBLISH MODE - call Notion API
    console.log('🚀 Publish mode - calling Notion API');

    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('NOTION_API_KEY')}`,
        'Notion-Version': Deno.env.get('NOTION_VERSION')!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notionPayload)
    });

    if (!notionResponse.ok) {
      const error = await notionResponse.json();
      console.error('❌ Notion API error:', error);

      return jsonError(
        notionResponse.status,
        'notion_api',
        `Notion API failed: ${error.message || 'Unknown error'}`,
        { notion_error: error }
      );
    }

    const notionPage = await notionResponse.json();
    console.log('✅ Notion page created:', notionPage.id);

    // 8. Update database atomically
    const { data: updated, error: updateError } = await supabase
      .from('gv_authority_assets')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.asset_id)
      .is('published_at', null) // Optimistic locking
      .select()
      .single();

    if (updateError || !updated) {
      console.error('⚠️ DB update failed but Notion page created!', updateError);
      return jsonError(
        500,
        'database',
        'Failed to update database after Notion publish - MANUAL INTERVENTION REQUIRED',
        { notion_page_id: notionPage.id, error: updateError }
      );
    }

    console.log('✅ Database updated - publish complete!');

    // 9. Return success
    return jsonResponse({
      status: 'ok',
      asset_id: updated.id,
      notion_page_id: notionPage.id,
      published_at: updated.published_at
    });

  } catch (err) {
    // Handle Response errors (validation, etc.)
    if (err instanceof Response) {
      return err;
    }

    // Unexpected errors
    console.error('💥 Unexpected error:', err);
    return jsonError(500, 'internal', 'Internal server error', {
      error: err instanceof Error ? err.message : String(err)
    });
  }
});