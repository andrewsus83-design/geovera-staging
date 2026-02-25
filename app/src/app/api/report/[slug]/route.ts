import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return new NextResponse("Missing report slug", { status: 400 });
  }

  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  if (!safeSlug) {
    return new NextResponse("Invalid report slug", { status: 400 });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || "https://vozjwptzutolvkvfpknk.supabase.co";
  const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/reports/report-html/${safeSlug}.html`;

  try {
    const response = await fetch(storageUrl);

    if (!response.ok) {
      const html404 = `<!DOCTYPE html>
        <html><head><title>Report Not Found</title>
        <style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;color:#374151;text-align:center;}
        .c{max-width:400px;}.h{font-size:72px;color:#16a34a;margin-bottom:16px;}.t{font-size:24px;font-weight:700;margin-bottom:8px;}.s{color:#6b7280;}</style>
        </head><body><div class="c"><div class="h">404</div><div class="t">Report Not Found</div><p class="s">The report "${safeSlug}" has not been generated yet.</p></div></body></html>`;
      return new NextResponse(html404, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const html = await response.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[Report API] Error:", error);
    return new NextResponse("Failed to load report", { status: 500 });
  }
}
