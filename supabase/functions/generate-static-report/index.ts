import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportData {
  brand_name: string;
  parent_company: string;
  category: string;
  country: string;
  generated_at: string;
  report_markdown: string;
}

function generateStaticHTML(data: ReportData): string {
  // Convert markdown to HTML (simple conversion)
  let htmlContent = data.report_markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\|/g, '</td><td>')  // Simple table support
    .replace(/<br>---<br>/g, '<hr>');

  htmlContent = '<p>' + htmlContent + '</p>';

  const formattedDate = new Date(data.generated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.brand_name} Intelligence Report | GeoVera</title>
    <meta name="description" content="${data.brand_name} brand intelligence report powered by AI - ${data.category}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Georgia:wght@400;700&display=swap" rel="stylesheet">

    <style>
        :root {
            --gv-green-500: #16a34a;
            --gv-green-600: #15803d;
            --gv-green-700: #166534;
            --gv-green-50: #f0fdf4;
            --gv-gray-50: #f9fafb;
            --gv-gray-100: #f2f4f7;
            --gv-gray-700: #344054;
            --gv-gray-800: #1d2939;
            --gv-gray-900: #101828;
            --font-sans: 'Inter', sans-serif;
            --font-serif: 'Georgia', serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-sans);
            line-height: 1.7;
            color: var(--gv-gray-800);
            background: var(--gv-gray-50);
            -webkit-font-smoothing: antialiased;
        }

        .report-header {
            background: white;
            border-bottom: 3px solid var(--gv-green-500);
            padding: 24px;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .header-content {
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
        }

        .logo-icon {
            width: 36px;
            height: 36px;
            background: var(--gv-green-500);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-serif);
            font-size: 20px;
            font-weight: 700;
            color: white;
        }

        .logo-text {
            font-family: var(--font-serif);
            font-size: 20px;
            font-weight: 700;
            color: var(--gv-gray-900);
        }

        .header-actions {
            display: flex;
            gap: 12px;
        }

        .btn {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
        }

        .btn-primary {
            background: var(--gv-green-500);
            color: white;
        }

        .btn-primary:hover {
            background: var(--gv-green-600);
        }

        .btn-secondary {
            background: white;
            color: var(--gv-gray-700);
            border: 1px solid var(--gv-gray-300);
        }

        .btn-secondary:hover {
            background: var(--gv-gray-50);
        }

        .report-container {
            max-width: 900px;
            margin: 40px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            overflow: hidden;
        }

        .report-meta {
            background: linear-gradient(135deg, var(--gv-green-500) 0%, var(--gv-green-700) 100%);
            color: white;
            padding: 32px;
        }

        .report-meta h1 {
            font-family: var(--font-serif);
            font-size: 2.5rem;
            margin-bottom: 12px;
        }

        .report-meta .meta-info {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
            font-size: 14px;
            opacity: 0.95;
        }

        .report-content {
            padding: 48px;
        }

        .report-content h2 {
            font-family: var(--font-serif);
            font-size: 2rem;
            color: var(--gv-gray-900);
            margin: 48px 0 24px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--gv-green-500);
        }

        .report-content h2:first-child {
            margin-top: 0;
        }

        .report-content h3 {
            font-size: 1.4rem;
            color: var(--gv-gray-800);
            margin: 32px 0 16px;
        }

        .report-content p {
            margin-bottom: 16px;
            line-height: 1.8;
            color: var(--gv-gray-700);
        }

        .report-content ul, .report-content ol {
            margin: 16px 0 16px 24px;
        }

        .report-content li {
            margin-bottom: 8px;
            line-height: 1.7;
        }

        .report-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            border: 1px solid var(--gv-gray-200);
            border-radius: 8px;
            overflow: hidden;
        }

        .report-content thead {
            background: var(--gv-green-500);
            color: white;
        }

        .report-content th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
        }

        .report-content td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--gv-gray-100);
        }

        .report-content tr:last-child td {
            border-bottom: none;
        }

        .report-content strong {
            color: var(--gv-gray-900);
            font-weight: 600;
        }

        .report-content hr {
            border: none;
            border-top: 2px solid var(--gv-gray-200);
            margin: 32px 0;
        }

        .report-footer {
            background: var(--gv-gray-900);
            color: var(--gv-gray-400);
            padding: 32px 24px;
            text-align: center;
        }

        .report-footer p {
            font-size: 14px;
            margin-bottom: 8px;
        }

        .report-footer a {
            color: var(--gv-green-500);
            text-decoration: none;
        }

        @media print {
            .report-header, .report-footer, .btn {
                display: none;
            }
            .report-container {
                box-shadow: none;
                margin: 0;
            }
        }

        @media (max-width: 768px) {
            .report-meta h1 {
                font-size: 2rem;
            }

            .report-content {
                padding: 24px;
            }

            .header-content {
                flex-direction: column;
                gap: 16px;
            }
        }
    </style>
</head>
<body>
    <header class="report-header">
        <div class="header-content">
            <a href="https://geovera-staging.vercel.app" class="logo">
                <div class="logo-icon">G</div>
                <span class="logo-text">GeoVera</span>
            </a>
            <div class="header-actions">
                <button class="btn btn-secondary" onclick="window.print()">📄 Download PDF</button>
                <a href="https://geovera-staging.vercel.app/onboarding" class="btn btn-primary">Get Your Report</a>
            </div>
        </div>
    </header>

    <div class="report-container">
        <div class="report-meta">
            <h1>${data.brand_name} Intelligence Report</h1>
            <div class="meta-info">
                <span>🏢 ${data.parent_company}</span>
                <span>📦 ${data.category}</span>
                <span>📅 ${formattedDate}</span>
            </div>
        </div>

        <div class="report-content">
            ${htmlContent}
        </div>
    </div>

    <footer class="report-footer">
        <p>© 2026 GeoVera Intelligence Platform</p>
        <p>Powered by Perplexity, Gemini, Claude & GPT-4o</p>
        <p><a href="https://geovera-staging.vercel.app">Get your brand intelligence report →</a></p>
    </footer>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { brand_name, parent_company, category, country, report_markdown } = await req.json();

    if (!brand_name || !report_markdown) {
      throw new Error('brand_name and report_markdown are required');
    }

    const reportData: ReportData = {
      brand_name,
      parent_company: parent_company || 'N/A',
      category: category || 'N/A',
      country: country || 'N/A',
      generated_at: new Date().toISOString(),
      report_markdown
    };

    // Generate static HTML
    const staticHTML = generateStaticHTML(reportData);

    // Generate slug for filename
    const slug = brand_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        html: staticHTML,
        html_length: staticHTML.length,
        filename: `${slug}.html`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
