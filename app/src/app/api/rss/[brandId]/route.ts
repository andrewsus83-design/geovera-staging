import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vozjwptzutolvkvfpknk.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BASE_URL = process.env.BASE_URL || "https://app.geovera.xyz";
const APP_URL  = process.env.APP_URL  || "https://app.geovera.xyz";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string | null): string {
  if (!date) return new Date().toUTCString();
  return new Date(date).toUTCString();
}

function buildCaption(article: Record<string, unknown>): string {
  const excerpt = (article.social_caption as string) || (article.excerpt as string) || "";
  const tags = (article.hashtags as string[]) || [];
  const hashtagLine = tags.length > 0
    ? "\n\n" + tags.map((t) => `#${t.replace(/^#/, "")}`).join(" ")
    : "";
  return `${excerpt}${hashtagLine}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;

  if (!brandId || !/^[0-9a-f-]{36}$/i.test(brandId)) {
    return new NextResponse("Invalid brandId", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: brand, error: brandErr } = await supabase
    .from("brands")
    .select("id, brand_name")
    .eq("id", brandId)
    .single();

  if (brandErr || !brand) {
    return new NextResponse("Brand not found", { status: 404 });
  }

  const { data: articles, error: artErr } = await supabase
    .from("gv_hub_articles")
    .select("id,slug,title,subtitle,article_type,category,excerpt,social_caption,hashtags,og_image_url,content_html,word_count,reading_time_min,published_at,created_at")
    .eq("brand_id", brandId)
    .eq("status", "published")
    .eq("rss_include", true)
    .order("published_at", { ascending: false })
    .limit(50);

  if (artErr) {
    console.error("[RSS] Article fetch error:", artErr);
    return new NextResponse("Failed to load feed", { status: 500 });
  }

  const items = articles || [];
  const feedUrl = `${BASE_URL}/api/rss/${brandId}`;
  const channelLink = `${APP_URL}/hub`;
  const lastBuildDate = items.length > 0 ? toRfc822(items[0].published_at as string) : new Date().toUTCString();
  const brandName = escapeXml(brand.brand_name as string);

  const itemsXml = items.map((a) => {
    const articleUrl = `${APP_URL}/hub/${escapeXml(a.slug as string)}`;
    const guid = `${APP_URL}/hub/${escapeXml(a.slug as string)}`;
    const caption = buildCaption(a as Record<string, unknown>);
    const pubDate = toRfc822((a.published_at as string) || (a.created_at as string));
    const imageXml = a.og_image_url
      ? `\n      <media:content url="${escapeXml(a.og_image_url as string)}" medium="image" width="1200" height="630"/>\n      <media:thumbnail url="${escapeXml(a.og_image_url as string)}"/>`
      : "";
    const categoryXml = a.category ? `<category>${escapeXml(a.category as string)}</category>` : "";
    return `
    <item>
      <title>${escapeXml(a.title as string || "Untitled")}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${caption}]]></description>
      <content:encoded><![CDATA[${(a.content_html as string) || ""}]]></content:encoded>
      ${categoryXml}${imageXml}
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${brandName} — GeoVera Hub</title>
    <link>${channelLink}</link>
    <description>AI-powered content feed from GeoVera for ${brandName}</description>
    <language>en-US</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>hello@geovera.xyz (GeoVera)</managingEditor>
    <generator>GeoVera AI Content Platform</generator>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      "X-Feed-Items": String(items.length),
    },
  });
}
