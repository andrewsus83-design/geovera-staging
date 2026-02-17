// Vercel Edge Function - Generate Brand Intelligence Report
// This is a WRAPPER that calls Supabase function and handles file saving
// URL: https://geovera-staging.vercel.app/api/generate-report

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

export const config = {
  runtime: 'nodejs',
  maxDuration: 300, // 5 minutes
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { brand_name, country } = req.body;

    // Validation
    if (!brand_name) {
      return res.status(400).json({ success: false, error: 'brand_name is required' });
    }

    if (!country) {
      return res.status(400).json({ success: false, error: 'country is required' });
    }

    console.log(`[Vercel API] Generating report for: ${brand_name} (${country})`);

    // Call Supabase Edge Function as backend
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vozjwptzutolvkvfpknk.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_ANON_KEY not configured');
    }

    console.log('[Vercel API] Calling Supabase function...');

    const startTime = Date.now();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/onboarding-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ brand_name, country }),
      signal: AbortSignal.timeout(280000), // 280 seconds (less than maxDuration)
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Vercel API] Supabase responded in ${elapsed}s`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Vercel API] Supabase error:', errorText);
      throw new Error(`Supabase function failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      console.error('[Vercel API] Generation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Report generation failed',
      });
    }

    console.log('[Vercel API] Report generated successfully');

    // Check if HTML content exists
    if (!result.html_content) {
      console.warn('[Vercel API] No HTML content in response');
      return res.status(500).json({
        success: false,
        error: 'No HTML content returned from generation',
      });
    }

    // Generate slug
    const slug = brand_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Save HTML to public/reports/ folder
    const publicDir = path.join(process.cwd(), 'public', 'reports');
    const reportPath = path.join(publicDir, `${slug}.html`);

    console.log(`[Vercel API] Saving HTML to: ${reportPath}`);

    try {
      // Ensure directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // Write HTML file
      fs.writeFileSync(reportPath, result.html_content, 'utf8');

      console.log(`[Vercel API] File saved successfully (${(result.html_content.length / 1024).toFixed(1)} KB)`);

    } catch (fileError: any) {
      console.error('[Vercel API] File save error:', fileError);
      // Don't fail the request, just log the error
      // Return success with note about file save failure
      return res.status(200).json({
        success: true,
        html_content: result.html_content,
        report_url: `https://geovera-staging.vercel.app/reports/${slug}.html`,
        slug,
        note: 'Report generated but file save failed. Re-deploy via git push to persist.',
        file_save_error: fileError.message,
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      report_url: `https://geovera-staging.vercel.app/reports/${slug}.html`,
      slug,
      brand_name,
      country,
      file_size_kb: (result.html_content.length / 1024).toFixed(1),
      generation_time_seconds: elapsed,
      message: `Report generated and saved successfully for ${brand_name}`,
      next_steps: [
        'Report is available immediately at the URL above',
        'For permanent hosting: git add public/reports/ && git commit && git push',
        'Vercel will automatically serve the file after deployment',
      ],
    });

  } catch (error: any) {
    console.error('[Vercel API] Error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
