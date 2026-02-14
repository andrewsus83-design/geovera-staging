# Insights Daily Task System - Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for the **Insights Daily Task System** - an AI-powered task generation and crisis detection engine that analyzes data across Radar, Hub, Search, and Chat features to generate up to 12 prioritized, actionable tasks daily.

**System Goals:**
- Generate data-driven, goal-oriented tasks (max 12 per day)
- Detect crises early (sentiment spikes, ranking drops, competitor surges)
- Every task has clear "why?" and measurable outcomes
- Tier-based task limits (Basic: 8, Premium: 10, Partner: 12)

---

## 1. Task Generation Algorithm

### 1.1 High-Level Algorithm (Pseudocode)

```javascript
FUNCTION generateDailyInsights(brandId: UUID, tier: string): InsightTask[] {

  // Step 1: Determine task limit based on tier
  taskLimit = getTierLimit(tier)  // Basic: 8, Premium: 10, Partner: 12

  // Step 2: Gather data from all sources
  radarData = fetchRadarData(brandId, days: 7)
  searchData = fetchSearchData(brandId, days: 7)
  hubData = fetchHubData(brandId, days: 7)
  chatData = fetchChatData(brandId, days: 7)

  // Step 3: Detect crises (highest priority)
  crisisAlerts = detectCrises(radarData, searchData, hubData)

  // Step 4: Generate task candidates from each source
  radarTasks = generateRadarTasks(radarData)
  searchTasks = generateSearchTasks(searchData)
  hubTasks = generateHubTasks(hubData)
  chatTasks = generateChatTasks(chatData)

  // Step 5: Merge all candidates
  allCandidates = [
    ...crisisAlerts,      // Priority: urgent
    ...radarTasks,        // Priority: high/medium
    ...searchTasks,       // Priority: high/medium
    ...hubTasks,          // Priority: medium/low
    ...chatTasks          // Priority: medium/low
  ]

  // Step 6: Calculate priority scores for each task
  FOR EACH task IN allCandidates:
    task.priorityScore = calculatePriorityScore(task)
  END FOR

  // Step 7: Rank tasks by priority score
  rankedTasks = sortByPriorityScore(allCandidates, DESC)

  // Step 8: Select top N tasks (with diversity)
  selectedTasks = selectDiverseTasks(rankedTasks, taskLimit)

  // Step 9: Assign categories and deadlines
  FOR EACH task IN selectedTasks:
    task.category = assignCategory(task)
    task.deadline = calculateDeadline(task.priority, task.category)
    task.expectedOutcome = defineExpectedOutcome(task)
  END FOR

  // Step 10: Save to database
  saveInsights(brandId, selectedTasks)

  RETURN selectedTasks
}
```

### 1.2 Data Collection Functions

```javascript
// Radar Data Collection
FUNCTION fetchRadarData(brandId: UUID, days: integer): RadarData {
  RETURN {
    // Mindshare (Creator Rankings)
    creatorRankings: SELECT FROM gv_creator_rankings
      WHERE brand_id = brandId
      AND snapshot_date >= (today - days)
      ORDER BY snapshot_date DESC,

    // Marketshare (Brand Mentions)
    brandMarketshare: SELECT FROM gv_brand_marketshare
      WHERE category = brand.category
      AND snapshot_date >= (today - days),

    // Trendshare (Viral Trends)
    activeTrends: SELECT FROM gv_trends
      WHERE category = brand.category
      AND status IN ('rising', 'peak')
      AND first_detected_at >= (today - days),

    // Content Performance
    topCreatorContent: SELECT FROM gv_creator_content
      WHERE brand_mentions CONTAINS brand.name
      AND posted_at >= (today - days)
      ORDER BY engagement_total DESC
      LIMIT 50,

    // Competitor Activity
    competitorBrands: SELECT FROM gv_discovered_brands
      WHERE brand_id = brandId
      AND is_competitor = true
  }
}

// Search Data Collection
FUNCTION fetchSearchData(brandId: UUID, days: integer): SearchData {
  RETURN {
    // Keyword Rankings
    keywordPerformance: SELECT k.*,
      kh.rank, kh.rank_change, kh.trend
      FROM gv_keywords k
      LEFT JOIN gv_keyword_history kh ON k.id = kh.keyword_id
      WHERE k.brand_id = brandId
      AND kh.tracked_date >= (today - days)
      ORDER BY kh.tracked_date DESC,

    // GEO Scores
    geoScores: SELECT * FROM gv_geo_scores
      WHERE brand_id = brandId
      AND tracked_date >= (today - days),

    // Search Results
    searchResults: SELECT * FROM gv_search_results
      WHERE brand_id = brandId
      AND search_date >= (today - days),

    // Competitor Tracking
    competitors: SELECT * FROM gv_competitors
      WHERE brand_id = brandId
      AND active = true
  }
}

// Hub Data Collection
FUNCTION fetchHubData(brandId: UUID, days: integer): HubData {
  RETURN {
    // Published Articles
    articles: SELECT * FROM gv_hub_articles
      WHERE brand_id = brandId
      AND published_at >= (today - days)
      ORDER BY view_count DESC,

    // Article Analytics
    analytics: SELECT
      article_id,
      COUNT(*) as views,
      AVG(time_on_page) as avg_time
      FROM gv_hub_analytics
      WHERE event_type = 'view'
      AND event_timestamp >= (today - days)
      GROUP BY article_id,

    // Generation Queue
    pendingArticles: SELECT * FROM gv_hub_generation_queue
      WHERE brand_id = brandId
      AND status = 'pending',

    // Daily Quota
    quota: SELECT FROM get_hub_daily_quota(brandId)
  }
}

// Chat Data Collection
FUNCTION fetchChatData(brandId: UUID, days: integer): ChatData {
  RETURN {
    // Recent Conversations
    conversations: SELECT * FROM gv_ai_conversations
      WHERE brand_id = brandId
      AND created_at >= (today - days)
      ORDER BY created_at DESC,

    // AI Insights
    insights: SELECT * FROM gv_ai_insights
      WHERE brand_id = brandId
      AND action_taken = false
      AND discovered_at >= (today - days)
      ORDER BY priority DESC,

    // Daily Briefs
    briefs: SELECT * FROM gv_daily_briefs
      WHERE brand_id = brandId
      AND brief_date >= (today - days)
  }
}
```

### 1.3 Task Generation from Each Source

```javascript
// RADAR TASKS
FUNCTION generateRadarTasks(radarData: RadarData): Task[] {
  tasks = []

  // Task Type 1: Competitor Surge Alert
  FOR EACH competitor IN radarData.competitorBrands:
    recentGrowth = calculateGrowthRate(competitor.id, days: 7)
    IF recentGrowth > 20%:  // 20% growth in 7 days
      tasks.push({
        title: "Competitor Alert: {competitor.name} is growing rapidly",
        why: "{competitor.name} gained {recentGrowth}% mindshare in 7 days. Immediate competitor analysis needed to understand their strategy.",
        category: "competitor_intelligence",
        priority: "high",
        priorityScore: 85 + (recentGrowth * 0.5),
        deadline: today + 2,
        expectedOutcome: "Detailed report on competitor strategy, content themes, and partnership opportunities",
        parameters: {
          competitorId: competitor.id,
          competitorName: competitor.name,
          growthRate: recentGrowth,
          timeframe: "7 days"
        }
      })
    END IF
  END FOR

  // Task Type 2: Ranking Drop Alert
  latestRanking = radarData.creatorRankings[0]
  previousRanking = radarData.creatorRankings[7]
  IF latestRanking.rank_position > previousRanking.rank_position + 3:
    tasks.push({
      title: "Mindshare Ranking Dropped by {rankDrop} positions",
      why: "Your brand dropped from #{previousRanking.rank_position} to #{latestRanking.rank_position} in creator mindshare. This affects visibility and brand awareness.",
      category: "performance_decline",
      priority: "urgent",
      priorityScore: 90 + (rankDrop * 2),
      deadline: today + 1,
      expectedOutcome: "Root cause analysis and action plan to recover ranking position",
      parameters: {
        currentRank: latestRanking.rank_position,
        previousRank: previousRanking.rank_position,
        rankDrop: rankDrop,
        category: brand.category
      }
    })
  END IF

  // Task Type 3: Viral Trend Opportunity
  FOR EACH trend IN radarData.activeTrends:
    brandInvolvement = checkBrandInvolvement(trend.id, brand.id)
    IF trend.status == 'rising' AND !brandInvolvement:
      tasks.push({
        title: "Jump on rising trend: {trend.trend_name}",
        why: "Trend #{trend.trend_name} is rising with {trend.total_posts} posts and {trend.total_reach} reach. Early participation can boost visibility.",
        category: "trend_opportunity",
        priority: "high",
        priorityScore: 75 + (trend.growth_rate * 0.3),
        deadline: today + 3,
        expectedOutcome: "Create and publish 2-3 pieces of content aligned with this trend",
        parameters: {
          trendId: trend.id,
          trendName: trend.trend_name,
          trendHashtag: trend.trend_hashtag,
          totalPosts: trend.total_posts,
          growthRate: trend.growth_rate
        }
      })
    END IF
  END FOR

  // Task Type 4: Top Creator Collaboration Opportunity
  topCreators = radarData.creatorRankings.slice(0, 10)
  FOR EACH creator IN topCreators:
    IF !hasCollaborated(creator.creator_id, brand.id):
      tasks.push({
        title: "Reach out to top creator: {creator.name}",
        why: "Creator {creator.name} is ranked #{creator.rank_position} with {creator.mindshare_percentage}% mindshare. Collaboration can expand brand reach.",
        category: "partnership_opportunity",
        priority: "medium",
        priorityScore: 60 + (10 - creator.rank_position) * 2,
        deadline: today + 7,
        expectedOutcome: "Initial outreach completed, partnership proposal sent",
        parameters: {
          creatorId: creator.creator_id,
          creatorName: creator.name,
          creatorRank: creator.rank_position,
          mindsharePercent: creator.mindshare_percentage
        }
      })
    END IF
  END FOR

  // Task Type 5: Content Quality Improvement
  avgQualityScore = calculateAvgQuality(brand.id, days: 30)
  IF avgQualityScore < 0.6:
    tasks.push({
      title: "Improve content quality score",
      why: "Your average content quality score is {avgQualityScore}/1.0, below industry benchmark of 0.7. Higher quality content drives better engagement.",
      category: "content_optimization",
      priority: "medium",
      priorityScore: 55 + ((0.7 - avgQualityScore) * 100),
      deadline: today + 10,
      expectedOutcome: "Content quality score improved to 0.7+ through better storytelling and production value",
      parameters: {
        currentScore: avgQualityScore,
        targetScore: 0.7,
        timeframe: "30 days"
      }
    })
  END IF

  RETURN tasks
}

// SEARCH TASKS
FUNCTION generateSearchTasks(searchData: SearchData): Task[] {
  tasks = []

  // Task Type 1: Keyword Ranking Drop
  FOR EACH keyword IN searchData.keywordPerformance:
    IF keyword.rank_change < -3:  // Dropped 3+ positions
      tasks.push({
        title: "Keyword '{keyword.keyword}' dropped {abs(keyword.rank_change)} positions",
        why: "Your ranking for '{keyword.keyword}' fell from #{keyword.rank - keyword.rank_change} to #{keyword.rank}. This reduces organic traffic and visibility.",
        category: "seo_alert",
        priority: "high",
        priorityScore: 80 + (abs(keyword.rank_change) * 2),
        deadline: today + 3,
        expectedOutcome: "SEO optimization plan implemented, ranking stabilized or improved",
        parameters: {
          keywordId: keyword.id,
          keyword: keyword.keyword,
          currentRank: keyword.rank,
          rankChange: keyword.rank_change,
          keywordType: keyword.keyword_type
        }
      })
    END IF
  END FOR

  // Task Type 2: New Keyword Opportunity
  competitorKeywords = analyzeCompetitorKeywords(searchData.competitors)
  FOR EACH keyword IN competitorKeywords:
    IF !brandTracksKeyword(keyword) AND keyword.searchVolume > 1000:
      tasks.push({
        title: "Target new keyword: '{keyword.text}'",
        why: "Competitor {keyword.competitorName} ranks #{keyword.rank} for '{keyword.text}' with {keyword.searchVolume} monthly searches. Untapped opportunity.",
        category: "keyword_opportunity",
        priority: "medium",
        priorityScore: 65 + (keyword.searchVolume / 100),
        deadline: today + 7,
        expectedOutcome: "Keyword tracked, content optimized for this keyword, initial ranking achieved",
        parameters: {
          keyword: keyword.text,
          searchVolume: keyword.searchVolume,
          competitorRank: keyword.rank,
          competitorName: keyword.competitorName
        }
      })
    END IF
  END FOR

  // Task Type 3: GEO Score Decline
  FOR EACH location IN searchData.geoScores:
    IF location.score_change < -5:  // Score dropped 5+ points
      tasks.push({
        title: "GEO score dropped in {location.location}",
        why: "Google Maps visibility score fell from {location.previous_score} to {location.current_score} in {location.location}. This impacts local discovery.",
        category: "local_seo_alert",
        priority: "high",
        priorityScore: 75 + (abs(location.score_change) * 1.5),
        deadline: today + 2,
        expectedOutcome: "GEO optimization completed: reviews responded, photos updated, GMB profile enhanced",
        parameters: {
          location: location.location,
          currentScore: location.current_score,
          previousScore: location.previous_score,
          scoreChange: location.score_change
        }
      })
    END IF
  END FOR

  RETURN tasks
}

// HUB TASKS
FUNCTION generateHubTasks(hubData: HubData): Task[] {
  tasks = []

  // Task Type 1: Publish Pending Articles
  IF hubData.pendingArticles.length > 0 AND hubData.quota.remaining_quota > 0:
    tasks.push({
      title: "Review and publish {hubData.pendingArticles.length} pending articles",
      why: "You have {hubData.pendingArticles.length} AI-generated articles ready for review. Publishing authoritative content boosts SEO and brand credibility.",
      category: "content_publishing",
      priority: "medium",
      priorityScore: 60 + (hubData.pendingArticles.length * 5),
      deadline: today + 3,
      expectedOutcome: "All pending articles reviewed, edited, and published on Authority Hub",
      parameters: {
        pendingCount: hubData.pendingArticles.length,
        remainingQuota: hubData.quota.remaining_quota,
        articleIds: hubData.pendingArticles.map(a => a.id)
      }
    })
  END IF

  // Task Type 2: Low Performing Content
  FOR EACH article IN hubData.articles:
    analytics = hubData.analytics.find(a => a.article_id == article.id)
    IF analytics.views < 10 AND daysSincePublished(article) > 7:
      tasks.push({
        title: "Promote underperforming article: {article.title}",
        why: "Article '{article.title}' has only {analytics.views} views in {daysSincePublished} days. Promotion can increase visibility and ROI.",
        category: "content_promotion",
        priority: "low",
        priorityScore: 40 + (daysSincePublished(article)),
        deadline: today + 5,
        expectedOutcome: "Article shared on social media, newsletter, and optimized for SEO",
        parameters: {
          articleId: article.id,
          articleTitle: article.title,
          currentViews: analytics.views,
          daysSincePublished: daysSincePublished(article)
        }
      })
    END IF
  END FOR

  // Task Type 3: Generate New Content
  IF hubData.quota.remaining_quota > 0:
    topicSuggestions = getContentTopics(brand.category)
    tasks.push({
      title: "Generate new Authority Hub article on trending topic",
      why: "You have {hubData.quota.remaining_quota} article credits remaining. Creating fresh content improves SEO and establishes thought leadership.",
      category: "content_creation",
      priority: "medium",
      priorityScore: 55,
      deadline: today + 7,
      expectedOutcome: "New article generated, reviewed, and published on a relevant trending topic",
      parameters: {
        remainingQuota: hubData.quota.remaining_quota,
        suggestedTopics: topicSuggestions
      }
    })
  END IF

  RETURN tasks
}

// CHAT TASKS
FUNCTION generateChatTasks(chatData: ChatData): Task[] {
  tasks = []

  // Task Type 1: Unaddressed AI Insights
  FOR EACH insight IN chatData.insights:
    IF insight.priority IN ('high', 'urgent') AND !insight.action_taken:
      tasks.push({
        title: insight.title,
        why: insight.description,
        category: "ai_recommendation",
        priority: insight.priority,
        priorityScore: calculateInsightScore(insight),
        deadline: today + 2,
        expectedOutcome: "Insight reviewed and actionable steps taken or dismissed with reasoning",
        parameters: {
          insightId: insight.id,
          insightType: insight.insight_type,
          confidenceScore: insight.confidence_score,
          aiProvider: insight.ai_provider
        }
      })
    END IF
  END FOR

  // Task Type 2: Daily Brief Action Items
  latestBrief = chatData.briefs[0]
  IF latestBrief.untapped_opportunities.length > 0:
    topOpportunity = latestBrief.untapped_opportunities[0]
    tasks.push({
      title: "Explore Blue Ocean opportunity: {topOpportunity.topic}",
      why: "AI detected untapped market: '{topOpportunity.topic}' with {topOpportunity.volume} search volume and low competition. First-mover advantage available.",
      category: "market_opportunity",
      priority: "high",
      priorityScore: 70 + (topOpportunity.volume / 100),
      deadline: today + 5,
      expectedOutcome: "Market research completed, content strategy developed for this opportunity",
      parameters: {
        topic: topOpportunity.topic,
        volume: topOpportunity.volume,
        competition: topOpportunity.competition,
        briefId: latestBrief.id
      }
    })
  END IF

  RETURN tasks
}
```

---

## 2. Crisis Detection System

### 2.1 Crisis Detection Rules & Thresholds

```javascript
FUNCTION detectCrises(radarData, searchData, hubData): CrisisAlert[] {
  crises = []

  // CRISIS TYPE 1: Viral Negative Mentions
  // Threshold: 50+ negative mentions with 100K+ reach in 24 hours
  negativeMentions = countNegativeMentions(brand.id, hours: 24)
  IF negativeMentions.count > 50 AND negativeMentions.totalReach > 100000:
    severity = calculateSeverity(negativeMentions.count, negativeMentions.totalReach)
    crises.push({
      type: "viral_negative_mentions",
      severity: severity,  // 'critical', 'high', 'medium'
      title: "CRISIS: {negativeMentions.count} negative mentions (Reach: {formatNumber(negativeMentions.totalReach)})",
      description: "Viral negative sentiment detected. Immediate brand reputation management required.",
      detectedAt: now(),
      metrics: {
        mentionCount: negativeMentions.count,
        totalReach: negativeMentions.totalReach,
        averageSentiment: negativeMentions.avgSentiment,
        topPlatforms: negativeMentions.platforms,
        keyPhrases: negativeMentions.commonPhrases
      },
      recommendedActions: [
        "Issue official statement within 2 hours",
        "Monitor all social channels continuously",
        "Engage with top influencers discussing the issue",
        "Prepare customer service team with FAQ responses"
      ]
    })
  END IF

  // CRISIS TYPE 2: Sentiment Spike (Positive or Negative)
  // Threshold: +/- 30% sentiment change in 48 hours
  sentimentChange = calculateSentimentChange(brand.id, hours: 48)
  IF abs(sentimentChange.percentChange) > 30:
    crises.push({
      type: sentimentChange.direction == 'negative' ? "sentiment_crash" : "sentiment_surge",
      severity: sentimentChange.direction == 'negative' ? "high" : "medium",
      title: sentimentChange.direction == 'negative'
        ? "CRISIS: Brand sentiment dropped {abs(sentimentChange.percentChange)}% in 48h"
        : "ALERT: Brand sentiment surged +{sentimentChange.percentChange}% in 48h",
      description: sentimentChange.direction == 'negative'
        ? "Rapid negative sentiment shift detected. Brand perception crisis possible."
        : "Positive sentiment spike detected. Capitalize on this momentum immediately.",
      detectedAt: now(),
      metrics: {
        currentSentiment: sentimentChange.current,
        previousSentiment: sentimentChange.previous,
        percentChange: sentimentChange.percentChange,
        triggerSources: sentimentChange.sources,
        affectedPlatforms: sentimentChange.platforms
      },
      recommendedActions: sentimentChange.direction == 'negative' ? [
        "Identify root cause of sentiment shift",
        "Audit recent brand activities for missteps",
        "Prepare crisis communication plan",
        "Engage PR team immediately"
      ] : [
        "Amplify positive momentum with additional content",
        "Engage with positive commenters",
        "Document success for case studies",
        "Increase ad spend to capitalize on positive sentiment"
      ]
    })
  END IF

  // CRISIS TYPE 3: Ranking Drop (Severe)
  // Threshold: Drop of 5+ positions in 48 hours for priority keywords
  FOR EACH keyword IN searchData.keywordPerformance:
    IF keyword.priority == 'high' AND keyword.rank_change < -5:
      recentChange = getRecentRankingChange(keyword.id, hours: 48)
      IF recentChange.drop >= 5:
        crises.push({
          type: "ranking_crash",
          severity: "high",
          title: "CRISIS: Keyword '{keyword.keyword}' dropped {recentChange.drop} positions in 48h",
          description: "Severe ranking drop detected. Algorithm penalty or competitor surge possible.",
          detectedAt: now(),
          metrics: {
            keyword: keyword.keyword,
            currentRank: keyword.rank,
            previousRank: keyword.rank - keyword.rank_change,
            rankDrop: recentChange.drop,
            searchVolume: keyword.search_volume,
            estimatedTrafficLoss: calculateTrafficLoss(keyword)
          },
          recommendedActions: [
            "Audit page for technical SEO issues",
            "Check for Google algorithm updates",
            "Analyze competitor changes",
            "Review content quality and relevance",
            "Implement emergency SEO optimization"
          ]
        })
      END IF
    END IF
  END FOR

  // CRISIS TYPE 4: Competitor Surge
  // Threshold: Competitor gains 40%+ marketshare in 7 days
  FOR EACH competitor IN radarData.competitorBrands:
    marketshareGrowth = getMarketshareGrowth(competitor.id, days: 7)
    IF marketshareGrowth > 40:
      crises.push({
        type: "competitor_surge",
        severity: "high",
        title: "CRISIS: Competitor '{competitor.name}' gained {marketshareGrowth}% marketshare in 7 days",
        description: "Rapid competitor growth detected. Competitive position threatened.",
        detectedAt: now(),
        metrics: {
          competitorName: competitor.name,
          marketshareGrowth: marketshareGrowth,
          currentMarketshare: competitor.currentMarketshare,
          brandMarketshare: brand.currentMarketshare,
          growthSources: competitor.growthSources
        },
        recommendedActions: [
          "Deep-dive competitor analysis (content, partnerships, campaigns)",
          "Identify competitive gaps in brand strategy",
          "Accelerate content production",
          "Explore counter-partnerships with key creators",
          "Adjust marketing budget allocation"
        ]
      })
    END IF
  END FOR

  // CRISIS TYPE 5: GEO Score Crash
  // Threshold: GEO score drops 15+ points in 24 hours
  FOR EACH location IN searchData.geoScores:
    recentDrop = getRecentGeoScoreChange(location.id, hours: 24)
    IF recentDrop <= -15:
      crises.push({
        type: "geo_score_crash",
        severity: "critical",
        title: "CRISIS: GEO score in '{location.location}' dropped {abs(recentDrop)} points in 24h",
        description: "Severe local SEO visibility loss. Google My Business crisis possible.",
        detectedAt: now(),
        metrics: {
          location: location.location,
          currentScore: location.current_score,
          scoreDrop: abs(recentDrop),
          affectedRadius: location.radius_km,
          estimatedVisibilityLoss: calculateVisibilityLoss(recentDrop)
        },
        recommendedActions: [
          "Check Google My Business for policy violations",
          "Review recent negative reviews (respond immediately)",
          "Verify business information accuracy",
          "Update photos and business hours",
          "Contact Google My Business support if needed"
        ]
      })
    END IF
  END FOR

  // CRISIS TYPE 6: Content Performance Collapse
  // Threshold: Average engagement drops 50%+ in 7 days
  engagementChange = calculateEngagementChange(brand.id, days: 7)
  IF engagementChange.percentDrop > 50:
    crises.push({
      type: "engagement_collapse",
      severity: "medium",
      title: "ALERT: Content engagement dropped {engagementChange.percentDrop}% in 7 days",
      description: "Significant audience disengagement detected. Content strategy adjustment needed.",
      detectedAt: now(),
      metrics: {
        currentEngagement: engagementChange.current,
        previousEngagement: engagementChange.previous,
        percentDrop: engagementChange.percentDrop,
        affectedPlatforms: engagementChange.platforms,
        contentTypes: engagementChange.contentTypes
      },
      recommendedActions: [
        "Analyze recent content for quality issues",
        "Survey audience for feedback",
        "Review content calendar and adjust topics",
        "Test new content formats",
        "Increase influencer collaborations"
      ]
    })
  END IF

  RETURN crises
}

// Helper: Calculate Crisis Severity
FUNCTION calculateSeverity(count: integer, reach: integer): string {
  score = (count * 0.3) + (reach / 10000)

  IF score > 100: RETURN 'critical'
  ELSE IF score > 50: RETURN 'high'
  ELSE: RETURN 'medium'
}

// Crisis Logging
FUNCTION logCrisis(crisis: CrisisAlert, brandId: UUID): void {
  INSERT INTO gv_crisis_events (
    brand_id,
    crisis_type,
    severity,
    title,
    description,
    metrics,
    recommended_actions,
    detected_at,
    status
  ) VALUES (
    brandId,
    crisis.type,
    crisis.severity,
    crisis.title,
    crisis.description,
    crisis.metrics,
    crisis.recommendedActions,
    crisis.detectedAt,
    'active'
  )
}
```

### 2.2 Crisis Thresholds Reference Table

| Crisis Type | Threshold | Severity | Response Time | Priority Score |
|-------------|-----------|----------|---------------|----------------|
| Viral Negative Mentions | 50+ mentions + 100K+ reach in 24h | Critical | < 2 hours | 95-100 |
| Sentiment Crash | -30% sentiment change in 48h | High | < 4 hours | 90-95 |
| Ranking Drop | -5 positions in 48h (priority keywords) | High | < 24 hours | 85-90 |
| Competitor Surge | +40% marketshare in 7 days | High | < 48 hours | 80-85 |
| GEO Score Crash | -15 points in 24h | Critical | < 2 hours | 95-100 |
| Engagement Collapse | -50% engagement in 7 days | Medium | < 72 hours | 70-75 |

---

## 3. Task Structure & JSON Schema

### 3.1 Task Object Schema

```typescript
interface InsightTask {
  // Core Identity
  id: string;  // UUID
  brand_id: string;  // UUID

  // Task Content
  title: string;  // Max 100 chars, clear action statement
  why: string;  // 200-300 chars, explains reasoning and goal
  description: string;  // Full details (optional)

  // Categorization
  category: TaskCategory;
  priority: TaskPriority;
  priorityScore: number;  // 0-100, used for ranking

  // Timing
  deadline: Date;  // Auto-calculated based on priority
  expectedDuration: number;  // Estimated minutes to complete

  // Expected Outcome
  expectedOutcome: string;  // Clear, measurable result
  successMetrics: SuccessMetric[];

  // Parameters (task-specific data)
  parameters: Record<string, any>;  // Flexible JSON

  // Source Tracking
  sourceType: 'radar' | 'search' | 'hub' | 'chat' | 'crisis';
  sourceData: {
    dataPoints: string[];  // Array of source table + IDs
    aiProvider?: string;
    confidenceScore?: number;
  };

  // Action Tracking
  actionStatus: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  completedAt?: Date;
  dismissedReason?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;  // For time-sensitive tasks
}

type TaskCategory =
  | 'competitor_intelligence'
  | 'performance_decline'
  | 'trend_opportunity'
  | 'partnership_opportunity'
  | 'content_optimization'
  | 'seo_alert'
  | 'keyword_opportunity'
  | 'local_seo_alert'
  | 'content_publishing'
  | 'content_promotion'
  | 'content_creation'
  | 'ai_recommendation'
  | 'market_opportunity'
  | 'crisis_response';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface SuccessMetric {
  metric: string;
  target: number;
  unit: string;
  timeframe: string;
}
```

### 3.2 Example Tasks (Full JSON)

#### Example 1: Crisis Task - Viral Negative Mentions

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "brand_id": "7f3a8c2d-1b4e-4f9a-8c3d-9e8f7a6b5c4d",
  "title": "CRISIS: 87 negative mentions (Reach: 2.3M)",
  "why": "Viral negative sentiment detected with 87 mentions reaching 2.3M people in 24 hours. Immediate brand reputation management required to prevent long-term damage.",
  "description": "Multiple creators are discussing a product quality issue that went viral on TikTok. The conversation has spread to Instagram and Twitter. Top influencers in your category are involved.",
  "category": "crisis_response",
  "priority": "urgent",
  "priorityScore": 98,
  "deadline": "2026-02-15T02:00:00Z",
  "expectedDuration": 120,
  "expectedOutcome": "Official statement issued, top 10 influencers contacted, customer service team briefed, negative mentions reduced by 50%",
  "successMetrics": [
    {
      "metric": "negative_mentions",
      "target": 40,
      "unit": "mentions",
      "timeframe": "24 hours"
    },
    {
      "metric": "sentiment_score",
      "target": 0.4,
      "unit": "score",
      "timeframe": "48 hours"
    }
  ],
  "parameters": {
    "mentionCount": 87,
    "totalReach": 2300000,
    "averageSentiment": -0.72,
    "topPlatforms": ["tiktok", "instagram", "twitter"],
    "keyPhrases": ["product broke", "waste of money", "disappointed"],
    "topInfluencers": [
      {
        "name": "Sarah Martinez",
        "handle": "@sarahmartinez",
        "followers": 450000,
        "mentionReach": 890000
      }
    ]
  },
  "sourceType": "crisis",
  "sourceData": {
    "dataPoints": [
      "gv_creator_content:c4f3a8e2-5d6b-4a9c-8f7e-9d8c7b6a5f4e",
      "gv_creator_content:d5g4b9f3-6e7c-5b0d-9g8f-0e9d8c7b6g5f"
    ],
    "aiProvider": "claude",
    "confidenceScore": 0.94
  },
  "actionStatus": "pending",
  "createdAt": "2026-02-14T08:30:00Z",
  "updatedAt": "2026-02-14T08:30:00Z",
  "expiresAt": "2026-02-15T08:30:00Z"
}
```

#### Example 2: High Priority - Competitor Surge

```json
{
  "id": "660f9511-f30c-52e5-b827-557766551002",
  "brand_id": "7f3a8c2d-1b4e-4f9a-8c3d-9e8f7a6b5c4d",
  "title": "Competitor Alert: BrandX is growing rapidly",
  "why": "BrandX gained 48% mindshare in 7 days through influencer partnerships. Immediate competitor analysis needed to understand their strategy and respond.",
  "description": "BrandX has launched a major influencer campaign with 15 top creators in your category. They're using a new hashtag challenge that's gaining traction.",
  "category": "competitor_intelligence",
  "priority": "high",
  "priorityScore": 89,
  "deadline": "2026-02-16T08:00:00Z",
  "expectedDuration": 180,
  "expectedOutcome": "Detailed report on competitor strategy, content themes, and partnership opportunities. Action plan to counter competitive threat.",
  "successMetrics": [
    {
      "metric": "competitor_analysis_completed",
      "target": 1,
      "unit": "report",
      "timeframe": "48 hours"
    },
    {
      "metric": "counter_strategy_launched",
      "target": 1,
      "unit": "campaign",
      "timeframe": "7 days"
    }
  ],
  "parameters": {
    "competitorId": "8g4b9d3e-2c5f-5g0f-9h8g-1f0e9d8c7h6g",
    "competitorName": "BrandX",
    "growthRate": 48.3,
    "timeframe": "7 days",
    "currentMarketshare": 18.5,
    "brandMarketshare": 22.1,
    "campaignDetails": {
      "hashtag": "#BrandXChallenge",
      "influencerCount": 15,
      "totalReach": 8500000,
      "avgEngagementRate": 6.8
    }
  },
  "sourceType": "radar",
  "sourceData": {
    "dataPoints": [
      "gv_brand_marketshare:e6h5c0g4-7f8d-6c1e-0h9g-2g1f0e9d8h7g",
      "gv_trend_involvement:f7i6d1h5-8g9e-7d2f-1i0h-3h2g1f0e9i8h"
    ],
    "confidenceScore": 0.91
  },
  "actionStatus": "pending",
  "createdAt": "2026-02-14T08:30:00Z",
  "updatedAt": "2026-02-14T08:30:00Z"
}
```

#### Example 3: Medium Priority - Trend Opportunity

```json
{
  "id": "770g0622-g41d-63f6-c938-668877662003",
  "brand_id": "7f3a8c2d-1b4e-4f9a-8c3d-9e8f7a6b5c4d",
  "title": "Jump on rising trend: #SustainableBeauty",
  "why": "Trend #SustainableBeauty is rising with 12,400 posts and 45M reach. Early participation can boost visibility and align with eco-conscious consumers.",
  "description": "This sustainability trend is gaining momentum in your category. 8 of top 10 creators have posted about it in the last 72 hours.",
  "category": "trend_opportunity",
  "priority": "high",
  "priorityScore": 78,
  "deadline": "2026-02-17T08:00:00Z",
  "expectedDuration": 240,
  "expectedOutcome": "Create and publish 2-3 pieces of content aligned with #SustainableBeauty trend, achieving 500K+ reach",
  "successMetrics": [
    {
      "metric": "content_published",
      "target": 3,
      "unit": "posts",
      "timeframe": "3 days"
    },
    {
      "metric": "trend_reach",
      "target": 500000,
      "unit": "impressions",
      "timeframe": "7 days"
    },
    {
      "metric": "trend_engagement",
      "target": 15000,
      "unit": "interactions",
      "timeframe": "7 days"
    }
  ],
  "parameters": {
    "trendId": "9h5c0e5f-3d6g-6h1g-1i0i-4i3h2g1f0j9i",
    "trendName": "Sustainable Beauty Movement",
    "trendHashtag": "#SustainableBeauty",
    "totalPosts": 12400,
    "totalReach": 45000000,
    "growthRate": 215.5,
    "status": "rising",
    "topCreators": [
      "EcoBeautyGuru",
      "GreenGlamour",
      "SustainableSkin"
    ],
    "contentThemes": [
      "Zero-waste packaging",
      "Eco-friendly ingredients",
      "Sustainable sourcing"
    ]
  },
  "sourceType": "radar",
  "sourceData": {
    "dataPoints": [
      "gv_trends:h8j7e2i6-9h0f-8e3g-2j1i-5j4i3h2g1k0j",
      "gv_trend_involvement:i9k8f3j7-0i1g-9f4h-3k2j-6k5j4i3h2l1k"
    ],
    "confidenceScore": 0.86
  },
  "actionStatus": "pending",
  "createdAt": "2026-02-14T08:30:00Z",
  "updatedAt": "2026-02-14T08:30:00Z",
  "expiresAt": "2026-02-21T08:30:00Z"
}
```

#### Example 4: Medium Priority - SEO Alert

```json
{
  "id": "880h1733-h52e-74g7-d049-779988773004",
  "brand_id": "7f3a8c2d-1b4e-4f9a-8c3d-9e8f7a6b5c4d",
  "title": "Keyword 'organic skincare routine' dropped 5 positions",
  "why": "Your ranking for 'organic skincare routine' fell from #3 to #8. This keyword has 8,200 monthly searches and drives 15% of your organic traffic.",
  "description": "Competitor GlowNaturals has overtaken you with fresh content published last week. Their article has more multimedia elements and better E-A-T signals.",
  "category": "seo_alert",
  "priority": "high",
  "priorityScore": 82,
  "deadline": "2026-02-17T08:00:00Z",
  "expectedDuration": 150,
  "expectedOutcome": "SEO optimization plan implemented, ranking stabilized or improved to top 5, organic traffic recovered",
  "successMetrics": [
    {
      "metric": "keyword_rank",
      "target": 5,
      "unit": "position",
      "timeframe": "14 days"
    },
    {
      "metric": "organic_traffic",
      "target": 450,
      "unit": "visits",
      "timeframe": "30 days"
    }
  ],
  "parameters": {
    "keywordId": "j0l9g4k8-1j2h-0g5i-4l3k-7l6k5j4i3m2l",
    "keyword": "organic skincare routine",
    "currentRank": 8,
    "previousRank": 3,
    "rankChange": -5,
    "keywordType": "seo",
    "searchVolume": 8200,
    "estimatedTrafficLoss": 320,
    "competitorInsights": {
      "topCompetitor": "GlowNaturals",
      "theirRank": 2,
      "theirStrengths": [
        "Video tutorial embedded",
        "10+ product images",
        "Medical professional quotes",
        "Updated last week"
      ]
    }
  },
  "sourceType": "search",
  "sourceData": {
    "dataPoints": [
      "gv_keywords:k1m0h5l9-2k3i-1h6j-5m4l-8m7l6k5j4n3m",
      "gv_keyword_history:l2n1i6m0-3l4j-2i7k-6n5m-9n8m7l6k5o4n"
    ],
    "confidenceScore": 0.88
  },
  "actionStatus": "pending",
  "createdAt": "2026-02-14T08:30:00Z",
  "updatedAt": "2026-02-14T08:30:00Z"
}
```

#### Example 5: Low Priority - Content Publishing

```json
{
  "id": "990i2844-i63f-85h8-e150-880099884005",
  "brand_id": "7f3a8c2d-1b4e-4f9a-8c3d-9e8f7a6b5c4d",
  "title": "Review and publish 3 pending articles",
  "why": "You have 3 AI-generated articles ready for review. Publishing authoritative content boosts SEO and brand credibility.",
  "description": "Articles ready: 'Best Natural Moisturizers 2026', 'How to Build a Morning Skincare Routine', 'Understanding Retinol: A Complete Guide'",
  "category": "content_publishing",
  "priority": "medium",
  "priorityScore": 55,
  "deadline": "2026-02-17T08:00:00Z",
  "expectedDuration": 90,
  "expectedOutcome": "All pending articles reviewed, edited, and published on Authority Hub with SEO optimization",
  "successMetrics": [
    {
      "metric": "articles_published",
      "target": 3,
      "unit": "articles",
      "timeframe": "3 days"
    },
    {
      "metric": "seo_score",
      "target": 85,
      "unit": "score",
      "timeframe": "per article"
    }
  ],
  "parameters": {
    "pendingCount": 3,
    "remainingQuota": 2,
    "articleIds": [
      "m3o2j7n1-4m5k-3j8l-7o6n-0o9n8m7l6p5o",
      "n4p3k8o2-5n6l-4k9m-8p7o-1p0o9n8m7q6p",
      "o5q4l9p3-6o7m-5l0n-9q8p-2q1p0o9n8r7q"
    ],
    "articleTitles": [
      "Best Natural Moisturizers 2026",
      "How to Build a Morning Skincare Routine",
      "Understanding Retinol: A Complete Guide"
    ],
    "estimatedReadingTime": [8, 6, 12],
    "contentQuality": [0.87, 0.91, 0.89]
  },
  "sourceType": "hub",
  "sourceData": {
    "dataPoints": [
      "gv_hub_generation_queue:p6r5m0q4-7p8n-6m1o-0r9q-3r2q1p0o9s8r"
    ],
    "aiProvider": "claude",
    "confidenceScore": 0.92
  },
  "actionStatus": "pending",
  "createdAt": "2026-02-14T08:30:00Z",
  "updatedAt": "2026-02-14T08:30:00Z"
}
```

---

## 4. Priority Scoring System

### 4.1 Priority Score Calculation

```javascript
FUNCTION calculatePriorityScore(task: Task): number {
  // Base score from priority level
  basePriority = {
    'urgent': 90,
    'high': 70,
    'medium': 50,
    'low': 30
  }[task.priority]

  // Factor 1: Impact Score (0-100)
  impactScore = task.impact_score || 50

  // Factor 2: Time Sensitivity (0-20)
  timeSensitivity = calculateTimeSensitivity(task)

  // Factor 3: Data Confidence (0-10)
  confidenceBonus = (task.sourceData.confidenceScore || 0.5) * 10

  // Factor 4: Category Weight (0-10)
  categoryWeight = {
    'crisis_response': 10,
    'competitor_intelligence': 8,
    'performance_decline': 8,
    'seo_alert': 7,
    'trend_opportunity': 6,
    'keyword_opportunity': 5,
    'content_optimization': 4,
    'partnership_opportunity': 4,
    'content_publishing': 3,
    'content_promotion': 2,
    'content_creation': 2
  }[task.category] || 3

  // Factor 5: Recency Bonus (0-5)
  // More recent data = higher priority
  recencyBonus = task.sourceData.dataAge < 24 ? 5 :
                 task.sourceData.dataAge < 72 ? 3 : 0

  // Calculate final score (0-100)
  finalScore = (
    basePriority * 0.4 +
    impactScore * 0.3 +
    timeSensitivity * 0.15 +
    confidenceBonus * 0.05 +
    categoryWeight * 0.05 +
    recencyBonus * 0.05
  )

  // Cap at 100
  RETURN min(finalScore, 100)
}

FUNCTION calculateTimeSensitivity(task: Task): number {
  hoursUntilDeadline = (task.deadline - now()) / HOUR

  IF hoursUntilDeadline < 24:
    RETURN 20  // Extremely urgent
  ELSE IF hoursUntilDeadline < 48:
    RETURN 15  // Very urgent
  ELSE IF hoursUntilDeadline < 72:
    RETURN 10  // Urgent
  ELSE IF hoursUntilDeadline < 168:  // 1 week
    RETURN 5   // Moderate
  ELSE:
    RETURN 0   // Low
  END IF
}
```

### 4.2 Task Selection & Diversity

```javascript
FUNCTION selectDiverseTasks(rankedTasks: Task[], limit: integer): Task[] {
  selected = []
  categoryCount = {}
  sourceCount = {}

  // Priority 1: Always include crisis tasks (up to 3)
  crisisTasks = rankedTasks.filter(t => t.category == 'crisis_response')
  FOR EACH crisis IN crisisTasks.slice(0, 3):
    selected.push(crisis)
    categoryCount['crisis_response'] = (categoryCount['crisis_response'] || 0) + 1
  END FOR

  // Priority 2: Fill remaining slots with diversity
  FOR EACH task IN rankedTasks:
    IF selected.length >= limit:
      BREAK
    END IF

    // Skip if already selected
    IF task IN selected:
      CONTINUE
    END IF

    // Diversity constraint: Max 4 tasks per category
    IF (categoryCount[task.category] || 0) >= 4:
      CONTINUE
    END IF

    // Diversity constraint: Max 5 tasks per source type
    IF (sourceCount[task.sourceType] || 0) >= 5:
      CONTINUE
    END IF

    // Add task
    selected.push(task)
    categoryCount[task.category] = (categoryCount[task.category] || 0) + 1
    sourceCount[task.sourceType] = (sourceCount[task.sourceType] || 0) + 1
  END FOR

  RETURN selected
}
```

---

## 5. Database Schema Extensions

### 5.1 New Table: `gv_task_actions` (Completion Tracking)

```sql
CREATE TABLE gv_task_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to insight task
  insight_id UUID NOT NULL REFERENCES gv_daily_insights(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Action tracking
  action_type TEXT NOT NULL CHECK (action_type IN (
    'started',
    'completed',
    'dismissed',
    'snoozed',
    'escalated'
  )),

  -- Completion details
  completion_notes TEXT,
  time_spent_minutes INTEGER,
  success_metrics_achieved JSONB,  -- {metric: value}

  -- Quality assessment (post-completion)
  outcome_quality TEXT CHECK (outcome_quality IN ('poor', 'average', 'good', 'excellent')),
  user_feedback TEXT,

  -- Timestamps
  action_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_actions_insight ON gv_task_actions(insight_id);
CREATE INDEX idx_task_actions_brand ON gv_task_actions(brand_id);
CREATE INDEX idx_task_actions_user ON gv_task_actions(user_id);
CREATE INDEX idx_task_actions_type ON gv_task_actions(action_type);

COMMENT ON TABLE gv_task_actions IS 'Track user actions on daily insight tasks';
```

### 5.2 New Table: `gv_crisis_events` (Crisis Log)

```sql
CREATE TABLE gv_crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Crisis details
  crisis_type TEXT NOT NULL CHECK (crisis_type IN (
    'viral_negative_mentions',
    'sentiment_crash',
    'sentiment_surge',
    'ranking_crash',
    'competitor_surge',
    'geo_score_crash',
    'engagement_collapse'
  )),

  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Crisis metrics
  metrics JSONB NOT NULL,  -- Crisis-specific data

  -- Recommendations
  recommended_actions JSONB,  -- Array of action strings

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved', 'escalated')),

  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Linked insight task (auto-generated)
  insight_task_id UUID REFERENCES gv_daily_insights(id) ON DELETE SET NULL,

  -- Timestamps
  detected_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crisis_events_brand ON gv_crisis_events(brand_id);
CREATE INDEX idx_crisis_events_type ON gv_crisis_events(crisis_type);
CREATE INDEX idx_crisis_events_severity ON gv_crisis_events(severity);
CREATE INDEX idx_crisis_events_status ON gv_crisis_events(status);
CREATE INDEX idx_crisis_events_detected ON gv_crisis_events(detected_at DESC);

COMMENT ON TABLE gv_crisis_events IS 'Log and track brand crisis events';
```

### 5.3 Update: `gv_daily_insights` Table (Add Missing Fields)

```sql
-- Add new columns to existing gv_daily_insights table
ALTER TABLE gv_daily_insights
ADD COLUMN IF NOT EXISTS expected_outcome TEXT,
ADD COLUMN IF NOT EXISTS expected_duration INTEGER,  -- minutes
ADD COLUMN IF NOT EXISTS success_metrics JSONB,
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('radar', 'search', 'hub', 'chat', 'crisis')),
ADD COLUMN IF NOT EXISTS source_data JSONB,
ADD COLUMN IF NOT EXISTS priority_score NUMERIC(5,2);  -- 0-100

-- Add parameters column (renamed from data for clarity)
ALTER TABLE gv_daily_insights
ADD COLUMN IF NOT EXISTS parameters JSONB;

-- Create index on priority score
CREATE INDEX IF NOT EXISTS idx_daily_insights_priority_score
ON gv_daily_insights(priority_score DESC);

COMMENT ON COLUMN gv_daily_insights.expected_outcome IS 'Clear, measurable expected result';
COMMENT ON COLUMN gv_daily_insights.success_metrics IS 'Array of {metric, target, unit, timeframe}';
COMMENT ON COLUMN gv_daily_insights.source_type IS 'Data source: radar, search, hub, chat, or crisis';
COMMENT ON COLUMN gv_daily_insights.priority_score IS 'Calculated priority score (0-100) for ranking';
```

---

## 6. Implementation Timeline

### Phase 1: Foundation (Week 1-2)

#### Functions to Build:

1. **`insights-generate-tasks` (Edge Function)**
   - Input: `{ brandId: UUID, tier: string }`
   - Output: Array of tasks (max 12)
   - Implements main algorithm
   - Scheduled: Daily at 6:00 AM (brand timezone)

2. **`insights-detect-crises` (Edge Function)**
   - Input: `{ brandId: UUID }`
   - Output: Array of crisis alerts
   - Runs: Every 4 hours for real-time detection

3. **`insights-calculate-priority` (Utility Function)**
   - Input: Task object
   - Output: Priority score (0-100)
   - Used by: `insights-generate-tasks`

4. **Database Setup**
   - Create `gv_task_actions` table
   - Create `gv_crisis_events` table
   - Update `gv_daily_insights` table
   - Add indexes

### Phase 2: Data Collection (Week 3)

#### Functions to Build:

5. **`insights-collect-radar-data` (Module)**
   - Fetches Radar data (7-day window)
   - Returns: RadarData object

6. **`insights-collect-search-data` (Module)**
   - Fetches Search data (7-day window)
   - Returns: SearchData object

7. **`insights-collect-hub-data` (Module)**
   - Fetches Hub data (7-day window)
   - Returns: HubData object

8. **`insights-collect-chat-data` (Module)**
   - Fetches Chat data (7-day window)
   - Returns: ChatData object

### Phase 3: Task Generation (Week 4)

#### Functions to Build:

9. **`insights-generate-radar-tasks` (Module)**
   - Input: RadarData
   - Output: Array of task candidates
   - Implements Radar-specific logic

10. **`insights-generate-search-tasks` (Module)**
    - Input: SearchData
    - Output: Array of task candidates
    - Implements Search-specific logic

11. **`insights-generate-hub-tasks` (Module)**
    - Input: HubData
    - Output: Array of task candidates
    - Implements Hub-specific logic

12. **`insights-generate-chat-tasks` (Module)**
    - Input: ChatData
    - Output: Array of task candidates
    - Implements Chat-specific logic

### Phase 4: Crisis Detection (Week 5)

#### Functions to Build:

13. **`insights-detect-viral-negative` (Module)**
    - Detects viral negative mentions
    - Threshold: 50+ mentions, 100K+ reach

14. **`insights-detect-sentiment-spike` (Module)**
    - Detects sentiment crashes/surges
    - Threshold: +/- 30% in 48h

15. **`insights-detect-ranking-drop` (Module)**
    - Detects severe ranking drops
    - Threshold: -5 positions in 48h

16. **`insights-detect-competitor-surge` (Module)**
    - Detects competitor growth
    - Threshold: +40% marketshare in 7 days

17. **`insights-detect-geo-crash` (Module)**
    - Detects GEO score crashes
    - Threshold: -15 points in 24h

### Phase 5: Action Tracking (Week 6)

#### Functions to Build:

18. **`insights-track-action` (Edge Function)**
    - Input: `{ insightId, actionType, notes }`
    - Logs action to `gv_task_actions`
    - Updates task status in `gv_daily_insights`

19. **`insights-complete-task` (Edge Function)**
    - Input: `{ insightId, completionNotes, metricsAchieved }`
    - Marks task complete
    - Evaluates outcome quality

20. **`insights-dismiss-task` (Edge Function)**
    - Input: `{ insightId, dismissReason }`
    - Dismisses task with reason
    - Learns from dismissals for future improvements

### Phase 6: Analytics & Optimization (Week 7)

#### Functions to Build:

21. **`insights-analyze-performance` (Edge Function)**
    - Analyzes task completion rates
    - Identifies high/low value tasks
    - Generates improvement recommendations

22. **`insights-export-report` (Edge Function)**
    - Exports insights summary (PDF/CSV)
    - Weekly/monthly reports

23. **Scheduled Jobs Setup**
    - Daily task generation (6 AM)
    - Crisis detection (every 4 hours)
    - Weekly performance analysis

---

## 7. API Endpoints

### 7.1 Core Endpoints

```typescript
// Generate daily tasks
POST /insights-generate-tasks
Body: {
  brandId: string,
  tier: 'basic' | 'premium' | 'partner',
  forceRegenerate?: boolean  // Skip cache
}
Response: {
  tasks: InsightTask[],
  crises: CrisisAlert[],
  metadata: {
    generatedAt: string,
    taskCount: number,
    crisisCount: number,
    dataSourcesCovered: string[]
  }
}

// Detect crises (real-time)
POST /insights-detect-crises
Body: {
  brandId: string
}
Response: {
  crises: CrisisAlert[],
  detectedAt: string
}

// Track task action
POST /insights-track-action
Body: {
  insightId: string,
  actionType: 'started' | 'completed' | 'dismissed' | 'snoozed',
  notes?: string,
  timeSpentMinutes?: number,
  metricsAchieved?: Record<string, any>
}
Response: {
  success: boolean,
  actionId: string
}

// Get insights for brand
GET /insights/brand/:brandId
Query: {
  date?: string,  // ISO date, default: today
  status?: 'pending' | 'in_progress' | 'completed' | 'dismissed'
}
Response: {
  insights: InsightTask[],
  crises: CrisisAlert[],
  stats: {
    totalTasks: number,
    completedTasks: number,
    pendingTasks: number,
    completionRate: number
  }
}

// Get crisis events
GET /insights/crises/:brandId
Query: {
  status?: 'active' | 'monitoring' | 'resolved',
  days?: number  // Default: 30
}
Response: {
  crises: CrisisEvent[],
  activeCount: number,
  resolvedCount: number
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```javascript
// Test: Priority Score Calculation
TEST('calculatePriorityScore - urgent crisis') {
  task = {
    priority: 'urgent',
    impact_score: 90,
    category: 'crisis_response',
    deadline: now() + 2 * HOUR,
    sourceData: { confidenceScore: 0.95, dataAge: 12 }
  }

  score = calculatePriorityScore(task)
  ASSERT(score >= 95 && score <= 100)
}

// Test: Task Generation
TEST('generateRadarTasks - competitor surge detection') {
  radarData = {
    competitorBrands: [{
      id: 'uuid',
      name: 'CompetitorX',
      currentMarketshare: 25
    }]
  }

  // Mock: growth rate = 45%
  mockGrowthRate('uuid', 45)

  tasks = generateRadarTasks(radarData)
  ASSERT(tasks.length > 0)
  ASSERT(tasks[0].category == 'competitor_intelligence')
  ASSERT(tasks[0].priority == 'high')
}

// Test: Crisis Detection
TEST('detectCrises - viral negative mentions') {
  // Mock: 80 negative mentions, 1.5M reach
  mockNegativeMentions(80, 1500000)

  crises = detectCrises(radarData, searchData, hubData)
  ASSERT(crises.length > 0)
  ASSERT(crises[0].type == 'viral_negative_mentions')
  ASSERT(crises[0].severity == 'critical')
}
```

### 8.2 Integration Tests

```javascript
// Test: End-to-End Task Generation
TEST('insights-generate-tasks - full pipeline') {
  brandId = 'test-brand-uuid'
  tier = 'premium'

  response = await fetch('/insights-generate-tasks', {
    method: 'POST',
    body: { brandId, tier }
  })

  ASSERT(response.tasks.length <= 10)  // Premium tier
  ASSERT(response.tasks.every(t => t.priorityScore >= 0))
  ASSERT(response.tasks.every(t => t.deadline != null))
}

// Test: Crisis Detection Real-Time
TEST('insights-detect-crises - real-time detection') {
  brandId = 'test-brand-uuid'

  // Simulate crisis condition
  createMockCrisis(brandId, 'ranking_crash')

  response = await fetch('/insights-detect-crises', {
    method: 'POST',
    body: { brandId }
  })

  ASSERT(response.crises.length > 0)
  ASSERT(response.crises[0].severity == 'high')
}
```

---

## 9. Deployment Checklist

- [ ] Database schema updated (`gv_task_actions`, `gv_crisis_events`)
- [ ] All 23 functions implemented and tested
- [ ] Edge Functions deployed to Supabase
- [ ] Cron jobs configured (daily 6 AM, crisis detection 4-hourly)
- [ ] RLS policies applied to new tables
- [ ] API endpoints documented in Swagger/OpenAPI
- [ ] Frontend integration completed
- [ ] Tier limits enforced (Basic: 8, Premium: 10, Partner: 12)
- [ ] Crisis alert notifications configured
- [ ] Analytics dashboard connected
- [ ] Performance monitoring enabled
- [ ] User documentation written

---

## 10. Success Metrics

### Key Performance Indicators (KPIs)

1. **Task Completion Rate**: Target 70%+ (tasks marked completed)
2. **Crisis Detection Accuracy**: Target 90%+ (true positives)
3. **False Positive Rate**: Target <10% (dismissed tasks)
4. **Time to Crisis Response**: Target <2 hours for critical alerts
5. **User Engagement**: Target 80%+ daily active users viewing insights
6. **Task Relevance Score**: Target 4.0/5.0 (user feedback)

### Monitoring Queries

```sql
-- Task completion rate (last 30 days)
SELECT
  COUNT(CASE WHEN action_status = 'completed' THEN 1 END)::FLOAT /
  COUNT(*)::FLOAT * 100 AS completion_rate_percent
FROM gv_daily_insights
WHERE insight_date >= CURRENT_DATE - INTERVAL '30 days';

-- Crisis detection breakdown
SELECT
  crisis_type,
  severity,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at)) / 3600) as avg_resolution_hours
FROM gv_crisis_events
WHERE detected_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY crisis_type, severity;

-- Task dismissal rate by category
SELECT
  category,
  COUNT(CASE WHEN action_status = 'dismissed' THEN 1 END)::FLOAT /
  COUNT(*)::FLOAT * 100 AS dismissal_rate_percent
FROM gv_daily_insights
WHERE insight_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY category
ORDER BY dismissal_rate_percent DESC;
```

---

## Appendix A: Function File Structure

```
supabase/functions/
├── insights-generate-tasks/
│   ├── index.ts                 # Main handler
│   ├── algorithm.ts             # Core algorithm
│   ├── data-collectors.ts       # Data fetching
│   ├── task-generators.ts       # Task generation logic
│   └── test.ts                  # Unit tests
│
├── insights-detect-crises/
│   ├── index.ts                 # Main handler
│   ├── detectors/
│   │   ├── viral-negative.ts
│   │   ├── sentiment-spike.ts
│   │   ├── ranking-drop.ts
│   │   ├── competitor-surge.ts
│   │   └── geo-crash.ts
│   └── test.ts
│
├── insights-track-action/
│   ├── index.ts
│   └── test.ts
│
├── insights-complete-task/
│   ├── index.ts
│   └── test.ts
│
├── insights-dismiss-task/
│   ├── index.ts
│   └── test.ts
│
└── _shared/
    ├── insights-types.ts        # TypeScript interfaces
    ├── priority-scoring.ts      # Priority calculation
    └── task-selection.ts        # Diversity selection
```

---

## Appendix B: Environment Variables

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers (for data analysis)
ANTHROPIC_API_KEY=your-claude-key
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
PERPLEXITY_API_KEY=your-perplexity-key

# Monitoring
SENTRY_DSN=your-sentry-dsn

# Scheduling
INSIGHTS_GENERATION_CRON=0 6 * * *  # Daily at 6 AM
CRISIS_DETECTION_CRON=0 */4 * * *   # Every 4 hours
```

---

## Conclusion

This implementation plan provides a complete roadmap for building the Insights Daily Task System. The system is designed to be:

1. **Data-Driven**: Uses real data from Radar, Search, Hub, and Chat
2. **Goal-Oriented**: Every task has clear "why?" and measurable outcomes
3. **Crisis-Aware**: Early detection of brand threats
4. **Tier-Flexible**: Adapts to Basic (8), Premium (10), Partner (12) limits
5. **Actionable**: Tasks are specific, achievable, and time-bound

**Next Steps:**
1. Review this plan with the team
2. Set up development environment
3. Begin Phase 1 (Foundation) implementation
4. Deploy to staging for testing
5. Iterate based on user feedback

**Estimated Timeline:** 7 weeks for full implementation
**Team Size:** 2-3 developers + 1 QA engineer
