# Multi-Channel Backlink Strategy
## Expanding Backlink Potential Beyond Traditional SEO

## Overview
Traditional backlink tracking focuses only on dofollow/nofollow links from websites. Modern brand visibility requires tracking brand mentions and backlink opportunities across **publishing platforms, collaboration tools, and community sites** that drive authority, referral traffic, and brand awareness.

**Key Insight**: A Medium article, Notion doc, or Substack newsletter mentioning your brand can be MORE valuable than a traditional backlink from a low-authority blog.

---

## 1. Multi-Channel Backlink Sources

### Tier 1: Publishing Platforms (High Authority)
These platforms have high domain authority and content is indexed by Google.

```typescript
const PUBLISHING_PLATFORMS = {
  // Long-form content
  medium: {
    domain: 'medium.com',
    authority_score: 95,
    indexing: 'excellent',
    link_type: 'dofollow',
    typical_reach: 5000,
    value_multiplier: 1.5, // Higher value than regular blogs
    content_types: ['articles', 'publications', 'series'],
    api_available: true
  },

  substack: {
    domain: 'substack.com',
    authority_score: 92,
    indexing: 'excellent',
    link_type: 'dofollow',
    typical_reach: 3000,
    value_multiplier: 1.4,
    content_types: ['newsletters', 'posts', 'podcasts'],
    api_available: true
  },

  hashnode: {
    domain: 'hashnode.com',
    authority_score: 88,
    indexing: 'excellent',
    link_type: 'dofollow',
    typical_reach: 2000,
    value_multiplier: 1.3,
    content_types: ['dev blogs', 'tutorials', 'tech articles'],
    api_available: true
  },

  devto: {
    domain: 'dev.to',
    authority_score: 90,
    indexing: 'excellent',
    link_type: 'dofollow',
    typical_reach: 4000,
    value_multiplier: 1.4,
    content_types: ['dev articles', 'tutorials', 'discussions'],
    api_available: true
  },

  // Documentation platforms
  gitbook: {
    domain: 'gitbook.io',
    authority_score: 85,
    indexing: 'good',
    link_type: 'dofollow',
    typical_reach: 1500,
    value_multiplier: 1.2,
    content_types: ['documentation', 'guides', 'wikis'],
    api_available: false
  },

  notion_public: {
    domain: 'notion.site',
    authority_score: 80,
    indexing: 'good',
    link_type: 'dofollow',
    typical_reach: 1000,
    value_multiplier: 1.1,
    content_types: ['public docs', 'wikis', 'databases'],
    api_available: true
  },

  // Professional platforms
  linkedin_pulse: {
    domain: 'linkedin.com/pulse',
    authority_score: 98,
    indexing: 'excellent',
    link_type: 'nofollow', // But high referral value
    typical_reach: 8000,
    value_multiplier: 1.8, // High professional reach
    content_types: ['articles', 'thought leadership'],
    api_available: true
  }
};
```

### Tier 2: Community & Forum Platforms (High Engagement)

```typescript
const COMMUNITY_PLATFORMS = {
  reddit: {
    domain: 'reddit.com',
    authority_score: 96,
    indexing: 'excellent',
    link_type: 'nofollow',
    typical_reach: 10000,
    value_multiplier: 1.6, // High viral potential
    content_types: ['posts', 'comments', 'AMAs'],
    api_available: true
  },

  hackernews: {
    domain: 'news.ycombinator.com',
    authority_score: 94,
    indexing: 'good',
    link_type: 'nofollow',
    typical_reach: 15000,
    value_multiplier: 2.0, // Tech influencer audience
    content_types: ['submissions', 'comments'],
    api_available: true
  },

  producthunt: {
    domain: 'producthunt.com',
    authority_score: 91,
    indexing: 'excellent',
    link_type: 'dofollow',
    typical_reach: 5000,
    value_multiplier: 1.5,
    content_types: ['product launches', 'reviews'],
    api_available: true
  },

  indiehackers: {
    domain: 'indiehackers.com',
    authority_score: 85,
    indexing: 'good',
    link_type: 'dofollow',
    typical_reach: 3000,
    value_multiplier: 1.3,
    content_types: ['posts', 'milestones', 'interviews'],
    api_available: false
  },

  quora: {
    domain: 'quora.com',
    authority_score: 93,
    indexing: 'excellent',
    link_type: 'nofollow',
    typical_reach: 7000,
    value_multiplier: 1.4,
    content_types: ['answers', 'spaces'],
    api_available: true
  }
};
```

### Tier 3: Collaboration & Knowledge Platforms

```typescript
const COLLABORATION_PLATFORMS = {
  github: {
    domain: 'github.com',
    authority_score: 100,
    indexing: 'excellent',
    link_type: 'dofollow',
    typical_reach: 2000,
    value_multiplier: 1.7, // Developer authority
    content_types: ['READMEs', 'wikis', 'discussions', 'issues'],
    api_available: true
  },

  stackoverflow: {
    domain: 'stackoverflow.com',
    authority_score: 97,
    indexing: 'excellent',
    link_type: 'nofollow',
    typical_reach: 5000,
    value_multiplier: 1.5,
    content_types: ['answers', 'questions'],
    api_available: true
  },

  coda: {
    domain: 'coda.io',
    authority_score: 75,
    indexing: 'limited',
    link_type: 'dofollow',
    typical_reach: 800,
    value_multiplier: 1.0,
    content_types: ['public docs', 'templates'],
    api_available: true
  },

  airtable: {
    domain: 'airtable.com',
    authority_score: 78,
    indexing: 'limited',
    link_type: 'dofollow',
    typical_reach: 600,
    value_multiplier: 1.0,
    content_types: ['public bases', 'universe templates'],
    api_available: true
  }
};
```

---

## 2. Enhanced Backlink Opportunity Model

```typescript
interface MultiChannelBacklinkOpportunity {
  // Traditional fields
  target_url: string;
  target_domain: string;

  // NEW: Channel classification
  channel_type: 'publishing' | 'community' | 'collaboration' | 'traditional';
  platform: string; // 'medium', 'notion', 'reddit', etc.

  // Enhanced scoring
  authority_score: number; // 1-100
  relevance_score: number; // 1-100
  engagement_score: number; // NEW: Comments, shares, saves

  // Multi-channel value
  link_value: number; // 1-100 (traditional)
  brand_visibility_value: number; // NEW: 1-100
  referral_traffic_potential: number; // NEW: 1-100
  community_influence_score: number; // NEW: 1-100

  // Combined value score
  total_opportunity_value: number; // Weighted combination

  // Channel-specific metadata
  channel_metadata: {
    // For Medium
    publication_name?: string;
    claps?: number;

    // For Substack
    subscriber_count?: number;

    // For Reddit
    subreddit?: string;
    upvotes?: number;

    // For GitHub
    stars?: number;
    forks?: number;

    // For LinkedIn
    connections?: number;
    engagement_rate?: number;

    // For Notion
    page_views?: number;
    shared_with?: number;
  };

  // Outreach strategy
  outreach_difficulty: 'easy' | 'medium' | 'hard';
  recommended_approach: string;
  outreach_template: string;

  // Discovery metadata
  discovered_via: 'enriched_crawl' | 'api_search' | 'competitor_analysis';
  discovery_date: string;
}
```

---

## 3. Multi-Channel Discovery Engine

### Implementation

```typescript
// /supabase/functions/discover-multichannel-backlinks/index.ts

interface DiscoveryConfig {
  brand_id: string;
  brand_name: string;
  industry: string;
  keywords: string[];
  tier: 'basic' | 'premium' | 'partner';
}

const TIER_LIMITS = {
  basic: {
    platforms_to_search: 5, // Medium, Dev.to, LinkedIn, Reddit, GitHub
    max_opportunities: 20,
    perplexity_ranked: 20 // Show all 20 ranked by Perplexity
  },
  premium: {
    platforms_to_search: 10, // All Tier 1 + Tier 2
    max_opportunities: 50,
    perplexity_ranked: 20 // Top 20 ranked by Perplexity
  },
  partner: {
    platforms_to_search: 15, // All platforms
    max_opportunities: 100,
    perplexity_ranked: 20 // Top 20 ranked by Perplexity
  }
};

async function discoverMultiChannelBacklinks(config: DiscoveryConfig) {
  const opportunities: MultiChannelBacklinkOpportunity[] = [];

  // 1. Search Medium for brand mentions and topic opportunities
  if (shouldSearchPlatform('medium', config.tier)) {
    const mediumOpps = await searchMedium(config);
    opportunities.push(...mediumOpps);
  }

  // 2. Search Substack newsletters
  if (shouldSearchPlatform('substack', config.tier)) {
    const substackOpps = await searchSubstack(config);
    opportunities.push(...substackOpps);
  }

  // 3. Search LinkedIn Pulse articles
  if (shouldSearchPlatform('linkedin', config.tier)) {
    const linkedinOpps = await searchLinkedInPulse(config);
    opportunities.push(...linkedinOpps);
  }

  // 4. Search Dev.to for tech content
  if (shouldSearchPlatform('devto', config.tier)) {
    const devtoOpps = await searchDevTo(config);
    opportunities.push(...devtoOpps);
  }

  // 5. Search Reddit communities
  if (shouldSearchPlatform('reddit', config.tier)) {
    const redditOpps = await searchReddit(config);
    opportunities.push(...redditOpps);
  }

  // 6. Search GitHub READMEs and wikis
  if (shouldSearchPlatform('github', config.tier)) {
    const githubOpps = await searchGitHub(config);
    opportunities.push(...githubOpps);
  }

  // 7. Search public Notion pages
  if (shouldSearchPlatform('notion', config.tier)) {
    const notionOpps = await searchNotionPublic(config);
    opportunities.push(...notionOpps);
  }

  // 8. Search Quora answers
  if (shouldSearchPlatform('quora', config.tier)) {
    const quoraOpps = await searchQuora(config);
    opportunities.push(...quoraOpps);
  }

  // 9. Search Product Hunt
  if (shouldSearchPlatform('producthunt', config.tier)) {
    const phOpps = await searchProductHunt(config);
    opportunities.push(...phOpps);
  }

  // 10. Search Hacker News
  if (shouldSearchPlatform('hackernews', config.tier)) {
    const hnOpps = await searchHackerNews(config);
    opportunities.push(...hnOpps);
  }

  // Score and rank all opportunities
  const scoredOpportunities = await scoreMultiChannelOpportunities(opportunities);

  // Apply tier limits
  const tierLimit = TIER_LIMITS[config.tier].max_opportunities;
  const topOpportunities = scoredOpportunities
    .sort((a, b) => b.total_opportunity_value - a.total_opportunity_value)
    .slice(0, tierLimit);

  // ⭐ NEW: Perplexity AI-powered ranking for top 20
  const perplexityRankedTop20 = await rankOpportunitiesWithPerplexity(
    topOpportunities.slice(0, 20),
    config
  );

  // Store in database
  await storeMultiChannelOpportunities(config.brand_id, topOpportunities, perplexityRankedTop20);

  return {
    all_opportunities: topOpportunities,
    perplexity_ranked_top20: perplexityRankedTop20
  };
}
```

### Platform-Specific Search Functions

```typescript
// Medium API search
async function searchMedium(config: DiscoveryConfig): Promise<MultiChannelBacklinkOpportunity[]> {
  const opportunities = [];

  // Search for articles in your industry that DON'T mention you yet
  const query = config.keywords.join(' OR ');

  // Using Medium's public API or RSS feeds
  const articles = await fetch(`https://medium.com/search?q=${encodeURIComponent(query)}`)
    .then(r => r.text())
    .then(html => parseMediumSearchResults(html));

  for (const article of articles) {
    // Check if brand is already mentioned
    const content = await fetchArticleContent(article.url);
    const brandMentioned = content.toLowerCase().includes(config.brand_name.toLowerCase());

    if (!brandMentioned) {
      // Opportunity: Article is relevant but doesn't mention you
      opportunities.push({
        target_url: article.url,
        target_domain: 'medium.com',
        channel_type: 'publishing',
        platform: 'medium',
        authority_score: 95,
        relevance_score: calculateRelevance(content, config.keywords),
        engagement_score: article.claps || 0,
        link_value: 85,
        brand_visibility_value: 90,
        referral_traffic_potential: calculateTrafficPotential(article.claps),
        community_influence_score: 80,
        total_opportunity_value: 0, // Will be calculated
        channel_metadata: {
          publication_name: article.publication,
          claps: article.claps
        },
        outreach_difficulty: 'medium',
        recommended_approach: 'comment_engagement',
        outreach_template: generateMediumOutreachTemplate(article, config),
        discovered_via: 'api_search',
        discovery_date: new Date().toISOString()
      });
    }
  }

  return opportunities;
}

// Substack search
async function searchSubstack(config: DiscoveryConfig): Promise<MultiChannelBacklinkOpportunity[]> {
  const opportunities = [];

  // Search Substack newsletters via Google site search
  const query = `site:substack.com ${config.keywords.join(' OR ')}`;

  const results = await serpApi.search({ q: query, num: 50 });

  for (const result of results.organic_results || []) {
    const newsletterUrl = result.link;

    // Extract newsletter metadata
    const metadata = await fetchSubstackMetadata(newsletterUrl);

    opportunities.push({
      target_url: newsletterUrl,
      target_domain: 'substack.com',
      channel_type: 'publishing',
      platform: 'substack',
      authority_score: 92,
      relevance_score: calculateRelevance(result.snippet, config.keywords),
      engagement_score: metadata.subscriber_count || 0,
      link_value: 88,
      brand_visibility_value: 92,
      referral_traffic_potential: metadata.subscriber_count / 100, // Estimate
      community_influence_score: 85,
      total_opportunity_value: 0,
      channel_metadata: {
        subscriber_count: metadata.subscriber_count
      },
      outreach_difficulty: 'hard',
      recommended_approach: 'email_outreach',
      outreach_template: generateSubstackOutreachTemplate(metadata, config),
      discovered_via: 'api_search',
      discovery_date: new Date().toISOString()
    });
  }

  return opportunities;
}

// Reddit search
async function searchReddit(config: DiscoveryConfig): Promise<MultiChannelBacklinkOpportunity[]> {
  const opportunities = [];

  // Use Reddit API to search relevant subreddits
  const subreddits = identifyRelevantSubreddits(config.industry);

  for (const subreddit of subreddits) {
    const posts = await redditApi.search({
      subreddit: subreddit,
      q: config.keywords.join(' OR '),
      sort: 'top',
      time: 'month',
      limit: 25
    });

    for (const post of posts.data.children) {
      const postData = post.data;

      // Check if brand is mentioned
      const brandMentioned =
        postData.selftext.toLowerCase().includes(config.brand_name.toLowerCase()) ||
        postData.title.toLowerCase().includes(config.brand_name.toLowerCase());

      if (!brandMentioned && postData.score > 10) {
        opportunities.push({
          target_url: `https://reddit.com${postData.permalink}`,
          target_domain: 'reddit.com',
          channel_type: 'community',
          platform: 'reddit',
          authority_score: 96,
          relevance_score: calculateRelevance(postData.selftext, config.keywords),
          engagement_score: postData.score + postData.num_comments,
          link_value: 75, // Nofollow
          brand_visibility_value: 95,
          referral_traffic_potential: postData.score * 2,
          community_influence_score: 90,
          total_opportunity_value: 0,
          channel_metadata: {
            subreddit: postData.subreddit,
            upvotes: postData.score
          },
          outreach_difficulty: 'easy',
          recommended_approach: 'helpful_comment',
          outreach_template: generateRedditCommentTemplate(postData, config),
          discovered_via: 'api_search',
          discovery_date: new Date().toISOString()
        });
      }
    }
  }

  return opportunities;
}

// GitHub search
async function searchGitHub(config: DiscoveryConfig): Promise<MultiChannelBacklinkOpportunity[]> {
  const opportunities = [];

  // Search GitHub repositories and documentation
  const query = `${config.keywords.join(' OR ')} in:readme`;

  const repos = await octokit.search.repos({
    q: query,
    sort: 'stars',
    order: 'desc',
    per_page: 50
  });

  for (const repo of repos.data.items) {
    // Fetch README content
    const readme = await octokit.repos.getReadme({
      owner: repo.owner.login,
      repo: repo.name
    });

    const readmeContent = Buffer.from(readme.data.content, 'base64').toString();
    const brandMentioned = readmeContent.toLowerCase().includes(config.brand_name.toLowerCase());

    if (!brandMentioned && repo.stargazers_count > 50) {
      opportunities.push({
        target_url: repo.html_url,
        target_domain: 'github.com',
        channel_type: 'collaboration',
        platform: 'github',
        authority_score: 100,
        relevance_score: calculateRelevance(readmeContent, config.keywords),
        engagement_score: repo.stargazers_count,
        link_value: 95,
        brand_visibility_value: 88,
        referral_traffic_potential: repo.stargazers_count / 10,
        community_influence_score: 92,
        total_opportunity_value: 0,
        channel_metadata: {
          stars: repo.stargazers_count,
          forks: repo.forks_count
        },
        outreach_difficulty: 'medium',
        recommended_approach: 'issue_or_pr',
        outreach_template: generateGitHubOutreachTemplate(repo, config),
        discovered_via: 'api_search',
        discovery_date: new Date().toISOString()
      });
    }
  }

  return opportunities;
}

// Notion public pages search
async function searchNotionPublic(config: DiscoveryConfig): Promise<MultiChannelBacklinkOpportunity[]> {
  const opportunities = [];

  // Search via Google for public Notion pages
  const query = `site:notion.site ${config.keywords.join(' OR ')}`;

  const results = await serpApi.search({ q: query, num: 30 });

  for (const result of results.organic_results || []) {
    opportunities.push({
      target_url: result.link,
      target_domain: 'notion.site',
      channel_type: 'collaboration',
      platform: 'notion',
      authority_score: 80,
      relevance_score: calculateRelevance(result.snippet, config.keywords),
      engagement_score: 50, // Default estimate
      link_value: 78,
      brand_visibility_value: 75,
      referral_traffic_potential: 60,
      community_influence_score: 70,
      total_opportunity_value: 0,
      channel_metadata: {},
      outreach_difficulty: 'hard',
      recommended_approach: 'find_owner_email',
      outreach_template: generateNotionOutreachTemplate(result, config),
      discovered_via: 'api_search',
      discovery_date: new Date().toISOString()
    });
  }

  return opportunities;
}

// Dev.to search
async function searchDevTo(config: DiscoveryConfig): Promise<MultiChannelBacklinkOpportunity[]> {
  const opportunities = [];

  // Dev.to has a public API
  const articles = await fetch(`https://dev.to/api/articles?tag=${config.keywords[0]}&per_page=50`)
    .then(r => r.json());

  for (const article of articles) {
    const content = await fetch(`https://dev.to/api/articles/${article.id}`)
      .then(r => r.json())
      .then(data => data.body_markdown);

    const brandMentioned = content.toLowerCase().includes(config.brand_name.toLowerCase());

    if (!brandMentioned && article.positive_reactions_count > 5) {
      opportunities.push({
        target_url: article.url,
        target_domain: 'dev.to',
        channel_type: 'publishing',
        platform: 'devto',
        authority_score: 90,
        relevance_score: calculateRelevance(content, config.keywords),
        engagement_score: article.positive_reactions_count + article.comments_count,
        link_value: 85,
        brand_visibility_value: 88,
        referral_traffic_potential: article.positive_reactions_count * 3,
        community_influence_score: 85,
        total_opportunity_value: 0,
        channel_metadata: {
          reactions: article.positive_reactions_count,
          comments: article.comments_count
        },
        outreach_difficulty: 'easy',
        recommended_approach: 'thoughtful_comment',
        outreach_template: generateDevToCommentTemplate(article, config),
        discovered_via: 'api_search',
        discovery_date: new Date().toISOString()
      });
    }
  }

  return opportunities;
}
```

---

## 4. Perplexity AI-Powered Opportunity Ranking

### Why Perplexity for Ranking?

Perplexity provides **real-time web intelligence** that goes beyond static scores:
- ✅ Current domain authority and traffic trends
- ✅ Recent engagement metrics (viral potential)
- ✅ Audience quality and relevance
- ✅ Outreach success probability
- ✅ Time-sensitive opportunities (trending topics)

### Implementation

```typescript
// /supabase/functions/rank-with-perplexity/index.ts

interface PerplexityRankingFactors {
  // Real-time authority
  current_domain_authority: number;
  traffic_trend: 'rising' | 'stable' | 'declining';
  recent_viral_content: boolean;

  // Audience analysis
  audience_quality: number; // 1-100
  audience_relevance: number; // 1-100
  decision_maker_percentage: number; // % of audience that can make buying decisions

  // Outreach intelligence
  author_responsiveness: number; // 1-100 (based on past engagement patterns)
  typical_response_time: string; // "within 24h", "3-5 days", etc.
  collaboration_openness: number; // 1-100

  // Strategic timing
  optimal_outreach_timing: string; // "now", "within 3 days", "wait 1 week"
  urgency_score: number; // 1-100
  time_sensitivity: 'high' | 'medium' | 'low';

  // ROI prediction
  predicted_referral_traffic: number;
  predicted_conversion_rate: number; // 0-1
  predicted_brand_lift: number; // 1-100

  // Final Perplexity score
  perplexity_opportunity_score: number; // 1-100
  perplexity_rank: number; // 1-20
  perplexity_recommendation: string;
}

interface PerplexityRankedOpportunity extends MultiChannelBacklinkOpportunity {
  perplexity_ranking: PerplexityRankingFactors;
}

async function rankOpportunitiesWithPerplexity(
  opportunities: MultiChannelBacklinkOpportunity[],
  config: DiscoveryConfig
): Promise<PerplexityRankedOpportunity[]> {

  const rankedOpportunities: PerplexityRankedOpportunity[] = [];

  // Process in batches of 5 to optimize Perplexity API usage
  for (let i = 0; i < opportunities.length; i += 5) {
    const batch = opportunities.slice(i, i + 5);

    // Build Perplexity analysis prompt
    const prompt = buildPerplexityRankingPrompt(batch, config);

    // Call Perplexity API
    const perplexityAnalysis = await callPerplexityAPI(prompt);

    // Parse and attach rankings
    for (let j = 0; j < batch.length; j++) {
      const opp = batch[j];
      const ranking = parsePerplexityRanking(perplexityAnalysis, j);

      rankedOpportunities.push({
        ...opp,
        perplexity_ranking: ranking
      });
    }
  }

  // Sort by Perplexity score
  rankedOpportunities.sort((a, b) =>
    b.perplexity_ranking.perplexity_opportunity_score -
    a.perplexity_ranking.perplexity_opportunity_score
  );

  // Assign final ranks
  rankedOpportunities.forEach((opp, index) => {
    opp.perplexity_ranking.perplexity_rank = index + 1;
  });

  return rankedOpportunities;
}

function buildPerplexityRankingPrompt(
  opportunities: MultiChannelBacklinkOpportunity[],
  config: DiscoveryConfig
): string {
  const opportunitiesData = opportunities.map((opp, i) => `
Opportunity ${i + 1}:
- Platform: ${opp.platform}
- URL: ${opp.target_url}
- Domain: ${opp.target_domain}
- Current Value Score: ${opp.total_opportunity_value}
- Engagement: ${opp.engagement_score}
- Channel Metadata: ${JSON.stringify(opp.channel_metadata)}
`).join('\n');

  return `You are an expert backlink opportunity analyst. Analyze these ${opportunities.length} multi-channel backlink opportunities for ${config.brand_name} in the ${config.industry} industry.

Brand Context:
- Brand: ${config.brand_name}
- Industry: ${config.industry}
- Target Keywords: ${config.keywords.join(', ')}

Opportunities to Rank:
${opportunitiesData}

For each opportunity, provide:

1. **Current Domain Authority & Traffic Trend**
   - What is the current domain authority?
   - Is traffic rising, stable, or declining?
   - Any recent viral content from this source?

2. **Audience Analysis**
   - Quality of audience (1-100)
   - Relevance to ${config.industry} (1-100)
   - What % are decision-makers who can buy products?

3. **Outreach Intelligence**
   - Author/owner responsiveness score (1-100)
   - Typical response time
   - Openness to collaboration (1-100)

4. **Strategic Timing**
   - Optimal outreach timing (now, within X days, wait)
   - Urgency score (1-100)
   - Time sensitivity (high/medium/low)

5. **ROI Prediction**
   - Predicted monthly referral traffic
   - Predicted conversion rate
   - Predicted brand awareness lift (1-100)

6. **Final Assessment**
   - Overall opportunity score (1-100)
   - Why this is a good/bad opportunity
   - Specific recommendation

Rank these opportunities from 1-${opportunities.length} based on total strategic value for ${config.brand_name}.

Format your response as JSON array with this structure for each opportunity:
{
  "opportunity_index": 1,
  "current_domain_authority": 95,
  "traffic_trend": "rising",
  "recent_viral_content": true,
  "audience_quality": 88,
  "audience_relevance": 92,
  "decision_maker_percentage": 45,
  "author_responsiveness": 75,
  "typical_response_time": "within 24h",
  "collaboration_openness": 80,
  "optimal_outreach_timing": "now",
  "urgency_score": 90,
  "time_sensitivity": "high",
  "predicted_referral_traffic": 1200,
  "predicted_conversion_rate": 0.08,
  "predicted_brand_lift": 85,
  "perplexity_opportunity_score": 91,
  "perplexity_recommendation": "Prioritize this - trending content with highly engaged audience"
}`;
}

async function callPerplexityAPI(prompt: string): Promise<any> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO and backlink opportunity analyst with access to real-time web data. Provide data-driven, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent, factual analysis
      return_citations: true,
      search_recency_filter: 'month' // Focus on recent data
    })
  });

  const data = await response.json();

  // Parse JSON from Perplexity response
  const content = data.choices[0].message.content;
  const jsonMatch = content.match(/\[[\s\S]*\]/);

  if (!jsonMatch) {
    throw new Error('Failed to parse Perplexity JSON response');
  }

  return {
    rankings: JSON.parse(jsonMatch[0]),
    citations: data.citations || []
  };
}

function parsePerplexityRanking(
  analysis: any,
  opportunityIndex: number
): PerplexityRankingFactors {
  const ranking = analysis.rankings.find(
    (r: any) => r.opportunity_index === opportunityIndex + 1
  );

  if (!ranking) {
    // Fallback if Perplexity didn't analyze this one
    return {
      current_domain_authority: 70,
      traffic_trend: 'stable',
      recent_viral_content: false,
      audience_quality: 70,
      audience_relevance: 70,
      decision_maker_percentage: 30,
      author_responsiveness: 60,
      typical_response_time: 'unknown',
      collaboration_openness: 60,
      optimal_outreach_timing: 'within 7 days',
      urgency_score: 50,
      time_sensitivity: 'medium',
      predicted_referral_traffic: 500,
      predicted_conversion_rate: 0.03,
      predicted_brand_lift: 60,
      perplexity_opportunity_score: 60,
      perplexity_rank: 0, // Will be assigned later
      perplexity_recommendation: 'Standard opportunity - proceed with caution'
    };
  }

  return {
    current_domain_authority: ranking.current_domain_authority,
    traffic_trend: ranking.traffic_trend,
    recent_viral_content: ranking.recent_viral_content,
    audience_quality: ranking.audience_quality,
    audience_relevance: ranking.audience_relevance,
    decision_maker_percentage: ranking.decision_maker_percentage,
    author_responsiveness: ranking.author_responsiveness,
    typical_response_time: ranking.typical_response_time,
    collaboration_openness: ranking.collaboration_openness,
    optimal_outreach_timing: ranking.optimal_outreach_timing,
    urgency_score: ranking.urgency_score,
    time_sensitivity: ranking.time_sensitivity,
    predicted_referral_traffic: ranking.predicted_referral_traffic,
    predicted_conversion_rate: ranking.predicted_conversion_rate,
    predicted_brand_lift: ranking.predicted_brand_lift,
    perplexity_opportunity_score: ranking.perplexity_opportunity_score,
    perplexity_rank: 0, // Will be assigned after sorting
    perplexity_recommendation: ranking.perplexity_recommendation
  };
}
```

### Perplexity Ranking Algorithm

```typescript
// How Perplexity scores and ranks opportunities

function calculatePerplexityScore(factors: PerplexityRankingFactors): number {
  // Weighted scoring model
  const weights = {
    domain_authority: 0.15,
    traffic_trend: 0.10,
    audience_quality: 0.15,
    audience_relevance: 0.20,
    decision_makers: 0.10,
    responsiveness: 0.10,
    urgency: 0.10,
    predicted_roi: 0.10
  };

  let score = 0;

  // Domain authority
  score += factors.current_domain_authority * weights.domain_authority;

  // Traffic trend bonus
  const trendMultiplier = {
    'rising': 1.2,
    'stable': 1.0,
    'declining': 0.8
  };
  score *= trendMultiplier[factors.traffic_trend];

  // Audience quality & relevance
  score += factors.audience_quality * weights.audience_quality;
  score += factors.audience_relevance * weights.audience_relevance;

  // Decision maker percentage
  score += factors.decision_maker_percentage * weights.decision_makers;

  // Responsiveness
  score += factors.author_responsiveness * weights.responsiveness;

  // Urgency (time-sensitive opportunities get boost)
  score += factors.urgency_score * weights.urgency;

  // Predicted ROI
  const roiScore =
    (factors.predicted_referral_traffic / 50) +
    (factors.predicted_conversion_rate * 100) +
    (factors.predicted_brand_lift);
  score += (roiScore / 3) * weights.predicted_roi;

  // Viral content bonus
  if (factors.recent_viral_content) {
    score *= 1.15; // 15% boost for viral platforms
  }

  return Math.min(Math.round(score), 100);
}
```

### Database Storage

```sql
-- Store Perplexity-ranked opportunities
CREATE TABLE gv_multichannel_backlink_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES gv_brands(id),

  -- Opportunity data
  target_url TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  channel_type TEXT NOT NULL,
  platform TEXT NOT NULL,

  -- Basic scores
  authority_score INTEGER,
  relevance_score INTEGER,
  engagement_score INTEGER,
  total_opportunity_value INTEGER,

  -- Perplexity ranking
  perplexity_rank INTEGER, -- 1-20 for top opportunities
  perplexity_score INTEGER,
  perplexity_recommendation TEXT,

  -- Perplexity intelligence
  current_domain_authority INTEGER,
  traffic_trend TEXT,
  audience_quality INTEGER,
  audience_relevance INTEGER,
  decision_maker_percentage INTEGER,

  -- Outreach intelligence
  author_responsiveness INTEGER,
  typical_response_time TEXT,
  collaboration_openness INTEGER,

  -- Timing
  optimal_outreach_timing TEXT,
  urgency_score INTEGER,
  time_sensitivity TEXT,

  -- Predictions
  predicted_referral_traffic INTEGER,
  predicted_conversion_rate DECIMAL,
  predicted_brand_lift INTEGER,

  -- Outreach
  outreach_difficulty TEXT,
  recommended_approach TEXT,
  outreach_template TEXT,

  -- Status tracking
  status TEXT DEFAULT 'discovered', -- discovered, outreach_sent, responded, completed
  outreach_sent_at TIMESTAMP,
  response_received_at TIMESTAMP,

  -- Metadata
  channel_metadata JSONB,
  discovered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_perplexity_rank ON gv_multichannel_backlink_opportunities(brand_id, perplexity_rank);
CREATE INDEX idx_urgency ON gv_multichannel_backlink_opportunities(brand_id, urgency_score DESC);
CREATE INDEX idx_status ON gv_multichannel_backlink_opportunities(brand_id, status);
```

---

## 5. Multi-Channel Opportunity Scoring

```typescript
async function scoreMultiChannelOpportunities(
  opportunities: MultiChannelBacklinkOpportunity[]
): Promise<MultiChannelBacklinkOpportunity[]> {

  return opportunities.map(opp => {
    // Get platform config
    const platformConfig = getPlatformConfig(opp.platform);

    // Calculate total opportunity value (weighted)
    const weights = {
      authority: 0.20,
      relevance: 0.25,
      engagement: 0.15,
      link_value: 0.15,
      brand_visibility: 0.15,
      referral_traffic: 0.10
    };

    const totalValue =
      (opp.authority_score * weights.authority) +
      (opp.relevance_score * weights.relevance) +
      (normalizeEngagement(opp.engagement_score, opp.platform) * weights.engagement) +
      (opp.link_value * weights.link_value) +
      (opp.brand_visibility_value * weights.brand_visibility) +
      (normalizeTrafficPotential(opp.referral_traffic_potential) * weights.referral_traffic);

    // Apply platform value multiplier
    const finalValue = totalValue * platformConfig.value_multiplier;

    return {
      ...opp,
      total_opportunity_value: Math.round(finalValue)
    };
  });
}

function normalizeEngagement(score: number, platform: string): number {
  // Normalize engagement scores to 0-100 scale based on platform
  const normalizers = {
    'medium': (s: number) => Math.min(s / 10, 100), // 1000 claps = 100
    'reddit': (s: number) => Math.min(s / 5, 100),  // 500 upvotes = 100
    'github': (s: number) => Math.min(s / 50, 100), // 5000 stars = 100
    'devto': (s: number) => Math.min(s / 3, 100),   // 300 reactions = 100
    'substack': (s: number) => Math.min(s / 100, 100), // 10K subscribers = 100
    'default': (s: number) => Math.min(s, 100)
  };

  const normalizer = normalizers[platform] || normalizers['default'];
  return normalizer(score);
}
```

---

## 5. Outreach Templates by Platform

```typescript
const OUTREACH_TEMPLATES = {
  medium: {
    comment_engagement: `Hi {author_name},

Great article on {topic}! I particularly enjoyed your take on {specific_point}.

I've been working on {related_topic} and found that {insight}. Have you considered {suggestion}?

We recently published {resource_link} that dives deeper into this - might be worth adding to your resources section if you found it helpful.

Keep up the great work!`,

    direct_outreach: `Hi {author_name},

I loved your recent article "{article_title}" on Medium. Your insights on {topic} really resonated with our community.

I'm reaching out because we've developed {product/resource} that complements what you covered in your piece. Would you be open to updating your article with a mention? Happy to provide any additional context or data that would be valuable for your readers.

Best,
{your_name}`
  },

  substack: {
    email_outreach: `Subject: Collaboration opportunity for {newsletter_name}

Hi {author_name},

I'm a subscriber to {newsletter_name} and have been following your insights on {topic} for a while now. Your recent piece on {specific_issue} was particularly insightful.

I wanted to reach out because {brand_name} has developed {solution/resource} that directly addresses {problem} you mentioned. I think your subscribers would find value in it.

Would you be interested in:
1. Featuring this in an upcoming newsletter?
2. Collaborating on a guest post?
3. Including it as a resource in your recommendation section?

Happy to provide exclusive insights or data for your audience.

Best regards,
{your_name}`
  },

  reddit: {
    helpful_comment: `This is a great discussion! For anyone looking for {solution}, I've had success with {approach}.

{Brand_name} actually addresses this exact use case - we've helped {social_proof} achieve {result}. Here's how: {brief_explanation}

More details: {link}

Happy to answer questions if anyone's curious about implementation.`,

    subtle_mention: `I ran into this same issue last month. After trying {alternatives}, we ended up using {brand_name} because {specific_reason}.

The key difference was {unique_value_prop}. Saved us about {time/money} compared to our previous approach.

Not affiliated, just sharing what worked for us.`
  },

  github: {
    issue_or_pr: `# Suggestion: Add {brand_name} to resources

Hi maintainers,

First, thanks for maintaining this excellent {repo_type}! It's been super helpful for {use_case}.

I noticed the README lists several {category} tools, but doesn't mention {brand_name}. It's an open-source/{free} alternative that offers {unique_features}.

Key advantages:
- {benefit_1}
- {benefit_2}
- {benefit_3}

Repo: {github_link}
Docs: {docs_link}

Would you be open to adding it to the list? Happy to submit a PR with the addition.

Thanks!`,

    documentation_improvement: `# Docs improvement: Alternative approach using {brand_name}

Hi team,

Love the documentation! I wanted to suggest adding an alternative approach for {specific_section}.

While {current_approach} works well, users dealing with {specific_use_case} might benefit from using {brand_name} because {reason}.

Here's a code example:

\`\`\`
{code_example}
\`\`\`

This approach offers:
- {benefit_1}
- {benefit_2}

Happy to submit a PR to add this to the docs if you think it's valuable.`
  },

  devto: {
    thoughtful_comment: `Great tutorial! 🎉

One thing I'd add for readers: if you're dealing with {specific_scenario}, {brand_name} has a built-in feature that handles this automatically.

Instead of:
\`\`\`
{manual_approach_code}
\`\`\`

You can do:
\`\`\`
{brand_approach_code}
\`\`\`

Saved me tons of boilerplate code. Here's the docs: {link}

Thanks for sharing this!`
  },

  linkedin: {
    article_comment: `Insightful article, {author_name}! Your point about {key_point} is spot on.

At {company}, we've seen similar trends. In fact, {related_stat_or_insight}.

{Brand_name} was built specifically to address {problem_mentioned}. We've helped {social_proof} achieve {result}.

Would love to connect and discuss this further!`,

    direct_message: `Hi {author_name},

I came across your recent article on {topic} - really valuable insights on {specific_point}.

I'm working on {related_area} at {company} and thought you might find {brand_name} interesting. It addresses {problem} you mentioned using {unique_approach}.

Would you be open to a brief chat? I'd love to hear your thoughts and potentially collaborate on content around this space.

Best,
{your_name}`
  },

  notion: {
    find_owner_email: `Subject: Suggestion for your {topic} Notion page

Hi there,

I came across your excellent Notion page on {topic} ({page_url}). Really appreciate you making this public - it's been super helpful for {use_case}.

I noticed you have a section on {category}. I wanted to suggest adding {brand_name} to your list. It's {brief_description} that offers {unique_value}.

Key features:
• {feature_1}
• {feature_2}
• {feature_3}

Link: {website}

Happy to provide more details if you'd like to include it!

Thanks,
{your_name}`
  }
};
```

---

## 6. Sync to Dashboard Features

### Integration with Content Studio

```typescript
// Auto-generate outreach content for backlink opportunities

async function syncMultiChannelToContentStudio(
  brandId: string,
  opportunities: MultiChannelBacklinkOpportunity[]
) {
  for (const opp of opportunities.slice(0, 10)) { // Top 10
    await supabase.from('gv_content_briefs').insert({
      brand_id: brandId,
      title: `Outreach: ${opp.platform} - ${opp.target_url}`,
      content_type: 'outreach',
      target_platform: opp.platform,
      outreach_difficulty: opp.outreach_difficulty,
      suggested_template: opp.outreach_template,
      estimated_impact: opp.total_opportunity_value,
      priority_score: opp.total_opportunity_value,
      source: 'multichannel_backlink_discovery'
    });
  }
}
```

### Integration with To-Do

```typescript
// Auto-generate outreach tasks

async function syncMultiChannelToTodo(
  brandId: string,
  opportunities: MultiChannelBacklinkOpportunity[]
) {
  for (const opp of opportunities.filter(o => o.total_opportunity_value > 70)) {
    await supabase.from('gv_todos').insert({
      brand_id: brandId,
      title: `Outreach: ${opp.platform} opportunity`,
      description: `${opp.recommended_approach} for ${opp.target_url}`,
      category: 'outreach',
      priority: opp.total_opportunity_value > 85 ? 'high' : 'medium',
      actionable_steps: [
        `Research author/owner of ${opp.target_url}`,
        `Customize outreach template`,
        `Send outreach message`,
        `Follow up in 7 days`,
        `Track response`
      ],
      estimated_time: '30-45 minutes',
      difficulty: opp.outreach_difficulty,
      related_urls: [opp.target_url],
      auto_generated: true,
      status: 'pending'
    });
  }
}
```

### Integration with Radar

```typescript
// Track multi-channel brand mentions

async function syncMultiChannelToRadar(
  brandId: string,
  opportunities: MultiChannelBacklinkOpportunity[]
) {
  // Identify where competitors ARE mentioned but you're not
  const competitorMentions = opportunities.filter(opp =>
    opp.relevance_score > 70 &&
    opp.platform !== 'traditional'
  );

  for (const mention of competitorMentions) {
    await supabase.from('gv_competitive_alerts').insert({
      brand_id: brandId,
      alert_type: 'multichannel_gap',
      message: `🎯 ${mention.platform} opportunity: Relevant content without your brand mention`,
      recommended_actions: [
        `Platform: ${mention.platform}`,
        `URL: ${mention.target_url}`,
        `Approach: ${mention.recommended_approach}`,
        `Potential value: ${mention.total_opportunity_value}/100`
      ],
      priority: mention.total_opportunity_value > 80 ? 'high' : 'medium'
    });
  }
}
```

---

## 7. Cost Analysis

### API Costs for Multi-Channel Discovery

```typescript
const API_COSTS = {
  // Per search query
  reddit_api: 0.00,        // Free
  github_api: 0.00,        // Free (with rate limits)
  devto_api: 0.00,         // Free
  medium_scraping: 0.001,  // Proxies/scraping
  substack_scraping: 0.001,
  notion_search: 0.002,    // Via SerpAPI
  linkedin_search: 0.002,  // Via SerpAPI
  quora_search: 0.002,     // Via SerpAPI

  // Perplexity API (NEW)
  perplexity_ranking: 0.05, // $0.05 per 1000 tokens (~200 tokens per 5 opportunities)

  // AI enrichment (Claude for outreach template customization)
  claude_customization: 0.005 // Per opportunity
};

// Monthly cost per tier
const MONTHLY_MULTICHANNEL_COSTS = {
  basic: {
    discovery: 0.10,          // 5 platforms × 20 opportunities
    perplexity_ranking: 0.20, // Rank all 20 opportunities (4 batches × $0.05)
    ai_customization: 0.10,   // 20 opportunities × $0.005
    total: 0.40
  },
  premium: {
    discovery: 0.25,          // 10 platforms × 50 opportunities
    perplexity_ranking: 0.20, // Rank top 20 only (4 batches × $0.05)
    ai_customization: 0.25,   // 50 opportunities × $0.005
    total: 0.70
  },
  partner: {
    discovery: 0.50,          // 15 platforms × 100 opportunities
    perplexity_ranking: 0.20, // Rank top 20 only (4 batches × $0.05)
    ai_customization: 0.50,   // 100 opportunities × $0.005
    total: 1.20
  }
};

// Cost efficiency: Perplexity only ranks top 20 for Premium/Partner tiers
// This keeps costs low while providing maximum value on best opportunities
```

---

## 8. User Experience

### Multi-Channel Backlinks Dashboard

```
Multi-Channel Backlink Opportunities

📊 Overview (Last 30 Days)
Total Opportunities Found: 73
Platforms Tracked: 10
Avg. Opportunity Value: 78/100

⭐ PERPLEXITY AI-RANKED TOP 20

Showing the highest-value opportunities analyzed by Perplexity AI
Based on: Real-time authority • Audience quality • ROI prediction • Timing

┌─────────────────────────────────────────────────────────────┐
│ 🥇 RANK #1 - Perplexity Score: 94/100                      │
│ Platform: HACKER NEWS                                       │
├─────────────────────────────────────────────────────────────┤
│ "Ask HN: Best analytics tools for SaaS?"                   │
│ Posted: 3 hours ago | Upvotes: 127 | Comments: 43          │
│                                                             │
│ 🎯 Perplexity Intelligence:                                │
│ • Traffic Trend: RISING (viral potential!)                 │
│ • Audience Quality: 96/100 (tech decision-makers)          │
│ • Decision Makers: 78% (startup founders, CTOs)             │
│ • Responsiveness: High (active discussion)                  │
│ • Optimal Timing: ⚠️ NOW (time-sensitive!)                 │
│                                                             │
│ 📈 Predicted Impact:                                        │
│ • Referral Traffic: 2,400/month                            │
│ • Conversion Rate: 12% (highly qualified)                  │
│ • Brand Lift: 92/100                                       │
│                                                             │
│ 💡 Perplexity Recommendation:                              │
│ "URGENT: This thread is trending and has 78% decision-     │
│  makers. Comment within 2 hours for maximum visibility.     │
│  HN front page traffic typically peaks at 6-8 hours."       │
│                                                             │
│ [View Comment Template] [Post Now] [Track Results]         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🥈 RANK #2 - Perplexity Score: 91/100                      │
│ Platform: MEDIUM                                            │
├─────────────────────────────────────────────────────────────┤
│ "The State of Marketing Analytics in 2024"                 │
│ Author: Sarah Chen (15K followers) | Claps: 1.2K           │
│                                                             │
│ 🎯 Perplexity Intelligence:                                │
│ • Domain Authority: 95 (Medium.com)                        │
│ • Traffic Trend: Rising (+45% this month)                  │
│ • Audience Quality: 88/100 (marketing professionals)       │
│ • Decision Makers: 62% (marketing directors, VPs)          │
│ • Author Responsiveness: 85/100 (responds to comments)     │
│ • Typical Response Time: Within 24 hours                   │
│                                                             │
│ 📈 Predicted Impact:                                        │
│ • Referral Traffic: 1,800/month                            │
│ • Conversion Rate: 9%                                      │
│ • Brand Lift: 85/100                                       │
│                                                             │
│ 💡 Perplexity Recommendation:                              │
│ "High-value opportunity. Author actively engages with       │
│  thoughtful comments. Article is trending in Marketing      │
│  publication (50K subscribers). Suggest comment-first       │
│  approach, then DM for collaboration."                      │
│                                                             │
│ [Generate Comment] [Send DM] [Track]                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🥉 RANK #3 - Perplexity Score: 89/100                      │
│ Platform: LINKEDIN PULSE                                    │
├─────────────────────────────────────────────────────────────┤
│ "Data-Driven Marketing: A 2024 Playbook"                   │
│ Author: Michael Torres (32K connections, CMO @ TechCorp)   │
│                                                             │
│ 🎯 Perplexity Intelligence:                                │
│ • Domain Authority: 98 (LinkedIn.com)                      │
│ • Traffic Trend: Stable (consistent engagement)            │
│ • Audience Quality: 94/100 (C-suite, senior marketers)     │
│ • Decision Makers: 81% (highest decision-maker %)          │
│ • Author Responsiveness: 72/100 (selective engagement)     │
│ • Collaboration Openness: 88/100                           │
│                                                             │
│ 📈 Predicted Impact:                                        │
│ • Referral Traffic: 1,500/month                            │
│ • Conversion Rate: 15% (high-quality B2B leads)            │
│ • Brand Lift: 90/100                                       │
│                                                             │
│ 💡 Perplexity Recommendation:                              │
│ "Premium opportunity - 81% decision-makers with high        │
│  buying power. Author is selective but open to valuable     │
│  collaborations. Best approach: connection request +        │
│  personalized message citing specific article insights."    │
│                                                             │
│ [Connect] [Personalized Message] [Track]                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ #4 - GitHub - awesome-analytics (⭐ 4.2K) - Score: 87/100  │
│ #5 - Dev.to - "Best Analytics APIs" - Score: 86/100       │
│ #6 - Reddit r/SaaS - "Analytics recommendations" - 85/100  │
│ #7 - Substack - MarketingWeekly (8K subs) - Score: 84/100 │
│ #8 - Product Hunt - Discussion thread - Score: 83/100     │
│ #9 - LinkedIn - Industry report - Score: 82/100           │
│ #10 - Medium - Tech publication - Score: 81/100           │
│                                                             │
│ [View Full Rankings 1-20] [Export Report] [Bulk Actions]   │
└─────────────────────────────────────────────────────────────┘

🔥 Top Opportunities by Platform

┌─────────────────────────────────────────────────────────────┐
│ 🎯 MEDIUM - High Value (3 opportunities)                    │
├─────────────────────────────────────────────────────────────┤
│ 1. "The Future of Marketing Analytics"                     │
│    Authority: 95/100 | Engagement: 847 claps               │
│    Opportunity Value: 92/100                                │
│                                                             │
│    Why this matters:                                        │
│    • Highly relevant to your product                        │
│    • Author has 12K followers                               │
│    • Article ranks #3 for "marketing analytics"             │
│                                                             │
│    Recommended Approach: Comment engagement                 │
│    Difficulty: Medium | Est. Time: 20 minutes               │
│                                                             │
│    [View Template] [Add to To-Do] [Mark Complete]          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 💼 LINKEDIN PULSE - Professional Reach (2 opportunities)    │
├─────────────────────────────────────────────────────────────┤
│ 1. "Data-Driven Decision Making in 2024"                   │
│    Authority: 98/100 | Author: 45K connections             │
│    Opportunity Value: 95/100                                │
│                                                             │
│    Outreach Strategy:                                       │
│    ✓ Thoughtful comment on article                         │
│    ✓ Connect with author                                   │
│    ✓ Share article with your take                          │
│    ✓ DM for collaboration                                  │
│                                                             │
│    [Generate Outreach] [Schedule] [Track]                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🐙 GITHUB - Developer Authority (5 opportunities)           │
├─────────────────────────────────────────────────────────────┤
│ 1. "awesome-analytics-tools" (⭐ 3.2K stars)               │
│    Repository lists 47 analytics tools, you're not there    │
│    Opportunity Value: 88/100                                │
│                                                             │
│    Recommended Approach: Submit PR                          │
│    Template: Add your tool to "Open Source" section        │
│                                                             │
│    PR Draft Preview:                                        │
│    "Add [YourBrand] - Open-source marketing analytics       │
│     with real-time insights and AI-powered predictions"     │
│                                                             │
│    [View Full PR Template] [Submit PR] [Track]             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🗣️ REDDIT - Community Engagement (8 opportunities)         │
├─────────────────────────────────────────────────────────────┤
│ 1. r/marketing: "Best analytics tools for small teams?"    │
│    Upvotes: 234 | Comments: 67                             │
│    Opportunity Value: 82/100                                │
│                                                             │
│    Comment Template (Helpful, Non-Spammy):                 │
│    "I ran a small marketing team and tried 5 different      │
│     analytics tools. What worked for us was finding         │
│     something that didn't require a data scientist...       │
│                                                             │
│     [Preview Full Comment] [Post Comment] [Track]          │
└─────────────────────────────────────────────────────────────┘

📈 Platform Performance

Medium:        ████████░░ 8 opportunities  | Avg Value: 87/100
LinkedIn:      ██████░░░░ 6 opportunities  | Avg Value: 91/100
GitHub:        ███████░░░ 7 opportunities  | Avg Value: 85/100
Reddit:        ████████░░ 8 opportunities  | Avg Value: 79/100
Dev.to:        █████░░░░░ 5 opportunities  | Avg Value: 83/100
Substack:      ███░░░░░░░ 3 opportunities  | Avg Value: 89/100
Hacker News:   ██░░░░░░░░ 2 opportunities  | Avg Value: 94/100
Product Hunt:  ████░░░░░░ 4 opportunities  | Avg Value: 80/100

⚡ Quick Actions
• [Generate This Week's Outreach Plan]
• [Export Opportunities to CSV]
• [Schedule Bulk Outreach]
• [View Success Metrics]
```

---

## 9. Perplexity Ranking Benefits

### Why Perplexity AI-Ranked Top 20 Changes Everything

**Traditional Ranking Problems:**
- ❌ Static scores don't account for trending content
- ❌ No insight into author responsiveness
- ❌ Can't predict actual ROI
- ❌ Miss time-sensitive opportunities
- ❌ No audience quality analysis

**Perplexity AI-Powered Ranking Solutions:**
- ✅ **Real-Time Intelligence**: Knows what's trending NOW
- ✅ **Author Insights**: Response patterns, collaboration openness
- ✅ **ROI Prediction**: Traffic, conversion, brand lift estimates
- ✅ **Urgency Detection**: "Post comment within 2 hours" alerts
- ✅ **Audience Quality**: % of decision-makers, professional level

### Real-World Example

**Without Perplexity Ranking:**
```
Top opportunity: Medium article (score 88/100)
- You reach out in 3 days
- Author doesn't respond (low responsiveness)
- Article traffic declines
- Result: Wasted effort
```

**With Perplexity Ranking:**
```
#1: Hacker News thread (Perplexity score 94/100)
- ⚠️ URGENT: Trending, post within 2 hours
- 78% decision-makers in thread
- Predicted traffic: 2,400/month
- Predicted conversion: 12%
- You comment immediately
- Result: Front page visibility, 340 signups
```

### Perplexity Intelligence Examples

**Traffic Trend Detection:**
```
Medium Article "A"
- Static score: 85/100
- Perplexity: Traffic declining -30% this month
- Rank: #12 (downgrade)

Medium Article "B"
- Static score: 78/100
- Perplexity: Traffic rising +45%, going viral
- Rank: #2 (upgrade)
```

**Audience Quality Analysis:**
```
LinkedIn Article "X"
- 5K views
- Perplexity: 81% C-suite decision-makers
- Predicted conversion: 15%
- Rank: #3 (high priority)

Reddit Thread "Y"
- 10K views
- Perplexity: 12% decision-makers (mostly students)
- Predicted conversion: 2%
- Rank: #18 (lower priority)
```

**Responsiveness Intelligence:**
```
Author Sarah Chen (Medium)
- Perplexity analysis: Responds to 85% of thoughtful comments
- Typical response: Within 24 hours
- Collaboration openness: 88/100
- Recommendation: Comment-first approach
- Rank: #2

Author John Doe (Substack)
- Perplexity analysis: Responds to 15% of emails
- Typical response: 2-3 weeks or never
- Collaboration openness: 30/100
- Recommendation: Lower priority
- Rank: #17
```

---

## Summary

**Multi-Channel Backlink Strategy** dramatically expands backlink opportunities beyond traditional SEO:

✅ **10+ platforms tracked**: Medium, Substack, LinkedIn, Reddit, GitHub, Dev.to, Notion, Quora, Product Hunt, Hacker News

✅ **Perplexity AI-Ranked Top 20**: Real-time intelligence on trending content, author responsiveness, ROI predictions, and urgency alerts

✅ **Enhanced value scoring**: Authority + Engagement + Brand Visibility + Referral Traffic + Perplexity Intelligence

✅ **Platform-specific outreach**: Customized templates for each channel

✅ **Auto-sync to features**: Content Studio (outreach briefs), To-Do (tasks), Radar (competitive gaps)

✅ **Cost-efficient**: $0.40-1.20/month for discovery + Perplexity ranking + AI customization

✅ **High ROI**: A single Hacker News comment or trending Medium article can drive 2,000+ monthly visitors and hundreds of signups

✅ **Smart Prioritization**: Perplexity ranks opportunities 1-20 based on:
  - Real-time traffic trends (rising/stable/declining)
  - Audience quality (decision-maker percentage)
  - Author responsiveness (response rate, typical timing)
  - ROI prediction (traffic, conversion, brand lift)
  - Urgency (time-sensitive opportunities flagged)

**Competitive Advantage**: While competitors chase traditional backlinks with static scores, GeoVera uses Perplexity AI to identify trending opportunities, predict ROI, and prioritize based on real-time web intelligence. You know EXACTLY which opportunities to pursue and WHEN to act for maximum impact.
