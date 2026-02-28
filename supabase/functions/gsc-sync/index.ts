/**
 * gsc-sync — Google Search Console Data Sync (Partner Tier Only)
 *
 * Auth: Service Account JSON (stored as GSC_SERVICE_ACCOUNT_JSON secret)
 * Client setup: Add service account email as Owner in their GSC property
 *
 * Modes:
 *   full        → pull last 90 days (first sync)
 *   incremental → pull only since last sync date (weekly refresh)
 *   sitemaps    → refresh sitemap status only
 *   summary     → return dashboard stats without re-pulling
 *
 * Data pulled:
 *   searchAnalytics → query × page × device (clicks, impressions, CTR, position)
 *   sitemaps        → submitted sitemaps + index status
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Config ───────────────────────────────────────────────────────────────────
const GSC_SA_JSON   = Deno.env.get("GSC_SERVICE_ACCOUNT_JSON")!;
const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SK   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GSC_BASE      = "https://searchconsole.googleapis.com";
const BATCH_SIZE    = 500;     // rows per Supabase upsert
const MAX_GSC_ROWS  = 25000;   // GSC API max per request
const FULL_DAYS     = 90;      // days to pull on first sync
const INCR_OVERLAP  = 3;       // extra days overlap on incremental (GSC data can be late)

const supabase = createClient(SUPABASE_URL, SUPABASE_SK);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface GscRow {
  client_id:   string;
  site_url:    string;
  date:        string;
  query:       string;
  page:        string;
  device:      string;
  clicks:      number;
  impressions: number;
  ctr:         number;
  position:    number;
}

interface SyncSummary {
  clientId:      string;
  siteUrl:       string;
  mode:          string;
  dateFrom:      string;
  dateTo:        string;
  rowsSynced:    number;
  totalQueries:  number;
  totalPages:    number;
  topQueries:    Array<{ query: string; clicks: number; impressions: number; position: number }>;
  topPages:      Array<{ page: string; clicks: number; impressions: number }>;
  avgPosition:   number;
  totalClicks:   number;
  totalImpressions: number;
  deviceSplit:   Record<string, number>;
  sitemaps:      Array<{ url: string; errors: number; warnings: number }>;
  syncedAt:      string;
}

// ─── SERVICE ACCOUNT AUTH ─────────────────────────────────────────────────────
// Implements OAuth2 JWT Bearer flow for Google APIs
// No external library needed — uses Deno's built-in crypto.subtle
// ─────────────────────────────────────────────────────────────────────────────

function b64url(data: string | Uint8Array): string {
  const str = typeof data === "string" ? data : String.fromCharCode(...data);
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getGscAccessToken(): Promise<string> {
  const sa = JSON.parse(GSC_SA_JSON);

  // Strip PEM headers, decode base64 private key
  const pem = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");
  const keyBytes = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

  // Import RSA private key
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );

  const now   = Math.floor(Date.now() / 1000);
  const claim = {
    iss:   sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud:   "https://oauth2.googleapis.com/token",
    iat:   now,
    exp:   now + 3600,
  };

  const header  = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(JSON.stringify(claim));
  const input   = `${header}.${payload}`;

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey,
    new TextEncoder().encode(input)
  );

  const jwt = `${input}.${b64url(new Uint8Array(sig))}`;

  // Exchange JWT for access token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion:  jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`GSC auth failed: ${JSON.stringify(data)}`);
  console.log("[gsc-auth] ✅ Access token obtained");
  return data.access_token;
}

// ─── GSC API CALLS ────────────────────────────────────────────────────────────

function dateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
}

// Pull search analytics: query × page × device
async function pullSearchAnalytics(
  siteUrl: string,
  token: string,
  startDate: string,
  endDate: string,
  startRow = 0
): Promise<{ rows: GscRow[]; hasMore: boolean; rawCount: number }> {
  const encodedSite = encodeURIComponent(siteUrl);

  const res = await fetch(
    `${GSC_BASE}/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions:  ["query", "page", "device"],
        rowLimit:    MAX_GSC_ROWS,
        startRow,
        dataState:   "final",
        aggregationType: "byPage",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GSC searchAnalytics ${res.status}: ${err}`);
  }

  const data = await res.json();
  const rawRows = data.rows || [];
  const hasMore = rawRows.length === MAX_GSC_ROWS;

  return { rows: rawRows, hasMore, rawCount: rawRows.length };
}

// Pull sitemaps list
async function pullSitemaps(siteUrl: string, token: string) {
  const res = await fetch(
    `${GSC_BASE}/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`,
    { headers: { "Authorization": `Bearer ${token}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.sitemap || [];
}

// ─── DATA PROCESSING ──────────────────────────────────────────────────────────

function processGscRows(
  rawRows: Array<Record<string, unknown>>,
  clientId: string,
  siteUrl: string
): GscRow[] {
  return rawRows.map(row => {
    const keys = row.keys as string[];
    return {
      client_id:   clientId,
      site_url:    siteUrl,
      date:        keys[0] || "",      // GSC returns date as first key when dimension=date
      query:       keys[0] || "",      // query dimension
      page:        keys[1] || "",      // page dimension
      device:      keys[2] || "DESKTOP",
      clicks:      Number(row.clicks)      || 0,
      impressions: Number(row.impressions) || 0,
      ctr:         Number(row.ctr)         || 0,
      position:    Number(row.position)    || 0,
    };
  });
}

// Note: GSC dimensions order = [query, page, device] (no date in dimensions)
// GSC returns aggregate over date range, not per-day when date not in dimensions
// For per-day data, we pull with date dimension separately

async function pullDailyAnalytics(
  siteUrl: string,
  token: string,
  startDate: string,
  endDate: string,
  clientId: string
): Promise<GscRow[]> {
  const encodedSite = encodeURIComponent(siteUrl);
  const allRows: GscRow[] = [];
  let startRow = 0;
  let hasMore  = true;

  while (hasMore) {
    const res = await fetch(
      `${GSC_BASE}/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions:  ["date", "query", "page", "device"],
          rowLimit:    MAX_GSC_ROWS,
          startRow,
          dataState:   "final",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error(`[gsc] searchAnalytics error: ${err}`);
      break;
    }

    const data    = await res.json();
    const rawRows = data.rows || [];

    // Process: keys = [date, query, page, device]
    for (const row of rawRows) {
      const keys = row.keys as string[];
      allRows.push({
        client_id:   clientId,
        site_url:    siteUrl,
        date:        keys[0],
        query:       keys[1] || "",
        page:        keys[2] || "",
        device:      keys[3] || "DESKTOP",
        clicks:      Number(row.clicks)      || 0,
        impressions: Number(row.impressions) || 0,
        ctr:         Number(row.ctr)         || 0,
        position:    Number(row.position)    || 0,
      });
    }

    hasMore  = rawRows.length === MAX_GSC_ROWS;
    startRow += MAX_GSC_ROWS;

    if (hasMore) console.log(`[gsc] Paginating... fetched ${allRows.length} rows so far`);
  }

  return allRows;
}

// ─── SUPABASE UPSERT (batched) ────────────────────────────────────────────────

async function batchUpsert(rows: GscRow[]): Promise<number> {
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("gsc_search_analytics")
      .upsert(batch, { onConflict: "client_id,date,query,page,device" });
    if (error) console.error(`[gsc] Upsert batch error: ${error.message}`);
    else upserted += batch.length;
  }
  return upserted;
}

async function upsertSitemaps(clientId: string, siteUrl: string, sitemaps: Array<Record<string, unknown>>): Promise<void> {
  if (!sitemaps.length) return;

  const rows = sitemaps.map(sm => ({
    client_id:       clientId,
    site_url:        siteUrl,
    sitemap_url:     sm.path as string,
    type:            sm.type as string,
    last_submitted:  sm.lastSubmitted as string || null,
    last_downloaded: sm.lastDownloaded as string || null,
    warnings:        Number(sm.warnings) || 0,
    errors:          Number(sm.errors)   || 0,
    is_pending:      (sm.isPending as boolean)    || false,
    is_processing:   (sm.isProcessing as boolean) || false,
    contents:        sm.contents || null,
    synced_at:       new Date().toISOString(),
  }));

  await supabase.from("gsc_sitemaps").upsert(rows, { onConflict: "client_id,sitemap_url" });
}

// ─── DASHBOARD SUMMARY ────────────────────────────────────────────────────────

async function buildSummary(clientId: string, siteUrl: string, dateFrom: string, dateTo: string) {
  // Top queries by clicks
  const { data: topQ } = await supabase.rpc("gsc_top_queries", {
    p_client_id: clientId,
    p_date_from: dateFrom,
    p_date_to:   dateTo,
    p_limit:     10,
  }).select("*");

  // Fallback: direct query if RPC not available
  const { data: analytics } = await supabase
    .from("gsc_search_analytics")
    .select("query, page, device, clicks, impressions, position")
    .eq("client_id", clientId)
    .gte("date", dateFrom)
    .lte("date", dateTo);

  const rows = analytics || [];

  // Aggregate top queries
  const queryMap: Record<string, { clicks: number; impressions: number; posSum: number; count: number }> = {};
  const pageMap:  Record<string, { clicks: number; impressions: number }> = {};
  const deviceMap: Record<string, number> = {};
  let totalClicks = 0, totalImpressions = 0, posSum = 0, posCount = 0;

  for (const row of rows) {
    // Queries
    if (!queryMap[row.query]) queryMap[row.query] = { clicks: 0, impressions: 0, posSum: 0, count: 0 };
    queryMap[row.query].clicks      += row.clicks;
    queryMap[row.query].impressions += row.impressions;
    queryMap[row.query].posSum      += row.position;
    queryMap[row.query].count++;

    // Pages
    if (row.page) {
      if (!pageMap[row.page]) pageMap[row.page] = { clicks: 0, impressions: 0 };
      pageMap[row.page].clicks      += row.clicks;
      pageMap[row.page].impressions += row.impressions;
    }

    // Devices
    deviceMap[row.device] = (deviceMap[row.device] || 0) + row.impressions;

    // Totals
    totalClicks      += row.clicks;
    totalImpressions += row.impressions;
    if (row.position > 0) { posSum += row.position; posCount++; }
  }

  const topQueries = Object.entries(queryMap)
    .map(([query, d]) => ({ query, clicks: d.clicks, impressions: d.impressions, position: Math.round(d.posSum / d.count * 10) / 10 }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const topPages = Object.entries(pageMap)
    .map(([page, d]) => ({ page, clicks: d.clicks, impressions: d.impressions }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const { data: sitemapsData } = await supabase
    .from("gsc_sitemaps")
    .select("sitemap_url, errors, warnings")
    .eq("client_id", clientId);

  return {
    totalClicks,
    totalImpressions,
    avgPosition:   posCount > 0 ? Math.round(posSum / posCount * 10) / 10 : 0,
    totalQueries:  Object.keys(queryMap).length,
    totalPages:    Object.keys(pageMap).length,
    topQueries,
    topPages,
    deviceSplit:   deviceMap,
    sitemaps:      (sitemapsData || []).map(s => ({ url: s.sitemap_url, errors: s.errors, warnings: s.warnings })),
  };
}

// ─── SYNC STATUS HELPERS ──────────────────────────────────────────────────────

async function getSyncStatus(clientId: string) {
  const { data } = await supabase
    .from("gsc_sync_status")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();
  return data;
}

async function updateSyncStatus(clientId: string, siteUrl: string, update: Record<string, unknown>): Promise<void> {
  await supabase.from("gsc_sync_status").upsert({
    client_id: clientId,
    site_url:  siteUrl,
    ...update,
  }, { onConflict: "client_id" });
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
//
// POST {
//   clientId: "uuid",
//   siteUrl:  "sc-domain:geovera.xyz" | "https://geovera.xyz/",
//   mode:     "full" | "incremental" | "sitemaps" | "summary"
// }
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { clientId, siteUrl, mode = "incremental" } = await req.json();
    if (!clientId) throw new Error("clientId is required");
    if (!siteUrl)  throw new Error("siteUrl is required");

    console.log(`[gsc-sync] ${clientId} | ${siteUrl} | mode=${mode}`);

    // ── MODE: SUMMARY (no API calls, just read from Supabase) ─────────────
    if (mode === "summary") {
      const status  = await getSyncStatus(clientId);
      if (!status?.last_sync_at) {
        return Response.json({ success: false, error: "No data synced yet. Run mode=full first." }, { status: 400, headers: cors });
      }
      const summary = await buildSummary(clientId, siteUrl, status.date_from, status.date_to);
      return Response.json({ success: true, mode: "summary", ...summary, lastSyncAt: status.last_sync_at }, { headers: cors });
    }

    // ── AUTH: Get GSC access token ─────────────────────────────────────────
    const token = await getGscAccessToken();

    // ── MODE: SITEMAPS ONLY ────────────────────────────────────────────────
    if (mode === "sitemaps") {
      const sitemaps = await pullSitemaps(siteUrl, token);
      await upsertSitemaps(clientId, siteUrl, sitemaps);
      return Response.json({ success: true, mode: "sitemaps", sitemapsFound: sitemaps.length }, { headers: cors });
    }

    // ── DETERMINE DATE RANGE ───────────────────────────────────────────────
    const dateTo = daysAgo(2);  // GSC data is 2 days delayed

    let dateFrom: string;
    if (mode === "full") {
      dateFrom = daysAgo(FULL_DAYS);
      console.log(`[gsc-sync] FULL sync: ${dateFrom} → ${dateTo}`);
    } else {
      // Incremental: since last sync (with overlap for late data)
      const status = await getSyncStatus(clientId);
      if (status?.date_to) {
        const lastDate = new Date(status.date_to);
        lastDate.setDate(lastDate.getDate() - INCR_OVERLAP);
        dateFrom = dateStr(lastDate);
        console.log(`[gsc-sync] INCREMENTAL: ${dateFrom} → ${dateTo} (${INCR_OVERLAP}d overlap)`);
      } else {
        // No previous sync → do full
        dateFrom = daysAgo(FULL_DAYS);
        console.log(`[gsc-sync] No previous sync found → FULL sync: ${dateFrom} → ${dateTo}`);
      }
    }

    // Update status to processing
    await updateSyncStatus(clientId, siteUrl, {
      last_sync_status: "processing",
      date_from:        dateFrom,
      date_to:          dateTo,
    });

    // ── PULL SEARCH ANALYTICS ──────────────────────────────────────────────
    console.log("[gsc-sync] Pulling search analytics...");
    const rows = await pullDailyAnalytics(siteUrl, token, dateFrom, dateTo, clientId);
    console.log(`[gsc-sync] Got ${rows.length} rows from GSC`);

    // ── PULL SITEMAPS ──────────────────────────────────────────────────────
    console.log("[gsc-sync] Pulling sitemaps...");
    const sitemaps = await pullSitemaps(siteUrl, token);
    await upsertSitemaps(clientId, siteUrl, sitemaps);

    // ── UPSERT TO SUPABASE (batched) ───────────────────────────────────────
    console.log("[gsc-sync] Upserting to Supabase...");
    const upserted = await batchUpsert(rows);
    console.log(`[gsc-sync] Upserted ${upserted} rows`);

    // ── BUILD SUMMARY ──────────────────────────────────────────────────────
    const summary = await buildSummary(clientId, siteUrl, dateFrom, dateTo);

    // ── UPDATE SYNC STATUS ─────────────────────────────────────────────────
    await updateSyncStatus(clientId, siteUrl, {
      last_sync_at:     new Date().toISOString(),
      last_sync_status: "success",
      rows_synced:      upserted,
      total_queries:    summary.totalQueries,
      total_pages:      summary.totalPages,
      date_from:        dateFrom,
      date_to:          dateTo,
      error:            null,
    });

    // ── REGISTER CONNECTED SITE ────────────────────────────────────────────
    const domain = siteUrl.replace(/^sc-domain:|^https?:\/\/|^www\.|\/$/g, "");
    await supabase.from("gsc_connected_sites").upsert({
      client_id:    clientId,
      site_url:     siteUrl,
      domain,
      connected_at: new Date().toISOString(),
      is_active:    true,
    }, { onConflict: "client_id" });

    console.log(`[gsc-sync] ✅ Done. ${upserted} rows | ${summary.totalQueries} queries | ${summary.totalPages} pages`);

    return Response.json({
      success: true,
      mode,
      sync: {
        dateFrom,
        dateTo,
        rowsSynced:   upserted,
        sitemapsFound: sitemaps.length,
        syncedAt:     new Date().toISOString(),
      },
      summary: {
        totalClicks:      summary.totalClicks,
        totalImpressions: summary.totalImpressions,
        avgPosition:      summary.avgPosition,
        totalQueries:     summary.totalQueries,
        totalPages:       summary.totalPages,
        deviceSplit:      summary.deviceSplit,
        topQueries:       summary.topQueries.slice(0, 5),
        topPages:         summary.topPages.slice(0, 5),
        sitemaps:         summary.sitemaps,
      },
    }, { headers: cors });

  } catch (err) {
    console.error("[gsc-sync] Error:", err.message);

    // Update status to failed if we have clientId
    try {
      const body = await new Request(req.url).json().catch(() => ({}));
      if (body?.clientId) {
        await updateSyncStatus(body.clientId, body.siteUrl || "", {
          last_sync_status: "failed",
          error: err.message,
        });
      }
    } catch { /* ignore */ }

    return Response.json({ success: false, error: err.message }, { status: 500, headers: cors });
  }
});
