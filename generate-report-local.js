#!/usr/bin/env node

// Local report generation script (bypasses Supabase)
// Usage: node generate-report-local.js "Brand Name" "Country"

const fs = require('fs');
const path = require('path');

const brandName = process.argv[2];
const country = process.argv[3];

if (!brandName || !country) {
  console.error('Usage: node generate-report-local.js "Brand Name" "Country"');
  process.exit(1);
}

console.log(`\n🚀 Generating report for: ${brandName} (${country})\n`);

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vozjwptzutolvkvfpknk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvemp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODI0NzcsImV4cCI6MjA4NTQ1ODQ3N30.p-RiTR1Iva9Y4KiZu8gnF2CZjvnMWNAHUVCbp57PDF8';

async function generateReport() {
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
      console.warn('⚠️  No HTML content in response.');
      throw new Error('No HTML content returned from API');
    }

    // Generate slug
    const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Save HTML to file
    const reportPath = path.join(__dirname, 'frontend', 'reports', `${slug}.html`);

    console.log(`💾 Saving HTML to: ${reportPath}`);

    fs.writeFileSync(reportPath, result.html_content, 'utf8');

    console.log(`\n✅ SUCCESS! Report saved!`);
    console.log(`   Local: ${reportPath}`);
    console.log(`   URL:   https://geovera-staging.vercel.app/reports/${slug}.html`);
    console.log(`\n📝 File size: ${(result.html_content.length / 1024).toFixed(1)} KB`);
    console.log(`\nℹ️  Deploy to Vercel: git add . && git commit -m "Add ${slug} report" && git push\n`);

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    process.exit(1);
  }
}

generateReport();
