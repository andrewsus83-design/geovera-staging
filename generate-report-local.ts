#!/usr/bin/env -S deno run --allow-net --allow-env --allow-write --allow-read

// Local report generation script (bypasses Supabase)
// Usage: deno run --allow-all generate-report-local.ts "Brand Name" "Country"

const brandName = Deno.args[0];
const country = Deno.args[1];

if (!brandName || !country) {
  console.error('Usage: deno run --allow-all generate-report-local.ts "Brand Name" "Country"');
  Deno.exit(1);
}

console.log(`\n🚀 Generating report for: ${brandName} (${country})\n`);

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://vozjwptzutolvkvfpknk.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvemp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODI0NzcsImV4cCI6MjA4NTQ1ODQ3N30.p-RiTR1Iva9Y4KiZu8gnF2CZjvnMWNAHUVCbp57PDF8';

try {
  // Call onboarding-workflow function
  console.log('📡 Calling onboarding-workflow API...');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/onboarding-workflow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ brand_name: brandName, country }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Report generation failed: ${result.error || 'Unknown error'}`);
  }

  console.log('✅ Report generated successfully!');

  // Check if HTML content exists
  if (!result.html_content) {
    console.warn('⚠️  No HTML content in response. Full response:');
    console.log(JSON.stringify(result, null, 2));
    throw new Error('No HTML content returned from API');
  }

  // Generate slug
  const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Save HTML to file
  const reportPath = `./frontend/reports/${slug}.html`;

  console.log(`💾 Saving HTML to: ${reportPath}`);

  await Deno.writeTextFile(reportPath, result.html_content);

  console.log(`\n✅ SUCCESS! Report saved to:`);
  console.log(`   Local: ${reportPath}`);
  console.log(`   URL:   https://geovera-staging.vercel.app/reports/${slug}.html`);
  console.log(`\nℹ️  Note: You need to commit and push to git for the URL to work on Vercel\n`);

} catch (error) {
  console.error(`\n❌ ERROR: ${error.message}\n`);
  Deno.exit(1);
}
