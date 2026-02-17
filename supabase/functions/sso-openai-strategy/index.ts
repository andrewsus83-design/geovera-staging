// SSO STEP 4: OpenAI Strategy Generation
// Takes Perplexity analysis (Step 3) and generates actionable strategies
// Output: Insights, To-Do lists, Content (articles, images, videos)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const { action, brand_id, category_id } = await req.json();

    let result;

    switch (action) {
      case 'generate_brand_strategy':
        result = await generateBrandStrategy(brand_id, category_id);
        break;
      case 'generate_content_plan':
        result = await generateContentPlan(brand_id);
        break;
      case 'generate_todo_list':
        result = await generateTodoList(brand_id);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ============================================
// STEP 4.1: GENERATE BRAND STRATEGY
// Transform Perplexity analysis into actionable strategy
// ============================================

async function generateBrandStrategy(brandId: string, categoryId: string) {
  console.log(`[Step 4.1] Generating strategy for brand: ${brandId}`);

  // Get brand details
  const { data: brand } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (!brand) throw new Error('Brand not found');

  // Get Perplexity analysis (Step 3 output)
  const { data: opportunities } = await supabase
    .from('gv_sso_brand_opportunities')
    .select('*')
    .eq('brand_id', brandId)
    .eq('category_id', categoryId)
    .order('analysis_date', { ascending: false })
    .limit(1)
    .single();

  if (!opportunities) throw new Error('No opportunities found. Run Step 3 first.');

  // Get category analysis
  const { data: categoryAnalysis } = await supabase
    .from('gv_sso_category_analysis')
    .select('*')
    .eq('category_id', categoryId)
    .order('analysis_date', { ascending: false })
    .limit(1)
    .single();

  // Get top ranked creators
  const { data: rankedCreators } = await supabase
    .from('gv_brand_creator_rankings')
    .select('*, gv_sso_creators(*)')
    .eq('brand_id', brandId)
    .order('brand_rank', { ascending: true })
    .limit(20);

  // OpenAI: Generate comprehensive strategy
  const strategyPrompt = `You are a social media strategy expert. Generate a comprehensive, actionable strategy for this brand.

BRAND: ${brand.name}
INDUSTRY: ${brand.industry}
CATEGORY: ${categoryId}

PERPLEXITY ANALYSIS (Step 3 Output):

**Competitor Analysis**:
${JSON.stringify(opportunities.competitor_analysis, null, 2)}

**Market Gaps**:
${JSON.stringify(opportunities.market_gaps, null, 2)}

**Content Opportunities**:
${JSON.stringify(opportunities.content_opportunities, null, 2)}

**Partnership Strategies**:
${JSON.stringify(opportunities.partnership_strategies, null, 2)}

**Keyword Strategy**:
${JSON.stringify(opportunities.keyword_strategy?.slice(0, 20), null, 2)}

**Category Trending Topics**:
${JSON.stringify(categoryAnalysis?.trending_topics?.slice(0, 10), null, 2)}

**Top 20 Recommended Creators**:
${rankedCreators?.map((r: any) => `${r.brand_rank}. ${r.gv_sso_creators.name} (@${r.gv_sso_creators.handle}) - Fit: ${r.brand_fit_score}, Reason: ${r.rank_reason}`).join('\n')}

YOUR TASK: Generate a comprehensive, actionable strategy with these sections:

1. **EXECUTIVE SUMMARY** (3-5 paragraphs):
   - Current market position
   - Key opportunities identified
   - Competitive advantages to leverage
   - Strategic priorities

2. **STRATEGIC INSIGHTS** (5-10 key insights):
   - What the data tells us
   - Why it matters
   - How to capitalize on it

   Example:
   {
     "insight": "Top competitors focus on macro-influencers, leaving micro-influencer segment underserved",
     "why_it_matters": "Micro-influencers (10K-100K) have 3x higher engagement rates and 60% lower costs",
     "action": "Prioritize partnerships with micro-influencers in sustainable fashion niche",
     "expected_impact": "30-40% cost reduction with higher engagement"
   }

3. **CREATOR PARTNERSHIP STRATEGY**:
   - Tier 1 (Top 5 creators): Deep partnerships
   - Tier 2 (Next 10 creators): Sponsored content
   - Tier 3 (Next 5 creators): Product seeding

   For EACH creator:
   - Why they're a good fit
   - Recommended collaboration type
   - Expected outcomes
   - Suggested approach

4. **CONTENT STRATEGY** (Prioritized):
   - Top 5 content themes to pursue
   - Messaging frameworks
   - Content formats (carousel, video, story, etc.)
   - Posting schedule recommendations
   - Hashtag strategy

5. **COMPETITIVE POSITIONING**:
   - How to differentiate from competitors
   - Gaps to exploit
   - Threats to mitigate
   - Positioning statement

6. **KEYWORD & SEO STRATEGY**:
   - Top 20 keywords to target
   - Content topics to cover
   - Search optimization tactics

7. **SUCCESS METRICS** (KPIs):
   - What to measure
   - Target benchmarks
   - Tracking recommendations

8. **BUDGET ALLOCATION**:
   - Recommended spend per creator tier
   - Content production budget
   - Tools and platforms needed

9. **TIMELINE** (3-month roadmap):
   - Month 1: What to do
   - Month 2: What to do
   - Month 3: What to do

Return comprehensive JSON with ALL sections.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: strategyPrompt }],
      temperature: 0.7,
      max_tokens: 16000,
    }),
  });

  const data = await response.json();
  const strategyText = data.choices[0].message.content;

  // Extract JSON
  const jsonMatch = strategyText.match(/```json\n([\s\S]*?)\n```/) || strategyText.match(/\{[\s\S]*\}/);
  let strategy;

  if (jsonMatch) {
    strategy = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } else {
    strategy = {
      raw_text: strategyText,
      executive_summary: strategyText.substring(0, 1000),
    };
  }

  // Save strategy
  await supabase.from('gv_sso_brand_strategies').upsert({
    brand_id: brandId,
    category_id: categoryId,
    executive_summary: strategy.executive_summary,
    strategic_insights: strategy.strategic_insights || [],
    creator_partnership_strategy: strategy.creator_partnership_strategy || {},
    content_strategy: strategy.content_strategy || {},
    competitive_positioning: strategy.competitive_positioning || {},
    keyword_seo_strategy: strategy.keyword_seo_strategy || {},
    success_metrics: strategy.success_metrics || {},
    budget_allocation: strategy.budget_allocation || {},
    timeline: strategy.timeline || {},
    generated_at: new Date().toISOString(),
  });

  console.log(`[Step 4.1] Strategy generated and saved`);

  return {
    success: true,
    brand_id: brandId,
    brand_name: brand.name,
    strategy: strategy,
    cost: 0.20, // GPT-4o
    message: 'Comprehensive strategy generated',
  };
}

// ============================================
// STEP 4.2: GENERATE CONTENT PLAN
// Create specific content pieces (articles, posts, videos)
// ============================================

async function generateContentPlan(brandId: string) {
  console.log(`[Step 4.2] Generating content plan for brand: ${brandId}`);

  // Get brand strategy
  const { data: strategy } = await supabase
    .from('gv_sso_brand_strategies')
    .select('*')
    .eq('brand_id', brandId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  if (!strategy) throw new Error('No strategy found. Run Step 4.1 first.');

  // Get brand details
  const { data: brand } = await supabase
    .from('gv_brands')
    .select('*')
    .eq('id', brandId)
    .single();

  // OpenAI: Generate content plan
  const contentPrompt = `You are a content strategist. Create a detailed content plan based on this brand strategy.

BRAND: ${brand.name}

STRATEGIC INSIGHTS:
${JSON.stringify(strategy.strategic_insights, null, 2)}

CONTENT STRATEGY:
${JSON.stringify(strategy.content_strategy, null, 2)}

TOP CREATORS TO WORK WITH:
${JSON.stringify(strategy.creator_partnership_strategy, null, 2)}

YOUR TASK: Generate 30-day content plan with specific content pieces:

1. **BLOG ARTICLES** (5-7 articles):
   For each article:
   - Title (SEO-optimized)
   - Target keyword
   - Outline (4-6 sections)
   - Key points to cover
   - Word count target
   - Call-to-action
   - Creator collaboration opportunities

   Example:
   {
     "title": "10 Sustainable Fashion Brands Leading Indonesia's Eco Revolution",
     "keyword": "sustainable fashion brands indonesia",
     "outline": [
       "Introduction: The Rise of Sustainable Fashion in Indonesia",
       "What Makes a Brand Truly Sustainable?",
       "Top 10 Eco-Friendly Indonesian Fashion Brands",
       "How to Support Sustainable Fashion",
       "Conclusion: The Future of Ethical Fashion"
     ],
     "key_points": ["certifications", "materials", "supply chain"],
     "word_count": 2000,
     "cta": "Shop our sustainable collection",
     "creator_collab": "Feature interview with @sustainablestyle"
   }

2. **SOCIAL MEDIA POSTS** (20-25 posts):
   For each post:
   - Platform (Instagram/TikTok/YouTube)
   - Post type (carousel/video/story/reel)
   - Caption (hook + body + CTA)
   - Hashtags (10-15)
   - Visual concept
   - Best posting time
   - Expected engagement

3. **VIDEO CONTENT** (3-5 videos):
   For each video:
   - Title
   - Script outline (intro/body/outro)
   - Duration (30sec / 60sec / 3min / 10min)
   - Platform optimization (TikTok/Reels/YouTube)
   - B-roll requirements
   - Creator collaboration opportunity

4. **CREATOR COLLABORATION BRIEFS** (5-7 briefs):
   For each collaboration:
   - Creator name + handle
   - Collaboration type (sponsored/gifted/ambassador)
   - Campaign concept
   - Content requirements
   - Key messages
   - Deliverables
   - Timeline
   - Compensation suggestion

5. **CONTENT CALENDAR** (30 days):
   Daily schedule:
   - Date
   - Content type
   - Platform
   - Topic
   - Creator involved (if any)
   - Status (planned/in progress/scheduled)

Return comprehensive JSON with ALL sections.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: contentPrompt }],
      temperature: 0.8,
      max_tokens: 16000,
    }),
  });

  const data = await response.json();
  const contentText = data.choices[0].message.content;

  // Extract JSON
  const jsonMatch = contentText.match(/```json\n([\s\S]*?)\n```/) || contentText.match(/\{[\s\S]*\}/);
  let contentPlan;

  if (jsonMatch) {
    contentPlan = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } else {
    contentPlan = { raw_text: contentText };
  }

  // Save content plan
  await supabase.from('gv_sso_content_plans').upsert({
    brand_id: brandId,
    blog_articles: contentPlan.blog_articles || [],
    social_media_posts: contentPlan.social_media_posts || [],
    video_content: contentPlan.video_content || [],
    creator_collaboration_briefs: contentPlan.creator_collaboration_briefs || [],
    content_calendar: contentPlan.content_calendar || [],
    generated_at: new Date().toISOString(),
  });

  console.log(`[Step 4.2] Content plan generated:`);
  console.log(`  - ${contentPlan.blog_articles?.length || 0} blog articles`);
  console.log(`  - ${contentPlan.social_media_posts?.length || 0} social posts`);
  console.log(`  - ${contentPlan.video_content?.length || 0} videos`);
  console.log(`  - ${contentPlan.creator_collaboration_briefs?.length || 0} collaboration briefs`);
  console.log(`  - 30-day content calendar`);

  return {
    success: true,
    brand_id: brandId,
    content_plan: contentPlan,
    cost: 0.20, // GPT-4o
    message: 'Content plan generated',
  };
}

// ============================================
// STEP 4.3: GENERATE TODO LIST
// Create actionable to-do items
// ============================================

async function generateTodoList(brandId: string) {
  console.log(`[Step 4.3] Generating to-do list for brand: ${brandId}`);

  // Get brand strategy
  const { data: strategy } = await supabase
    .from('gv_sso_brand_strategies')
    .select('*')
    .eq('brand_id', brandId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  if (!strategy) throw new Error('No strategy found. Run Step 4.1 first.');

  // Get content plan
  const { data: contentPlan } = await supabase
    .from('gv_sso_content_plans')
    .select('*')
    .eq('brand_id', brandId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  // OpenAI: Generate to-do list
  const todoPrompt = `You are a project manager. Create a detailed, actionable to-do list based on this brand's strategy and content plan.

TIMELINE:
${JSON.stringify(strategy.timeline, null, 2)}

CREATOR PARTNERSHIPS:
${JSON.stringify(strategy.creator_partnership_strategy, null, 2)}

CONTENT PLAN:
${JSON.stringify(contentPlan, null, 2)}

YOUR TASK: Generate comprehensive to-do list organized by:

1. **IMMEDIATE (This Week)**:
   - Priority: CRITICAL
   - Tasks that must be done now
   - Include: who, what, deadline

2. **SHORT-TERM (This Month)**:
   - Priority: HIGH
   - Tasks for next 30 days
   - Include: dependencies, resources needed

3. **MID-TERM (3 Months)**:
   - Priority: MEDIUM
   - Strategic initiatives
   - Include: milestones, success criteria

Each task format:
{
  "task": "Reach out to @sustainablestyle for partnership discussion",
  "priority": "CRITICAL",
  "category": "Creator Outreach",
  "deadline": "2026-02-20",
  "assigned_to": "Marketing Manager",
  "dependencies": ["Prepare partnership deck", "Set budget approval"],
  "resources_needed": ["Partnership agreement template", "Product samples"],
  "estimated_time": "2 hours",
  "success_criteria": "Partnership agreement signed",
  "notes": "Creator fit score: 95/100, responds best via Instagram DM"
}

Categories:
- Creator Outreach
- Content Creation
- Content Publishing
- Community Management
- Analytics & Reporting
- Budget & Admin
- Campaign Planning

Generate 30-50 specific, actionable tasks.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Cheaper for todo lists
      messages: [{ role: 'user', content: todoPrompt }],
      temperature: 0.6,
      max_tokens: 8000,
    }),
  });

  const data = await response.json();
  const todoText = data.choices[0].message.content;

  // Extract JSON
  const jsonMatch = todoText.match(/```json\n([\s\S]*?)\n```/) || todoText.match(/\{[\s\S]*\}/);
  let todoList;

  if (jsonMatch) {
    todoList = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  } else {
    todoList = { raw_text: todoText };
  }

  // Save to-do list
  await supabase.from('gv_sso_todo_lists').upsert({
    brand_id: brandId,
    immediate_tasks: todoList.immediate || [],
    short_term_tasks: todoList.short_term || [],
    mid_term_tasks: todoList.mid_term || [],
    generated_at: new Date().toISOString(),
  });

  const totalTasks =
    (todoList.immediate?.length || 0) +
    (todoList.short_term?.length || 0) +
    (todoList.mid_term?.length || 0);

  console.log(`[Step 4.3] To-do list generated:`);
  console.log(`  - ${todoList.immediate?.length || 0} immediate tasks`);
  console.log(`  - ${todoList.short_term?.length || 0} short-term tasks`);
  console.log(`  - ${todoList.mid_term?.length || 0} mid-term tasks`);
  console.log(`  - ${totalTasks} total tasks`);

  return {
    success: true,
    brand_id: brandId,
    todo_list: todoList,
    total_tasks: totalTasks,
    cost: 0.05, // GPT-4o-mini
    message: 'To-do list generated',
  };
}
