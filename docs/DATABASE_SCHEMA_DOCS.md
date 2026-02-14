# GEOVERA DATABASE SCHEMA DOCUMENTATION
## Complete Database Reference

**Version:** 1.0
**Last Updated:** February 14, 2026
**Database:** PostgreSQL 15.x (Supabase)
**Total Tables:** 28+

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Core Platform Tables](#core-platform-tables)
3. [AI & Chat Tables](#ai--chat-tables)
4. [Content Studio Tables](#content-studio-tables)
5. [Authority Hub Tables](#authority-hub-tables)
6. [Radar Tables](#radar-tables)
7. [Insights & Tasks Tables](#insights--tasks-tables)
8. [Relationships Diagram](#relationships-diagram)
9. [Indexes](#indexes)
10. [RLS Policies](#rls-policies)

---

## OVERVIEW

### Database Architecture

GeoVera uses PostgreSQL with Row-Level Security (RLS) for multi-tenant data isolation. Each brand's data is protected by RLS policies ensuring users can only access their own brands' data.

### Naming Convention

All GeoVera tables use the `gv_` prefix:
- `gv_brands` - Core brand table
- `gv_creators` - Creator database
- `gv_content_library` - Content library

### Key Design Principles

1. **Multi-tenancy:** All data is scoped to `brand_id`
2. **Audit trails:** `created_at` and `updated_at` timestamps on all tables
3. **Soft deletes:** Use `is_active` flag instead of hard deletes
4. **JSONB flexibility:** Use JSONB columns for flexible metadata
5. **UUID primary keys:** All tables use UUID for security and scalability

---

## CORE PLATFORM TABLES

### brands

**Description:** Core brand profiles and subscription information.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_name` | TEXT | No | - | Brand display name |
| `category` | TEXT | No | - | One of 18 categories |
| `business_type` | TEXT | No | - | `offline`, `online`, or `hybrid` |
| `country` | TEXT | No | `'ID'` | ISO 3166-1 alpha-2 country code |
| `subscription_tier` | TEXT | Yes | - | `basic`, `premium`, or `partner` |
| `billing_cycle` | TEXT | Yes | - | `monthly` or `yearly` |
| `yearly_discount_applied` | BOOLEAN | No | `false` | Whether yearly discount applied |
| `brand_locked_until` | TIMESTAMPTZ | Yes | - | Brand lock expiry (30 days) |
| `onboarding_completed` | BOOLEAN | No | `false` | Onboarding completion status |
| `google_maps_url` | TEXT | Yes | - | Google Maps location URL |
| `web_url` | TEXT | Yes | - | Brand website URL |
| `instagram_url` | TEXT | Yes | - | Instagram profile URL |
| `tiktok_url` | TEXT | Yes | - | TikTok profile URL |
| `youtube_url` | TEXT | Yes | - | YouTube channel URL |
| `facebook_url` | TEXT | Yes | - | Facebook page URL |
| `whatsapp` | TEXT | Yes | - | WhatsApp contact number |
| `description` | TEXT | Yes | - | Brand description |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `category`
- Index on: `subscription_tier`
- Index on: `country`

**RLS Policies:**
- Users can only view brands they own (via `user_brands` table)
- Users can update their own brands
- Service role can access all brands

---

### users

**Description:** User accounts (managed by Supabase Auth).

**Note:** This is a Supabase Auth table. GeoVera doesn't directly manage this table but references it via `auth.users`.

**Key Columns:**
- `id` (UUID) - Primary key
- `email` (TEXT) - User email
- `created_at` (TIMESTAMPTZ) - Account creation

---

### user_brands

**Description:** Many-to-many relationship between users and brands.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | No | - | Foreign key to `auth.users.id` |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `role` | TEXT | No | `'member'` | User role: `owner`, `admin`, `member` |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Link creation timestamp |

**Indexes:**
- Primary key: `id`
- Unique constraint: `(user_id, brand_id)`
- Index on: `user_id`
- Index on: `brand_id`

**RLS Policies:**
- Users can only see their own brand links
- Users can only create links for themselves

---

### gv_onboarding_progress

**Description:** Track multi-step onboarding progress.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `user_id` | UUID | No | - | Foreign key to `auth.users.id` |
| `current_step` | INTEGER | No | `1` | Current onboarding step (1-5) |
| `step_1_completed` | BOOLEAN | No | `false` | Welcome step completed |
| `step_2_completed` | BOOLEAN | No | `false` | Brand info completed |
| `step_3_completed` | BOOLEAN | No | `false` | Social media completed |
| `step_4_completed` | BOOLEAN | No | `false` | Confirmation completed |
| `step_5_completed` | BOOLEAN | No | `false` | Tier selection completed |
| `completed_at` | TIMESTAMPTZ | Yes | - | Onboarding completion timestamp |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id`
- Index on: `user_id`

---

### gv_brand_confirmations

**Description:** Stores user confirmation during onboarding Step 4 (30-day lock agreement).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `user_id` | UUID | No | - | Foreign key to `auth.users.id` |
| `confirmed_brand_name` | TEXT | No | - | Brand name at confirmation time |
| `confirmed_category` | TEXT | No | - | Category at confirmation time |
| `confirmed_tier` | TEXT | Yes | - | Tier at confirmation time |
| `confirmed_billing_cycle` | TEXT | Yes | - | Billing cycle at confirmation time |
| `understood_30day_lock` | BOOLEAN | No | - | User acknowledged 30-day lock |
| `confirmation_text` | TEXT | No | - | User typed confirmation ("SAYA SETUJU") |
| `ip_address` | TEXT | Yes | - | User IP address at confirmation |
| `user_agent` | TEXT | Yes | - | User browser user agent |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Confirmation timestamp |

**Purpose:** Legal compliance - record user's explicit consent to 30-day brand lock policy.

---

## AI & CHAT TABLES

### gv_ai_chat_sessions

**Description:** AI chat sessions grouping multiple conversation messages.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `user_id` | UUID | No | - | Foreign key to `auth.users.id` |
| `title` | TEXT | No | - | Session title (first message preview) |
| `message_count` | INTEGER | No | `0` | Total messages in session |
| `total_tokens` | INTEGER | No | `0` | Total tokens consumed |
| `total_cost_usd` | DECIMAL(10,4) | No | `0` | Total cost in USD |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Session start timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last message timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id`
- Index on: `user_id`
- Index on: `created_at DESC`

---

### gv_ai_conversations

**Description:** Individual AI chat messages with provider tracking and token usage.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `user_id` | UUID | No | - | Foreign key to `auth.users.id` |
| `session_id` | UUID | Yes | - | Foreign key to `gv_ai_chat_sessions.id` |
| `message` | TEXT | No | - | Message content |
| `role` | TEXT | No | - | `user` or `assistant` |
| `ai_provider` | TEXT | Yes | - | `openai`, `anthropic`, `perplexity` |
| `model_used` | TEXT | Yes | - | Model name (e.g., `gpt-3.5-turbo`) |
| `conversation_type` | TEXT | No | `'chat'` | Conversation type |
| `tokens_used` | INTEGER | No | `0` | Tokens consumed |
| `cost_usd` | DECIMAL(10,6) | No | `0` | Cost in USD |
| `parent_message_id` | UUID | Yes | - | Parent message for threading |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Message timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id, created_at DESC`
- Index on: `session_id, created_at`
- Index on: `user_id`

---

## CONTENT STUDIO TABLES

### gv_content_library

**Description:** AI-generated content library (articles, images, videos).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `user_id` | UUID | No | - | Foreign key to `auth.users.id` |
| `content_type` | TEXT | No | - | `article`, `image`, `video` |
| `title` | TEXT | Yes | - | Content title |
| `content` | TEXT | Yes | - | Content body (for articles) |
| `media_url` | TEXT | Yes | - | URL for images/videos |
| `thumbnail_url` | TEXT | Yes | - | Thumbnail preview URL |
| `word_count` | INTEGER | Yes | - | Word count (articles only) |
| `reading_time` | INTEGER | Yes | - | Estimated reading time in minutes |
| `keywords` | TEXT[] | Yes | `'{}'` | SEO keywords |
| `tone` | TEXT | Yes | - | Content tone (`professional`, `casual`, etc.) |
| `status` | TEXT | No | `'draft'` | `draft`, `published`, `archived` |
| `ai_provider` | TEXT | Yes | - | AI provider used |
| `model_used` | TEXT | Yes | - | AI model used |
| `generation_prompt` | TEXT | Yes | - | Original generation prompt |
| `generation_cost_usd` | DECIMAL(10,6) | Yes | - | Generation cost |
| `published_at` | TIMESTAMPTZ | Yes | - | Publication timestamp |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id, content_type, created_at DESC`
- Index on: `status`
- Index on: `published_at`

---

### gv_content_queue

**Description:** Queue for scheduled content generation.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `content_type` | TEXT | No | - | `article`, `image`, `video` |
| `topic` | TEXT | No | - | Content topic/prompt |
| `parameters` | JSONB | Yes | `'{}'` | Generation parameters |
| `scheduled_for` | TIMESTAMPTZ | No | - | Scheduled generation time |
| `status` | TEXT | No | `'pending'` | `pending`, `processing`, `completed`, `failed` |
| `result_content_id` | UUID | Yes | - | FK to `gv_content_library.id` |
| `error_message` | TEXT | Yes | - | Error message if failed |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Queue entry timestamp |
| `processed_at` | TIMESTAMPTZ | Yes | - | Processing completion timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id, status, scheduled_for`

---

### gv_content_performance

**Description:** Performance metrics for published content.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `content_id` | UUID | No | - | Foreign key to `gv_content_library.id` |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `platform` | TEXT | Yes | - | Publishing platform |
| `views` | INTEGER | No | `0` | Total views |
| `likes` | INTEGER | No | `0` | Total likes |
| `comments` | INTEGER | No | `0` | Total comments |
| `shares` | INTEGER | No | `0` | Total shares |
| `engagement_rate` | DECIMAL(5,2) | Yes | - | Engagement rate percentage |
| `metrics_snapshot` | JSONB | Yes | `'{}'` | Full metrics snapshot |
| `snapshot_date` | DATE | No | - | Date of metrics snapshot |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `content_id`
- Index on: `brand_id, snapshot_date DESC`

---

## AUTHORITY HUB TABLES

### gv_hub_collections

**Description:** Curated content collections for Authority Hub articles.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `category` | TEXT | No | - | Content category |
| `article_type` | TEXT | No | - | `hot`, `review`, `education`, `nice_to_know` |
| `title` | TEXT | No | - | Collection title |
| `keywords` | TEXT[] | Yes | `'{}'` | Search keywords used |
| `content_count` | INTEGER | No | `0` | Number of content pieces |
| `total_reach` | BIGINT | No | `0` | Estimated total reach |
| `status` | TEXT | No | `'draft'` | `draft`, `ready`, `published` |
| `discovery_method` | TEXT | Yes | - | How content was discovered |
| `discovery_cost_usd` | DECIMAL(10,6) | Yes | - | Discovery cost |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Collection creation timestamp |
| `published_at` | TIMESTAMPTZ | Yes | - | Publication timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id, category, created_at DESC`
- Index on: `status`

---

### gv_hub_embedded_content

**Description:** Individual embedded content pieces (TikTok, Instagram, YouTube).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `collection_id` | UUID | No | - | Foreign key to `gv_hub_collections.id` |
| `platform` | TEXT | No | - | `tiktok`, `instagram`, `youtube` |
| `creator_name` | TEXT | Yes | - | Content creator name |
| `creator_handle` | TEXT | Yes | - | Creator username/handle |
| `post_url` | TEXT | No | - | Original post URL |
| `embed_url` | TEXT | No | - | Embeddable URL |
| `caption` | TEXT | Yes | - | Post caption/description |
| `hashtags` | TEXT[] | Yes | `'{}'` | Hashtags used |
| `posted_at` | TIMESTAMPTZ | Yes | - | Original post date |
| `likes` | INTEGER | Yes | - | Like count |
| `comments` | INTEGER | Yes | - | Comment count |
| `shares` | INTEGER | Yes | - | Share count |
| `views` | INTEGER | Yes | - | View count |
| `engagement_rate` | DECIMAL(5,2) | Yes | - | Engagement rate |
| `quality_score` | DECIMAL(3,2) | Yes | - | Quality score (0-10) |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `collection_id`
- Index on: `platform`

---

### gv_hub_articles

**Description:** Generated Hub articles with embedded content.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `collection_id` | UUID | No | - | Foreign key to `gv_hub_collections.id` |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `title` | TEXT | No | - | Article title |
| `content` | TEXT | No | - | Article body content |
| `intro` | TEXT | Yes | - | Article introduction |
| `conclusion` | TEXT | Yes | - | Article conclusion |
| `sections` | JSONB | Yes | `'[]'` | Article sections with embeds |
| `charts` | JSONB | Yes | `'[]'` | Data visualization charts |
| `word_count` | INTEGER | Yes | - | Total word count |
| `reading_time` | INTEGER | Yes | - | Estimated reading time (minutes) |
| `status` | TEXT | No | `'draft'` | `draft`, `published`, `archived` |
| `generation_cost_usd` | DECIMAL(10,6) | Yes | - | Article generation cost |
| `published_at` | TIMESTAMPTZ | Yes | - | Publication timestamp |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Creation timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id, created_at DESC`
- Index on: `collection_id`

---

## RADAR TABLES

**Note:** All Radar tables are accessible ONLY to Partner tier subscribers.

### gv_creators

**Description:** Content creator database (100K-2M followers range).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `name` | TEXT | No | - | Creator full name |
| `category` | TEXT | No | - | Content category |
| `country` | TEXT | No | `'ID'` | Country code |
| `instagram_handle` | TEXT | Yes | - | Instagram username |
| `tiktok_handle` | TEXT | Yes | - | TikTok username |
| `youtube_handle` | TEXT | Yes | - | YouTube channel name |
| `facebook_handle` | TEXT | Yes | - | Facebook page name |
| `follower_count` | INTEGER | No | - | Total follower count (estimated) |
| `engagement_rate` | DECIMAL(5,2) | Yes | - | Average engagement rate (%) |
| `content_focus` | TEXT | Yes | - | Content focus description |
| `recent_brands` | JSONB | Yes | `'[]'` | Recently mentioned brands |
| `platform_primary` | TEXT | Yes | - | Primary platform |
| `discovery_source` | TEXT | No | `'perplexity'` | How creator was discovered |
| `last_scraped_at` | TIMESTAMPTZ | Yes | - | Last content scrape timestamp |
| `is_active` | BOOLEAN | No | `true` | Active status |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `category`
- Index on: `country`
- Index on: `follower_count`
- Index on: `is_active WHERE is_active = true`

---

### gv_creator_content

**Description:** Scraped social media posts from creators (filtered: NO PROMO, NO GIVEAWAY, NOT LIFE UPDATE).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `creator_id` | UUID | No | - | Foreign key to `gv_creators.id` |
| `platform` | TEXT | No | - | `instagram`, `tiktok`, `youtube`, `facebook` |
| `post_id` | TEXT | No | - | Platform-specific post ID |
| `post_url` | TEXT | No | - | Full post URL |
| `caption` | TEXT | Yes | - | Post caption/description |
| `hashtags` | TEXT[] | Yes | `'{}'` | Hashtags used |
| `posted_at` | TIMESTAMPTZ | Yes | - | Original post timestamp |
| `reach` | INTEGER | Yes | - | Estimated reach |
| `likes` | INTEGER | Yes | - | Like count |
| `comments` | INTEGER | Yes | - | Comment count |
| `shares` | INTEGER | Yes | - | Share count |
| `saves` | INTEGER | Yes | - | Save count |
| `views` | INTEGER | Yes | - | View count |
| `engagement_total` | INTEGER | Yes | - | Total engagement |
| `is_promo` | BOOLEAN | No | `false` | Is promotional content |
| `is_giveaway` | BOOLEAN | No | `false` | Is giveaway content |
| `is_life_update` | BOOLEAN | No | `false` | Is personal life update |
| `content_quality_score` | DECIMAL(3,2) | Yes | - | Quality score (0-10) |
| `originality_score` | DECIMAL(3,2) | Yes | - | Originality score (0-10) |
| `brand_mentions` | JSONB | Yes | `'[]'` | Mentioned brands |
| `scraped_at` | TIMESTAMPTZ | No | `NOW()` | Scraping timestamp |
| `analyzed_at` | TIMESTAMPTZ | Yes | - | AI analysis timestamp |
| `analysis_status` | TEXT | No | `'pending'` | `pending`, `analyzing`, `completed`, `failed` |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `creator_id, posted_at DESC`
- Index on: `platform, posted_at DESC`
- Index on: `analysis_status`
- Unique constraint: `(platform, post_id)`

---

### gv_creator_rankings

**Description:** Creator ranking snapshots (Mindshare calculation).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `creator_id` | UUID | No | - | Foreign key to `gv_creators.id` |
| `category` | TEXT | No | - | Content category |
| `rank` | INTEGER | No | - | Ranking position |
| `mindshare_score` | DECIMAL(5,2) | No | - | Mindshare score (0-100) |
| `total_reach` | BIGINT | No | `0` | Total estimated reach |
| `quality_score` | DECIMAL(3,2) | Yes | - | Average quality score |
| `engagement_rate` | DECIMAL(5,2) | Yes | - | Average engagement rate |
| `trend_involvement` | INTEGER | No | `0` | Number of trends involved in |
| `calculation_date` | DATE | No | - | Date of calculation |
| `data_maturity_hours` | INTEGER | No | - | Data maturity in hours |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |

**Indexes:**
- Primary key: `id`
- Unique constraint: `(creator_id, category, calculation_date)`
- Index on: `category, rank, calculation_date DESC`

---

### gv_brand_marketshare

**Description:** Brand marketshare calculation based on creator mentions.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `category` | TEXT | No | - | Content category |
| `brand_name` | TEXT | No | - | Brand name |
| `mention_count` | INTEGER | No | `0` | Total mentions |
| `total_reach` | BIGINT | No | `0` | Total estimated reach |
| `unique_creators` | INTEGER | No | `0` | Unique creators mentioning brand |
| `marketshare_percentage` | DECIMAL(5,2) | No | - | Marketshare percentage |
| `rank` | INTEGER | No | - | Marketshare ranking |
| `calculation_date` | DATE | No | - | Date of calculation |
| `analysis_period_days` | INTEGER | No | `30` | Analysis period in days |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `category, rank, calculation_date DESC`
- Index on: `brand_name, category`

---

### gv_trends

**Description:** Detected trends per category (hashtags, topics, challenges).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `category` | TEXT | No | - | Content category |
| `trend_name` | TEXT | No | - | Trend name/title |
| `trend_type` | TEXT | No | - | `hashtag`, `topic`, `challenge` |
| `hashtags` | TEXT[] | Yes | `'{}'` | Associated hashtags |
| `keywords` | TEXT[] | Yes | `'{}'` | Associated keywords |
| `trend_score` | DECIMAL(3,2) | No | - | Trending score (0-1) |
| `total_posts` | INTEGER | No | `0` | Total posts using trend |
| `total_reach` | BIGINT | No | `0` | Total estimated reach |
| `peak_date` | DATE | Yes | - | Peak popularity date |
| `first_detected` | DATE | No | - | First detection date |
| `is_active` | BOOLEAN | No | `true` | Currently active |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `category, trend_score DESC, created_at DESC`
- Index on: `is_active WHERE is_active = true`

---

### gv_trend_involvement

**Description:** Creator/Brand involvement in trends (Trendshare).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `trend_id` | UUID | No | - | Foreign key to `gv_trends.id` |
| `creator_id` | UUID | Yes | - | Foreign key to `gv_creators.id` |
| `brand_name` | TEXT | Yes | - | Brand name (if brand involvement) |
| `involvement_type` | TEXT | No | - | `creator` or `brand` |
| `post_count` | INTEGER | No | `0` | Posts involving this trend |
| `total_reach` | BIGINT | No | `0` | Total reach from posts |
| `avg_engagement_rate` | DECIMAL(5,2) | Yes | - | Average engagement rate |
| `first_post_date` | DATE | Yes | - | First post date |
| `last_post_date` | DATE | Yes | - | Most recent post date |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `trend_id`
- Index on: `creator_id`

---

### gv_radar_processing_queue

**Description:** Job queue for Radar processing tasks.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `job_type` | TEXT | No | - | Job type (e.g., `scrape_creators`, `analyze_content`) |
| `category` | TEXT | Yes | - | Target category |
| `parameters` | JSONB | Yes | `'{}'` | Job parameters |
| `status` | TEXT | No | `'pending'` | `pending`, `processing`, `completed`, `failed` |
| `priority` | INTEGER | No | `5` | Job priority (1=highest, 10=lowest) |
| `scheduled_for` | TIMESTAMPTZ | No | `NOW()` | Scheduled execution time |
| `started_at` | TIMESTAMPTZ | Yes | - | Job start timestamp |
| `completed_at` | TIMESTAMPTZ | Yes | - | Job completion timestamp |
| `error_message` | TEXT | Yes | - | Error message if failed |
| `retry_count` | INTEGER | No | `0` | Number of retry attempts |
| `max_retries` | INTEGER | No | `3` | Maximum retry attempts |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Queue entry timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `status, priority, scheduled_for`
- Index on: `job_type, status`

---

### gv_radar_snapshots

**Description:** Delta caching for Radar data (optimize costs by tracking changes).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `snapshot_type` | TEXT | No | - | Snapshot type (e.g., `creator_content`, `rankings`) |
| `entity_id` | UUID | No | - | Related entity ID |
| `snapshot_date` | DATE | No | - | Snapshot date |
| `data_snapshot` | JSONB | No | `'{}'` | Full data snapshot |
| `delta_from_previous` | JSONB | Yes | `'{}'` | Changes from previous snapshot |
| `has_changes` | BOOLEAN | No | `false` | Whether snapshot has changes |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Snapshot creation timestamp |

**Purpose:** Avoid re-scraping unchanged data, reducing API costs.

**Indexes:**
- Primary key: `id`
- Unique constraint: `(snapshot_type, entity_id, snapshot_date)`
- Index on: `snapshot_date DESC`

---

### gv_brand_authority_patterns

**Description:** Claude-learned patterns for identifying brand authority signals vs noise.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | Yes | - | Foreign key to `brands.id` (null = global patterns) |
| `category` | TEXT | No | - | Content category |
| `pattern_type` | TEXT | No | - | `authority` or `noise` |
| `signal_keywords` | TEXT[] | Yes | `'{}'` | Keywords indicating this pattern |
| `signal_phrases` | TEXT[] | Yes | `'{}'` | Phrases indicating this pattern |
| `content_characteristics` | JSONB | Yes | `'{}'` | Content characteristics |
| `confidence_score` | DECIMAL(3,2) | No | - | Pattern confidence (0-1) |
| `training_samples` | INTEGER | No | `0` | Number of training samples |
| `last_trained_at` | TIMESTAMPTZ | Yes | - | Last training timestamp |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Pattern creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update timestamp |

**Purpose:** Machine learning to filter out noise (giveaways, generic mentions) from genuine brand authority signals.

**Indexes:**
- Primary key: `id`
- Index on: `category, pattern_type`
- Index on: `brand_id`

---

### gv_discovered_brands

**Description:** Competitor brands discovered via Perplexity for user brands.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` (requesting brand) |
| `discovered_brand_name` | TEXT | No | - | Discovered competitor name |
| `category` | TEXT | No | - | Content category |
| `country` | TEXT | No | `'ID'` | Country code |
| `instagram_handle` | TEXT | Yes | - | Instagram handle |
| `tiktok_handle` | TEXT | Yes | - | TikTok handle |
| `youtube_handle` | TEXT | Yes | - | YouTube handle |
| `facebook_handle` | TEXT | Yes | - | Facebook handle |
| `follower_estimate` | INTEGER | Yes | - | Estimated follower count |
| `positioning` | TEXT | Yes | - | Brand positioning |
| `key_differentiators` | JSONB | Yes | `'[]'` | Key differentiating factors |
| `discovery_source` | TEXT | No | `'perplexity'` | Discovery method |
| `discovered_at` | TIMESTAMPTZ | No | `NOW()` | Discovery timestamp |
| `is_competitor` | BOOLEAN | No | `true` | Marked as competitor |
| `is_active` | BOOLEAN | No | `true` | Active status |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id`
- Index on: `category`

---

## INSIGHTS & TASKS TABLES

### gv_daily_insights

**Description:** Daily task system with max 12 tasks per day (tier-based: Basic=8, Premium=10, Partner=12).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `insight_date` | DATE | No | - | Date for these insights |
| `tasks` | JSONB[] | Yes | `'{}'` | Array of task objects (max 12) |
| `tasks_completed` | INTEGER | No | `0` | Number of completed tasks |
| `tasks_snoozed` | INTEGER | No | `0` | Number of snoozed tasks |
| `crisis_alerts` | JSONB[] | Yes | `'{}'` | Crisis alert objects |
| `crisis_count` | INTEGER | No | `0` | Number of crisis alerts |
| `goal_achievement_rate` | DECIMAL(5,2) | Yes | - | Goal achievement percentage |
| `avg_task_completion_time` | INTEGER | Yes | - | Average completion time (minutes) |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Record creation timestamp |

**Task Object Structure:**
```json
{
  "id": "task_001",
  "title": "Task title",
  "why": "Why this task matters",
  "category": "visibility|discovery|authority|trust",
  "priority": 1,
  "deadline": "2026-02-14T18:00:00Z",
  "data_source": "radar|hub|chat|search",
  "expected_outcome": "What success looks like",
  "crisis_level": "none|low|medium|high|critical",
  "status": "pending|in_progress|completed|snoozed|dismissed"
}
```

**Indexes:**
- Primary key: `id`
- Unique constraint: `(brand_id, insight_date)`
- Index on: `brand_id, insight_date DESC`

---

### gv_task_actions

**Description:** Track task completion, snooze, and dismiss actions.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `insight_id` | UUID | No | - | Foreign key to `gv_daily_insights.id` |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `task_id` | TEXT | No | - | Task ID from `gv_daily_insights.tasks` |
| `action` | TEXT | No | - | `complete`, `snooze`, `dismiss` |
| `user_id` | UUID | Yes | - | Foreign key to `auth.users.id` |
| `completion_time_minutes` | INTEGER | Yes | - | Time to complete (minutes) |
| `snooze_until` | TIMESTAMPTZ | Yes | - | Snooze until timestamp |
| `notes` | TEXT | Yes | - | User notes |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Action timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `insight_id`
- Index on: `brand_id, created_at DESC`

---

### gv_crisis_events

**Description:** Crisis detection log (sentiment spikes, ranking drops, competitor surges).

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `brand_id` | UUID | No | - | Foreign key to `brands.id` |
| `crisis_type` | TEXT | No | - | Crisis type (e.g., `sentiment_spike`, `ranking_drop`) |
| `severity` | TEXT | No | - | `low`, `medium`, `high`, `critical` |
| `title` | TEXT | No | - | Crisis title |
| `description` | TEXT | No | - | Crisis description |
| `detected_value` | DECIMAL(10,2) | Yes | - | Detected value (e.g., sentiment score) |
| `threshold_value` | DECIMAL(10,2) | Yes | - | Threshold value |
| `delta_percentage` | DECIMAL(5,2) | Yes | - | Percentage change |
| `data_source` | TEXT | Yes | - | Data source |
| `recommended_actions` | JSONB[] | Yes | `'{}'` | Recommended actions |
| `resolved_at` | TIMESTAMPTZ | Yes | - | Resolution timestamp |
| `resolved_by` | UUID | Yes | - | Foreign key to `auth.users.id` |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Detection timestamp |

**Indexes:**
- Primary key: `id`
- Index on: `brand_id, severity, created_at DESC`
- Index on: `resolved_at` (for unresolved crises)

---

## RELATIONSHIPS DIAGRAM

```
┌─────────────┐
│   users     │
│ (auth.users)│
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│  user_brands    │
└──────┬──────────┘
       │ N:M
       │
┌──────▼──────────┐        ┌─────────────────────┐
│     brands      ├────────┤ gv_brand_confirmations│
└──────┬──────────┘   1:1  └─────────────────────┘
       │
       │ 1:N (all tables reference brand_id)
       │
       ├──────────────┬──────────────┬──────────────┬──────────────┐
       │              │              │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
│gv_content   │ │gv_hub    │ │gv_creators  │ │gv_daily  │ │gv_ai_chat   │
│_library     │ │_collections│ │             │ │_insights │ │_sessions    │
└─────────────┘ └──────┬───┘ └──────┬──────┘ └──────────┘ └─────────────┘
                       │            │
                   1:N │        1:N │
                       │            │
              ┌────────▼────┐ ┌────▼────────────┐
              │gv_hub       │ │gv_creator       │
              │_embedded    │ │_content         │
              │_content     │ └────┬────────────┘
              └─────────────┘      │
                                   │ 1:N
                                   │
                            ┌──────▼──────────┐
                            │gv_creator       │
                            │_rankings        │
                            └─────────────────┘
```

---

## INDEXES

### Performance Indexes

All tables have the following standard indexes:
- Primary key index on `id` (UUID)
- Index on `brand_id` for tenant scoping
- Index on `created_at DESC` for chronological queries
- Index on `status` fields where applicable

### Category-Specific Indexes

**Radar Tables:**
- `gv_creator_content`: Index on `(platform, post_id)` for deduplication
- `gv_creator_rankings`: Index on `(category, rank, calculation_date DESC)` for leaderboards
- `gv_trends`: Index on `(category, trend_score DESC)` for trending queries

**Content Tables:**
- `gv_content_library`: Index on `(brand_id, content_type, created_at DESC)`
- `gv_hub_collections`: Index on `(brand_id, category, status)`

### Full-Text Search Indexes

```sql
-- Add full-text search to content
CREATE INDEX idx_content_library_fts ON gv_content_library
USING gin(to_tsvector('english', title || ' ' || content));

-- Add full-text search to Hub articles
CREATE INDEX idx_hub_articles_fts ON gv_hub_articles
USING gin(to_tsvector('english', title || ' ' || content));
```

---

## RLS POLICIES

### Global RLS Strategy

All GeoVera tables have RLS enabled. The general pattern:

```sql
-- Enable RLS on table
ALTER TABLE gv_table_name ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own brand's data
CREATE POLICY "Users can view own brand data" ON gv_table_name
FOR SELECT USING (
  brand_id IN (
    SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
  )
);

-- Policy: Users can insert data for their own brands
CREATE POLICY "Users can insert own brand data" ON gv_table_name
FOR INSERT WITH CHECK (
  brand_id IN (
    SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update their own brand's data
CREATE POLICY "Users can update own brand data" ON gv_table_name
FOR UPDATE USING (
  brand_id IN (
    SELECT brand_id FROM user_brands WHERE user_id = auth.uid()
  )
);

-- Policy: Service role bypasses RLS (for Edge Functions)
CREATE POLICY "Service role has full access" ON gv_table_name
FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

### Radar-Specific RLS (Partner Tier Only)

```sql
-- Only Partner tier can access Radar tables
CREATE POLICY "Partner tier only" ON gv_creators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM brands
    INNER JOIN user_brands ON brands.id = user_brands.brand_id
    WHERE user_brands.user_id = auth.uid()
    AND brands.subscription_tier = 'partner'
  )
);
```

### Public Content Tables

Tables like `gv_hub_articles` can have public read access:

```sql
-- Public can read published Hub articles
CREATE POLICY "Public can view published articles" ON gv_hub_articles
FOR SELECT USING (status = 'published');
```

---

## COMMON QUERIES

### Get User's Brands

```sql
SELECT b.*
FROM brands b
INNER JOIN user_brands ub ON b.id = ub.brand_id
WHERE ub.user_id = auth.uid();
```

### Get Daily Insights for Brand

```sql
SELECT *
FROM gv_daily_insights
WHERE brand_id = 'your-brand-id'
ORDER BY insight_date DESC
LIMIT 7;
```

### Get Top Creators by Category

```sql
SELECT c.*, cr.rank, cr.mindshare_score
FROM gv_creators c
INNER JOIN gv_creator_rankings cr ON c.id = cr.creator_id
WHERE cr.category = 'beauty'
AND cr.calculation_date = CURRENT_DATE
ORDER BY cr.rank
LIMIT 10;
```

### Get Brand Marketshare

```sql
SELECT *
FROM gv_brand_marketshare
WHERE category = 'beauty'
AND calculation_date = CURRENT_DATE
ORDER BY rank
LIMIT 20;
```

### Get Hub Articles with Content Count

```sql
SELECT
  ha.*,
  hc.content_count
FROM gv_hub_articles ha
INNER JOIN gv_hub_collections hc ON ha.collection_id = hc.id
WHERE ha.brand_id = 'your-brand-id'
ORDER BY ha.created_at DESC;
```

---

## MAINTENANCE

### Regular Maintenance Tasks

**Daily:**
- Vacuum analyze frequently updated tables
- Check for slow queries in `pg_stat_statements`

**Weekly:**
- Review table sizes with `pg_total_relation_size()`
- Archive old data (>90 days)

**Monthly:**
- Review and optimize indexes
- Update statistics

### Backup Strategy

```bash
# Daily automated backups
0 2 * * * pg_dump $DATABASE_URL -F c -f backup_$(date +\%Y\%m\%d).dump

# Backup before migrations
pg_dump $DATABASE_URL -F c -f pre_migration_backup.dump
```

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Database Version:** PostgreSQL 15.x
**Schema Version:** 11 migrations
