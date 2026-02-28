import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY")!;
const FIRECRAWL_BASE    = "https://api.firecrawl.dev/v1";
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SK       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_GATEWAY    = Deno.env.get("CF_AI_GATEWAY_GEMINI")!;   // via Cloudflare (cached)
const GOOGLE_AI_KEY     = Deno.env.get("GOOGLE_AI_API_KEY")!;
const PAGE_SIZE         = 20;

const supabase = createClient(SUPABASE_URL, SUPABASE_SK);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Status = "good" | "warn" | "bad";

interface GeminiInsights {
  eeat: {
    experience:       number;   // 0–10
    expertise:        number;
    authoritativeness:number;
    trustworthiness:  number;
    overall:          number;
    signals:          string[];
  };
  content: {
    primaryTopic:     string;
    subtopics:        string[];
    entities:         string[];
    intentMatch:      "good" | "partial" | "poor";
    intentNote:       string;
    readabilityLevel: "easy" | "medium" | "complex";
  };
  gaps:                  string[];
  keywordOpportunities:  string[];
  qualityScore:          number;   // 0–100 (Gemini's content quality score)
  summary:               string;
}

interface SEOAnalysis {
  url:             string;
  technicalScore:  number;        // from HTML analysis (0–100)
  contentScore:    number;        // from Gemini   (0–100)
  score:           number;        // combined: 60% technical + 40% content
  title:           { text: string | null; length: number; status: Status; note: string };
  metaDescription: { text: string | null; length: number; status: Status; note: string };
  headings:        { h1: string[]; h2: string[]; h3: string[]; h1Count: number; h2Count: number; h3Count: number; status: Status; note: string };
  canonical:       { url: string | null; status: Status; note: string };
  openGraph:       { hasTitle: boolean; hasDescription: boolean; hasImage: boolean; status: Status };
  images:          { total: number; missingAlt: number; status: Status; note: string };
  links:           { internal: number; external: number; total: number };
  wordCount:       number;
  robots:          string | null;
  language:        string | null;
  schemaMarkup:    boolean;
  geminiInsights?: GeminiInsights;
  issues:          string[];
  suggestions:     string[];
  crawledAt:       string;
  source?:         "cache" | "fresh";
  hashMethod:      "smart" | "full";  // which hash strategy was used
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART HASH
// Extracts only SEO-meaningful content before hashing.
// Ignores: scripts, styles, ads, nav, header, footer, timestamps, dynamic tokens.
// Prevents false cache misses when trivial things change (ad rotations, etc.)
// ─────────────────────────────────────────────────────────────────────────────

function extractSeoSignals(
  html: string,
  metadata: Record<string, string>
): string {
  const stripped = html
    // Remove noise: scripts, styles, iframes, svg, comments
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove layout chrome: nav, header, footer, sidebar, cookie banners, ads
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/class=["'][^"']*(cookie|banner|popup|modal|ad-|widget)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "")
    // Strip remaining tags, collapse whitespace
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Combine SEO signals: meta fields + first 5000 chars of meaningful body text
  return [
    `TITLE:${metadata.title      || ""}`,
    `DESC:${metadata.description || ""}`,
    `CANONICAL:${metadata.canonical || ""}`,
    `ROBOTS:${metadata.robots    || ""}`,
    `OG_TITLE:${metadata.ogTitle || ""}`,
    `LANG:${metadata.language    || ""}`,
    `BODY:${stripped.slice(0, 5000)}`,
  ].join("|||");
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART URL PRIORITIZATION
// ─────────────────────────────────────────────────────────────────────────────

function prioritizeUrls(urls: string[]): string[] {
  const score = (url: string): number => {
    try {
      const path = new URL(url).pathname.toLowerCase();
      if (path === "/" || path === "") return 0;
      if (/\/(service|layanan|produk|product|jasa)/.test(path)) return 1;
      if (/\/(about|tentang|profil|company)/.test(path)) return 2;
      if (/\/(contact|kontak|hubungi)/.test(path)) return 3;
      if (/\/(portfolio|project|proyek|case)/.test(path)) return 4;
      if (/\/(blog|artikel|news|berita|post)/.test(path)) return 5;
      if (/\/(faq|help|bantuan)/.test(path)) return 6;
      const depth = path.split("/").filter(Boolean).length;
      return 10 + depth;
    } catch { return 99; }
  };
  return [...urls].sort((a, b) => score(a) - score(b));
}

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI INDEXING
// Runs via Cloudflare AI Gateway (cached 24h) — only called on cache MISS.
// Extracts E-E-A-T, topical depth, entities, intent alignment, content gaps.
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeWithGemini(
  url: string,
  title: string | null,
  description: string | null,
  markdown: string
): Promise<GeminiInsights | null> {
  try {
    const excerpt = markdown.slice(0, 4000); // Keep prompt efficient

    const prompt = `You are an expert SEO content analyst. Analyze this webpage and return ONLY valid JSON, no markdown.

URL: ${url}
Title: ${title || "(none)"}
Meta Description: ${description || "(none)"}
Content:
${excerpt}

Return this exact JSON structure:
{
  "eeat": {
    "experience": <0-10>,
    "expertise": <0-10>,
    "authoritativeness": <0-10>,
    "trustworthiness": <0-10>,
    "overall": <0-10>,
    "signals": ["<signal1>", "<signal2>"]
  },
  "content": {
    "primaryTopic": "<main topic in 1 phrase>",
    "subtopics": ["<subtopic1>", "<subtopic2>"],
    "entities": ["<entity1>", "<entity2>"],
    "intentMatch": "<good|partial|poor>",
    "intentNote": "<why title/content match or mismatch>",
    "readabilityLevel": "<easy|medium|complex>"
  },
  "gaps": ["<missing topic or section>"],
  "keywordOpportunities": ["<keyword phrase opportunity>"],
  "qualityScore": <0-100>,
  "summary": "<2 sentence quality assessment>"
}`;

    const res = await fetch(
      `${GEMINI_GATEWAY}/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn(`[gemini] HTTP ${res.status} — skipping insights`);
      return null;
    }

    const data = await res.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return null;

    const insights: GeminiInsights = JSON.parse(raw);
    console.log(`[gemini] ✅ Indexed: ${url} — qualityScore=${insights.qualityScore}`);
    return insights;

  } catch (err) {
    console.warn(`[gemini] Parse error for ${url}: ${err.message}`);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELTA CACHE
// ─────────────────────────────────────────────────────────────────────────────

async function deltaCheck(
  url: string,
  smartHash: string
): Promise<{ hit: boolean; analysis: SEOAnalysis | null }> {
  const { data } = await supabase
    .from("onpage_cache")
    .select("content_hash, analysis")
    .eq("url", url)
    .maybeSingle();

  if (!data) return { hit: false, analysis: null };
  if (data.content_hash === smartHash) return { hit: true, analysis: { ...data.analysis, source: "cache" } };
  return { hit: false, analysis: null };
}

async function saveCache(
  url: string,
  clientId: string,
  hash: string,
  analysis: SEOAnalysis
): Promise<void> {
  await supabase.from("onpage_cache").upsert({
    url,
    client_id:    clientId,
    content_hash: hash,
    analysis,
    score:        analysis.score,
    issues_count: analysis.issues.length,
    crawled_at:   new Date().toISOString(),
  }, { onConflict: "url" });
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRECRAWL
// ─────────────────────────────────────────────────────────────────────────────

async function getRawHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GeoVeraBot/1.0 (SEO Audit; +https://geovera.xyz)" },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? await res.text() : null;
  } catch { return null; }
}

async function mapSiteUrls(siteUrl: string, limit: number): Promise<string[]> {
  const res = await fetch(`${FIRECRAWL_BASE}/map`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url: siteUrl, limit }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Firecrawl /map failed: ${data.error}`);
  return (data.links as string[]) || [];
}

async function firecrawlScrape(url: string) {
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown", "html"], onlyMainContent: false }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Firecrawl /scrape failed: ${data.error}`);
  return {
    markdown: data.data?.markdown || "",
    html:     data.data?.html     || "",
    metadata: (data.data?.metadata || {}) as Record<string, string>,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML ANALYZERS
// ─────────────────────────────────────────────────────────────────────────────

function analyzeTitle(t: string | null): SEOAnalysis["title"] {
  if (!t) return { text: null, length: 0, status: "bad", note: "Title tag tidak ditemukan" };
  const l = t.length;
  if (l < 30) return { text: t, length: l, status: "warn", note: `Terlalu pendek — ${l} karakter (ideal 30–60)` };
  if (l > 60) return { text: t, length: l, status: "warn", note: `Terlalu panjang — ${l} karakter (ideal 30–60)` };
  return { text: t, length: l, status: "good", note: `Optimal — ${l} karakter` };
}

function analyzeMetaDesc(d: string | null): SEOAnalysis["metaDescription"] {
  if (!d) return { text: null, length: 0, status: "bad", note: "Meta description tidak ditemukan" };
  const l = d.length;
  if (l < 100) return { text: d, length: l, status: "warn", note: `Terlalu pendek — ${l} karakter (ideal 100–160)` };
  if (l > 160) return { text: d, length: l, status: "warn", note: `Terlalu panjang — ${l} karakter (ideal 100–160)` };
  return { text: d, length: l, status: "good", note: `Optimal — ${l} karakter` };
}

function analyzeHeadings(md: string): SEOAnalysis["headings"] {
  const h1 = (md.match(/^# .+$/gm)   || []).map(h => h.replace(/^# /,   "").trim());
  const h2 = (md.match(/^## .+$/gm)  || []).map(h => h.replace(/^## /,  "").trim());
  const h3 = (md.match(/^### .+$/gm) || []).map(h => h.replace(/^### /, "").trim());
  let status: Status = "good", note = "Struktur heading baik";
  if (h1.length === 0)   { status = "bad";  note = "H1 tidak ditemukan — wajib ada"; }
  else if (h1.length > 1){ status = "warn"; note = `${h1.length} H1 ditemukan, idealnya hanya 1`; }
  else if (h2.length === 0){ status = "warn"; note = "Tidak ada H2 subheading"; }
  return { h1, h2, h3, h1Count: h1.length, h2Count: h2.length, h3Count: h3.length, status, note };
}

function analyzeImages(html: string): SEOAnalysis["images"] {
  const all    = html.match(/<img[^>]*>/gi) || [];
  const noAlt  = all.filter(i => !i.match(/alt=["'][^"']+["']/i));
  const total  = all.length, missing = noAlt.length;
  if (total === 0) return { total: 0, missingAlt: 0, status: "good", note: "Tidak ada gambar" };
  if (missing === 0) return { total, missingAlt: 0, status: "good", note: `${total} gambar, semua punya alt text` };
  return { total, missingAlt: missing, status: missing / total > 0.5 ? "bad" : "warn", note: `${missing}/${total} gambar tidak punya alt text` };
}

function analyzeLinks(html: string, pageUrl: string): SEOAnalysis["links"] {
  const hrefs  = (html.match(/href=["']([^"']+)["']/gi) || []).map(h => h.replace(/href=["']|["']$/gi, ""));
  const domain = (() => { try { return new URL(pageUrl).hostname; } catch { return ""; } })();
  let internal = 0, external = 0;
  for (const href of hrefs) {
    if (!href || /^(#|javascript|mailto)/.test(href)) continue;
    try { new URL(href.startsWith("http") ? href : href, pageUrl).hostname === domain ? internal++ : external++; } catch { /* skip */ }
  }
  return { internal, external, total: internal + external };
}

function countWords(md: string): number {
  return md.replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[.*?\]\(.*?\)/g, "").replace(/#{1,6} /g, "").replace(/[*_`~>|]/g, "").replace(/\n+/g, " ").trim().split(/\s+/).filter(w => w.length > 1).length;
}

function hasSchema(html: string): boolean {
  return html.includes("application/ld+json") || html.includes("schema.org");
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING
// technicalScore: from HTML (60% of final)
// contentScore:   from Gemini (40% of final) — falls back to 70 if Gemini skipped
// ─────────────────────────────────────────────────────────────────────────────

function calcTechnicalScore(parts: Partial<SEOAnalysis>): { score: number; issues: string[]; suggestions: string[] } {
  let score = 100;
  const issues: string[] = [], suggestions: string[] = [];

  if (parts.title?.status === "bad")           { score -= 20; issues.push("Title tag tidak ada"); }
  else if (parts.title?.status === "warn")     { score -= 8;  issues.push(`Title: ${parts.title.note}`); }

  if (parts.metaDescription?.status === "bad") { score -= 15; issues.push("Meta description tidak ada"); }
  else if (parts.metaDescription?.status === "warn") { score -= 6; issues.push(`Meta desc: ${parts.metaDescription.note}`); }

  if (parts.headings?.status === "bad")        { score -= 15; issues.push("H1 tidak ditemukan"); }
  else if (parts.headings?.status === "warn")  { score -= 6;  issues.push(`Heading: ${parts.headings.note}`); }

  if (parts.canonical?.status === "warn")      { score -= 5;  suggestions.push("Tambahkan canonical tag"); }

  if (parts.openGraph?.status === "bad")       { score -= 10; suggestions.push("Tambahkan Open Graph tags (og:title, og:description, og:image)"); }
  else if (parts.openGraph?.status === "warn") { score -= 5;  suggestions.push("Lengkapi semua Open Graph tags"); }

  if (parts.images?.status === "bad")          { score -= 10; issues.push(`${parts.images.missingAlt} gambar tidak punya alt text`); }
  else if (parts.images?.status === "warn")    { score -= 5;  issues.push(`${parts.images.missingAlt} gambar tidak punya alt text`); }

  if ((parts.wordCount || 0) < 300)            { score -= 15; issues.push(`Konten terlalu pendek (${parts.wordCount} kata, min 300)`); }
  else if ((parts.wordCount || 0) < 500)       { score -= 7;  suggestions.push("Tambah konten (500+ kata lebih optimal)"); }

  if (!parts.schemaMarkup)                     { score -= 5;  suggestions.push("Tambahkan Schema Markup (JSON-LD) untuk rich results"); }
  if ((parts.links?.internal || 0) < 3)        { score -= 5;  suggestions.push("Tambahkan internal link ke halaman relevan lainnya"); }

  return { score: Math.max(0, Math.round(score)), issues, suggestions };
}

function combineScores(technicalScore: number, geminiInsights: GeminiInsights | null): { contentScore: number; finalScore: number } {
  const contentScore = geminiInsights?.qualityScore ?? 70; // 70 = neutral fallback if Gemini unavailable
  const finalScore   = Math.round(technicalScore * 0.6 + contentScore * 0.4);
  return { contentScore, finalScore };
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL PAGE ANALYSIS (called on cache MISS only)
// ─────────────────────────────────────────────────────────────────────────────

async function analyzePage(
  url: string,
  scraped: { markdown: string; html: string; metadata: Record<string, string> }
): Promise<SEOAnalysis> {
  const { markdown, html, metadata } = scraped;

  // HTML analysis
  const title          = analyzeTitle(metadata.title       || null);
  const metaDescription= analyzeMetaDesc(metadata.description || null);
  const headings       = analyzeHeadings(markdown);
  const images         = analyzeImages(html);
  const links          = analyzeLinks(html, url);
  const wordCount      = countWords(markdown);
  const schemaMarkup   = hasSchema(html);

  const canonical = {
    url:    metadata.canonical || null,
    status: (metadata.canonical ? "good" : "warn") as Status,
    note:   metadata.canonical ? "Canonical tag ditemukan" : "Canonical tag tidak ditemukan",
  };
  const ogStatus: Status = (!!metadata.ogTitle && !!metadata.ogDescription && !!metadata.ogImage) ? "good"
    : (!!metadata.ogTitle || !!metadata.ogDescription) ? "warn" : "bad";
  const openGraph = {
    hasTitle: !!metadata.ogTitle, hasDescription: !!metadata.ogDescription,
    hasImage: !!metadata.ogImage, status: ogStatus,
  };

  const parts = { url, title, metaDescription, headings, canonical, openGraph, images, links, wordCount, schemaMarkup };
  const { score: technicalScore, issues, suggestions } = calcTechnicalScore(parts);

  // Gemini indexing (runs via CF Gateway — responses cached 24h)
  const geminiInsights = await analyzeWithGemini(url, metadata.title || null, metadata.description || null, markdown);

  // Enrich issues/suggestions with Gemini gaps
  if (geminiInsights) {
    if (geminiInsights.content.intentMatch === "poor")    issues.push(`Intent mismatch: ${geminiInsights.content.intentNote}`);
    if (geminiInsights.eeat.overall < 5)                  issues.push(`E-E-A-T rendah (${geminiInsights.eeat.overall}/10): ${geminiInsights.eeat.signals.join(", ")}`);
    for (const gap of geminiInsights.gaps.slice(0, 2))   suggestions.push(`Content gap: ${gap}`);
    for (const kw  of geminiInsights.keywordOpportunities.slice(0, 2)) suggestions.push(`Keyword opportunity: ${kw}`);
  }

  const { contentScore, finalScore } = combineScores(technicalScore, geminiInsights);

  return {
    url,
    technicalScore,
    contentScore,
    score: finalScore,
    title, metaDescription, headings, canonical, openGraph, images, links,
    wordCount,
    robots:       metadata.robots   || null,
    language:     metadata.language || null,
    schemaMarkup,
    geminiInsights: geminiInsights ?? undefined,
    issues,
    suggestions,
    crawledAt:  new Date().toISOString(),
    source:     "fresh",
    hashMethod: "smart",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCAN JOB HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function createScanJob(clientId: string, siteUrl: string, urls: string[]): Promise<string> {
  const { data, error } = await supabase.from("onpage_scans").insert({
    client_id: clientId, site_url: siteUrl, urls,
    status: "processing", total_pages: urls.length,
  }).select("id").single();
  if (error) throw new Error(`Failed to create scan job: ${error.message}`);
  return data.id;
}

async function getScanJob(scanId: string) {
  const { data, error } = await supabase.from("onpage_scans").select("*").eq("id", scanId).single();
  if (error || !data) throw new Error(`Scan job not found: ${scanId}`);
  return data;
}

async function updateScanJob(scanId: string, updates: Record<string, unknown>): Promise<void> {
  await supabase.from("onpage_scans").update(updates).eq("id", scanId);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
//
// mode=start   → map site URLs, create scan job
// mode=process → process one page (20 URLs) with smart hash + delta cache + Gemini
// mode=status  → return scan job progress
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const body        = await req.json();
    const { mode = "start" } = body;

    // ── STATUS ───────────────────────────────────────────────────────────────
    if (mode === "status") {
      const job = await getScanJob(body.scanId);
      return Response.json({ success: true, scan: job }, { headers: cors });
    }

    // ── START ────────────────────────────────────────────────────────────────
    if (mode === "start") {
      const { siteUrl, clientId = "default", limit = 100 } = body;
      if (!siteUrl) throw new Error("siteUrl required");

      console.log(`[onpage] START: ${siteUrl}`);
      const rawUrls     = await mapSiteUrls(siteUrl, limit);
      const prioritized = prioritizeUrls(rawUrls);
      const scanId      = await createScanJob(clientId, siteUrl, prioritized);

      return Response.json({
        success: true, scanId,
        total:       prioritized.length,
        totalPages:  Math.ceil(prioritized.length / PAGE_SIZE),
        pageSize:    PAGE_SIZE,
        preview:     prioritized.slice(0, 5),
        message:     `Scan started. Call mode=process with scanId + page (1–${Math.ceil(prioritized.length / PAGE_SIZE)}).`,
      }, { headers: cors });
    }

    // ── PROCESS ──────────────────────────────────────────────────────────────
    if (mode === "process") {
      const { scanId, page = 1 } = body;
      if (!scanId) throw new Error("scanId required");

      const job      = await getScanJob(scanId);
      const allUrls  = job.urls as string[];
      const start    = (page - 1) * PAGE_SIZE;
      const end      = Math.min(start + PAGE_SIZE, allUrls.length);
      const pageUrls = allUrls.slice(start, end);
      const hasMore  = end < allUrls.length;

      if (pageUrls.length === 0) {
        return Response.json({ success: true, pages: [], hasMore: false }, { headers: cors });
      }

      const results: SEOAnalysis[] = [];
      let cacheHits = 0, newCrawls = 0;

      for (const url of pageUrls) {
        try {
          // ── STEP 1: Lightweight fetch (free — no Firecrawl credit) ─────────
          const rawHtml = await getRawHtml(url);
          if (!rawHtml) { console.warn(`[onpage] Unreachable: ${url}`); continue; }

          // ── STEP 2: Smart hash — SEO signals only ─────────────────────────
          // Ignore scripts/ads/nav/footer → no false cache misses
          const seoSignals = extractSeoSignals(rawHtml, {});
          const smartHashValue = await sha256(seoSignals);

          // ── STEP 3: Delta check ───────────────────────────────────────────
          const { hit, analysis: cached } = await deltaCheck(url, smartHashValue);

          if (hit && cached) {
            // ✅ CACHE HIT — content unchanged, Gemini not needed
            results.push({ ...cached, source: "cache" });
            cacheHits++;
            console.log(`[onpage] ✅ CACHE HIT: ${url}`);
            continue;
          }

          // ── STEP 4: Cache MISS — full Firecrawl + Gemini analysis ─────────
          console.log(`[onpage] 🔄 FRESH: ${url}`);
          const scraped  = await firecrawlScrape(url);

          // Use richer metadata from Firecrawl for smarter hash on next run
          const richSignals = extractSeoSignals(scraped.html, scraped.metadata);
          const richHash    = await sha256(richSignals);

          const analysis = await analyzePage(url, scraped);
          analysis.hashMethod = "smart";

          await saveCache(url, job.client_id, richHash, analysis);
          results.push(analysis);
          newCrawls++;

        } catch (err) {
          console.error(`[onpage] Error: ${url} — ${err.message}`);
        }
      }

      // Update scan job
      const processed = Math.min(job.processed_pages + results.length, allUrls.length);
      const avg       = results.length > 0 ? results.reduce((s, r) => s + r.score, 0) / results.length : null;

      await updateScanJob(scanId, {
        processed_pages: processed,
        cache_hits:      (job.cache_hits   || 0) + cacheHits,
        new_crawls:      (job.new_crawls   || 0) + newCrawls,
        credits_used:    (job.credits_used || 0) + newCrawls,
        avg_score:       avg ? Math.round(avg) : job.avg_score,
        status:          !hasMore ? "completed" : "processing",
        ...(!hasMore ? { completed_at: new Date().toISOString() } : {}),
      });

      return Response.json({
        success: true,
        pagination: {
          page, pageSize: PAGE_SIZE,
          total: allUrls.length,
          totalPages: Math.ceil(allUrls.length / PAGE_SIZE),
          hasMore, nextPage: hasMore ? page + 1 : null,
        },
        stats: {
          cacheHits, newCrawls,
          creditsUsed: newCrawls,       // 1 Firecrawl credit per fresh crawl only
          geminiCalls: newCrawls,       // 1 Gemini call per fresh crawl (CF cached 24h)
          processed: results.length,
          scanComplete: !hasMore,
        },
        pages: results,
      }, { headers: cors });
    }

    throw new Error(`Unknown mode: ${mode}. Use: start | process | status`);

  } catch (err) {
    console.error("[onpage-analyzer]", err.message);
    return Response.json({ success: false, error: err.message }, { status: 500, headers: cors });
  }
});
