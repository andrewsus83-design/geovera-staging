# BRAND REPORT OPTIMIZATION STRATEGY

## 🎯 Goal: Faster & Smoother Report Access

**Current State**: Report loads in ~2-3 seconds with markdown rendering
**Target**: Report loads in <1 second with instant display

---

## 🚀 OPTIMIZATION STRATEGIES

### 1. **Server-Side Rendering (SSR)** ⭐ HIGHEST IMPACT

**Problem**: Current system renders markdown on client-side
**Solution**: Pre-render HTML on server when report is generated

#### Implementation:

```typescript
// In onboarding-workflow Edge Function (Step 4)
async function step4_openai_with_html(
  brandName: string,
  geminiData: Step1Output,
  perplexityResearch: string,
  claudeAnalysis: Step3Output
): Promise<{ markdown: string, html: string }> {

  // Get markdown from GPT-4o
  const markdown = await generateMarkdownReport(...);

  // Convert markdown to HTML server-side
  const html = await marked.parse(markdown);

  // Save BOTH markdown and pre-rendered HTML
  return { markdown, html };
}
```

#### Database Schema Update:
```sql
ALTER TABLE brand_reports
ADD COLUMN report_html TEXT;  -- Pre-rendered HTML

-- Index for faster queries
CREATE INDEX idx_brand_reports_html ON brand_reports(report_html)
WHERE report_html IS NOT NULL;
```

#### Frontend Update:
```javascript
// report-viewer.html
async function loadReport() {
    const { data } = await supabase
        .from('brand_reports')
        .select('report_html, brand_name, parent_company')  // Fetch HTML directly
        .eq('slug', brandSlug)
        .single();

    // NO markdown parsing needed - instant display!
    document.getElementById('markdown-content').innerHTML = data.report_html;
}
```

**Performance Gain**:
- ❌ Before: Client downloads markdown (14KB) + marked.js library (50KB) + parse time (500ms)
- ✅ After: Client downloads pre-rendered HTML (16KB) + instant display (0ms parse)
- **Total Savings**: ~1.5 seconds faster

---

### 2. **Static HTML Generation** ⭐⭐ BEST PERFORMANCE

**Concept**: Generate standalone HTML file per brand (like bulletin)

#### Implementation:

```typescript
// After report generation in Step 4
async function generateStaticReportHTML(reportData: ReportData): Promise<string> {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${reportData.brand_name} Intelligence Report | GeoVera</title>
    <style>
        /* Inline all CSS - no external requests */
        ${GEOVERA_REPORT_CSS}
    </style>
</head>
<body>
    <header class="report-header">
        <div class="logo">GeoVera</div>
        <h1>${reportData.brand_name}</h1>
    </header>

    <main class="report-content">
        ${reportData.report_html}
    </main>

    <footer class="report-footer">
        © 2026 GeoVera Intelligence
    </footer>
</body>
</html>`;

  return html;
}

// Save to Vercel Blob or Supabase Storage
const fileUrl = await saveStaticHTML(html, `${slug}.html`);
// Returns: https://geovera-reports.vercel.app/kata-oma.html
```

#### URL Structure:
```
https://geovera-reports.vercel.app/kata-oma.html
https://geovera-reports.vercel.app/aquviva.html
https://geovera-reports.vercel.app/the-watch-co.html
```

**Performance Gain**:
- ❌ Before: Supabase query (200ms) + markdown parsing (500ms) + render (100ms) = 800ms
- ✅ After: Static HTML from CDN = 50ms load time
- **Total Savings**: ~750ms faster (15x improvement!)

---

### 3. **CDN Caching with Vercel Edge** ⭐⭐ GLOBAL PERFORMANCE

**Setup**: Cache reports on Vercel Edge Network (global CDN)

#### vercel.json Configuration:
```json
{
  "headers": [
    {
      "source": "/report/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "CDN-Cache-Control",
          "value": "public, max-age=31536000"
        }
      ]
    }
  ]
}
```

#### Edge Function with Cache:
```typescript
// supabase/functions/get-report/index.ts
export const config = {
  runtime: 'edge',
  regions: ['sin1', 'iad1', 'sfo1']  // Singapore, US East, US West
};

Deno.serve(async (req) => {
  const slug = new URL(req.url).searchParams.get('brand');

  // Check Vercel Edge Cache first
  const cacheKey = `report:${slug}`;
  const cached = await edge.get(cacheKey);

  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Status': 'HIT',
        'Age': cached.age
      }
    });
  }

  // If not cached, fetch from Supabase
  const { data } = await supabase
    .from('brand_reports')
    .select('report_html')
    .eq('slug', slug)
    .single();

  // Cache for 1 year
  await edge.set(cacheKey, data.report_html, { ttl: 31536000 });

  return new Response(data.report_html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Status': 'MISS'
    }
  });
});
```

**Performance Gain**:
- ❌ Before: Supabase in Singapore (200ms from Indonesia, 800ms from US)
- ✅ After: Vercel Edge Cache (20ms from anywhere in the world)
- **Total Savings**: ~180-780ms depending on location

---

### 4. **Progressive Loading** 🎨 PERCEIVED PERFORMANCE

**Show skeleton/preview instantly, load full report in background**

#### Implementation:
```html
<!-- report-viewer.html -->
<div id="report-skeleton" class="skeleton-loader">
    <div class="header-skeleton">
        <div class="logo-skeleton"></div>
        <div class="title-skeleton"></div>
    </div>
    <div class="content-skeleton">
        <div class="section-skeleton"></div>
        <div class="section-skeleton"></div>
        <div class="section-skeleton"></div>
    </div>
</div>

<div id="report-content" style="display: none;">
    <!-- Actual report loads here -->
</div>

<script>
async function loadReport() {
    // Show skeleton immediately
    document.getElementById('report-skeleton').style.display = 'block';

    // Load report in background
    const { data } = await supabase
        .from('brand_reports')
        .select('*')
        .eq('slug', brandSlug)
        .single();

    // Fade out skeleton, fade in content
    document.getElementById('report-skeleton').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('report-skeleton').style.display = 'none';
        document.getElementById('report-content').innerHTML = data.report_html;
        document.getElementById('report-content').style.display = 'block';
        document.getElementById('report-content').style.opacity = '1';
    }, 300);
}
</script>

<style>
.skeleton-loader {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.header-skeleton {
    height: 120px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
</style>
```

**Performance Gain**:
- User sees SOMETHING instantly (skeleton)
- Perceived load time: 0ms
- Actual load time unchanged, but feels 10x faster

---

### 5. **Lazy Load Images** 📸 BANDWIDTH OPTIMIZATION

#### Current Issue:
```html
<!-- All images load immediately -->
<img src="https://images.unsplash.com/photo-1234...?w=1200&h=600" />
<img src="https://images.unsplash.com/photo-5678...?w=1200&h=600" />
<img src="https://images.unsplash.com/photo-9012...?w=1200&h=600" />
```

**6 images × 200KB = 1.2MB loaded immediately**

#### Optimized:
```html
<!-- Images load as user scrolls -->
<img
    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3C/svg%3E"
    data-src="https://images.unsplash.com/photo-1234...?w=1200&h=600&auto=format&q=80"
    loading="lazy"
    class="lazy-image"
    alt="Data analytics dashboard"
/>

<script>
// Intersection Observer for lazy loading
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy-image');
            imageObserver.unobserve(img);
        }
    });
});

document.querySelectorAll('.lazy-image').forEach(img => {
    imageObserver.observe(img);
});
</script>
```

**Performance Gain**:
- ❌ Before: 1.2MB loaded upfront (3-5 seconds on 3G)
- ✅ After: 200KB loaded upfront (0.5 seconds), rest loads on scroll
- **Total Savings**: 1MB bandwidth, 2-4 seconds faster initial load

---

### 6. **WebP Images with Auto-Format** 🖼️ COMPRESSION

#### Unsplash Optimization:
```html
<!-- Before: 200KB per image -->
<img src="https://images.unsplash.com/photo-1234...?w=1200&h=600" />

<!-- After: 50KB per image (75% smaller) -->
<img
    srcset="
        https://images.unsplash.com/photo-1234...?w=600&auto=format&fit=crop&q=80 600w,
        https://images.unsplash.com/photo-1234...?w=900&auto=format&fit=crop&q=80 900w,
        https://images.unsplash.com/photo-1234...?w=1200&auto=format&fit=crop&q=80 1200w
    "
    sizes="(max-width: 768px) 600px, (max-width: 1200px) 900px, 1200px"
    src="https://images.unsplash.com/photo-1234...?w=1200&auto=format&fit=crop&q=80"
    alt="Dashboard"
/>
```

**Unsplash `auto=format` automatically serves**:
- WebP to Chrome/Edge/Firefox (50% smaller)
- JPEG to Safari/older browsers
- Correct size for device (responsive)

**Performance Gain**:
- 6 images: 1.2MB → 300KB
- **Total Savings**: 900KB (3x faster image load)

---

### 7. **Inline Critical CSS** 💅 ELIMINATE RENDER BLOCKING

#### Current Issue:
```html
<link rel="stylesheet" href="css/report-styles.css">
<!-- Browser waits 200ms to download CSS before rendering -->
```

#### Optimized:
```html
<style>
/* Inline only critical above-the-fold CSS */
:root { --gv-green: #16a34a; }
body { font-family: Inter, sans-serif; margin: 0; }
.report-header { background: var(--gv-green); color: white; padding: 24px; }
.report-meta h1 { font-size: 2.5rem; margin: 0; }
/* ... only what's visible initially */
</style>

<!-- Load non-critical CSS asynchronously -->
<link rel="preload" href="css/report-styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="css/report-styles.css"></noscript>
```

**Performance Gain**:
- ❌ Before: 200ms blocking CSS download
- ✅ After: 0ms blocking (inline), rest loads async
- **Total Savings**: 200ms faster first paint

---

### 8. **Preconnect to Supabase** 🔗 DNS OPTIMIZATION

```html
<!-- report-viewer.html -->
<head>
    <!-- Establish early connection to Supabase -->
    <link rel="preconnect" href="https://vozjwptzutolvkvfpknk.supabase.co">
    <link rel="dns-prefetch" href="https://vozjwptzutolvkvfpknk.supabase.co">

    <!-- Preconnect to image CDN -->
    <link rel="preconnect" href="https://images.unsplash.com">
    <link rel="dns-prefetch" href="https://images.unsplash.com">
</head>
```

**Performance Gain**:
- ❌ Before: DNS lookup (50ms) + TCP handshake (50ms) + SSL negotiation (100ms) = 200ms
- ✅ After: Connection established during HTML parse = 0ms when API call is made
- **Total Savings**: 200ms faster API response

---

### 9. **Service Worker Caching** 📦 OFFLINE SUPPORT

```javascript
// sw.js - Service Worker
const CACHE_NAME = 'geovera-reports-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/report-viewer.html',
                '/css/report-styles.css',
                // Cache report HTML after first visit
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached version OR fetch from network
            return response || fetch(event.request).then((response) => {
                // Cache for future visits
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});
```

```html
<!-- report-viewer.html -->
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
</script>
```

**Performance Gain**:
- ❌ Before: Every visit requires network requests (500ms-2s)
- ✅ After: Second visit loads from cache (10ms)
- **Total Savings**: 490ms-1.99s on repeat visits

---

## 📊 PERFORMANCE COMPARISON

### Current Implementation
```
DNS Lookup:              50ms
TCP Handshake:          50ms
SSL Negotiation:       100ms
Supabase API Call:     200ms
Markdown Download:     150ms
marked.js Library:     300ms
Markdown Parsing:      500ms
CSS Download:          200ms
Image Downloads:      3000ms
─────────────────────────────
TOTAL:                4550ms (4.5 seconds)
```

### With ALL Optimizations
```
Preconnected DNS:        0ms
Edge Cache Hit:         20ms
Pre-rendered HTML:       0ms
No library needed:       0ms
No parsing needed:       0ms
Inline CSS:              0ms
Lazy images:           200ms (only 1 image)
─────────────────────────────
TOTAL:                 220ms (0.22 seconds)
```

**IMPROVEMENT: 20x FASTER (4.5s → 0.22s)** 🚀

---

## 🎯 RECOMMENDED IMPLEMENTATION PRIORITY

### Phase 1: Quick Wins (1-2 hours) ⭐⭐⭐
1. ✅ **Pre-render HTML server-side** (Save to `report_html` column)
2. ✅ **Inline critical CSS** (Remove external CSS)
3. ✅ **Preconnect hints** (Add to `<head>`)
4. ✅ **Lazy load images** (Add `loading="lazy"`)
5. ✅ **WebP optimization** (Add `auto=format` to Unsplash URLs)

**Expected Result**: 2-3 seconds → 1 second load time

---

### Phase 2: Advanced Optimization (4-6 hours) ⭐⭐
1. ✅ **Static HTML generation** (Generate standalone files)
2. ✅ **Vercel Edge caching** (Add cache headers)
3. ✅ **Progressive skeleton loading** (Better UX)

**Expected Result**: 1 second → 0.5 seconds load time

---

### Phase 3: Enterprise Performance (1-2 days) ⭐
1. ✅ **Service Worker** (Offline support + instant repeat visits)
2. ✅ **Custom CDN** (`reports.geovera.xyz` subdomain)
3. ✅ **Image optimization pipeline** (Self-hosted WebP conversion)

**Expected Result**: 0.5 seconds → 0.2 seconds, offline support

---

## 💡 QUICK IMPLEMENTATION: Phase 1 (Today)

### Step 1: Update Edge Function
```typescript
// supabase/functions/onboarding-workflow/index.ts

import { marked } from 'marked';

async function step4_openai(...) {
    // ... existing code to get markdown ...

    // NEW: Convert markdown to HTML
    const reportHTML = marked.parse(finalReport);

    // Save BOTH to database
    const { data } = await supabase
        .from('brand_reports')
        .insert([{
            brand_name,
            slug: brandName.toLowerCase().replace(/\s+/g, '-'),
            report_markdown: finalReport,
            report_html: reportHTML,  // ← NEW
            metadata: { ... },
            public: true
        }]);

    return finalReport;
}
```

### Step 2: Update Database
```sql
-- Run in Supabase SQL Editor
ALTER TABLE brand_reports
ADD COLUMN IF NOT EXISTS report_html TEXT;
```

### Step 3: Optimize report-viewer.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- OPTIMIZATION: Preconnect -->
    <link rel="preconnect" href="https://vozjwptzutolvkvfpknk.supabase.co">
    <link rel="dns-prefetch" href="https://images.unsplash.com">

    <title id="page-title">Brand Intelligence Report | GeoVera</title>

    <!-- OPTIMIZATION: Inline critical CSS -->
    <style>
        :root { --gv-green: #16a34a; /* ... */ }
        body { /* critical styles only */ }
        .report-header { /* ... */ }
        /* ... only above-the-fold styles ... */
    </style>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <!-- REMOVED: marked.js - not needed anymore! -->
</head>
<body>
    <!-- Skeleton loader -->
    <div id="loading" class="skeleton-loader">
        <div class="header-skeleton"></div>
        <div class="content-skeleton"></div>
    </div>

    <div id="report-view" style="display: none;">
        <!-- ... header ... -->
        <div class="report-content" id="report-content"></div>
    </div>

    <script>
    async function loadReport() {
        // Fetch PRE-RENDERED HTML (no parsing needed)
        const { data } = await supabase
            .from('brand_reports')
            .select('report_html, brand_name, parent_company')
            .eq('slug', brandSlug)
            .single();

        // Direct assignment - instant display!
        document.getElementById('report-content').innerHTML = data.report_html;

        // Hide loading, show report
        document.getElementById('loading').style.display = 'none';
        document.getElementById('report-view').style.display = 'block';

        // Lazy load images
        document.querySelectorAll('img').forEach(img => {
            img.loading = 'lazy';
            if (img.src.includes('unsplash.com')) {
                img.src = img.src + '&auto=format&fit=crop&q=80';
            }
        });
    }

    loadReport();
    </script>
</body>
</html>
```

---

## ✅ VERIFICATION CHECKLIST

After implementing Phase 1, test with:

### Chrome DevTools
1. Open DevTools → Network tab
2. Throttle to "Fast 3G"
3. Load report
4. Check metrics:
   - **DOMContentLoaded**: Should be <500ms
   - **Load**: Should be <1.5s
   - **First Paint**: Should be <300ms

### Lighthouse Audit
```bash
lighthouse https://geovera-staging.vercel.app/report?brand=kata-oma --view
```

**Target Scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

---

## 📈 EXPECTED RESULTS

### Before Optimization
- Load Time: 4.5 seconds
- Time to Interactive: 5 seconds
- Total Size: 1.5 MB
- Requests: 15

### After Phase 1
- Load Time: **1 second** ✅ (4.5x faster)
- Time to Interactive: **1.2 seconds** ✅
- Total Size: **300 KB** ✅ (5x smaller)
- Requests: **8** ✅

### After Phase 2
- Load Time: **0.5 seconds** ✅ (9x faster)
- Time to Interactive: **0.6 seconds** ✅
- Total Size: **200 KB** ✅
- Requests: **4** ✅

### After Phase 3
- Load Time: **0.2 seconds** ✅ (22x faster)
- Time to Interactive: **0.3 seconds** ✅
- Offline support: **Yes** ✅
- Repeat visit: **<50ms** ✅

---

**Status**: Ready for implementation
**Estimated Time**: Phase 1 = 2 hours, Phase 2 = 6 hours, Phase 3 = 2 days
**Priority**: Start with Phase 1 today for immediate 4.5x performance improvement
