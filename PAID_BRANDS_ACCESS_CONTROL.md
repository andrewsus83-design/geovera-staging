# GeoVera - Paid Brands Access Control Implementation

## 🎯 Critical Requirement

**Content Generation (Feature 4) is ONLY available to PAYING brands (Basic, Premium, Partner tiers).**

Free/non-paying brands:
- ✅ Data collection allowed (for GeoVera's IP, case studies, market analysis)
- ❌ Content generation BLOCKED (articles, images, videos)

---

## 🔐 Implementation Strategy

### 1. Database Level - RLS Policies

**Content Library Access:**
```sql
-- Users can ONLY access content for brands they own AND that have paid subscriptions
CREATE POLICY "Users access own paid brand content"
  ON gv_content_library FOR ALL
  USING (
    brand_id IN (
      SELECT b.id FROM gv_brands b
      JOIN user_brands ub ON b.id = ub.brand_id
      WHERE ub.user_id = auth.uid()
      AND b.subscription_tier IN ('basic', 'premium', 'partner')
    )
  );
```

**Content Queue Access:**
```sql
-- Users can ONLY create content generation jobs for paid brands
CREATE POLICY "Users create content jobs for paid brands"
  ON gv_content_queue FOR INSERT
  WITH CHECK (
    brand_id IN (
      SELECT b.id FROM gv_brands b
      JOIN user_brands ub ON b.id = ub.brand_id
      WHERE ub.user_id = auth.uid()
      AND b.subscription_tier IN ('basic', 'premium', 'partner')
    )
  );
```

**Content Templates Access:**
```sql
-- Paid brands can use templates
CREATE POLICY "Paid brands access content templates"
  ON gv_content_templates FOR SELECT
  USING (
    brand_id IS NULL OR brand_id IN (
      SELECT b.id FROM gv_brands b
      JOIN user_brands ub ON b.id = ub.brand_id
      WHERE ub.user_id = auth.uid()
      AND b.subscription_tier IN ('basic', 'premium', 'partner')
    )
  );
```

---

### 2. Edge Function Level - Access Control

**Every content generation Edge Function MUST include this check:**

#### `generate-article/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GenerateArticleRequest {
  brand_id: string;
  topic: string;
  target_platforms: string[];
  keywords?: string[];
}

Deno.serve(async (req: Request) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { brand_id, topic, target_platforms, keywords } = await req.json() as GenerateArticleRequest;

    // ============================================================================
    // CRITICAL: Check if brand has paid subscription
    // ============================================================================
    const { data: brand, error: brandError } = await supabase
      .from('gv_brands')
      .select('subscription_tier, brand_name')
      .eq('id', brand_id)
      .single();

    if (brandError) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Brand not found',
        code: 'BRAND_NOT_FOUND'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // REJECT if not paid subscription
    if (!brand.subscription_tier || brand.subscription_tier === 'free' || brand.subscription_tier === null) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Content generation requires a paid subscription',
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Upgrade to Basic ($399/mo), Premium ($699/mo), or Partner ($1,099/mo) to generate content',
        current_tier: brand.subscription_tier || 'free',
        data_collection_status: 'active',
        note: 'Your brand data is being collected for market analysis and GeoVera internal content generation'
      }), {
        status: 403, // Forbidden
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ============================================================================
    // Check tier quota
    // ============================================================================
    const { data: quotaCheck, error: quotaError } = await supabase
      .rpc('check_tier_limit', {
        p_brand_id: brand_id,
        p_limit_type: 'articles'
      });

    if (quotaCheck === true) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Monthly article quota exceeded',
        code: 'QUOTA_EXCEEDED',
        message: 'Upgrade your tier or wait until next month',
        current_tier: brand.subscription_tier
      }), {
        status: 429, // Too Many Requests
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ============================================================================
    // Get brand voice guidelines
    // ============================================================================
    const { data: voiceData } = await supabase
      .from('gv_brand_voice_guidelines')
      .select('*')
      .eq('brand_id', brand_id)
      .single();

    // ============================================================================
    // Get content template for article
    // ============================================================================
    const { data: templateData } = await supabase
      .from('gv_content_templates')
      .select('*')
      .eq('template_type', 'article')
      .or(`brand_id.eq.${brand_id},brand_id.is.null`)
      .limit(1)
      .single();

    // ============================================================================
    // Generate article with OpenAI GPT-4o
    // ============================================================================
    const systemPrompt = `You are an expert content writer for ${brand.brand_name}.

Brand Voice:
- Tone: ${voiceData?.tone || 'professional and engaging'}
- Language Style: ${voiceData?.language_style || 'clear and accessible'}
${voiceData?.personality_traits ? `- Personality: ${voiceData.personality_traits.join(', ')}` : ''}

Content Guidelines:
${voiceData?.do_phrases ? `DO USE: ${voiceData.do_phrases.join(', ')}` : ''}
${voiceData?.dont_phrases ? `DON'T USE: ${voiceData.dont_phrases.join(', ')}` : ''}

Platform Optimization:
- Target Platforms: ${target_platforms.join(', ')}
- Length: ${voiceData?.preferred_content_length || '800-1200 words'}
- Hashtag Count: ${voiceData?.preferred_hashtag_count || 5}
- Emoji Usage: ${voiceData?.emoji_usage || 'minimal'}

${templateData?.prompt_template || ''}`;

    const userPrompt = `Write a compelling article about: ${topic}

${keywords ? `Focus Keywords: ${keywords.join(', ')}` : ''}

Requirements:
- Engaging hook in first paragraph
- Clear structure with H2/H3 subheadings
- Data-driven insights when possible
- Actionable takeaways
- Strong conclusion with call-to-action
- SEO-optimized for target keywords
- Platform-specific formatting for: ${target_platforms.join(', ')}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    const openaiData = await openaiResponse.json();

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiData.error?.message || 'Unknown error'}`);
    }

    const article_content = openaiData.choices[0].message.content;
    const cost_usd = (openaiData.usage.total_tokens / 1_000_000) * 2.5; // GPT-4o pricing

    // ============================================================================
    // Save to content library
    // ============================================================================
    const { data: contentData, error: contentError } = await supabase
      .from('gv_content_library')
      .insert({
        brand_id,
        user_id: req.headers.get('x-user-id'), // Passed from frontend
        content_type: 'article',
        title: topic,
        slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content_variations: {
          full: article_content,
          platforms: target_platforms.reduce((acc, platform) => {
            acc[platform] = article_content; // Platform-specific variations
            return acc;
          }, {} as Record<string, string>)
        },
        meta_title: topic,
        meta_description: article_content.slice(0, 160),
        keywords: keywords || [],
        brand_voice_score: 0.85, // Placeholder for ML scoring
        content_goal: 'visibility',
        target_platforms,
        ai_provider_used: 'openai',
        model_used: 'gpt-4o',
        generation_prompt: userPrompt,
        generation_cost_usd: cost_usd,
        publish_status: 'draft'
      })
      .select()
      .single();

    if (contentError) {
      throw new Error(`Failed to save content: ${contentError.message}`);
    }

    // ============================================================================
    // Increment usage quota
    // ============================================================================
    await supabase.rpc('increment_content_usage', {
      p_brand_id: brand_id,
      p_content_type: 'article'
    });

    // ============================================================================
    // Return success response
    // ============================================================================
    return new Response(JSON.stringify({
      success: true,
      content_id: contentData.id,
      article: {
        title: topic,
        content: article_content,
        platforms: target_platforms,
        cost_usd: cost_usd.toFixed(4),
        tokens_used: openaiData.usage.total_tokens
      },
      quota_used: {
        articles_this_month: 1, // Would be fetched from gv_tier_usage
        tier_limit: brand.subscription_tier === 'basic' ? 1 : brand.subscription_tier === 'premium' ? 3 : 6
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[generate-article] Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      code: 'GENERATION_FAILED'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

---

#### `generate-image/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GenerateImageRequest {
  brand_id: string;
  prompt: string;
  target_platforms: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { brand_id, prompt, target_platforms } = await req.json() as GenerateImageRequest;

    // ============================================================================
    // CRITICAL: Check if brand has paid subscription
    // ============================================================================
    const { data: brand } = await supabase
      .from('gv_brands')
      .select('subscription_tier, brand_name')
      .eq('id', brand_id)
      .single();

    if (!brand?.subscription_tier || brand.subscription_tier === 'free') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Image generation requires a paid subscription',
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Upgrade to Basic, Premium, or Partner tier'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check quota
    const quotaExceeded = await supabase.rpc('check_tier_limit', {
      p_brand_id: brand_id,
      p_limit_type: 'images'
    });

    if (quotaExceeded) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Monthly image quota exceeded',
        code: 'QUOTA_EXCEEDED'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ============================================================================
    // Generate image with DALL-E 3
    // ============================================================================
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Professional brand image for ${brand.brand_name}: ${prompt}. High quality, modern, on-brand.`,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      })
    });

    const dalleData = await dalleResponse.json();
    const image_url = dalleData.data[0].url;
    const cost_usd = 0.04; // DALL-E 3 HD pricing

    // Save to content library
    const { data: contentData } = await supabase
      .from('gv_content_library')
      .insert({
        brand_id,
        user_id: req.headers.get('x-user-id'),
        content_type: 'image',
        title: prompt,
        content_variations: {
          original: image_url,
          platforms: target_platforms
        },
        target_platforms,
        ai_provider_used: 'openai',
        model_used: 'dall-e-3',
        generation_cost_usd: cost_usd,
        primary_file_url: image_url,
        publish_status: 'draft'
      })
      .select()
      .single();

    // Increment usage
    await supabase.rpc('increment_content_usage', {
      p_brand_id: brand_id,
      p_content_type: 'image'
    });

    return new Response(JSON.stringify({
      success: true,
      content_id: contentData.id,
      image: {
        url: image_url,
        cost_usd: cost_usd.toFixed(4)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[generate-image] Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      code: 'GENERATION_FAILED'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

---

#### `generate-video/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GenerateVideoRequest {
  brand_id: string;
  topic: string;
  duration_seconds: number; // 15, 30, 60
  target_platform: string; // 'tiktok', 'instagram', 'youtube'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { brand_id, topic, duration_seconds, target_platform } = await req.json() as GenerateVideoRequest;

    // ============================================================================
    // CRITICAL: Check if brand has paid subscription AND tier supports video
    // ============================================================================
    const { data: brand } = await supabase
      .from('gv_brands')
      .select('subscription_tier, brand_name')
      .eq('id', brand_id)
      .single();

    if (!brand?.subscription_tier || brand.subscription_tier === 'free' || brand.subscription_tier === 'basic') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Video generation requires Premium or Partner subscription',
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Video generation is available on Premium ($699/mo) and Partner ($1,099/mo) tiers only',
        current_tier: brand?.subscription_tier || 'free'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check quota
    const quotaExceeded = await supabase.rpc('check_tier_limit', {
      p_brand_id: brand_id,
      p_limit_type: 'videos'
    });

    if (quotaExceeded) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Monthly video quota exceeded',
        code: 'QUOTA_EXCEEDED'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ============================================================================
    // Generate video script with Claude
    // ============================================================================
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Create a ${duration_seconds}-second video script for ${target_platform} about: ${topic}

Brand: ${brand.brand_name}
Platform: ${target_platform}
Duration: ${duration_seconds} seconds

Format the script as:
[HOOK - 0-3s]: (opening line)
[MAIN CONTENT - 3-${duration_seconds-3}s]: (key points)
[CTA - ${duration_seconds-3}-${duration_seconds}s]: (call to action)

Include:
- Visual suggestions for each section
- Text overlay recommendations
- Platform-specific best practices
- Hashtag suggestions`
        }]
      })
    });

    const claudeData = await claudeResponse.json();
    const video_script = claudeData.content[0].text;
    const cost_usd = 0.015; // Claude API pricing estimate

    // Save to content library
    const { data: contentData } = await supabase
      .from('gv_content_library')
      .insert({
        brand_id,
        user_id: req.headers.get('x-user-id'),
        content_type: 'video',
        title: topic,
        content_variations: {
          script: video_script,
          duration_seconds,
          platform: target_platform
        },
        target_platforms: [target_platform],
        ai_provider_used: 'anthropic',
        model_used: 'claude-3-5-sonnet-20241022',
        generation_cost_usd: cost_usd,
        publish_status: 'draft'
      })
      .select()
      .single();

    // Increment usage
    await supabase.rpc('increment_content_usage', {
      p_brand_id: brand_id,
      p_content_type: 'video'
    });

    return new Response(JSON.stringify({
      success: true,
      content_id: contentData.id,
      video: {
        script: video_script,
        duration: duration_seconds,
        platform: target_platform,
        cost_usd: cost_usd.toFixed(4)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[generate-video] Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      code: 'GENERATION_FAILED'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

---

### 3. Frontend Level - UI/UX Control

**Content Studio Page - Conditional Rendering:**

```javascript
// content-studio.html

async function checkSubscriptionAccess() {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userBrands } = await supabase
    .from('user_brands')
    .select('brand_id, gv_brands(subscription_tier)')
    .eq('user_id', user.id);

  const activeBrand = userBrands[0];
  const tier = activeBrand.gv_brands.subscription_tier;

  if (!tier || tier === 'free') {
    // Show upgrade prompt
    document.getElementById('content-studio').style.display = 'none';
    document.getElementById('upgrade-prompt').style.display = 'block';
    document.getElementById('upgrade-prompt').innerHTML = `
      <div class="upgrade-required">
        <h2>Content Generation Requires Paid Subscription</h2>
        <p>Upgrade to access AI-powered content creation:</p>
        <ul>
          <li><strong>Basic ($399/mo):</strong> 1 article + 1 image/month</li>
          <li><strong>Premium ($699/mo):</strong> 3 articles + 3 images + 1 video/month</li>
          <li><strong>Partner ($1,099/mo):</strong> 6 articles + 6 images + 3 videos/month</li>
        </ul>
        <a href="/pricing" class="btn-upgrade">View Pricing & Upgrade</a>
        <p class="note">Your brand data is still being collected for market insights.</p>
      </div>
    `;
    return false;
  }

  return true;
}

// On page load
window.addEventListener('DOMContentLoaded', async () => {
  const hasAccess = await checkSubscriptionAccess();
  if (hasAccess) {
    loadContentStudio();
  }
});
```

---

## 📊 Error Response Standards

**All content generation Edge Functions MUST return these error codes:**

### `SUBSCRIPTION_REQUIRED` (403 Forbidden)
```json
{
  "success": false,
  "error": "Content generation requires a paid subscription",
  "code": "SUBSCRIPTION_REQUIRED",
  "message": "Upgrade to Basic ($399/mo), Premium ($699/mo), or Partner ($1,099/mo)",
  "current_tier": "free",
  "data_collection_status": "active",
  "upgrade_url": "/pricing"
}
```

### `QUOTA_EXCEEDED` (429 Too Many Requests)
```json
{
  "success": false,
  "error": "Monthly content quota exceeded",
  "code": "QUOTA_EXCEEDED",
  "message": "Upgrade your tier or wait until next month",
  "current_tier": "basic",
  "quota": {
    "used": 1,
    "limit": 1,
    "resets_at": "2026-03-01T00:00:00Z"
  },
  "upgrade_url": "/pricing"
}
```

### `TIER_INSUFFICIENT` (403 Forbidden)
```json
{
  "success": false,
  "error": "Video generation requires Premium or Partner tier",
  "code": "TIER_INSUFFICIENT",
  "message": "Video generation is not available on Basic tier",
  "current_tier": "basic",
  "required_tiers": ["premium", "partner"],
  "upgrade_url": "/pricing"
}
```

---

## ✅ Validation Checklist

Before deploying to production:

**Database:**
- [ ] RLS policies enforce paid subscription for content tables
- [ ] Free tier brands CANNOT access gv_content_library
- [ ] Free tier brands CANNOT create entries in gv_content_queue
- [ ] All content-related tables have proper RLS

**Edge Functions:**
- [ ] `generate-article` checks subscription tier
- [ ] `generate-image` checks subscription tier
- [ ] `generate-video` checks subscription tier AND tier level (Premium/Partner only)
- [ ] All functions check quota before generation
- [ ] All functions increment usage after successful generation
- [ ] All functions return proper error codes

**Frontend:**
- [ ] Content Studio page hidden for free tier
- [ ] Upgrade prompts displayed for free tier
- [ ] Clear pricing information shown
- [ ] No client-side bypasses possible

**Testing:**
- [ ] Test with free tier brand → Should get 403 error
- [ ] Test with Basic tier → Articles & images work, videos blocked
- [ ] Test with Premium tier → All content types work
- [ ] Test quota limits → Should get 429 error when exceeded
- [ ] Test RLS bypass attempts → Should be blocked at database level

---

## 🎯 Summary

**The Rule:**
- Free brands = Data collection ONLY (for GeoVera IP)
- Paid brands = Data collection + Content generation

**Implementation Layers:**
1. **Database RLS** - Blocks at data level
2. **Edge Functions** - Blocks at API level
3. **Frontend UI** - Blocks at interface level

**Three-tier defense ensures NO free brand can generate content, even with direct API calls.**

---

**Last Updated:** 2026-02-13
**Status:** ✅ Ready for implementation
**Priority:** 🔴 CRITICAL - Must be implemented before any content generation features go live
