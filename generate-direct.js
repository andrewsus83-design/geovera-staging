#!/usr/bin/env node

// Direct Supabase call WITHOUT CDN caching
// Uses SERVICE ROLE KEY which bypasses Cloudflare CDN
// Usage: node generate-direct.js "Brand Name" "Country"

const fs = require('fs');
const path = require('path');

const brandName = process.argv[2];
const country = process.argv[3];

if (!brandName || !country) {
  console.error('Usage: node generate-direct.js "Brand Name" "Country"');
  process.exit(1);
}

console.log(`\n🚀 Generating report (DIRECT, NO CDN): ${brandName} (${country})\n`);

// CRITICAL: Use SERVICE ROLE KEY to bypass CDN
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vozjwptzutolvkvfpknk.supabase.co';

// This key bypasses Cloudflare CDN!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvemp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg4MjQ3NywiZXhwIjoyMDg1NDU4NDc3fQ.Tc3_VDzEkDUlXx6xM5-xQ3gKLYqp5PEbh4mI3Xo4Ork';

async function generateReport() {
  try {
    console.log('📡 Calling Supabase with SERVICE ROLE (bypasses CDN)...');
    console.log(`   URL: ${SUPABASE_URL}/functions/v1/onboarding-workflow`);
    console.log(`   Auth: Service Role Key (first 20 chars): ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
    console.log('');

    const startTime = Date.now();

    const response = await fetch(`${SUPABASE_URL}/functions/v1/onboarding-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // SERVICE ROLE bypasses CDN!
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ brand_name: brandName, country }),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`Report generation failed: ${result.error || 'Unknown error'}`);
    }

    console.log(`✅ Report generated in ${elapsed}s!`);

    // Check if HTML content exists
    if (!result.html_content) {
      console.warn('⚠️  No HTML content in response.');
      throw new Error('No HTML content returned from API');
    }

    // Generate slug
    const slug = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Save to multiple locations
    const locations = [
      path.join(__dirname, 'frontend', 'reports', `${slug}.html`),
      path.join(__dirname, 'public', 'reports', `${slug}.html`),
      path.join(__dirname, 'report-html', `${slug}.html`),
    ];

    let savedCount = 0;
    for (const reportPath of locations) {
      try {
        const dir = path.dirname(reportPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(reportPath, result.html_content, 'utf8');
        console.log(`💾 Saved to: ${reportPath}`);
        savedCount++;
      } catch (err) {
        console.warn(`⚠️  Could not save to ${reportPath}: ${err.message}`);
      }
    }

    if (savedCount === 0) {
      throw new Error('Failed to save HTML to any location');
    }

    console.log(`\n✅ SUCCESS! Report saved to ${savedCount} location(s)`);
    console.log(`\n📊 Report Details:`);
    console.log(`   Brand: ${brandName}`);
    console.log(`   Country: ${country}`);
    console.log(`   Slug: ${slug}`);
    console.log(`   Size: ${(result.html_content.length / 1024).toFixed(1)} KB`);
    console.log(`   Generation Time: ${elapsed}s`);

    console.log(`\n🔗 URLs:`);
    console.log(`   Local: file://${locations[0]}`);
    console.log(`   Vercel (after git push): https://geovera-staging.vercel.app/reports/${slug}.html`);

    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Open: open ${locations[2]}`);
    console.log(`   2. Or open: ./open-report.sh ${slug}`);
    console.log(`   3. To deploy: git add . && git commit -m "Add ${slug} report" && git push`);
    console.log('');

    return {
      success: true,
      slug,
      paths: locations.filter((p, i) => i < savedCount),
    };

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    process.exit(1);
  }
}

generateReport();
