#!/usr/bin/env node

// Extract and save HTML reports from JSON responses
// Usage: node save-reports.js

const fs = require('fs');
const path = require('path');

const reports = [
  { name: 'Kata Oma', file: '/tmp/kata-oma-final.json', slug: 'kata-oma' },
  { name: 'TheWatchCo', file: '/tmp/thewatchco-final.json', slug: 'thewatchco' },
  { name: 'Indomie', file: '/tmp/indomie-final.json', slug: 'indomie' },
];

console.log('\n🔍 Checking generated reports...\n');

let successCount = 0;
let failCount = 0;

reports.forEach(report => {
  console.log(`📝 Processing ${report.name}...`);

  try {
    // Check if JSON file exists
    if (!fs.existsSync(report.file)) {
      console.log(`   ❌ JSON file not found: ${report.file}`);
      failCount++;
      return;
    }

    // Read JSON response
    const jsonContent = fs.readFileSync(report.file, 'utf8');

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(jsonContent);
    } catch (parseError) {
      console.log(`   ⚠️  Failed to parse JSON (still generating or error)`);
      console.log(`   File size: ${(jsonContent.length / 1024).toFixed(1)} KB`);
      failCount++;
      return;
    }

    // Check if generation was successful
    if (!data.success) {
      console.log(`   ❌ Generation failed: ${data.error || 'Unknown error'}`);
      failCount++;
      return;
    }

    // Check if HTML content exists
    if (!data.html_content) {
      console.log(`   ⚠️  No HTML content in response`);
      failCount++;
      return;
    }

    // Save HTML to file
    const reportPath = path.join(__dirname, 'frontend', 'reports', `${report.slug}.html`);
    fs.writeFileSync(reportPath, data.html_content, 'utf8');

    console.log(`   ✅ Saved to: ${reportPath}`);
    console.log(`   📏 Size: ${(data.html_content.length / 1024).toFixed(1)} KB`);
    console.log(`   🔗 URL: https://geovera-staging.vercel.app/reports/${report.slug}.html`);
    successCount++;

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failCount++;
  }

  console.log('');
});

console.log('═'.repeat(60));
console.log(`\n📊 Summary: ${successCount} succeeded, ${failCount} failed\n`);

if (successCount > 0) {
  console.log('✅ Next steps:');
  console.log('   1. git add frontend/reports/*.html');
  console.log('   2. git commit -m "Add enhanced reports with Content Studio"');
  console.log('   3. git push');
  console.log('   4. Wait ~30s for Vercel deployment');
  console.log('   5. Visit URLs above\n');
}

if (failCount > 0) {
  console.log('⏳ Some reports still generating. Run this script again in 60-90s.\n');
}
