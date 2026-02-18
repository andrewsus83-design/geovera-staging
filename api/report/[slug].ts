import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).send('Missing report slug');
  }

  // Sanitize slug
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  if (!safeSlug) {
    return res.status(400).send('Invalid report slug');
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vozjwptzutolvkvfpknk.supabase.co';
  const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/reports/${safeSlug}.html`;

  try {
    const response = await fetch(storageUrl);

    if (!response.ok) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html><head><title>Report Not Found</title>
        <style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb;color:#374151;text-align:center;}
        .c{max-width:400px;}.h{font-size:72px;color:#16a34a;margin-bottom:16px;}.t{font-size:24px;font-weight:700;margin-bottom:8px;}.s{color:#6b7280;}</style>
        </head><body><div class="c"><div class="h">404</div><div class="t">Report Not Found</div><p class="s">The report "${safeSlug}" has not been generated yet.</p><p><a href="https://geovera.xyz/onboarding" style="color:#16a34a;font-weight:600;">Generate a report →</a></p></div></body></html>
      `);
    }

    const html = await response.text();

    // Cache for 1 hour, revalidate in background
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (error: any) {
    console.error('[Report API] Error:', error);
    return res.status(500).send('Failed to load report');
  }
}
