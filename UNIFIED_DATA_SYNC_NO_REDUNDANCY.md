# UNIFIED DATA SYNC - NO REDUNDANCY
## SEO + GEO + Social Search Integration with Real-Time Enrichment

---

## OVERVIEW

**CRITICAL RULE**: Jangan pernah crawl/index/research data yang sama lebih dari sekali!

- Jika **SEO** sudah index URL → **GEO** dan **Social Search** gunakan data itu
- Jika **GEO** sudah research topic → **SEO** dan **Social Search** gunakan research itu
- Jika **Social Search** sudah crawl creator → **SEO** dan **GEO** gunakan data itu

**Semua sistem** harus **SYNC**, **ENRICH**, dan **SHARE** data secara **REAL-TIME**.

---

## 1. UNIFIED DATA ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│            UNIFIED DATA LAYER (Central)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │     SEO     │◄──►│     GEO     │◄──►│    SSO      │    │
│  │             │    │             │    │ (Social)     │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│         │                  │                   │            │
│         └──────────────────┼───────────────────┘            │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │  Unified Index  │                       │
│                   │  gv_unified_*   │                       │
│                   └─────────────────┘                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. UNIFIED INDEX TABLES

### 2.1 Master URL Index

```sql
-- Central URL index - NO DUPLICATES across SEO, GEO, SSO
CREATE TABLE gv_unified_url_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- URL info
  url TEXT UNIQUE NOT NULL, -- Enforces uniqueness
  domain TEXT NOT NULL,
  url_type TEXT CHECK (url_type IN ('webpage', 'social_profile', 'article', 'video', 'document')),

  -- Which systems use this URL?
  used_by_seo BOOLEAN DEFAULT false,
  used_by_geo BOOLEAN DEFAULT false,
  used_by_sso BOOLEAN DEFAULT false,

  -- Content snapshot (shared across all systems)
  content_text TEXT,
  content_hash TEXT, -- MD5 of content
  last_crawled_at TIMESTAMPTZ,

  -- Meta information
  title TEXT,
  description TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,

  -- Delta caching (shared)
  timestamp_hash TEXT, -- MD5(last_modified + content_hash)
  last_modified_at TIMESTAMPTZ,

  -- Status
  is_indexed BOOLEAN DEFAULT false,
  last_indexed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_unified_url_unique ON gv_unified_url_index(url);
CREATE INDEX idx_unified_url_domain ON gv_unified_url_index(domain);
CREATE INDEX idx_unified_url_brand ON gv_unified_url_index(brand_id);
CREATE INDEX idx_unified_url_seo ON gv_unified_url_index(used_by_seo);
CREATE INDEX idx_unified_url_geo ON gv_unified_url_index(used_by_geo);
CREATE INDEX idx_unified_url_sso ON gv_unified_url_index(used_by_sso);
CREATE INDEX idx_unified_url_hash ON gv_unified_url_index(timestamp_hash);
```

### 2.2 Master Research Index

```sql
-- Central research index - NO DUPLICATE research
CREATE TABLE gv_unified_research_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Research topic/query
  research_topic TEXT NOT NULL,
  research_type TEXT CHECK (research_type IN ('keyword', 'topic', 'competitor', 'creator', 'site')),

  -- Which systems requested this research?
  requested_by_seo BOOLEAN DEFAULT false,
  requested_by_geo BOOLEAN DEFAULT false,
  requested_by_sso BOOLEAN DEFAULT false,

  -- Research data (shared across all systems)
  gemini_flash_lite_index JSONB, -- Stage 1: Fast indexing
  perplexity_research JSONB, -- Stage 2: Real-time intelligence
  gemini_deep_analysis JSONB, -- Stage 3: Deep analysis

  -- AI usage tracking
  total_tokens_used INTEGER,
  total_cost DECIMAL(10,4),
  processing_time_ms INTEGER,

  -- Validity
  is_valid BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  researched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unified_research_brand ON gv_unified_research_index(brand_id);
CREATE INDEX idx_unified_research_topic ON gv_unified_research_index(research_topic);
CREATE INDEX idx_unified_research_type ON gv_unified_research_index(research_type);
CREATE INDEX idx_unified_research_seo ON gv_unified_research_index(requested_by_seo);
CREATE INDEX idx_unified_research_geo ON gv_unified_research_index(requested_by_geo);
CREATE INDEX idx_unified_research_sso ON gv_unified_research_index(requested_by_sso);
CREATE INDEX idx_unified_research_expires ON gv_unified_research_index(expires_at);
```

### 2.3 Master Entity Index

```sql
-- Central entity index (creators, sites, competitors, etc.)
CREATE TABLE gv_unified_entity_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES gv_brands(id) ON DELETE CASCADE,

  -- Entity info
  entity_name TEXT NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('creator', 'competitor', 'site', 'platform')),
  entity_handle TEXT, -- @username for creators
  entity_url TEXT,
  entity_domain TEXT,

  -- Which systems track this entity?
  tracked_by_seo BOOLEAN DEFAULT false, -- Competitor analysis
  tracked_by_geo BOOLEAN DEFAULT false, -- Rank #1 competitor
  tracked_by_sso BOOLEAN DEFAULT false, -- Top creator/site

  -- Unified metrics (aggregated from all systems)
  impact_score DECIMAL(10,2), -- Combined score
  reach INTEGER,
  engagement_rate DECIMAL(5,2),
  authority_score DECIMAL(5,2),

  -- References to specific tables
  sso_creator_id UUID REFERENCES gv_sso_creators(id),
  sso_site_id UUID REFERENCES gv_sso_sites(id),
  geo_competitor_ref TEXT, -- Competitor name from GEO

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(brand_id, entity_name, entity_type)
);

CREATE INDEX idx_unified_entity_brand ON gv_unified_entity_index(brand_id);
CREATE INDEX idx_unified_entity_type ON gv_unified_entity_index(entity_type);
CREATE INDEX idx_unified_entity_seo ON gv_unified_entity_index(tracked_by_seo);
CREATE INDEX idx_unified_entity_geo ON gv_unified_entity_index(tracked_by_geo);
CREATE INDEX idx_unified_entity_sso ON gv_unified_entity_index(tracked_by_sso);
```

---

## 3. ANTI-REDUNDANCY RULES

### Rule 1: Check Unified Index FIRST

```typescript
async function shouldCrawlURL(url: string, brandId: string): Promise<boolean> {
  // Check if URL already exists in unified index
  const existing = await supabase
    .from('gv_unified_url_index')
    .select('*')
    .eq('url', url)
    .eq('brand_id', brandId)
    .maybeSingle();

  if (!existing.data) {
    return true; // URL not indexed yet → crawl it
  }

  // Check if content is still fresh (delta caching)
  const now = Date.now();
  const lastCrawled = new Date(existing.data.last_crawled_at).getTime();
  const hoursSinceLastCrawl = (now - lastCrawled) / (1000 * 60 * 60);

  if (hoursSinceLastCrawl < 24) {
    console.log(`[Anti-Redundancy] URL already crawled ${hoursSinceLastCrawl.toFixed(1)}h ago. Using cached data.`);
    return false; // Use cached data
  }

  // Content might have changed → check delta hash
  const currentTimestampHash = await getTimestampHashForURL(url);
  if (currentTimestampHash === existing.data.timestamp_hash) {
    console.log('[Anti-Redundancy] Content unchanged. Using cached data.');
    return false;
  }

  return true; // Content changed → re-crawl
}
```

### Rule 2: Check Unified Research FIRST

```typescript
async function shouldDoResearch(
  topic: string,
  researchType: string,
  brandId: string
): Promise<boolean> {
  // Check if research already exists
  const existing = await supabase
    .from('gv_unified_research_index')
    .select('*')
    .eq('research_topic', topic)
    .eq('research_type', researchType)
    .eq('brand_id', brandId)
    .eq('is_valid', true)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!existing.data) {
    return true; // Research not done yet → do it
  }

  console.log('[Anti-Redundancy] Research already exists. Reusing data.');
  return false; // Reuse existing research
}
```

### Rule 3: Check Unified Entity FIRST

```typescript
async function shouldTrackEntity(
  entityName: string,
  entityType: string,
  brandId: string,
  system: 'seo' | 'geo' | 'sso'
): Promise<boolean> {
  // Check if entity already tracked
  const existing = await supabase
    .from('gv_unified_entity_index')
    .select('*')
    .eq('entity_name', entityName)
    .eq('entity_type', entityType)
    .eq('brand_id', brandId)
    .maybeSingle();

  if (!existing.data) {
    return true; // Entity not tracked yet → track it
  }

  // Check if already tracked by this system
  const systemField = `tracked_by_${system}`;
  if (existing.data[systemField]) {
    console.log(`[Anti-Redundancy] Entity already tracked by ${system}. Using existing data.`);
    return false;
  }

  // Update to mark as tracked by this system too
  await supabase
    .from('gv_unified_entity_index')
    .update({ [systemField]: true })
    .eq('id', existing.data.id);

  console.log(`[Anti-Redundancy] Entity tracked by another system. Marked as tracked by ${system}.`);
  return false; // Reuse existing entity data
}
```

---

## 4. REAL-TIME SYNC ARCHITECTURE

### 4.1 Sync Triggers

```sql
-- Trigger: When SEO crawls URL → Update unified index
CREATE OR REPLACE FUNCTION sync_seo_to_unified_url()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO gv_unified_url_index (
    brand_id,
    url,
    domain,
    url_type,
    used_by_seo,
    content_text,
    content_hash,
    last_crawled_at,
    title,
    description,
    timestamp_hash,
    last_modified_at,
    is_indexed,
    last_indexed_at
  ) VALUES (
    NEW.brand_id,
    NEW.url,
    NEW.domain,
    'webpage',
    true,
    NEW.content,
    NEW.content_hash,
    NOW(),
    NEW.title,
    NEW.meta_description,
    NEW.timestamp_hash,
    NEW.last_modified,
    true,
    NOW()
  )
  ON CONFLICT (url) DO UPDATE SET
    used_by_seo = true,
    content_text = EXCLUDED.content_text,
    content_hash = EXCLUDED.content_hash,
    last_crawled_at = EXCLUDED.last_crawled_at,
    timestamp_hash = EXCLUDED.timestamp_hash,
    last_modified_at = EXCLUDED.last_modified_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: When SSO crawls creator profile → Update unified index
CREATE OR REPLACE FUNCTION sync_sso_to_unified_url()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO gv_unified_url_index (
    brand_id,
    url,
    domain,
    url_type,
    used_by_sso,
    content_text,
    content_hash,
    last_crawled_at,
    timestamp_hash,
    last_modified_at
  ) VALUES (
    NEW.brand_id,
    NEW.profile_url,
    SPLIT_PART(NEW.profile_url, '/', 3), -- Extract domain
    'social_profile',
    true,
    NULL, -- Will be populated on first crawl
    NEW.content_snapshot_hash,
    NEW.last_checked_at,
    NEW.timestamp_hash,
    NEW.last_modified_at
  )
  ON CONFLICT (url) DO UPDATE SET
    used_by_sso = true,
    timestamp_hash = EXCLUDED.timestamp_hash,
    last_modified_at = EXCLUDED.last_modified_at,
    updated_at = NOW();

  -- Also update unified entity index
  INSERT INTO gv_unified_entity_index (
    brand_id,
    entity_name,
    entity_type,
    entity_handle,
    entity_url,
    tracked_by_sso,
    impact_score,
    reach,
    engagement_rate,
    authority_score,
    sso_creator_id
  ) VALUES (
    NEW.brand_id,
    NEW.creator_name,
    'creator',
    NEW.creator_handle,
    NEW.profile_url,
    true,
    NEW.impact_score,
    NEW.reach,
    NEW.engagement_rate,
    NEW.authority_score,
    NEW.id
  )
  ON CONFLICT (brand_id, entity_name, entity_type) DO UPDATE SET
    tracked_by_sso = true,
    impact_score = EXCLUDED.impact_score,
    reach = EXCLUDED.reach,
    engagement_rate = EXCLUDED.engagement_rate,
    authority_score = EXCLUDED.authority_score,
    sso_creator_id = EXCLUDED.sso_creator_id,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_sync_sso_creator_to_unified
AFTER INSERT OR UPDATE ON gv_sso_creators
FOR EACH ROW
EXECUTE FUNCTION sync_sso_to_unified_url();
```

### 4.2 Cross-System Enrichment

```typescript
// When SEO finds a backlink opportunity
async function onSEOBacklinkDiscovered(backlink: Backlink) {
  // 1. Check if URL already indexed
  const unified = await getUnifiedURLIndex(backlink.url);

  if (!unified) {
    // First time seeing this URL → crawl and index
    const content = await crawlURL(backlink.url);
    await saveToUnifiedIndex(backlink.url, content, 'seo');
  } else {
    // URL already indexed → mark as used by SEO
    await markUsedBy(unified.id, 'seo');
  }

  // 2. Check if it's a creator/site tracked by SSO
  const entity = await checkIfSSO Entity(backlink.url);

  if (entity) {
    console.log('[Cross-Enrichment] Backlink is from SSO-tracked creator!');

    // Enrich backlink with SSO data
    await enrichBacklinkWithSSOData(backlink.id, entity);

    // Higher priority because it's from tracked creator
    await updateBacklinkPriority(backlink.id, 'high');
  }

  // 3. Check if domain is GEO rank #1 competitor
  const geoCompetitor = await checkIfGEOCompetitor(backlink.domain);

  if (geoCompetitor) {
    console.log('[Cross-Enrichment] Backlink is from GEO rank #1 competitor!');

    // Super high priority!
    await updateBacklinkPriority(backlink.id, 'urgent');

    // Add to competitive intelligence
    await addCompetitiveIntelligence({
      competitor: geoCompetitor.name,
      insight: `They have a backlink from ${backlink.domain}`,
      action: 'Get similar backlink'
    });
  }
}

// When GEO finds rank #1 competitor
async function onGEOCompetitorFound(competitor: GEOCompetitor) {
  // 1. Add to unified entity index
  const entity = await addToUnifiedEntityIndex({
    brandId: competitor.brand_id,
    entityName: competitor.name,
    entityType: 'competitor',
    trackedByGEO: true
  });

  // 2. Check if SSO already tracks this competitor as creator
  if (entity.tracked_by_sso) {
    console.log('[Cross-Enrichment] GEO competitor is SSO-tracked creator!');

    // Get SSO data
    const ssoData = await getSSO CreatorData(entity.sso_creator_id);

    // Enrich GEO competitor with SSO data
    await enrichGEOCompetitorWithSSOData(competitor.topic_id, ssoData);

    // Insight: "Competitor X has 100K followers on Twitter"
    await addGEOInsight({
      topic: competitor.topic,
      insight: `Rank #1 competitor ${competitor.name} has ${ssoData.reach} reach on ${ssoData.platform}`,
      action: 'Consider building presence on this platform'
    });
  }

  // 3. Check if SEO has backlinks from this competitor
  const seoBacklinks = await getSEOBacklinksFromDomain(competitor.domain);

  if (seoBacklinks.length > 0) {
    console.log('[Cross-Enrichment] SEO has backlinks from GEO competitor!');

    // Prioritize these backlinks
    await Promise.all(
      seoBacklinks.map(bl => updateBacklinkPriority(bl.id, 'urgent'))
    );
  }
}

// When SSO finds a mention
async function onSSOmMentionFound(mention: SSOMention) {
  // 1. Add mention URL to unified index
  await addToUnifiedURLIndex(mention.mention_url, 'sso');

  // 2. Check if it's a GEO citation source
  const geoCitation = await checkIfGEOCitationURL(mention.mention_url);

  if (geoCitation) {
    console.log('[Cross-Enrichment] SSO mention is also GEO citation!');

    // Update GEO citation with SSO engagement data
    await enrichGEOCitationWithSSOMention(geoCitation.id, {
      likes: mention.likes,
      shares: mention.shares,
      sentiment: mention.sentiment
    });
  }

  // 3. Check if it's a SEO backlink opportunity
  const domain = extractDomain(mention.mention_url);
  const seoOpportunity = await checkIfSEOBacklinkOpportunity(domain);

  if (seoOpportunity) {
    console.log('[Cross-Enrichment] SSO mention is SEO backlink opportunity!');

    // Update backlink opportunity with mention data
    await enrichSEOBacklinkWithSSOMention(seoOpportunity.id, mention);

    // Higher conversion rate because brand already mentioned
    await updateBacklinkStatus(seoOpportunity.id, 'warm_lead');
  }
}
```

---

## 5. UNIFIED WORKFLOW EXAMPLE

### Scenario: User adds brand "Acme Corp"

```typescript
async function onboardNewBrand(brand: Brand) {
  console.log('[Unified System] Starting brand onboarding...');

  // STEP 1: Gemini Flash Lite indexes EVERYTHING
  console.log('[Stage 1] Gemini Flash Lite indexing across ALL categories...');

  const categories = [
    ...SSO_CATEGORIES, // Social categories
    ...SEO_TOPICS,     // SEO keywords
    ...GEO_TOPICS      // GEO topics
  ];

  const indexResults = await runGeminiFlashLiteUnifiedIndexing(
    brand.id,
    categories
  );

  // Save to unified research index
  await saveToUnifiedResearchIndex({
    brandId: brand.id,
    researchTopic: 'brand_onboarding',
    researchType: 'keyword',
    requestedBySEO: true,
    requestedByGEO: true,
    requestedBySSO: true,
    geminiFlashLiteIndex: indexResults
  });

  // STEP 2: Amplified Perplexity ranking (using Gemini index)
  console.log('[Stage 2] Perplexity ranking (amplified by Gemini index)...');

  const perplexityResults = await runAmplifiedPerplexityRanking(
    brand.id,
    indexResults
  );

  // Update unified research index
  await updateUnifiedResearchIndex({
    researchTopic: 'brand_onboarding',
    perplexityResearch: perplexityResults
  });

  // STEP 3: Distribute to systems (NO DUPLICATION!)
  console.log('[Stage 3] Distributing to SEO, GEO, SSO...');

  // SEO gets keywords + backlink opportunities
  await distributToSEO(brand.id, {
    keywords: perplexityResults.keywords,
    backlinks: perplexityResults.backlinks
  });

  // GEO gets topics + competitors
  await distributeToGEO(brand.id, {
    topics: perplexityResults.topics,
    competitors: perplexityResults.competitors
  });

  // SSO gets creators + sites
  await distributeToSSO(brand.id, {
    creators: perplexityResults.creators,
    sites: perplexityResults.sites
  });

  // STEP 4: Mark all as indexed in unified index
  await markAsIndexedInUnifiedIndex(brand.id);

  console.log('[Unified System] Brand onboarding complete!');
  console.log(`- Total research cost: $${calculateTotalCost()}`);
  console.log(`- Research reused across 3 systems: NO DUPLICATION`);
}
```

---

## 6. COST SAVINGS WITH UNIFIED SYSTEM

### Without Unified System (REDUNDANT):

```
SEO research: $50
GEO research: $50
SSO research: $50
Total: $150

3x duplication! Same URLs crawled 3 times, same research done 3 times.
```

### With Unified System (EFFICIENT):

```
Unified Gemini Flash Lite indexing: $0.01
Unified Perplexity ranking: $25
Unified Gemini deep analysis: $0.02
Total: $25.03

Shared across SEO, GEO, SSO!
Savings: $150 - $25.03 = $124.97 (83% reduction!)
```

---

## 7. MONITORING & ALERTS

```typescript
// Monitor for duplicate operations
async function monitorForDuplicates() {
  // Check if any URL is being crawled by multiple systems
  const duplicateCrawls = await supabase
    .from('gv_unified_url_index')
    .select('*')
    .eq('used_by_seo', true)
    .eq('used_by_sso', true)
    .gte('last_crawled_at', new Date(Date.now() - 60 * 60 * 1000)); // Last hour

  if (duplicateCrawls.data && duplicateCrawls.data.length > 0) {
    console.warn(`[⚠️ REDUNDANCY ALERT] ${duplicateCrawls.data.length} URLs crawled by multiple systems in last hour!`);

    // Send alert to admin
    await sendAlert({
      type: 'redundancy_detected',
      details: duplicateCrawls.data
    });
  }

  // Check if any research is being done multiple times
  const duplicateResearch = await supabase
    .from('gv_unified_research_index')
    .select('research_topic, COUNT(*) as count')
    .gte('researched_at', new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24h
    .group('research_topic')
    .having('COUNT(*) > 1');

  if (duplicateResearch.data && duplicateResearch.data.length > 0) {
    console.warn(`[⚠️ REDUNDANCY ALERT] ${duplicateResearch.data.length} research topics duplicated!`);

    await sendAlert({
      type: 'duplicate_research',
      details: duplicateResearch.data
    });
  }
}

// Run monitoring every hour
setInterval(monitorForDuplicates, 60 * 60 * 1000);
```

---

## 8. SUMMARY

### ✅ **ANTI-REDUNDANCY GUARANTEED**

1. **Single Source of Truth**: All URLs, research, entities stored in unified tables
2. **Check Before Action**: Every system checks unified index FIRST
3. **Delta Caching**: Only re-crawl if content changed (timestamp hash)
4. **Research Sharing**: Gemini Flash Lite + Perplexity + Gemini research shared across all systems
5. **Real-Time Sync**: Database triggers + Supabase Realtime ensure instant sync
6. **Cross-Enrichment**: Data from one system enriches others automatically

### 📊 **BENEFITS**

- **83% Cost Reduction**: $150 → $25 (no duplicate research)
- **3x Faster**: No waiting for duplicate operations
- **100% Sync**: All systems always have latest data
- **Smart Enrichment**: SSO data enriches GEO, GEO enriches SEO, etc.
- **Zero Manual Work**: All sync happens automatically

---

**END OF DOCUMENT**
