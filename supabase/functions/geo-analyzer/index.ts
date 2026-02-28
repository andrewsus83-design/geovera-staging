/**
 * geo-analyzer — 8-Factor GEO Analysis + Claude QA Biweekly + RAG Readiness Score
 *
 * Pipeline (6 steps):
 *   Step 1: Load ALL SEO data from Supabase (FREE)
 *   Step 2: Claude QA + RAG Readiness (biweekly, parallel)
 *             ├── QA Citation Test  : CF Workers AI / LLaMA 3.1 8B (Basic=30Q / Premium=50Q / Partner=100Q)
 *             │     smart hash + delta cache (13-day TTL) + smart pagination (10Q/batch)
 *             └── RAG Readiness     : LLaMA judges content vs 20 niche questions from onpage_cache
 *   [Steps 2+4 run in parallel]
 *   Step 3: Aggregate page-level SEO signals (sync, instant)
 *   Step 4: Perplexity topic/visibility/discovery + technical + Wikipedia + GBP (parallel)
 *   Step 5: Claude scores all 8 GEO factors (+ QA citation rate + RAG readiness)
 *   Step 6: Claude progress analysis (citation trend vs previous biweekly)
 *
 * Cost vs previous version:
 *   QA testing  : Perplexity ($1/1M) → CF Workers AI ($0.011/1M) = ~91% cheaper
 *   RAG check   : NEW, uses onpage_cache content (no re-crawl, no Firecrawl credits)
 *   Perplexity  : Kept ONLY for 3 GEO research queries (needs real-time web data)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ────────────────────────────────────────────────────────────────────
const CF_ANTHROPIC      = Deno.env.get("CF_AI_GATEWAY_ANTHROPIC")!;
const ANTHROPIC_KEY     = Deno.env.get("ANTHROPIC_API_KEY")!;
const PERPLEXITY_KEY    = Deno.env.get("PERPLEXITY_API_KEY")!;
const GOOGLE_PLACES_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") || "";  // already set ✅
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SK       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Cloudflare Workers AI — for QA citation testing + RAG readiness
// CF_AI_GATEWAY_BASE is already set → auto-derive Workers AI gateway URL.
// Only CLOUDFLARE_API_TOKEN needs to be added (create at dash.cloudflare.com with Workers AI permission).
const CF_AI_GATEWAY_BASE = Deno.env.get("CF_AI_GATEWAY_BASE") || "";
const CF_WORKERS_AI      = Deno.env.get("CF_AI_GATEWAY_WORKERS_AI")
  || (CF_AI_GATEWAY_BASE ? `${CF_AI_GATEWAY_BASE}/workers-ai` : "");
const CF_ACCOUNT_ID      = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const CF_API_TOKEN       = Deno.env.get("CLOUDFLARE_API_TOKEN") || "";
const LLAMA_MODEL       = "@cf/meta/llama-3.1-8b-instruct";   // fast + cheap
const LLAMA_HEAVY       = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"; // for RAG eval

const CLAUDE_MODEL      = "claude-sonnet-4-5";
const CACHE_TTL_DAYS    = 7;

// QA biweekly config
const QA_BIWEEKLY_DAYS      = 14;
const QA_ANSWER_CACHE_DAYS  = 13;   // delta cache per question (force-rerun uses cache)
const QA_BATCH_SIZE         = 10;   // questions per LLaMA call (Workers AI has no rate limit)
const RAG_EVAL_QUESTIONS    = 20;   // questions for RAG readiness check (all tiers)

// Tier-based QA question counts (increased with CF Workers AI's lower cost)
const QA_QUESTIONS: Record<string, number> = {
  basic:   30,
  premium: 50,
  partner: 100,
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SK);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const TRAINING_SOURCES = [
  "wikipedia.org", "producthunt.com", "crunchbase.com", "github.com",
  "linkedin.com",  "reddit.com",       "medium.com",    "quora.com",
  "g2.com",        "capterra.com",     "trustpilot.com","techcrunch.com",
];

const AI_CRAWLERS = [
  "GPTBot", "ClaudeBot", "PerplexityBot",
  "Google-Extended", "anthropic-ai", "CCBot",
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type GeoStatus = "good" | "warn" | "low";

interface GeoFactor {
  score:      number;
  status:     GeoStatus;
  dataPoints: string[];
  actions:    string[];
  details:    Record<string, unknown>;
}

interface GeoAnalysis {
  domain:       string;
  clientId:     string;
  overallScore: number;
  factors: {
    eeat:             GeoFactor;
    answerReady:      GeoFactor;
    topicalDepth:     GeoFactor;
    freshness:        GeoFactor;
    technicalSignals: GeoFactor;
    schemaMarkup:     GeoFactor;
    trainingPresence: GeoFactor;
    factClarity:      GeoFactor;
  };
  topActions:     string[];
  geoStrategy:    string;
  cachedAt:       string;
  expiresAt:      string;
  source:         "cache" | "fresh";
  dataReused:     string[];
}

interface QAItem {
  question:        string;
  answer:          string;
  brandsMentioned: string[];
  isCited:         boolean;
  isRecommended:   boolean;
  fromCache:       boolean;
}

interface QATestResult {
  id?:                string;
  tier:               string;
  questionsCount:     number;
  results:            QAItem[];
  citationRate:       number;
  recommendationRate: number;
  topCitedBrands:     string[];
  cacheHits:          number;
  freshTests:         number;
  runDate:            string;
  isFromCache:        boolean;
  previousRun?: {
    citationRate:       number;
    recommendationRate: number;
    runDate:            string;
  };
  progressDirection:  "improving" | "declining" | "stable" | "first-run";
  progressDelta:      number;
}

interface RAGReadinessResult {
  score:           number;       // 0–100
  answerablePct:   number;       // % of questions content can answer (score ≥ 6)
  avgQualityScore: number;       // avg 0–10 across all questions
  contentStrengths:string[];     // what the content covers well
  contentGaps:     string[];     // what's missing for AI retrieval
  questionScores:  Array<{ question: string; score: number; missing: string }>;
}

interface GBPResult {
  isListed:       boolean;
  name?:          string;
  rating?:        number;
  reviewCount?:   number;
  types?:         string[];
  businessStatus?: string;
}

interface PerplexityGeoInsights {
  topicRelevance: {
    associatedTopics:  string[];
    topicStrength:     Record<string, "strong" | "moderate" | "weak">;
    misalignedTopics:  string[];
    aiAnswerPresence:  string;
    topicScore:        number;
  };
  brandVisibility: {
    aiPlatforms:       Array<{ platform: string; visibility: "high" | "medium" | "low" | "none"; notes: string }>;
    webVisibility:     string;
    brandSentiment:    "positive" | "neutral" | "negative" | "mixed";
    mentionFrequency:  "frequent" | "occasional" | "rare" | "not-found";
    visibilityScore:   number;
    keyInsight:        string;
  };
  platformDiscovery: {
    primaryChannels:   Array<{ platform: string; strength: "strong" | "moderate" | "weak"; opportunity: string }>;
    audienceDiscovery: string;
    untappedPlatforms: string[];
    discoveryScore:    number;
    recommendations:   string[];
  };
  citations: string[];
}

// ─── CF Workers AI Helper ──────────────────────────────────────────────────────
// Routes via AI Gateway (with 24h caching) when CF_AI_GATEWAY_WORKERS_AI is set,
// otherwise falls back to direct Cloudflare API.

async function callWorkersAI(
  messages:  Array<{ role: string; content: string }>,
  model    = LLAMA_MODEL,
  maxTokens = 1200,
): Promise<string> {
  const hasGateway = CF_WORKERS_AI && CF_API_TOKEN;
  const hasDirect  = CF_ACCOUNT_ID && CF_API_TOKEN;

  if (!hasGateway && !hasDirect) {
    throw new Error("CF Workers AI not configured: set CLOUDFLARE_API_TOKEN (CF_AI_GATEWAY_BASE is auto-used as gateway base, or set CF_ACCOUNT_ID for direct API)");
  }

  const url = hasGateway
    ? `${CF_WORKERS_AI}/${model}`
    : `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${model}`;

  const res = await fetch(url, {
    method:  "POST",
    headers: { "Authorization": `Bearer ${CF_API_TOKEN}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ messages, max_tokens: maxTokens, stream: false }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Workers AI ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  // Workers AI returns result.response (not OpenAI choices format)
  return (data?.result?.response as string)
    || (data?.choices?.[0]?.message?.content as string)
    || "";
}

// ─── STEP 1: Load ALL existing SEO data from Supabase ─────────────────────────

async function loadSeoData(domain: string, clientId: string) {
  const [pagesRes, backlinkRes, strategyRes, sitemapsRes, gscRes] = await Promise.all([
    supabase.from("onpage_cache")
      .select("url, score, analysis, crawled_at")
      .eq("client_id", clientId)
      .order("score", { ascending: false })
      .limit(100),

    supabase.from("backlink_cache")
      .select("analysis, quality_score")
      .eq("domain", domain)
      .maybeSingle(),

    supabase.from("seo_strategy_cache")
      .select("strategy")
      .eq("domain", domain)
      .eq("client_id", clientId)
      .maybeSingle(),

    supabase.from("gsc_sitemaps")
      .select("sitemap_url, errors, warnings, is_pending, contents")
      .eq("client_id", clientId),

    supabase.from("gsc_search_analytics")
      .select("query, clicks, impressions, position, date")
      .eq("client_id", clientId)
      .order("impressions", { ascending: false })
      .limit(200),
  ]);

  return {
    pages:     pagesRes.data    || [],
    backlinks: backlinkRes.data || null,
    strategy:  strategyRes.data?.strategy || null,
    sitemaps:  sitemapsRes.data  || [],
    gscData:   gscRes.data       || [],
    tables: [
      pagesRes.data?.length    ? "onpage_cache"         : null,
      backlinkRes.data         ? "backlink_cache"        : null,
      strategyRes.data         ? "seo_strategy_cache"    : null,
      sitemapsRes.data?.length ? "gsc_sitemaps"          : null,
      gscRes.data?.length      ? "gsc_search_analytics"  : null,
    ].filter(Boolean) as string[],
  };
}

// ─── STEP 3 (sync): Aggregate page signals ────────────────────────────────────

function aggregatePageSignals(pages: Array<Record<string, unknown>>) {
  if (!pages.length) return null;

  let totalEeat = 0, eeatCount = 0;
  let faqH2Count = 0, totalH2Count = 0;
  let schemaPages = 0, wordCountSum = 0;
  let externalLinksSum = 0, internalLinksSum = 0;
  const allTopics: string[]      = [];
  const allEntities: string[]    = [];
  const allEeatSignals: string[] = [];
  const allGaps: string[]        = [];
  const allIssues: string[]      = [];
  const crawlDates: Date[]       = [];

  const questionPattern = /^(apa|bagaimana|mengapa|kapan|dimana|siapa|kenapa|berapa|apakah|how|what|why|when|where|which|is|are|can|does|should|will)/i;

  for (const p of pages) {
    const a  = p.analysis as Record<string, unknown>;
    if (!a) continue;
    const gi = a.geminiInsights as Record<string, unknown> | null;

    if (gi?.eeat) {
      const eeat = gi.eeat as Record<string, number>;
      totalEeat += eeat.overall || 0; eeatCount++;
      if (Array.isArray((gi.eeat as Record<string, unknown>).signals))
        allEeatSignals.push(...((gi.eeat as Record<string, unknown>).signals as string[]));
    }

    const h2s = (a.headings as Record<string, string[]>)?.h2 || [];
    totalH2Count += h2s.length;
    faqH2Count   += h2s.filter(h => questionPattern.test(h) || h.endsWith("?")).length;

    if (a.schemaMarkup) schemaPages++;
    wordCountSum += (a.wordCount as number) || 0;

    const links = a.links as Record<string, number>;
    externalLinksSum += links?.external || 0;
    internalLinksSum += links?.internal || 0;

    const content = gi?.content as Record<string, unknown> | null;
    if (content?.primaryTopic)             allTopics.push(content.primaryTopic as string);
    if (Array.isArray(content?.entities))  allEntities.push(...(content.entities as string[]));
    if (Array.isArray(gi?.gaps))           allGaps.push(...(gi!.gaps as string[]));
    if (Array.isArray(a.issues))           allIssues.push(...(a.issues as string[]));
    if (p.crawled_at) crawlDates.push(new Date(p.crawled_at as string));
  }

  const n         = pages.length;
  const avgEeat   = eeatCount > 0 ? Math.round(totalEeat / eeatCount * 10) / 10 : 0;
  const faqPct    = totalH2Count  > 0 ? Math.round(faqH2Count / totalH2Count * 100) : 0;
  const schemaPct = Math.round(schemaPages / n * 100);
  const avgWords  = Math.round(wordCountSum / n);
  const now       = Date.now();
  const avgAgeDays = crawlDates.length
    ? Math.round(crawlDates.reduce((s, d) => s + (now - d.getTime()) / 86400000, 0) / crawlDates.length) : 90;

  const topicClusters  = [...new Set(allTopics)].slice(0, 15);
  const issueFreq: Record<string, number> = {};
  for (const i of allIssues) issueFreq[i] = (issueFreq[i] || 0) + 1;

  return {
    totalPages: n,
    avgScore:   Math.round(pages.reduce((s, p) => s + ((p.score as number) || 0), 0) / n),
    avgEeat, faqPct, schemaPct, avgWords,
    avgExtLinks:      Math.round(externalLinksSum / n),
    avgInternalLinks: Math.round(internalLinksSum / n),
    avgAgeDays,      topicClusters,
    uniqueEntities:  [...new Set(allEntities)].slice(0, 20),
    allEeatSignals:  [...new Set(allEeatSignals)].slice(0, 10),
    contentGaps:     [...new Set(allGaps)].slice(0, 8),
    topIssues:       Object.entries(issueFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k),
    pagesWithSchema: schemaPages,
  };
}

// ─── STEP 2a: RAG Readiness Score via CF Workers AI ───────────────────────────
//
// Uses onpage_cache content digest → no re-crawl, no Firecrawl credits.
// LLaMA evaluates: "Can this website content answer [question]? Score 0-10"
// Score ≥ 6 = "answerable" → drives answerablePct metric.
// ─────────────────────────────────────────────────────────────────────────────

function buildContentDigest(pages: Array<Record<string, unknown>>): string {
  return pages.slice(0, 10).map((p, i) => {
    const a       = p.analysis as Record<string, unknown>;
    const gi      = a?.geminiInsights as Record<string, unknown>;
    const content = gi?.content as Record<string, unknown>;
    const h2s     = ((a?.headings as Record<string, string[]>)?.h2 || []).slice(0, 5);
    const score   = p.score || "?";
    return `[Page ${i + 1}] ${(a?.title as string) || (p.url as string)}
  SEO Score: ${score}/100 | Words: ${a?.wordCount || "?"}
  Topic: ${content?.primaryTopic || "unknown"}
  Subtopics: ${(content?.subtopics as string[] || []).join(", ") || "—"}
  H2 sections: ${h2s.join(" | ") || "—"}
  Entities: ${(content?.entities as string[] || []).slice(0, 6).join(", ") || "—"}
  Quality: ${gi?.qualityScore || "?"}/10`;
  }).join("\n\n");
}

async function computeRagReadiness(
  pages:  Array<Record<string, unknown>>,
  brand:  string,
  domain: string,
  topics: string[],
): Promise<RAGReadinessResult | null> {
  if (!pages.length) {
    console.log("[rag] No pages in cache — skipping RAG readiness");
    return null;
  }

  // ── Generate 20 RAG evaluation questions (different from citation questions) ─
  const topicList = topics.slice(0, 6).join(", ") || "main services";
  const contentDigest = buildContentDigest(pages);

  // Generate questions with Claude (1 call, reuse for both gen + eval batch)
  let ragQuestions: string[] = [];
  try {
    const genRes = await fetch(`${CF_ANTHROPIC}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CLAUDE_MODEL, max_tokens: 1200,
        messages: [{
          role: "user",
          content: `Generate exactly ${RAG_EVAL_QUESTIONS} diverse questions that a user or RAG system would need to answer from content about "${brand}" (${domain}) in the "${topicList}" space.

Questions should test different content dimensions:
- Factual: "What is ${brand}?", "How does it work?", "What are the pricing tiers?"
- How-to: "How do I set up X?", "How to use X for Y?"
- Comparison: "How does ${brand} compare to competitors?"
- Use-case: "Can ${brand} help with [specific scenario]?"
- Trust: "Is ${brand} reliable?", "What do users say about ${brand}?"

Return ONLY JSON: { "questions": ["...", ...${RAG_EVAL_QUESTIONS} items] }`,
        }],
      }),
    });
    const genData = await genRes.json();
    const genText = genData?.content?.[0]?.text || "{}";
    const clean   = genText.replace(/```json|```/g, "").trim();
    const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
    ragQuestions = JSON.parse(clean.slice(s, e + 1))?.questions?.slice(0, RAG_EVAL_QUESTIONS) || [];
  } catch (err) {
    console.error("[rag] Question generation failed:", err.message);
    ragQuestions = topics.flatMap(t => [
      `What is ${brand}'s approach to ${t}?`,
      `How does ${brand} help with ${t}?`,
    ]).slice(0, RAG_EVAL_QUESTIONS);
  }

  if (!ragQuestions.length) return null;

  // ── Batch evaluate with LLaMA (heavy model for better judgment) ─────────────
  // Split into 2 batches of 10
  const batches: string[][] = [];
  for (let i = 0; i < ragQuestions.length; i += 10) batches.push(ragQuestions.slice(i, i + 10));

  const batchResults = await Promise.allSettled(
    batches.map(async (batch, bi) => {
      const numbered = batch.map((q, i) => `${bi * 10 + i + 1}. ${q}`).join("\n");
      const evalPrompt = `You are a RAG (Retrieval-Augmented Generation) system evaluator.

WEBSITE CONTENT SUMMARY for ${domain} (${brand}):
${contentDigest}

Evaluate how well the above content enables a RAG system to answer each question.
Scoring: 0-2=no info, 3-5=partial, 6-8=clearly addressed, 9-10=comprehensive+citable

Questions:
${numbered}

Return ONLY JSON:
{
  "scores": [
    { "q": "question text", "score": 7, "missing": "what specific info is missing" },
    ...
  ]
}`;

      const text = await callWorkersAI(
        [
          { role: "system", content: "You are an expert RAG content evaluator. Return only valid JSON." },
          { role: "user",   content: evalPrompt },
        ],
        LLAMA_HEAVY,
        1400,
      );

      const clean = text.replace(/```json|```/g, "").trim();
      const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
      return JSON.parse(clean.slice(s, e + 1));
    })
  );

  // ── Aggregate scores ──────────────────────────────────────────────────────
  const allScores: Array<{ question: string; score: number; missing: string }> = [];
  for (const settled of batchResults) {
    if (settled.status !== "fulfilled") continue;
    const items = settled.value?.scores || [];
    for (const item of items) {
      allScores.push({
        question: item.q || item.question || "",
        score:    Math.max(0, Math.min(10, Number(item.score) || 0)),
        missing:  item.missing || "",
      });
    }
  }

  if (!allScores.length) return null;

  const avgQuality   = allScores.reduce((s, i) => s + i.score, 0) / allScores.length;
  const answerable   = allScores.filter(i => i.score >= 6);
  const answerablePct = Math.round(answerable.length / allScores.length * 100);
  const ragScore      = Math.round(avgQuality * 10); // 0-10 avg → 0-100 score

  // Top strengths (highest scoring questions show what content covers well)
  const strengths = allScores
    .filter(i => i.score >= 7)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(i => `"${i.question.slice(0, 60)}" (${i.score}/10)`);

  // Gaps (lowest scoring + non-empty missing field)
  const gaps = allScores
    .filter(i => i.score < 5 && i.missing)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map(i => i.missing);

  console.log(`[rag] RAG Readiness: ${ragScore}/100 | answerable=${answerablePct}% | avg_quality=${avgQuality.toFixed(1)}/10`);

  return {
    score:           ragScore,
    answerablePct,
    avgQualityScore: Math.round(avgQuality * 10) / 10,
    contentStrengths: strengths,
    contentGaps:      [...new Set(gaps)],
    questionScores:   allScores,
  };
}

// ─── STEP 2b: Claude QA Biweekly Citation Testing via CF Workers AI ───────────
//
// Uses LLaMA (training data knowledge) instead of Perplexity (real-time search).
// This is MORE appropriate for GEO: tests what AI models have in their training
// corpus, not what appears in current web search results.
// ─────────────────────────────────────────────────────────────────────────────

async function computeHash(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function computeTopicHash(brand: string, domain: string, tier: string, topics: string[]): Promise<string> {
  return computeHash(`${brand.toLowerCase()}::${domain.toLowerCase()}::${tier}::${[...topics].sort().join("|")}`);
}

async function generateCitationQuestions(
  brand:  string,
  domain: string,
  tier:   string,
  topics: string[],
  count:  number,
): Promise<string[]> {
  const topicList = topics.slice(0, 8).join(", ") || "main services";
  const prompt = `Generate exactly ${count} natural questions that business owners or marketers would ask an AI assistant (ChatGPT, Gemini, Claude, Perplexity) about tools in the "${topicList}" space. Brand being tested: "${brand}" (${domain}).

Cover evenly:
- Discovery: "best tools for X", "top platforms for X", "what software for X"
- Problem-solving: "how to improve X", "what helps with X"
- Comparison: "alternatives to X", "X vs Y", "compare platforms for X"
- Recommendation: "recommend solution for X", "which is best for X"
- Use-case: specific scenarios the brand solves

Sound natural, like a real business owner searching. Vary topics across all ${count}.
Return ONLY JSON: { "questions": ["...", ...${count} items] }`;

  try {
    const res     = await fetch(`${CF_ANTHROPIC}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 3000, messages: [{ role: "user", content: prompt }] }),
    });
    const data    = await res.json();
    const text    = data?.content?.[0]?.text || "{}";
    const clean   = text.replace(/```json|```/g, "").trim();
    const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
    const qs      = JSON.parse(clean.slice(s, e + 1))?.questions?.slice(0, count) as string[] || [];
    console.log(`[qa-gen] Generated ${qs.length}/${count} questions for "${brand}"`);
    return qs;
  } catch (err) {
    console.error("[qa-gen] Failed:", err.message);
    return Array.from({ length: Math.min(count, 10) }, (_, i) =>
      `What are the best tools for ${topics[i % topics.length] || "this niche"}? (Q${i + 1})`
    );
  }
}

async function testQuestionsWithWorkersAI(
  questions: string[],
  brand:     string,
  domain:    string,
): Promise<{ results: QAItem[]; cacheHits: number; freshTests: number }> {

  const brandLower = brand.toLowerCase();
  const domainBase = domain.split(".")[0].toLowerCase();
  const expireAt   = new Date(Date.now() + QA_ANSWER_CACHE_DAYS * 86400000).toISOString();

  // ── Delta cache check ───────────────────────────────────────────────────
  const hashes = await Promise.all(questions.map(q =>
    computeHash(`${domain.toLowerCase()}::${q.toLowerCase().trim()}`)
  ));

  const { data: cached } = await supabase
    .from("geo_qa_cache")
    .select("question_hash, question, answer, brands_mentioned, is_cited, is_recommended")
    .in("question_hash", hashes)
    .eq("domain", domain)
    .gt("expires_at", new Date().toISOString());

  const cachedMap = new Map<string, Record<string, unknown>>();
  for (const row of (cached || [])) cachedMap.set(row.question_hash, row);

  const cacheHitItems: Array<{ idx: number; item: QAItem }> = [];
  const missIndices:   number[] = [];
  const missQuestions: string[] = [];

  for (let i = 0; i < questions.length; i++) {
    const hit = cachedMap.get(hashes[i]);
    if (hit) {
      cacheHitItems.push({ idx: i, item: {
        question: questions[i], answer: hit.answer as string,
        brandsMentioned: hit.brands_mentioned as string[],
        isCited: hit.is_cited as boolean, isRecommended: hit.is_recommended as boolean,
        fromCache: true,
      }});
    } else {
      missIndices.push(i);
      missQuestions.push(questions[i]);
    }
  }

  console.log(`[qa-cache] ${cacheHitItems.length} hits / ${missQuestions.length} fresh (Workers AI)`);

  // ── Smart pagination: batch misses into pages of QA_BATCH_SIZE ─────────
  const freshItemMap  = new Map<number, QAItem>();
  const newCacheRows: Array<Record<string, unknown>> = [];

  if (missQuestions.length > 0) {
    const batches: Array<{ indices: number[]; questions: string[] }> = [];
    for (let i = 0; i < missQuestions.length; i += QA_BATCH_SIZE) {
      batches.push({ indices: missIndices.slice(i, i + QA_BATCH_SIZE), questions: missQuestions.slice(i, i + QA_BATCH_SIZE) });
    }

    const batchResults = await Promise.allSettled(
      batches.map(async (batch) => {
        const numbered = batch.questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
        const sysMsg   = "You are a knowledgeable AI assistant. Answer based on your training knowledge (not real-time search). Be specific about brand names you know.";
        const userMsg  = `Answer each question based on your training knowledge. For each answer, list ALL specific brand names, product names, or services you mention.

${numbered}

Return ONLY JSON:
{
  "results": [
    { "q": "question", "answer": "<2-3 sentence answer>", "brands": ["Brand1", "Brand2"], "recommended": ["Brand1"] },
    ...
  ]
}`;

        const text = await callWorkersAI(
          [{ role: "system", content: sysMsg }, { role: "user", content: userMsg }],
          LLAMA_MODEL,
          1600,
        );

        const clean = text.replace(/```json|```/g, "").trim();
        const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
        return { batch, parsed: JSON.parse(clean.slice(s, e + 1)) };
      })
    );

    for (const settled of batchResults) {
      if (settled.status !== "fulfilled") continue;
      const { batch, parsed } = settled.value;
      const items = parsed?.results || [];

      for (let bi = 0; bi < batch.questions.length; bi++) {
        const item      = items[bi] || {};
        const answer    = (item.answer || "") as string;
        const brands    = ((item.brands || []) as string[]).map((b: string) => b.toLowerCase());
        const recBrands = ((item.recommended || []) as string[]).map((b: string) => b.toLowerCase());

        const isCited       = brands.some(b => b.includes(brandLower) || b.includes(domainBase) || brandLower.includes(b.split(" ")[0]));
        const isRecommended = recBrands.some(b => b.includes(brandLower) || b.includes(domainBase));

        const origIdx = batch.indices[bi];
        const qaItem: QAItem = {
          question: batch.questions[bi], answer,
          brandsMentioned: item.brands || [],
          isCited, isRecommended, fromCache: false,
        };
        freshItemMap.set(origIdx, qaItem);

        newCacheRows.push({
          question_hash:    hashes[origIdx],
          domain,
          question:         batch.questions[bi],
          answer,
          brands_mentioned: item.brands || [],
          is_cited:         isCited,
          is_recommended:   isRecommended,
          expires_at:       expireAt,
        });
      }
    }

    // Persist new answers to delta cache
    if (newCacheRows.length > 0) {
      await supabase.from("geo_qa_cache")
        .upsert(newCacheRows, { onConflict: "question_hash,domain" })
        .then(({ error }) => { if (error) console.warn("[qa-cache] upsert:", error.message); });
    }
  }

  // ── Merge in original order ────────────────────────────────────────────
  const results: QAItem[] = questions.map((q, i) => {
    const hit = cacheHitItems.find(c => c.idx === i);
    if (hit) return hit.item;
    return freshItemMap.get(i) || {
      question: q, answer: "Test unavailable",
      brandsMentioned: [], isCited: false, isRecommended: false, fromCache: false,
    };
  });

  return { results, cacheHits: cacheHitItems.length, freshTests: missQuestions.length };
}

async function runQaTest(
  domain:   string,
  brand:    string,
  tier:     string,
  topics:   string[],
  clientId: string,
  force   = false,
): Promise<QATestResult> {
  const questionCount = QA_QUESTIONS[tier] || QA_QUESTIONS.basic;

  // ── Biweekly check ───────────────────────────────────────────────────────
  const { data: lastRuns } = await supabase
    .from("geo_qa_results")
    .select("id, citation_rate, recommendation_rate, run_date, topic_hash, questions, questions_count, qa_results, top_cited_brands, cache_hits, fresh_tests")
    .eq("domain", domain)
    .eq("client_id", clientId)
    .order("run_date", { ascending: false })
    .limit(2);

  const lastRun = (lastRuns || [])[0] || null;
  const prevRun = (lastRuns || [])[1] || null;

  if (!force && lastRun) {
    const daysSince = (Date.now() - new Date(lastRun.run_date).getTime()) / 86400000;
    if (daysSince < QA_BIWEEKLY_DAYS) {
      console.log(`[qa-test] ✅ Biweekly cache HIT (${Math.round(daysSince)}d ago)`);
      const delta = prevRun ? (lastRun.citation_rate - prevRun.citation_rate) : 0;
      return {
        id: lastRun.id, tier, questionsCount: lastRun.questions_count,
        results: lastRun.qa_results, citationRate: lastRun.citation_rate,
        recommendationRate: (lastRun as Record<string, unknown>).recommendation_rate as number || 0,
        topCitedBrands: lastRun.top_cited_brands || [],
        cacheHits: lastRun.cache_hits || 0, freshTests: lastRun.fresh_tests || 0,
        runDate: lastRun.run_date, isFromCache: true,
        previousRun: prevRun ? { citationRate: prevRun.citation_rate, recommendationRate: (prevRun as Record<string, unknown>).recommendation_rate as number || 0, runDate: prevRun.run_date } : undefined,
        progressDirection: prevRun ? (delta > 5 ? "improving" : delta < -5 ? "declining" : "stable") : "first-run",
        progressDelta: delta,
      };
    }
  }

  // ── Smart hash: detect topic drift ────────────────────────────────────
  const topicHash     = await computeTopicHash(brand, domain, tier, topics.slice(0, 8));
  const hashUnchanged = lastRun?.topic_hash === topicHash;

  let questions: string[] = hashUnchanged && lastRun?.questions?.length >= questionCount
    ? (lastRun.questions as string[])
    : [];

  if (questions.length < questionCount) {
    console.log(`[qa-test] ${hashUnchanged ? "Refilling" : "Regenerating"} ${questionCount}Q bank (hash: ${topicHash.slice(0, 8)}...)`);
    questions = await generateCitationQuestions(brand, domain, tier, topics, questionCount);
  } else {
    console.log(`[qa-test] Reusing ${questions.length}Q bank (hash unchanged)`);
  }

  // ── Smart pagination + delta cache ────────────────────────────────────
  const { results, cacheHits, freshTests } = await testQuestionsWithWorkersAI(questions, brand, domain);

  // ── Metrics ───────────────────────────────────────────────────────────
  const citationRate     = results.length > 0 ? Math.round(results.filter(q => q.isCited).length / results.length * 100) : 0;
  const recommendationRate = results.length > 0 ? Math.round(results.filter(q => q.isRecommended).length / results.length * 100) : 0;

  const brandFreq: Record<string, number> = {};
  for (const r of results) {
    for (const b of r.brandsMentioned) {
      const bl = b.toLowerCase();
      if (!bl.includes(brand.toLowerCase()) && !bl.includes(domain.split(".")[0])) {
        brandFreq[bl] = (brandFreq[bl] || 0) + 1;
      }
    }
  }
  const topCitedBrands = Object.entries(brandFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([b]) => b);

  const delta             = prevRun ? citationRate - (prevRun.citation_rate as number) : 0;
  const progressDirection = prevRun ? (delta > 5 ? "improving" : delta < -5 ? "declining" : "stable") : "first-run" as const;

  // ── Persist ───────────────────────────────────────────────────────────
  const { data: savedRow } = await supabase.from("geo_qa_results").insert({
    client_id: clientId, domain, tier, topic_hash: topicHash,
    questions, questions_count: results.length, page_number: 1, total_pages: 1,
    qa_results: results, citation_rate: citationRate, recommendation_rate: recommendationRate,
    cache_hits: cacheHits, fresh_tests: freshTests, top_cited_brands: topCitedBrands,
    previous_citation_rate: prevRun?.citation_rate || null,
    previous_recommendation_rate: (prevRun as Record<string, unknown>)?.recommendation_rate || null,
    previous_run_date: prevRun?.run_date || null,
  }).select("id").maybeSingle();

  console.log(`[qa-test] ✅ ${citationRate}% cited | ${recommendationRate}% recommended | cache=${cacheHits}/${results.length} | Δ${delta > 0 ? "+" : ""}${delta}pp`);

  return {
    id: savedRow?.id, tier, questionsCount: results.length,
    results, citationRate, recommendationRate, topCitedBrands, cacheHits, freshTests,
    runDate: new Date().toISOString(), isFromCache: false,
    previousRun: prevRun ? { citationRate: prevRun.citation_rate as number, recommendationRate: (prevRun as Record<string, unknown>).recommendation_rate as number || 0, runDate: prevRun.run_date as string } : undefined,
    progressDirection,
    progressDelta: delta,
  };
}

// ─── STEP 4a: Perplexity (real-time web research — kept for GEO queries) ──────

async function researchWithPerplexity(
  domain: string, brand: string, topics: string[],
): Promise<PerplexityGeoInsights | null> {
  const topicList = topics.slice(0, 8).join(", ") || "main services";

  const prompts = [
    `Research how AI search engines and the web associate the brand "${brand}" (website: ${domain}) with these topics: ${topicList}.
Find: 1) Which topics does AI strongly associate with this brand? 2) When users ask AI about these topics, does the brand appear in answers? 3) Are there topic areas the brand should own but doesn't appear in AI answers? 4) What is the brand's topical authority in AI-generated content?
Return ONLY JSON: { "associatedTopics": ["..."], "topicStrength": { "topic": "strong|moderate|weak" }, "misalignedTopics": ["..."], "aiAnswerPresence": "<narrative>", "topicScore": <0-100> }`,

    `Research the visibility and presence of "${brand}" (${domain}) across AI platforms and the web.
Check: 1) Does ChatGPT, Perplexity, Gemini, Claude mention this brand when asked about their niche? 2) How frequently is the brand mentioned? 3) What is the brand's sentiment in AI answers? 4) How does visibility compare to competitors?
Return ONLY JSON: { "aiPlatforms": [{ "platform": "ChatGPT|Perplexity|Gemini|Claude", "visibility": "high|medium|low|none", "notes": "..." }], "webVisibility": "<narrative>", "brandSentiment": "positive|neutral|negative|mixed", "mentionFrequency": "frequent|occasional|rare|not-found", "visibilityScore": <0-100>, "keyInsight": "<most important finding>" }`,

    `Research how people discover brands in the "${topicList}" space online in Indonesia and globally.
Find: 1) Which platforms (TikTok, YouTube, LinkedIn, Reddit, Quora, etc.) do people use to discover services in this niche? 2) Where is "${brand}" currently discoverable vs where it's missing? 3) What are the untapped discovery channels? 4) How does the target audience search and discover solutions in this category?
Return ONLY JSON: { "primaryChannels": [{ "platform": "...", "strength": "strong|moderate|weak", "opportunity": "..." }], "audienceDiscovery": "<narrative>", "untappedPlatforms": ["..."], "discoveryScore": <0-100>, "recommendations": ["..."] }`,
  ];

  try {
    const responses = await Promise.allSettled(
      prompts.map(content =>
        fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${PERPLEXITY_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content }], temperature: 0.1, max_tokens: 800, return_citations: true }),
        }).then(r => r.json())
      )
    );

    const allCitations: string[] = [];
    const parse = (res: PromiseSettledResult<Record<string, unknown>>, idx: number) => {
      if (res.status !== "fulfilled") { console.warn(`[perplexity] Q${idx + 1} failed`); return null; }
      const content = (res.value?.choices?.[0]?.message?.content as string) || "{}";
      allCitations.push(...((res.value?.citations as string[]) || []));
      try { const clean = content.replace(/```json|```/g, "").trim(); const s = clean.indexOf("{"), e = clean.lastIndexOf("}"); return JSON.parse(clean.slice(s, e + 1)); } catch { return null; }
    };

    const [topicData, visibilityData, discoveryData] = [parse(responses[0], 0), parse(responses[1], 1), parse(responses[2], 2)];
    console.log(`[perplexity] GEO: topic=${topicData?.topicScore}, visibility=${visibilityData?.visibilityScore}, discovery=${discoveryData?.discoveryScore}`);

    return {
      topicRelevance:    topicData    ?? { associatedTopics: [], topicStrength: {}, misalignedTopics: [], aiAnswerPresence: "unavailable", topicScore: 0 },
      brandVisibility:   visibilityData ?? { aiPlatforms: [], webVisibility: "unavailable", brandSentiment: "neutral", mentionFrequency: "not-found", visibilityScore: 0, keyInsight: "unavailable" },
      platformDiscovery: discoveryData  ?? { primaryChannels: [], audienceDiscovery: "unavailable", untappedPlatforms: [], discoveryScore: 0, recommendations: [] },
      citations: [...new Set(allCitations)],
    };
  } catch (err) { console.error("[perplexity]", err.message); return null; }
}

// ─── STEP 4b-d: Technical + Wikipedia + GBP ───────────────────────────────────

async function checkGoogleBusinessProfile(brandName: string, domain: string): Promise<GBPResult> {
  if (!GOOGLE_PLACES_KEY) return { isListed: false };

  // Search with domain appended to distinguish brand from similarly-named businesses
  // e.g. "GeoVera geovera.xyz" avoids matching "GeoVera Insurance Group"
  const domainBase = domain.replace(/^www\./, "");
  const searchQuery = `${brandName} ${domainBase}`;

  try {
    const url  = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`
      + `?input=${encodeURIComponent(searchQuery)}&inputtype=textquery`
      + `&fields=name,rating,user_ratings_total,types,business_status,website&key=${GOOGLE_PLACES_KEY}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();

    if (data.status !== "OK" || !data.candidates?.length) {
      // Fallback: search by brand name only
      const url2 = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`
        + `?input=${encodeURIComponent(brandName)}&inputtype=textquery`
        + `&fields=name,rating,user_ratings_total,types,business_status,website&key=${GOOGLE_PLACES_KEY}`;
      const res2 = await fetch(url2, { signal: AbortSignal.timeout(6000) });
      const data2 = await res2.json();
      if (data2.status !== "OK" || !data2.candidates?.length) {
        console.log(`[gbp] Not listed: "${brandName}"`);
        return { isListed: false };
      }
      // Verify the result belongs to our domain (not another business with same name)
      const candidate = data2.candidates[0];
      const website   = (candidate.website || "") as string;
      const domainMatch = website.includes(domainBase) || website.includes(brandName.toLowerCase());
      if (!domainMatch) {
        console.log(`[gbp] Found "${candidate.name}" but website (${website}) doesn't match domain — likely different brand`);
        return { isListed: false };
      }
      console.log(`[gbp] ✅ ${candidate.name} | ${candidate.rating}★ | ${candidate.user_ratings_total} reviews`);
      return { isListed: true, name: candidate.name, rating: candidate.rating, reviewCount: candidate.user_ratings_total, types: candidate.types?.filter((t: string) => !["establishment", "point_of_interest"].includes(t)).slice(0, 5), businessStatus: candidate.business_status };
    }

    const p = data.candidates[0];
    console.log(`[gbp] ✅ ${p.name} | ${p.rating}★ | ${p.user_ratings_total} reviews`);
    return { isListed: true, name: p.name, rating: p.rating, reviewCount: p.user_ratings_total, types: p.types?.filter((t: string) => !["establishment", "point_of_interest"].includes(t)).slice(0, 5), businessStatus: p.business_status };
  } catch (err) {
    console.warn("[gbp] Error:", (err as Error).message);
    return { isListed: false };
  }
}

async function checkTechnicalSignals(domain: string) {
  const [llmRes, robotsRes, homepageRes] = await Promise.allSettled([
    fetch(`https://${domain}/llm.txt`,   { signal: AbortSignal.timeout(6000) }),
    fetch(`https://${domain}/robots.txt`, { signal: AbortSignal.timeout(6000) }),
    fetch(`https://${domain}/`,           { signal: AbortSignal.timeout(8000) }),
  ]);

  const hasLlmTxt = llmRes.status === "fulfilled" && llmRes.value.ok;
  let robotsTxt = "";
  if (robotsRes.status === "fulfilled" && robotsRes.value.ok)
    robotsTxt = await robotsRes.value.text().catch(() => "");

  const crawlerStatus = AI_CRAWLERS.map(bot => {
    const idx = robotsTxt.toLowerCase().indexOf(`user-agent: ${bot.toLowerCase()}`);
    if (idx === -1) return { bot, allowed: true };
    const section = robotsTxt.slice(idx, idx + 300);
    return { bot, allowed: !(/disallow:\s*\//i.test(section) && !/allow:\s*\//i.test(section)) };
  });

  let schemaTypes: string[] = [];
  if (homepageRes.status === "fulfilled" && homepageRes.value.ok) {
    const html    = await homepageRes.value.text().catch(() => "");
    const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const s of scripts) {
      try { const c = s.replace(/<script[^>]*>|<\/script>/gi, "").trim(); const p = JSON.parse(c); const t = Array.isArray(p) ? p.map((x: Record<string, unknown>) => x["@type"]) : [p["@type"]]; schemaTypes.push(...t.filter(Boolean).flat()); } catch { /* skip */ }
    }
    schemaTypes = [...new Set(schemaTypes)].filter(Boolean);
  }

  return {
    hasLlmTxt,
    allowedBots: crawlerStatus.filter(c =>  c.allowed).map(c => c.bot),
    blockedBots: crawlerStatus.filter(c => !c.allowed).map(c => c.bot),
    schemaTypes,
    hasRobotsTxt: robotsTxt.length > 0,
  };
}

async function checkWikipedia(brandName: string): Promise<boolean> {
  try {
    const res   = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(brandName)}&format=json&origin=*`, { signal: AbortSignal.timeout(5000) });
    const data  = await res.json();
    const pages = Object.keys(data?.query?.pages || {});
    return pages.length > 0 && !pages.includes("-1");
  } catch { return false; }
}

function checkTrainingSources(topDomains: string[], citations: string[], brandMentions: number) {
  const allSources = [...topDomains, ...citations.map(u => { try { return new URL(u).hostname; } catch { return ""; } })].join(" ").toLowerCase();
  const found   = TRAINING_SOURCES.filter(s => allSources.includes(s));
  const missing = TRAINING_SOURCES.filter(s => !allSources.includes(s));
  return { found, missing, coveragePct: Math.round(found.length / TRAINING_SOURCES.length * 100), brandMentions };
}

// ─── STEP 5: Claude scores all 8 GEO factors (+ QA citation + RAG readiness) ─

async function scoreWithClaude(
  domain: string, brand: string,
  pageStats: ReturnType<typeof aggregatePageSignals>,
  backlinks: Record<string, unknown> | null,
  strategy:  Record<string, unknown> | null,
  technical: Awaited<ReturnType<typeof checkTechnicalSignals>>,
  wikipedia: boolean,
  training:  ReturnType<typeof checkTrainingSources>,
  sitemaps:  Array<Record<string, unknown>>,
  gscTopQ:   string[],
  perplexity:PerplexityGeoInsights | null,
  qaResult:  QATestResult | null,
  ragResult: RAGReadinessResult | null,
  gbp:       GBPResult,
): Promise<GeoAnalysis["factors"] & { overallScore: number; topActions: string[]; geoStrategy: string }> {

  const prompt = `You are a GEO (Generative Engine Optimization) expert. Score this website across 8 factors that determine how well it appears in AI-generated answers (ChatGPT, Perplexity, Gemini, Claude).

## DOMAIN: ${domain} (Brand: ${brand})

## PAGE SEO DATA (${pageStats?.totalPages || 0} pages)
- Avg SEO score: ${pageStats?.avgScore || 0}/100 | E-E-A-T: ${pageStats?.avgEeat || 0}/10
- E-E-A-T signals: ${pageStats?.allEeatSignals.join(", ") || "none"}
- FAQ-format H2: ${pageStats?.faqPct || 0}% | Schema pages: ${pageStats?.schemaPct || 0}% (${pageStats?.pagesWithSchema || 0})
- Avg words: ${pageStats?.avgWords || 0} | Ext citations/page: ${pageStats?.avgExtLinks || 0}
- Content age: ${pageStats?.avgAgeDays || 0} days avg
- Topics: ${pageStats?.topicClusters.join(", ") || "unknown"}
- Entities: ${pageStats?.uniqueEntities.slice(0, 10).join(", ") || "unknown"}
- Gaps: ${pageStats?.contentGaps.join(", ") || "none"}

## BACKLINKS & BRAND
- Backlink quality: ${backlinks?.quality_score || "?"}/100 | Brand mentions: ${(backlinks?.analysis as Record<string, unknown>)?.gemini?.brandMentions || 0}
- Top linking domains: ${((backlinks?.analysis as Record<string, unknown>)?.gemini?.topLinkingDomains as string[] || []).slice(0, 5).join(", ") || "none"}
- Domain reputation: ${(backlinks?.analysis as Record<string, unknown>)?.perplexity?.domainReputation || "unknown"}

## TOPICAL STRATEGY
- Topical score: ${(strategy as Record<string, unknown>)?.topicalAuthority?.score || "?"}/100
- Current topics: ${((strategy as Record<string, unknown>)?.topicalAuthority?.currentTopics as string[] || []).slice(0, 5).join(", ") || "unknown"}
- Missing topics: ${((strategy as Record<string, unknown>)?.topicalAuthority?.missingTopics as string[] || []).slice(0, 5).join(", ") || "none"}

## TECHNICAL SIGNALS
- LLM.txt: ${technical.hasLlmTxt ? "✅" : "❌ NOT FOUND"} | Robots.txt: ${technical.hasRobotsTxt ? "✅" : "❌"}
- AI crawlers BLOCKED: ${technical.blockedBots.join(", ") || "none"}
- Homepage schema: ${technical.schemaTypes.join(", ") || "none detected"}

## GOOGLE BUSINESS PROFILE (GBP)
- Listed: ${gbp.isListed ? `✅ "${gbp.name}" — ${gbp.rating}★ (${gbp.reviewCount} reviews) — ${gbp.businessStatus}` : "❌ NOT FOUND"}
${gbp.isListed ? `- Types: ${gbp.types?.join(", ")}` : "- No GBP (major trust signal missing for local AI queries)"}

## TRAINING PRESENCE
- Wikipedia: ${wikipedia ? "✅" : "❌"} | Training sources: ${training.found.join(", ") || "none"} (${training.coveragePct}%)
- Sitemaps: ${sitemaps.length} submitted, ${sitemaps.filter((s: Record<string, unknown>) => (s.errors as number) > 0).length} with errors
- Top GSC queries: ${gscTopQ.slice(0, 5).join(", ") || "no GSC"}

## PERPLEXITY RESEARCH (real-time web)
- AI topic score: ${perplexity?.topicRelevance.topicScore ?? "?"}/100
- Brand visibility: ${perplexity?.brandVisibility.visibilityScore ?? "?"}/100 (${perplexity?.brandVisibility.mentionFrequency || "unknown"})
- Key insight: ${perplexity?.brandVisibility.keyInsight || "none"}
- Platform discovery: ${perplexity?.platformDiscovery.discoveryScore ?? "?"}/100
${(perplexity?.brandVisibility.aiPlatforms || []).map(p => `- ${p.platform}: ${p.visibility}`).join(" | ") || ""}

## AI CITATION TEST — CF Workers AI / LLaMA (${qaResult?.questionsCount || 0}Q, ${qaResult?.tier || "basic"} tier)
This tests what LLaMA's TRAINING DATA knows about the brand — true AI training corpus presence.
- Citation Rate: ${qaResult?.citationRate ?? "not tested"}% (brand cited in LLaMA answers)
- Recommendation Rate: ${qaResult?.recommendationRate ?? "not tested"}%
- Trend: ${qaResult?.progressDirection || "first-run"} (${qaResult?.progressDelta ? (qaResult.progressDelta > 0 ? "+" : "") + qaResult.progressDelta + "pp" : "baseline"})
- Competing brands cited instead: ${qaResult?.topCitedBrands.slice(0, 5).join(", ") || "none"}
- From biweekly cache: ${qaResult?.isFromCache ? "yes (no new data)" : "no (fresh test)"}

## RAG READINESS — CF Workers AI / LLaMA Judge
Tests if website content is well-structured for RAG systems to retrieve and use.
- RAG Score: ${ragResult?.score ?? "not tested"}/100
- Answerable questions: ${ragResult?.answerablePct ?? "not tested"}% (${ragResult?.questionScores?.length || 0} questions evaluated, score ≥ 6/10)
- Avg retrieval quality: ${ragResult?.avgQualityScore ?? "?"}/10
- Content strengths (what RAG can retrieve well): ${ragResult?.contentStrengths.slice(0, 3).join("; ") || "unknown"}
- Content gaps (what RAG cannot answer): ${ragResult?.contentGaps.slice(0, 4).join(", ") || "none"}

## TASK
Score each GEO factor. Use actual numbers. RAG readiness + citation rate are KEY data for trainingPresence + answerReady scores.

Return ONLY JSON:
{
  "overallScore": <weighted average>,
  "topActions": ["<priority 1>", "<priority 2>", "<priority 3>"],
  "geoStrategy": "<3-sentence executive summary>",
  "factors": {
    "eeat": { "score": <0-100>, "status": "<good|warn|low>", "dataPoints": ["<specific>", ...], "actions": ["<specific>"], "details": { "avgEeatScore": <n>, "brandMentions": <n>, "wikipediaExists": <bool>, "gbpListed": <bool>, "gbpRating": <n|null> } },
    "answerReady": { "score": <0-100>, "status": "<good|warn|low>", "dataPoints": ["<include RAG answerablePct>", ...], "actions": ["<specific>"], "details": { "faqPercentage": <n>, "ragAnswerablePct": <n>, "avgQualityScore": <n>, "hasFaqSchema": <bool> } },
    "topicalDepth": { "score": <0-100>, "status": "<good|warn|low>", "dataPoints": ["<specific>", ...], "actions": ["<specific>"], "details": { "clusterCount": <n>, "missingTopics": ["..."], "strongClusters": ["..."] } },
    "freshness": { "score": <0-100>, "status": "<good|warn|low>", "dataPoints": ["<age data>", ...], "actions": ["<specific>"], "details": { "avgAgeDays": <n>, "updateFrequency": "<high|medium|low>" } },
    "technicalSignals": { "score": <0-100>, "status": "<good|warn|low>", "dataPoints": ["<llm.txt, schema, GBP>", ...], "actions": ["<specific>"], "details": { "hasLlmTxt": <bool>, "blockedBots": [], "sitemapErrors": <n>, "gbpVerified": <bool> } },
    "schemaMarkup": { "score": <0-100>, "status": "<good|warn|low>", "dataPoints": ["<schema data>", ...], "actions": ["<specific>"], "details": { "existingTypes": [], "missingTypes": [], "coveragePct": <n> } },
    "trainingPresence": { "score": <0-100>, "status": "<good|warn|low>", "dataPoints": ["<include citationRate + RAG score>", ...], "actions": ["<specific>"], "details": { "citationRate": <n>, "recommendationRate": <n>, "ragScore": <n>, "sourcesFound": [], "coveragePct": <n> } },
    "factClarity": { "score": <0-100>, "status": "<good|warn|low>", "dataPoints": ["<citation + word count>", ...], "actions": ["<specific>"], "details": { "avgExtCitations": <n>, "avgWordCount": <n> } }
  }
}`;

  const res = await fetch(`${CF_ANTHROPIC}/v1/messages`, {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 4000, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const data    = await res.json();
  const content = data?.content?.[0]?.text || "{}";
  console.log(`[claude] GEO scoring: in=${data.usage?.input_tokens} out=${data.usage?.output_tokens}`);
  const clean = content.replace(/```json|```/g, "").trim();
  const s = clean.indexOf("{"), e = clean.lastIndexOf("}");
  return JSON.parse(clean.slice(s, e + 1));
}

// ─── STEP 6: Claude Progress Analysis ─────────────────────────────────────────

async function analyzeProgress(
  brand:        string,
  domain:       string,
  qaResult:     QATestResult,
  ragResult:    RAGReadinessResult | null,
  overallScore: number,
  factors:      GeoAnalysis["factors"],
): Promise<string> {
  const isFirst  = qaResult.progressDirection === "first-run";
  const deltaStr = qaResult.progressDelta > 0 ? `+${qaResult.progressDelta}` : `${qaResult.progressDelta}`;

  const prompt = `Anda adalah pakar GEO (Generative Engine Optimization). Analisis progress AI citation dan RAG readiness brand ini.

## BRAND: ${brand} (${domain})

## CITATION TEST — LLaMA Training Data (${qaResult.questionsCount} pertanyaan, tier ${qaResult.tier})
- Citation Rate: ${qaResult.citationRate}% | Recommendation Rate: ${qaResult.recommendationRate}%
- Cache efficiency: ${qaResult.cacheHits}/${qaResult.questionsCount} dari delta cache (${Math.round(qaResult.cacheHits / Math.max(qaResult.questionsCount, 1) * 100)}% hemat)
${isFirst ? "- Status: BASELINE (pengukuran pertama)" : `- Sebelumnya: ${qaResult.previousRun?.citationRate}% | Δ: ${deltaStr}pp | Tren: ${qaResult.progressDirection === "improving" ? "📈 NAIK" : qaResult.progressDirection === "declining" ? "📉 TURUN" : "➡️ STABIL"}`}
- Kompetitor dikutip: ${qaResult.topCitedBrands.slice(0, 5).join(", ") || "tidak terdeteksi"}

## RAG READINESS — LLaMA Content Judge
- RAG Score: ${ragResult?.score ?? "tidak ditest"}/100
- Answerable: ${ragResult?.answerablePct ?? "?"}% pertanyaan bisa dijawab dari konten
- Kualitas retrieval: ${ragResult?.avgQualityScore ?? "?"}/10
- Gap konten: ${ragResult?.contentGaps.slice(0, 4).join(", ") || "tidak ada"}

## PERTANYAAN TIDAK DIKUTIP (top 5)
${qaResult.results.filter(r => !r.isCited).slice(0, 5).map((r, i) => `${i + 1}. "${r.question}"`).join("\n") || "Brand dikutip di semua pertanyaan!"}

## KONTEKS GEO
- Overall GEO: ${overallScore}/100 | Training Presence: ${factors.trainingPresence?.score || 0}/100 | Answer Ready: ${factors.answerReady?.score || 0}/100

## TUGAS
Tulis analisis progress (3-4 paragraf, bahasa Indonesia, data-driven):
1. **Citation & RAG readiness status** — apa artinya ${qaResult.citationRate}% citation + ${ragResult?.answerablePct ?? "?"}% RAG score?
2. **${isFirst ? "Posisi baseline" : "Progress biweekly"}** — assessment jujur
3. **3 aksi spesifik** untuk meningkatkan citation rate + RAG readiness dalam 2 minggu
4. **Target realistis** untuk biweekly berikutnya (citation rate + RAG score)`;

  try {
    const res     = await fetch(`${CF_ANTHROPIC}/v1/messages`, {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
    });
    const data     = await res.json();
    const analysis = data?.content?.[0]?.text || "";
    console.log(`[step6] Progress analysis: ${data.usage?.output_tokens} tokens`);
    if (qaResult.id) {
      await supabase.from("geo_qa_results").update({ progress_analysis: analysis }).eq("id", qaResult.id);
    }
    return analysis;
  } catch (err) {
    console.error("[step6]", err.message);
    return `Citation rate: ${qaResult.citationRate}% | RAG readiness: ${ragResult?.score ?? "N/A"}/100. ${isFirst ? "Baseline pertama." : `Δ${deltaStr}pp.`}`;
  }
}

// ─── Cache helpers ─────────────────────────────────────────────────────────────

async function getCache(domain: string, clientId: string): Promise<GeoAnalysis | null> {
  const { data } = await supabase.from("geo_analysis_cache")
    .select("analysis, expires_at").eq("domain", domain).eq("client_id", clientId).maybeSingle();
  if (!data || new Date(data.expires_at) < new Date()) return null;
  return { ...data.analysis, source: "cache" };
}

async function saveCache(domain: string, clientId: string, analysis: Record<string, unknown>): Promise<void> {
  await supabase.from("geo_analysis_cache").upsert({
    domain, client_id: clientId, analysis,
    overall_score: (analysis as Record<string, unknown>).overallScore,
    cached_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + CACHE_TTL_DAYS * 86400000).toISOString(),
  }, { onConflict: "domain,client_id" });
}

// ─── MAIN HANDLER ──────────────────────────────────────────────────────────────
//
// POST {
//   domain:   "geovera.xyz",
//   clientId: "uuid",
//   brand:    "GeoVera",
//   tier:     "basic" | "premium" | "partner"   → QA: 30 / 50 / 100 questions
//   force:    false
// }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { domain: raw, clientId = "default", brand, tier = "basic", force = false } = await req.json();
    if (!raw) throw new Error("domain is required");

    const domain    = raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    const brandName = brand || domain.split(".")[0];
    const tierNorm  = ["basic", "premium", "partner"].includes(tier) ? tier : "basic";

    console.log(`[geo-analyzer] ${domain} | brand="${brandName}" | tier=${tierNorm} | ${QA_QUESTIONS[tierNorm]}Q | force=${force}`);

    // ── Cache check ─────────────────────────────────────────────────────────
    if (!force) {
      const cached = await getCache(domain, clientId);
      if (cached) {
        console.log(`[geo-analyzer] ✅ GEO cache HIT`);
        return Response.json({ success: true, data: cached, cached: true }, { headers: cors });
      }
    }

    // ── Step 1: Load SEO data ────────────────────────────────────────────────
    console.log("[geo-analyzer] Step 1: Loading SEO data...");
    const seoData = await loadSeoData(domain, clientId);
    console.log(`[geo-analyzer] Loaded: ${seoData.pages.length} pages from [${seoData.tables.join(", ")}]`);

    // Step 3 (sync, instant): Aggregate signals
    const pageStats = aggregatePageSignals(seoData.pages);
    const topics    = pageStats?.topicClusters || [];

    // ── Steps 2+4: Run ALL in parallel ──────────────────────────────────────
    //   Step 2a: QA Citation Test (CF Workers AI / LLaMA) — biweekly + delta cache
    //   Step 2b: RAG Readiness Score (CF Workers AI / LLaMA judge) — content quality
    //   Step 4a: Perplexity 3× (topic/visibility/discovery) — real-time web
    //   Step 4b: Technical signals (llm.txt, robots.txt, schema)
    //   Step 4c: Wikipedia
    //   Step 4d: Google Business Profile (optional)
    console.log(`[geo-analyzer] Steps 2+4 parallel: QA(${QA_QUESTIONS[tierNorm]}Q) + RAG(${RAG_EVAL_QUESTIONS}Q) + Perplexity + technical...`);

    const [qaResult, ragResult, perplexityInsights, technical, wikipedia, gbp] = await Promise.all([
      runQaTest(domain, brandName, tierNorm, topics, clientId, force),
      computeRagReadiness(seoData.pages, brandName, domain, topics),
      researchWithPerplexity(domain, brandName, topics),
      checkTechnicalSignals(domain),
      checkWikipedia(brandName),
      checkGoogleBusinessProfile(brandName, domain),
    ]);

    const topDomains    = (seoData.backlinks?.analysis as Record<string, unknown>)?.gemini?.topLinkingDomains as string[] || [];
    const allCitations  = [...new Set([...(seoData.backlinks?.analysis as Record<string, unknown>)?.perplexity?.citations as string[] || [], ...perplexityInsights?.citations || []])];
    const brandMentions = (seoData.backlinks?.analysis as Record<string, unknown>)?.gemini?.brandMentions as number || 0;
    const training      = checkTrainingSources(topDomains, allCitations, brandMentions);
    const gscTopQ       = seoData.gscData.slice(0, 10).map((r: Record<string, unknown>) => r.query as string);

    // ── Step 5: Claude GEO scoring ──────────────────────────────────────────
    console.log("[geo-analyzer] Step 5: Claude GEO scoring (with QA + RAG + GBP)...");
    const scored = await scoreWithClaude(
      domain, brandName, pageStats,
      seoData.backlinks as Record<string, unknown> | null,
      seoData.strategy  as Record<string, unknown> | null,
      technical, wikipedia, training,
      seoData.sitemaps as Array<Record<string, unknown>>,
      gscTopQ, perplexityInsights,
      qaResult, ragResult, gbp,
    );

    // ── Step 6: Claude progress analysis ────────────────────────────────────
    console.log("[geo-analyzer] Step 6: Claude progress analysis...");
    const progressAnalysis = await analyzeProgress(
      brandName, domain, qaResult, ragResult, scored.overallScore, scored.factors
    );

    // ── Assemble final result ────────────────────────────────────────────────
    const now = new Date(), expires = new Date(now.getTime() + CACHE_TTL_DAYS * 86400000);

    const analysis = {
      domain, clientId,
      overallScore:     scored.overallScore,
      factors:          scored.factors,
      topActions:       scored.topActions,
      geoStrategy:      scored.geoStrategy,
      progressAnalysis,
      qaTest: {
        tier: qaResult.tier, questionsCount: qaResult.questionsCount,
        citationRate: qaResult.citationRate, recommendationRate: qaResult.recommendationRate,
        topCitedBrands: qaResult.topCitedBrands,
        progressDirection: qaResult.progressDirection, progressDelta: qaResult.progressDelta,
        cacheHits: qaResult.cacheHits, freshTests: qaResult.freshTests,
        runDate: qaResult.runDate, isFromCache: qaResult.isFromCache, previousRun: qaResult.previousRun,
      },
      ragReadiness: ragResult ? {
        score: ragResult.score, answerablePct: ragResult.answerablePct,
        avgQualityScore: ragResult.avgQualityScore,
        contentStrengths: ragResult.contentStrengths, contentGaps: ragResult.contentGaps,
      } : null,
      gbp: gbp.isListed ? { name: gbp.name, rating: gbp.rating, reviewCount: gbp.reviewCount, types: gbp.types, businessStatus: gbp.businessStatus } : null,
      perplexityInsights: perplexityInsights ?? undefined,
      cachedAt: now.toISOString(), expiresAt: expires.toISOString(),
      source: "fresh" as const, dataReused: seoData.tables,
    };

    await saveCache(domain, clientId, analysis as Record<string, unknown>);

    const cfCallsEstimate = qaResult.isFromCache
      ? `0 (QA biweekly cache hit)`
      : `${Math.ceil(qaResult.freshTests / QA_BATCH_SIZE)} (QA) + ${Math.ceil(RAG_EVAL_QUESTIONS / 10) * 2 + 1} (RAG gen+eval)`;

    console.log(`[geo-analyzer] ✅ Done. GEO=${scored.overallScore}/100 | QA=${qaResult.citationRate}% | RAG=${ragResult?.score ?? "N/A"}/100 | GBP=${gbp.isListed ? "✅" : "❌"}`);

    return Response.json({
      success: true, data: analysis, cached: false,
      meta: {
        tier: tierNorm,
        qaQuestions: { count: qaResult.questionsCount, cacheHits: qaResult.cacheHits, freshTests: qaResult.freshTests, fromBiweeklyCache: qaResult.isFromCache },
        ragReadiness: { score: ragResult?.score, answerable: ragResult?.answerablePct, questionsEvaluated: ragResult?.questionScores?.length || 0 },
        gbpFound:     gbp.isListed,
        pagesAnalyzed:seoData.pages.length,
        tablesReused: seoData.tables,
        apiCalls: {
          perplexity: 3,
          claude:     `${qaResult.isFromCache ? 1 : 2} (${qaResult.isFromCache ? "scoring only" : "QA gen + scoring"}) + 1 (progress) = ${qaResult.isFromCache ? 2 : 3}`,
          cfWorkersAI:cfCallsEstimate,
          firecrawl:  0,
        },
        scores: {
          overall: scored.overallScore,
          citationRate: qaResult.citationRate,
          ragReadiness: ragResult?.score,
          perplexityTopic:      perplexityInsights?.topicRelevance.topicScore,
          perplexityVisibility: perplexityInsights?.brandVisibility.visibilityScore,
          perplexityDiscovery:  perplexityInsights?.platformDiscovery.discoveryScore,
        },
      },
    }, { headers: cors });

  } catch (err) {
    console.error("[geo-analyzer]", err.message);
    return Response.json({ success: false, error: err.message }, { status: 500, headers: cors });
  }
});
