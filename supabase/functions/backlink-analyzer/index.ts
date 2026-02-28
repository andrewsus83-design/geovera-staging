import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ───────────────────────────────────────────────────────────────────
const GEMINI_GATEWAY    = Deno.env.get("CF_AI_GATEWAY_GEMINI")!;  // Cloudflare cached
const GOOGLE_AI_KEY     = Deno.env.get("GOOGLE_AI_API_KEY")!;
const PERPLEXITY_KEY    = Deno.env.get("PERPLEXITY_API_KEY")!;
const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SK       = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CACHE_TTL_DAYS    = 30;  // Backlink data cached 30 days

const supabase = createClient(SUPABASE_URL, SUPABASE_SK);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface BacklinkEntry {
  url:    string;
  domain: string;
  title:  string;
  type:   "editorial" | "directory" | "social" | "forum" | "news" | "unknown";
}

interface BacklinkAnalysis {
  domain:          string;
  qualityScore:    number;   // 0–100 combined score
  gemini: {
    totalFound:       number;
    backlinks:        BacklinkEntry[];
    linkTypes:        Record<string, number>;
    anchorTexts:      string[];
    brandMentions:    number;
    topLinkingDomains:string[];
    dofollow:         number;
    nofollow:         number;
    summary:          string;
    searchQueries:    string[];
  };
  perplexity: {
    domainReputation: string;
    industryAuthority:string;
    brandStrength:    string;
    competitorGap:    string[];
    linkOpportunities:string[];
    citations:        string[];
    summary:          string;
    eeatSignals:      string[];
  };
  combined: {
    strengths:        string[];
    weaknesses:       string[];
    opportunities:    string[];
    topSources:       string[];
    actionItems:      string[];
  };
  cachedAt:  string;
  expiresAt: string;
  source:    "cache" | "fresh";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

function classifyLinkType(url: string, title: string): BacklinkEntry["type"] {
  const u = url.toLowerCase(), t = title.toLowerCase();
  if (/facebook|twitter|instagram|linkedin|youtube|tiktok|pinterest/.test(u)) return "social";
  if (/kompas|detik|tempo|cnbc|tribun|liputan6|kumparan|bisnis|cnnindonesia/.test(u)) return "news";
  if (/forum|diskusi|community|reddit|quora|kaskus/.test(u)) return "forum";
  if (/direktori|directory|listing|yellow|bisnis\.com|indonesiadir/.test(u)) return "directory";
  if (/blog|artikel|post|review/.test(t)) return "editorial";
  return "unknown";
}

function calcQualityScore(
  geminiFound: number,
  perplexityCitations: number,
  hasNews: boolean,
  hasEditorial: boolean,
  opportunities: number
): number {
  let score = 30; // baseline

  // Quantity signals
  if (geminiFound >= 50)  score += 20;
  else if (geminiFound >= 20) score += 12;
  else if (geminiFound >= 5)  score += 6;

  if (perplexityCitations >= 10) score += 15;
  else if (perplexityCitations >= 5) score += 8;
  else if (perplexityCitations >= 1) score += 4;

  // Quality signals
  if (hasNews)      score += 15;
  if (hasEditorial) score += 10;

  // Opportunities (more opportunities = weaker current position)
  if (opportunities > 5) score -= 5;

  return Math.min(100, Math.max(0, score));
}

// ─── GEMINI: Google Search Grounding ─────────────────────────────────────────
// Uses Google's actual index to find pages that link to / mention the domain.
// groundingChunks = real URLs from Google search results.
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeWithGemini(domain: string, brand: string): Promise<BacklinkAnalysis["gemini"]> {
  const prompt = `You are an expert SEO backlink analyst. Use Google Search to find backlink data for the domain: ${domain}

Search for:
1. Websites and pages that link to ${domain}
2. Brand mentions of "${brand}" and "${domain}" across the web
3. Directory listings and citations for ${domain}
4. News articles and editorial coverage mentioning ${domain}
5. Social media profiles and discussions about ${domain}

Analyze what you find and return ONLY this JSON (no markdown):
{
  "totalFound": <estimated number of backlinks/mentions found>,
  "topLinkingDomains": ["domain1.com", "domain2.com"],
  "linkTypes": {
    "editorial": <count>,
    "directory": <count>,
    "social": <count>,
    "news": <count>,
    "forum": <count>
  },
  "anchorTexts": ["text1", "text2"],
  "brandMentions": <total count including unlinked mentions>,
  "dofollow": <estimated dofollow count>,
  "nofollow": <estimated nofollow count>,
  "summary": "<2–3 sentence assessment of backlink profile quality>",
  "searchQueries": ["queries you searched to find this data"]
}`;

  const res = await fetch(
    `${GEMINI_GATEWAY}/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],  // Google Search Grounding
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const textPart = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  // Extract grounding chunks (actual URLs Google found)
  const groundingChunks: Array<{ web?: { uri: string; title: string } }> =
    data?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  const backlinks: BacklinkEntry[] = groundingChunks
    .filter(c => c.web?.uri && !c.web.uri.includes(domain))
    .map(c => ({
      url:    c.web!.uri,
      domain: extractDomain(c.web!.uri),
      title:  c.web!.title || "",
      type:   classifyLinkType(c.web!.uri, c.web!.title || ""),
    }));

  // Parse Gemini's JSON analysis
  let parsed: Partial<BacklinkAnalysis["gemini"]> = {};
  try {
    const clean = textPart.replace(/```json|```/g, "").trim();
    const jsonStart = clean.indexOf("{");
    const jsonEnd   = clean.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      parsed = JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
    }
  } catch { /* use defaults */ }

  // Merge grounding URLs into top linking domains
  const groundingDomains = [...new Set(backlinks.map(b => b.domain))];
  const topDomains = [
    ...new Set([...(parsed.topLinkingDomains || []), ...groundingDomains])
  ].slice(0, 10);

  console.log(`[gemini] Found ${backlinks.length} grounding chunks for ${domain}`);

  return {
    totalFound:        parsed.totalFound        ?? backlinks.length,
    backlinks:         backlinks.slice(0, 50),   // cap at 50
    linkTypes:         parsed.linkTypes         ?? {},
    anchorTexts:       parsed.anchorTexts       ?? [],
    brandMentions:     parsed.brandMentions     ?? 0,
    topLinkingDomains: topDomains,
    dofollow:          parsed.dofollow          ?? 0,
    nofollow:          parsed.nofollow          ?? 0,
    summary:           parsed.summary           ?? "Analysis completed via Google Search grounding.",
    searchQueries:     parsed.searchQueries     ?? [],
  };
}

// ─── PERPLEXITY: Deep Research ────────────────────────────────────────────────
// sonar-deep-research → comprehensive reputation + opportunity research
// Returns citations array = actual URLs Perplexity found
// ─────────────────────────────────────────────────────────────────────────────

async function analyzeWithPerplexity(domain: string, brand: string): Promise<BacklinkAnalysis["perplexity"]> {
  const prompt = `Analyze the complete online backlink profile, domain reputation, and authority signals for: ${domain} (brand: "${brand}")

Research and answer:
1. What is the domain's reputation and authority in its niche/industry?
2. Which high-authority websites link to or cite this domain?
3. What are the strongest E-E-A-T signals (expertise, authoritativeness, trustworthiness)?
4. How does it compare to key competitors for backlink authority?
5. What link-building opportunities exist (sites that link to competitors but not this domain)?
6. What is the brand's strength and recognition online?

Return ONLY JSON (no markdown):
{
  "domainReputation": "<assessment of overall domain reputation>",
  "industryAuthority": "<niche/industry authority level and context>",
  "brandStrength": "<brand recognition and online presence strength>",
  "eeatSignals": ["<signal1>", "<signal2>"],
  "competitorGap": ["<competitor that has stronger backlinks>"],
  "linkOpportunities": ["<site or tactic to get backlinks>"],
  "summary": "<3 sentence comprehensive assessment>"
}`;

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PERPLEXITY_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model:       "sonar-deep-research",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens:  1500,
      return_citations: true,
    }),
  });

  if (!res.ok) throw new Error(`Perplexity HTTP ${res.status}: ${await res.text()}`);

  const data    = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  const citations: string[] = data?.citations || [];

  let parsed: Partial<BacklinkAnalysis["perplexity"]> = {};
  try {
    const clean = content.replace(/```json|```/g, "").trim();
    const jsonStart = clean.indexOf("{");
    const jsonEnd   = clean.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      parsed = JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
    }
  } catch { /* use defaults */ }

  console.log(`[perplexity] ${citations.length} citations found for ${domain}`);

  return {
    domainReputation:  parsed.domainReputation  ?? "Research completed.",
    industryAuthority: parsed.industryAuthority ?? "Analysis available.",
    brandStrength:     parsed.brandStrength     ?? "Brand data collected.",
    eeatSignals:       parsed.eeatSignals       ?? [],
    competitorGap:     parsed.competitorGap     ?? [],
    linkOpportunities: parsed.linkOpportunities ?? [],
    citations,
    summary:           parsed.summary           ?? "Deep research completed.",
  };
}

// ─── COMBINE: Merge Gemini + Perplexity ──────────────────────────────────────

function combineInsights(
  domain: string,
  gemini: BacklinkAnalysis["gemini"],
  perplexity: BacklinkAnalysis["perplexity"]
): BacklinkAnalysis["combined"] {
  const strengths: string[]     = [];
  const weaknesses: string[]    = [];
  const opportunities: string[] = [];

  // Strengths
  if (gemini.totalFound >= 20)        strengths.push(`${gemini.totalFound}+ backlinks ditemukan di Google index`);
  if (gemini.brandMentions >= 10)     strengths.push(`${gemini.brandMentions} brand mentions di web`);
  if (gemini.linkTypes["news"] > 0)   strengths.push(`${gemini.linkTypes["news"]} backlink dari media/news`);
  if (perplexity.eeatSignals.length)  strengths.push(...perplexity.eeatSignals.slice(0, 2));
  if (gemini.dofollow > gemini.nofollow) strengths.push("Mayoritas backlink dofollow");

  // Weaknesses
  if (gemini.totalFound < 10)         weaknesses.push("Jumlah backlink masih rendah");
  if (gemini.linkTypes["editorial"] < 3) weaknesses.push("Sedikit editorial backlinks (butuh lebih banyak konten yang dikutip)");
  if (gemini.brandMentions < 5)       weaknesses.push("Brand awareness online masih rendah");
  if (!gemini.linkTypes["news"])      weaknesses.push("Belum ada coverage dari media/news");

  // Opportunities
  for (const opp of perplexity.linkOpportunities.slice(0, 3)) opportunities.push(opp);
  if (perplexity.competitorGap.length) opportunities.push(`Competitor gap: ${perplexity.competitorGap.slice(0, 2).join(", ")}`);

  // Top sources merged from both engines
  const topSources = [
    ...new Set([
      ...gemini.topLinkingDomains.slice(0, 5),
      ...perplexity.citations.map(extractDomain).slice(0, 5),
    ])
  ].filter(d => d && !d.includes(domain)).slice(0, 10);

  // Action items
  const actionItems: string[] = [
    ...perplexity.linkOpportunities.slice(0, 2),
    gemini.linkTypes["directory"] < 5 ? "Daftarkan ke direktori bisnis lokal Indonesia (YellowPages, Qraved, dll)" : "",
    gemini.linkTypes["social"] < 3    ? "Aktifkan profil social media dan link ke website" : "",
    !gemini.linkTypes["news"]         ? "Kirim press release ke media lokal untuk mendapat backlink news" : "",
  ].filter(Boolean).slice(0, 5);

  return { strengths, weaknesses, opportunities, topSources, actionItems };
}

// ─── CACHE ────────────────────────────────────────────────────────────────────

async function getCache(domain: string): Promise<BacklinkAnalysis | null> {
  const { data } = await supabase
    .from("backlink_cache")
    .select("analysis, expires_at")
    .eq("domain", domain)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null; // expired
  return { ...data.analysis, source: "cache" };
}

async function saveCache(domain: string, clientId: string, analysis: BacklinkAnalysis): Promise<void> {
  await supabase.from("backlink_cache").upsert({
    domain,
    client_id:       clientId,
    analysis,
    quality_score:   analysis.qualityScore,
    total_backlinks: analysis.gemini.totalFound,
    cached_at:       new Date().toISOString(),
    expires_at:      new Date(Date.now() + CACHE_TTL_DAYS * 86400000).toISOString(),
  }, { onConflict: "domain" });
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
//
// POST { domain: "geovera.xyz", brand: "GeoVera", clientId: "uuid", force: false }
//   force: true → bypass cache, re-run full analysis
//
// Returns: BacklinkAnalysis
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { domain: rawDomain, brand, clientId = "default", force = false } = await req.json();
    if (!rawDomain) throw new Error("domain is required");

    // Normalize domain
    const domain = rawDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    const brandName = brand || domain.split(".")[0];

    console.log(`[backlink-analyzer] ${domain} (brand="${brandName}", force=${force})`);

    // ── CACHE CHECK (30 day TTL) ───────────────────────────────────────────
    if (!force) {
      const cached = await getCache(domain);
      if (cached) {
        console.log(`[backlink-analyzer] ✅ Cache HIT: ${domain} (expires ${cached.expiresAt})`);
        return Response.json({ success: true, data: cached, cached: true }, { headers: cors });
      }
    }

    console.log(`[backlink-analyzer] 🔄 Fresh analysis: ${domain}`);

    // ── RUN IN PARALLEL: Gemini + Perplexity ──────────────────────────────
    const [geminiResult, perplexityResult] = await Promise.allSettled([
      analyzeWithGemini(domain, brandName),
      analyzeWithPerplexity(domain, brandName),
    ]);

    const gemini: BacklinkAnalysis["gemini"] = geminiResult.status === "fulfilled"
      ? geminiResult.value
      : {
          totalFound: 0, backlinks: [], linkTypes: {}, anchorTexts: [],
          brandMentions: 0, topLinkingDomains: [], dofollow: 0, nofollow: 0,
          summary: `Gemini error: ${(geminiResult as PromiseRejectedResult).reason}`,
          searchQueries: [],
        };

    const perplexity: BacklinkAnalysis["perplexity"] = perplexityResult.status === "fulfilled"
      ? perplexityResult.value
      : {
          domainReputation: "Analysis unavailable",
          industryAuthority: "", brandStrength: "",
          eeatSignals: [], competitorGap: [], linkOpportunities: [],
          citations: [],
          summary: `Perplexity error: ${(perplexityResult as PromiseRejectedResult).reason}`,
        };

    // ── COMBINE + SCORE ────────────────────────────────────────────────────
    const combined = combineInsights(domain, gemini, perplexity);

    const hasNews      = (gemini.linkTypes["news"] || 0) > 0;
    const hasEditorial = (gemini.linkTypes["editorial"] || 0) > 0;
    const qualityScore = calcQualityScore(
      gemini.totalFound,
      perplexity.citations.length,
      hasNews,
      hasEditorial,
      combined.opportunities.length
    );

    const now      = new Date();
    const expires  = new Date(now.getTime() + CACHE_TTL_DAYS * 86400000);

    const analysis: BacklinkAnalysis = {
      domain,
      qualityScore,
      gemini,
      perplexity,
      combined,
      cachedAt:  now.toISOString(),
      expiresAt: expires.toISOString(),
      source:    "fresh",
    };

    // ── SAVE TO CACHE ──────────────────────────────────────────────────────
    await saveCache(domain, clientId, analysis);

    console.log(`[backlink-analyzer] ✅ Done: ${domain} score=${qualityScore}`);

    return Response.json({
      success: true,
      data:    analysis,
      cached:  false,
      engines: {
        gemini:     geminiResult.status === "fulfilled" ? "ok" : "error",
        perplexity: perplexityResult.status === "fulfilled" ? "ok" : "error",
      },
    }, { headers: cors });

  } catch (err) {
    console.error("[backlink-analyzer]", err.message);
    return Response.json({ success: false, error: err.message }, { status: 500, headers: cors });
  }
});
