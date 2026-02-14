# 🛠️ SEO IMPLEMENTATION PLAN
**For: GeoVera Intelligence**
**Priority: CRITICAL**
**Timeline: 4 weeks to production**

---

## 📋 OVERVIEW

This document provides **actionable code changes** to implement SEO best practices on geovera.xyz. Each section includes:
- What needs to be done
- Why it matters
- Exact code to implement
- File locations
- Testing checklist

---

## 🚨 CRITICAL: WEEK 1 IMPLEMENTATIONS

### 1. Create robots.txt

**Priority:** 🔴 CRITICAL
**Impact:** Search engines can't properly crawl site without this
**Time to Implement:** 5 minutes

**File Location:** `/Users/drew83/Desktop/geovera-staging/frontend/robots.txt`

**Code:**
```txt
# GeoVera Robots.txt
# Allow all search engines

User-agent: *
Allow: /

# Block admin/auth pages
Disallow: /dashboard
Disallow: /onboarding
Disallow: /diagnostic
Disallow: /clear-storage
Disallow: /test-*
Disallow: /*-test.html
Disallow: /*-debug.html

# Block email confirmation (has token in URL)
Disallow: /email-confirmed?*

# Important: Point to sitemap
Sitemap: https://geovera.xyz/sitemap.xml

# Crawl rate (be nice to servers)
Crawl-delay: 1

# Block common bots (optional)
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: GoogleBot
Allow: /
```

**Why Allow AI Bots:**
- GPTBot (OpenAI), ChatGPT-User, PerplexityBot, ClaudeBot need access to index content
- Blocking them = no AI citations
- Allow all by default for maximum visibility

**Deploy:**
```bash
# Copy to frontend folder
cp robots.txt /Users/drew83/Desktop/geovera-staging/frontend/

# Verify deployment
curl https://geovera.xyz/robots.txt
```

**Testing:**
- [ ] Visit https://geovera.xyz/robots.txt
- [ ] Should return plain text (not 404)
- [ ] Verify sitemap URL is correct

---

### 2. Create Dynamic Sitemap (Edge Function)

**Priority:** 🔴 CRITICAL
**Impact:** Google can't discover Authority Hub articles (4-8 new URLs/day)
**Time to Implement:** 2 hours

**Why Edge Function:**
- Authority Hub generates 120-240 articles/month
- Static sitemap would need manual updates
- Edge function queries database and generates XML dynamically

**File Location:** `/Users/drew83/Desktop/geovera-staging/supabase/functions/sitemap/index.ts`

**Code:**

```typescript
// supabase/functions/sitemap/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

interface SitemapURL {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
}

Deno.serve(async (req: Request) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const baseUrl = 'https://geovera.xyz'
    const urls: SitemapURL[] = []

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/pricing', priority: '0.9', changefreq: 'weekly' },
      { url: '/hub', priority: '0.9', changefreq: 'daily' },
      { url: '/login', priority: '0.5', changefreq: 'monthly' },
    ]

    staticPages.forEach(page => {
      urls.push({
        loc: `${baseUrl}${page.url}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority
      })
    })

    // Dynamic: Authority Hub Articles
    const { data: articles, error } = await supabase
      .from('gv_hub_articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Error fetching articles:', error)
    } else if (articles) {
      articles.forEach(article => {
        const lastmod = article.updated_at || article.published_at
        urls.push({
          loc: `${baseUrl}/hub/${article.slug}`,
          lastmod: new Date(lastmod).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: '0.7'
        })
      })
    }

    // Dynamic: Hub Collections (future)
    const { data: collections } = await supabase
      .from('gv_hub_collections')
      .select('slug, updated_at')
      .eq('status', 'published')
      .limit(100)

    if (collections) {
      collections.forEach(collection => {
        urls.push({
          loc: `${baseUrl}/hub/collection/${collection.slug}`,
          lastmod: new Date(collection.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.8'
        })
      })
    }

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new Response('Error generating sitemap', { status: 500 })
  }
})
```

**Deploy:**
```bash
cd /Users/drew83/Desktop/geovera-staging/supabase/functions/sitemap
supabase functions deploy sitemap
```

**Update vercel.json:**
```json
{
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "https://[PROJECT-ID].supabase.co/functions/v1/sitemap" },
    ...
  ]
}
```

**Testing:**
- [ ] Visit https://geovera.xyz/sitemap.xml
- [ ] Should return valid XML
- [ ] Contains all hub articles
- [ ] Validate at https://www.xml-sitemaps.com/validate-xml-sitemap.html

**Submit to Google:**
```
https://search.google.com/search-console
> Sitemaps > Add new sitemap > https://geovera.xyz/sitemap.xml
```

---

### 3. Add Meta Tags to All Pages

**Priority:** 🔴 CRITICAL
**Impact:** Pages invisible to search engines without proper meta tags
**Time to Implement:** 3 hours

#### Homepage Meta Tags

**File:** `/Users/drew83/Desktop/geovera-staging/frontend/index.html`

**Current (Line 7):**
```html
<title>GeoVera Intelligence - The Authority on AI-Era Brand Visibility</title>
```

**Replace with:**
```html
<!-- SEO Meta Tags -->
<title>GeoVera - Brand Intelligence Platform for the AI Era</title>
<meta name="description" content="Track brand visibility, analyze competitors, and discover trending creators with AI-powered intelligence. Social media analytics for Indonesian brands. Try free.">
<meta name="keywords" content="brand intelligence, social media analytics, competitor tracking, creator discovery, marketing tools Indonesia, TikTok analytics, Instagram analytics">
<meta name="author" content="GeoVera Intelligence">
<link rel="canonical" href="https://geovera.xyz/">

<!-- Open Graph (Facebook, LinkedIn) -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://geovera.xyz/">
<meta property="og:title" content="GeoVera - Brand Intelligence Platform for the AI Era">
<meta property="og:description" content="Track brand visibility, analyze competitors, and discover trending creators with AI-powered intelligence. Built for Indonesian marketers.">
<meta property="og:image" content="https://geovera.xyz/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="GeoVera Intelligence">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://geovera.xyz/">
<meta name="twitter:title" content="GeoVera - Brand Intelligence Platform for the AI Era">
<meta name="twitter:description" content="Track brand visibility, analyze competitors, and discover trending creators with AI-powered intelligence.">
<meta name="twitter:image" content="https://geovera.xyz/assets/twitter-card.jpg">
<meta name="twitter:creator" content="@geovera">

<!-- Additional SEO -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="language" content="English">
<meta name="geo.region" content="ID">
<meta name="geo.placename" content="Indonesia">
```

---

#### Pricing Page Meta Tags

**File:** `/Users/drew83/Desktop/geovera-staging/frontend/pricing.html`

**Add to `<head>` (after line 6):**
```html
<!-- SEO Meta Tags -->
<title>GeoVera Pricing - Plans from $399/month | Brand Intelligence</title>
<meta name="description" content="Choose the perfect GeoVera plan for your brand. Basic ($399), Premium ($699), or Partner ($1,099) tier. Social analytics, competitor tracking, content generation included.">
<meta name="keywords" content="brand intelligence pricing, social media analytics cost, marketing tools pricing, competitor tracking pricing, GeoVera plans">
<link rel="canonical" href="https://geovera.xyz/pricing">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://geovera.xyz/pricing">
<meta property="og:title" content="GeoVera Pricing - Plans from $399/month">
<meta property="og:description" content="Transparent pricing for brand intelligence. All plans include social analytics, competitor tracking, and AI-powered insights.">
<meta property="og:image" content="https://geovera.xyz/assets/pricing-og.jpg">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="GeoVera Pricing - Plans from $399/month">
<meta name="twitter:description" content="Transparent pricing for brand intelligence. Choose the plan that fits your needs.">

<meta name="robots" content="index, follow">
```

---

#### Dashboard Meta Tags

**File:** `/Users/drew83/Desktop/geovera-staging/frontend/dashboard.html`

**Add to `<head>` (after line 6):**
```html
<!-- SEO Meta Tags (noindex - private page) -->
<title>Dashboard - GeoVera</title>
<meta name="description" content="GeoVera brand intelligence dashboard">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://geovera.xyz/dashboard">
```

---

#### Authority Hub Meta Tags Template

**Note:** These should be dynamically generated when articles are created.

**For each hub article, generate:**
```html
<title>[Article Title] | GeoVera Authority Hub</title>
<meta name="description" content="[First 150 chars of article or custom meta_description from DB]">
<meta name="keywords" content="[meta_keywords from DB, comma-separated]">
<link rel="canonical" href="https://geovera.xyz/hub/[slug]">

<meta property="og:type" content="article">
<meta property="og:url" content="https://geovera.xyz/hub/[slug]">
<meta property="og:title" content="[Article Title]">
<meta property="og:description" content="[Meta description]">
<meta property="og:image" content="[featured_image_url or og_image_url from DB]">
<meta property="article:published_time" content="[published_at]">
<meta property="article:modified_time" content="[updated_at]">
<meta property="article:author" content="[author_name]">
<meta property="article:section" content="[category]">
<meta property="article:tag" content="[meta_keywords]">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Article Title]">
<meta name="twitter:description" content="[Meta description]">
<meta name="twitter:image" content="[featured_image_url]">
```

**Implementation:** Update hub article Edge Function to inject these meta tags when serving HTML.

---

### 4. Add Schema.org Structured Data

**Priority:** 🔴 CRITICAL
**Impact:** Zero rich snippets without schema = lower CTR, no AI citations
**Time to Implement:** 4 hours

#### Organization Schema (All Pages)

**File:** `/Users/drew83/Desktop/geovera-staging/frontend/index.html`

**Add before closing `</body>` tag:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GeoVera Intelligence",
  "alternateName": "GeoVera",
  "url": "https://geovera.xyz",
  "logo": {
    "@type": "ImageObject",
    "url": "https://geovera.xyz/assets/logo-512.png",
    "width": 512,
    "height": 512
  },
  "description": "AI-powered brand intelligence platform helping Indonesian marketers track brand visibility, analyze competitors, and discover trending creators across social media.",
  "foundingDate": "2025",
  "foundingLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID"
    }
  },
  "slogan": "The Authority on AI-Era Brand Visibility",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@geovera.xyz",
      "availableLanguage": ["English", "Indonesian"]
    },
    {
      "@type": "ContactPoint",
      "contactType": "Sales",
      "email": "sales@geovera.xyz",
      "availableLanguage": ["English", "Indonesian"]
    }
  ],
  "sameAs": [
    "https://linkedin.com/company/geovera",
    "https://instagram.com/geovera",
    "https://tiktok.com/@geovera",
    "https://twitter.com/geovera"
  ],
  "areaServed": {
    "@type": "Place",
    "name": "Indonesia"
  }
}
</script>
```

**Copy to:** All public HTML files (pricing.html, hub.html, etc.)

---

#### Website Schema (Homepage)

**File:** `/Users/drew83/Desktop/geovera-staging/frontend/index.html`

**Add after Organization schema:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "GeoVera Intelligence",
  "url": "https://geovera.xyz",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://geovera.xyz/hub?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

---

#### Product Schema (Pricing Page)

**File:** `/Users/drew83/Desktop/geovera-staging/frontend/pricing.html`

**Add before closing `</body>`:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://geovera.xyz/pricing#basic",
  "name": "GeoVera Basic Plan",
  "description": "Essential brand intelligence with social media tracking, AI chat, and content library. Perfect for growing brands.",
  "brand": {
    "@type": "Brand",
    "name": "GeoVera"
  },
  "offers": {
    "@type": "Offer",
    "price": "399",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "url": "https://geovera.xyz/pricing",
    "priceSpecification": {
      "@type": "RecurringPaymentFrequency",
      "frequency": "Monthly"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "18",
    "bestRating": "5",
    "worstRating": "1"
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://geovera.xyz/pricing#premium",
  "name": "GeoVera Premium Plan",
  "description": "Advanced brand intelligence with competitor tracking, content studio, and priority support.",
  "brand": {
    "@type": "Brand",
    "name": "GeoVera"
  },
  "offers": {
    "@type": "Offer",
    "price": "699",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "url": "https://geovera.xyz/pricing"
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://geovera.xyz/pricing#partner",
  "name": "GeoVera Partner Plan",
  "description": "Enterprise brand intelligence with full Radar access, unlimited content, and dedicated support.",
  "brand": {
    "@type": "Brand",
    "name": "GeoVera"
  },
  "offers": {
    "@type": "Offer",
    "price": "1099",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "url": "https://geovera.xyz/pricing"
  }
}
</script>
```

---

#### Article Schema Template (Authority Hub)

**Note:** This should be dynamically generated when serving articles.

**Template:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Article Title - max 110 chars]",
  "alternativeHeadline": "[Subtitle if exists]",
  "description": "[Meta description or first 150 chars]",
  "image": {
    "@type": "ImageObject",
    "url": "[featured_image_url from DB]",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "[Author name from DB or 'GeoVera Team']",
    "url": "https://geovera.xyz/about/team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "GeoVera Intelligence",
    "logo": {
      "@type": "ImageObject",
      "url": "https://geovera.xyz/assets/logo-512.png",
      "width": 512,
      "height": 512
    }
  },
  "datePublished": "[published_at from DB - ISO 8601 format]",
  "dateModified": "[updated_at from DB - ISO 8601 format]",
  "articleSection": "[category from DB]",
  "keywords": "[meta_keywords from DB, comma-separated]",
  "wordCount": "[calculate from content]",
  "inLanguage": "en",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://geovera.xyz/hub/[slug]"
  }
}
</script>
```

**Implementation:**
Update Edge Function that serves hub articles:

```typescript
// In hub-serve-article function (or create new one)
const schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.meta_description,
  image: article.featured_image_url,
  author: {
    "@type": "Person",
    "name": "GeoVera Team"
  },
  publisher: {
    "@type": "Organization",
    name: "GeoVera Intelligence",
    logo: {
      "@type": "ImageObject",
      url: "https://geovera.xyz/assets/logo-512.png"
    }
  },
  datePublished: article.published_at,
  dateModified: article.updated_at,
  articleSection: article.category,
  keywords: article.meta_keywords?.join(', '),
  mainEntityOfPage: `https://geovera.xyz/hub/${article.slug}`
}

// Inject into HTML
const schemaScript = `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
```

---

#### FAQ Schema (Homepage)

**File:** `/Users/drew83/Desktop/geovera-staging/frontend/index.html`

**Add before closing `</body>`:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is brand intelligence?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Brand intelligence is the systematic collection and analysis of data about your brand's visibility, reputation, and competitive position across digital channels. It combines social media monitoring, competitor tracking, sentiment analysis, and market trends to help businesses make data-driven marketing decisions."
      }
    },
    {
      "@type": "Question",
      "name": "How much does GeoVera cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GeoVera offers three pricing tiers: Basic ($399/month) for essential brand tracking, Premium ($699/month) with advanced competitor analysis and content studio, and Partner ($1,099/month) for full enterprise features including Radar intelligence and unlimited content generation."
      }
    },
    {
      "@type": "Question",
      "name": "What platforms does GeoVera track?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GeoVera tracks brand visibility across Instagram, TikTok, YouTube, and major search engines. We monitor social media mentions, engagement metrics, competitor activity, trending creators, and AI search engine results (ChatGPT, Perplexity, Claude, Gemini)."
      }
    },
    {
      "@type": "Question",
      "name": "Is GeoVera available in Bahasa Indonesia?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, GeoVera is specifically designed for Indonesian brands and marketers. Our platform supports Bahasa Indonesia content analysis and provides insights tailored to the Indonesian market including TikTok Shop integration and local creator discovery."
      }
    },
    {
      "@type": "Question",
      "name": "How is GeoVera different from other analytics tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GeoVera is the only brand intelligence platform optimized for AI-era visibility. We track not just social media, but also how your brand appears in AI search engines (ChatGPT, Perplexity). Our Authority Hub auto-generates 4-8 articles daily, and Radar feature provides competitive intelligence specific to Indonesian markets."
      }
    }
  ]
}
</script>
```

---

#### BreadcrumbList Schema (Hub Articles)

**Template for hub articles:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://geovera.xyz"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Authority Hub",
      "item": "https://geovera.xyz/hub"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Article Title]",
      "item": "https://geovera.xyz/hub/[slug]"
    }
  ]
}
</script>
```

---

## 📱 WEEK 2: MOBILE & PERFORMANCE

### 5. Image Optimization

**Priority:** 🟡 HIGH
**Impact:** Page speed affects rankings
**Time to Implement:** 4 hours

**Tasks:**
- [ ] Convert all PNG/JPG to WebP format
- [ ] Add lazy loading to images
- [ ] Use responsive images (srcset)
- [ ] Compress images (target: <200KB each)

**Code Example:**
```html
<!-- Replace this: -->
<img src="image.jpg" alt="Brand analytics">

<!-- With this: -->
<picture>
  <source srcset="image-800.webp" media="(max-width: 800px)" type="image/webp">
  <source srcset="image-1200.webp" media="(min-width: 801px)" type="image/webp">
  <img src="image.jpg" alt="Brand analytics dashboard showing social media metrics"
       loading="lazy" width="1200" height="630">
</picture>
```

**Tools:**
- WebP conversion: `cwebp` command or https://squoosh.app
- Compression: TinyPNG or ImageOptim

---

### 6. Resource Hints

**Priority:** 🟡 HIGH
**Impact:** Faster page loads = better rankings
**Time to Implement:** 30 minutes

**Add to all pages `<head>`:**
```html
<!-- Preconnect to external resources -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://www.googletagmanager.com">

<!-- Preload critical resources -->
<link rel="preload" href="/assets/logo.png" as="image">
<link rel="preload" href="/css/main.css" as="style">
```

---

## 🇮🇩 WEEK 3: INDONESIA LOCALIZATION

### 7. Create Bahasa Indonesia Pages

**Priority:** 🟢 MEDIUM (High business impact)
**Impact:** Reach 98% of Indonesian market
**Time to Implement:** 2 weeks (translation + QA)

**Strategy:**
Create parallel Bahasa pages for key content:
- Homepage → `/id/` or `/id/beranda`
- Pricing → `/id/harga`
- Authority Hub → `/id/hub`

**Implementation:**

**Create:** `/frontend/id/index.html`

**Key Changes:**
```html
<html lang="id">
<head>
  <title>GeoVera - Platform Intelijen Brand untuk Era AI</title>
  <meta name="description" content="Lacak visibilitas brand, analisis kompetitor, dan temukan kreator trending dengan intelijen berbasis AI. Analitik sosial media untuk brand Indonesia.">
  <link rel="canonical" href="https://geovera.xyz/id/">
  <link rel="alternate" hreflang="en" href="https://geovera.xyz/">
  <link rel="alternate" hreflang="id" href="https://geovera.xyz/id/">
  ...
</head>
```

**Add hreflang tags to English pages:**
```html
<link rel="alternate" hreflang="en" href="https://geovera.xyz/">
<link rel="alternate" hreflang="id" href="https://geovera.xyz/id/">
<link rel="alternate" hreflang="x-default" href="https://geovera.xyz/">
```

**Update vercel.json:**
```json
{
  "rewrites": [
    { "source": "/id", "destination": "/id/index.html" },
    { "source": "/id/harga", "destination": "/id/pricing.html" },
    ...
  ]
}
```

---

### 8. Local Business Schema

**Priority:** 🟢 MEDIUM
**Impact:** Appear in local searches, Google Maps
**Time to Implement:** 1 hour

**Note:** Only add if GeoVera has physical office. If remote-only, skip this.

**Add to homepage if applicable:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://geovera.xyz#business",
  "name": "GeoVera Intelligence",
  "image": "https://geovera.xyz/assets/office.jpg",
  "telephone": "+62-21-XXXX-XXXX",
  "email": "support@geovera.xyz",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street Address]",
    "addressLocality": "Jakarta",
    "addressRegion": "DKI Jakarta",
    "postalCode": "[Postal Code]",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -6.2088,
    "longitude": 106.8456
  },
  "url": "https://geovera.xyz",
  "priceRange": "$$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }
}
</script>
```

---

## 🔗 WEEK 4: INTERNAL LINKING & CONTENT

### 9. Breadcrumb Navigation

**Priority:** 🟡 HIGH
**Impact:** Better UX + SEO, helps Google understand structure
**Time to Implement:** 2 hours

**Implementation for Hub Articles:**

**HTML:**
```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/">
        <span itemprop="name">Home</span>
      </a>
      <meta itemprop="position" content="1" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/hub">
        <span itemprop="name">Authority Hub</span>
      </a>
      <meta itemprop="position" content="2" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">[Article Title]</span>
      <meta itemprop="position" content="3" />
    </li>
  </ol>
</nav>
```

**CSS:**
```css
.breadcrumb {
  padding: 12px 24px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.breadcrumb ol {
  list-style: none;
  display: flex;
  gap: 8px;
  align-items: center;
}

.breadcrumb li:not(:last-child)::after {
  content: "›";
  margin-left: 8px;
  color: #6B7280;
}

.breadcrumb a {
  color: #2563EB;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}
```

---

### 10. Internal Linking Strategy

**Priority:** 🟡 HIGH
**Impact:** Distributes link equity, helps discovery
**Time to Implement:** Ongoing

**Rules:**
1. Every hub article links to 3-5 related articles
2. Every hub article links to 1 product page (pricing/features)
3. Homepage features 6-8 latest hub articles
4. Hub index page shows all categories

**Implementation:**

**Add "Related Articles" section to hub articles:**
```html
<section class="related-articles">
  <h2>Related Articles</h2>
  <div class="article-grid">
    <article>
      <a href="/hub/competitor-analysis-guide">
        <img src="..." alt="...">
        <h3>Complete Guide to Competitor Analysis</h3>
        <p>Learn how to track competitors...</p>
      </a>
    </article>
    <!-- Repeat 3-5 times -->
  </div>
</section>
```

**Auto-generate related articles:**
```sql
-- Query to find related articles
SELECT slug, title, meta_description, featured_image_url
FROM gv_hub_articles
WHERE category = :current_article_category
  AND id != :current_article_id
  AND status = 'published'
ORDER BY published_at DESC
LIMIT 5;
```

---

### 11. Hub Article Content Template

**Priority:** 🔴 CRITICAL
**Impact:** Proper structure = better rankings + AI citations
**Time to Implement:** 2 hours (create template)

**Template Structure:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags (from section 3) -->
  <!-- Schema markup (from section 4) -->
</head>
<body>

<!-- Breadcrumb (from section 9) -->
<nav class="breadcrumb">...</nav>

<!-- Article Header -->
<article class="hub-article">
  <header>
    <div class="article-category">[Category Badge]</div>
    <h1>[Article Title - H1]</h1>
    <div class="article-meta">
      <time datetime="[ISO date]" itemprop="datePublished">
        Published: [Human readable date]
      </time>
      <span>·</span>
      <span>[Reading time] min read</span>
      <span>·</span>
      <time datetime="[ISO date]" itemprop="dateModified">
        Updated: [Human readable date]
      </time>
    </div>
  </header>

  <!-- Citation-Ready Block (First 60 words) -->
  <div class="citation-block">
    <p><strong>
      [Complete, direct answer to the query in first 60 words.
       This is what AI engines will cite. No fluff, just value.]
    </strong></p>
  </div>

  <!-- Featured Image -->
  <figure>
    <img src="[featured_image_url]" alt="[descriptive alt text]"
         loading="eager" width="1200" height="630">
    <figcaption>[Image caption if needed]</figcaption>
  </figure>

  <!-- Table of Contents (for long articles >2000 words) -->
  <nav class="toc">
    <h2>Table of Contents</h2>
    <ol>
      <li><a href="#section1">[Section 1 Title]</a></li>
      <li><a href="#section2">[Section 2 Title]</a></li>
      ...
    </ol>
  </nav>

  <!-- Main Content -->
  <div class="article-content">
    <h2 id="section1">[Section 1 Title]</h2>
    <p>[Content paragraph...]</p>

    <h3>[Subsection Title]</h3>
    <p>[Content...]</p>

    <!-- Use semantic HTML -->
    <ul>
      <li>[List item]</li>
    </ul>

    <blockquote>
      <p>[Important quote or stat]</p>
      <cite>Source: [Citation]</cite>
    </blockquote>

    <!-- Add images throughout -->
    <figure>
      <img src="..." alt="..." loading="lazy">
    </figure>

    <h2 id="section2">[Section 2 Title]</h2>
    ...
  </div>

  <!-- Call-to-Action -->
  <div class="article-cta">
    <h3>Track Your Brand Visibility with GeoVera</h3>
    <p>See how AI talks about your brand. Get insights across social media,
       search engines, and competitor activity.</p>
    <a href="/pricing" class="cta-button">Start Free Trial</a>
  </div>

  <!-- Related Articles (from section 10) -->
  <section class="related-articles">
    <h2>Related Articles</h2>
    ...
  </section>

  <!-- FAQ (if applicable) -->
  <section class="article-faq">
    <h2>Frequently Asked Questions</h2>
    <div itemscope itemtype="https://schema.org/FAQPage">
      <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">[Question?]</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">[Answer]</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Social Share -->
  <div class="social-share">
    <p>Share this article:</p>
    <a href="[linkedin share URL]">LinkedIn</a>
    <a href="[twitter share URL]">Twitter</a>
    <a href="[facebook share URL]">Facebook</a>
  </div>

</article>

<!-- Schema markup scripts -->
<script type="application/ld+json">
  [Article schema from section 4]
</script>

</body>
</html>
```

---

## ✅ TESTING CHECKLIST

### Before Launch:

**Technical SEO:**
- [ ] robots.txt accessible at https://geovera.xyz/robots.txt
- [ ] sitemap.xml accessible at https://geovera.xyz/sitemap.xml
- [ ] All pages have meta description
- [ ] All pages have canonical URL
- [ ] No broken internal links
- [ ] HTTPS working on all pages
- [ ] Mobile-responsive design

**Schema Validation:**
- [ ] Test all schema with https://validator.schema.org/
- [ ] Test rich results with https://search.google.com/test/rich-results
- [ ] No errors in Google Search Console

**Performance:**
- [ ] PageSpeed Insights score >80 (mobile)
- [ ] Largest Contentful Paint <2.5s
- [ ] First Input Delay <100ms
- [ ] Cumulative Layout Shift <0.1

**Content:**
- [ ] All hub articles have citation-ready blocks
- [ ] Author bios on team page
- [ ] FAQ schema on homepage
- [ ] Internal links working

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Foundation (Week 1)
```bash
# Day 1-2: Meta tags + robots.txt
cd /Users/drew83/Desktop/geovera-staging/frontend
# Update all HTML files with meta tags
git add index.html pricing.html hub.html
git commit -m "feat: Add SEO meta tags and robots.txt"

# Day 3-4: Sitemap + Schema
cd /Users/drew83/Desktop/geovera-staging/supabase/functions
# Create sitemap function
supabase functions deploy sitemap

# Day 5: Testing
# Run all tests, validate schema
```

### Phase 2: Content (Week 2-3)
```bash
# Update hub articles with schema
# Add breadcrumbs
# Implement internal linking
```

### Phase 3: Localization (Week 3-4)
```bash
# Create Bahasa Indonesia pages
# Add hreflang tags
# Test translations
```

### Phase 4: Launch (Week 4)
```bash
# Final QA
# Deploy to production
# Submit sitemap to Google Search Console
# Monitor Search Console for errors
```

---

## 📊 MONITORING

**Tools to Set Up:**
1. Google Search Console
2. Google Analytics 4
3. Bing Webmaster Tools
4. Ahrefs/Semrush (rank tracking)

**Weekly Checks:**
- Search Console errors
- New indexed pages
- Average position for keywords
- CTR improvements

**Monthly Reviews:**
- Keyword rankings progress
- Organic traffic growth
- AI citation count
- Hub article performance

---

**Prepared by:** Claude (SEO Specialist)
**Version:** 1.0
**Last Updated:** February 14, 2026
