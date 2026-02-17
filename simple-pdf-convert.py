#!/usr/bin/env python3
"""
Simple Markdown to HTML conversion for AQUVIVA report
Will create HTML file that can be printed to PDF from browser
"""

import re
import sys

def convert_md_to_html(md_file, html_file):
    """Convert markdown to styled HTML"""

    # Read markdown content
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Simple markdown parsing
    html_body = md_content

    # Convert headers
    html_body = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html_body, flags=re.MULTILINE)
    html_body = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html_body, flags=re.MULTILINE)
    html_body = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html_body, flags=re.MULTILINE)

    # Convert bold
    html_body = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_body)

    # Convert italic
    html_body = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html_body)

    # Convert lists
    html_body = re.sub(r'^• (.*?)$', r'<li>\1</li>', html_body, flags=re.MULTILINE)
    html_body = re.sub(r'(<li>.*?</li>\n)+', r'<ul>\g<0></ul>', html_body, flags=re.DOTALL)

    # Convert horizontal rules
    html_body = re.sub(r'^---$', r'<hr>', html_body, flags=re.MULTILINE)

    # Convert paragraphs
    html_body = re.sub(r'\n\n', r'</p><p>', html_body)
    html_body = '<p>' + html_body + '</p>'

    # Clean up
    html_body = re.sub(r'<p>\s*<h', r'<h', html_body)
    html_body = re.sub(r'</h([123])>\s*</p>', r'</h\1>', html_body)
    html_body = re.sub(r'<p>\s*<hr>\s*</p>', r'<hr>', html_body)
    html_body = re.sub(r'<p>\s*<ul>', r'<ul>', html_body)
    html_body = re.sub(r'</ul>\s*</p>', r'</ul>', html_body)
    html_body = re.sub(r'<p>\s*</p>', r'', html_body)

    # Create full HTML document
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AQUVIVA Brand Intelligence Report - GeoVera</title>
    <style>
        @page {{
            size: A4;
            margin: 2cm;
        }}

        @media print {{
            body {{
                margin: 0;
                padding: 0;
            }}

            .no-print {{
                display: none !important;
            }}

            h1, h2, h3 {{
                page-break-after: avoid;
            }}

            ul, ol, table {{
                page-break-inside: avoid;
            }}
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            line-height: 1.7;
            color: #1a1a1a;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #ffffff;
            font-size: 11pt;
        }}

        .header {{
            text-align: center;
            background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%);
            color: white;
            padding: 40px 30px;
            border-radius: 15px;
            margin-bottom: 50px;
            box-shadow: 0 10px 30px rgba(26, 86, 219, 0.2);
        }}

        .header h1 {{
            font-size: 42pt;
            margin-bottom: 10px;
            font-weight: 700;
            letter-spacing: -1px;
        }}

        .header p {{
            font-size: 12pt;
            opacity: 0.95;
            margin: 5px 0;
        }}

        h1 {{
            color: #1a56db;
            font-size: 32pt;
            margin: 50px 0 20px 0;
            border-bottom: 4px solid #1a56db;
            padding-bottom: 15px;
            font-weight: 700;
        }}

        h2 {{
            color: #1a56db;
            font-size: 20pt;
            margin: 40px 0 20px 0;
            border-left: 6px solid #1a56db;
            padding-left: 20px;
            font-weight: 600;
        }}

        h3 {{
            color: #2d3748;
            font-size: 15pt;
            margin: 30px 0 15px 0;
            font-weight: 600;
        }}

        p {{
            margin: 15px 0;
            text-align: justify;
            line-height: 1.8;
        }}

        ul {{
            margin: 15px 0;
            padding-left: 0;
            list-style: none;
        }}

        li {{
            margin: 10px 0;
            padding-left: 30px;
            position: relative;
        }}

        li:before {{
            content: "▸";
            position: absolute;
            left: 10px;
            color: #1a56db;
            font-weight: bold;
        }}

        strong {{
            color: #1a56db;
            font-weight: 600;
        }}

        em {{
            font-style: italic;
            color: #4a5568;
        }}

        hr {{
            border: none;
            border-top: 2px solid #e2e8f0;
            margin: 40px 0;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10pt;
        }}

        th, td {{
            border: 1px solid #cbd5e0;
            padding: 12px;
            text-align: left;
        }}

        th {{
            background-color: #1a56db;
            color: white;
            font-weight: 600;
        }}

        tr:nth-child(even) {{
            background-color: #f7fafc;
        }}

        .footer {{
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
            color: #718096;
            font-size: 9pt;
        }}

        .print-button {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a56db;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(26, 86, 219, 0.3);
            transition: all 0.3s ease;
            z-index: 1000;
        }}

        .print-button:hover {{
            background: #1e40af;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(26, 86, 219, 0.4);
        }}

        .badge {{
            display: inline-block;
            padding: 4px 12px;
            background: #e0e7ff;
            color: #1a56db;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 600;
            margin: 5px 5px 5px 0;
        }}
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print to PDF</button>

    <div class="header">
        <h1>🌊 AQUVIVA</h1>
        <p style="font-size: 16pt; font-weight: 600; margin-top: 15px;">BRAND INTELLIGENCE REPORT</p>
        <p>GeoVera Intelligence Platform</p>
        <p>Generated: February 17, 2026</p>
    </div>

    {html_body}

    <div class="footer">
        <p><strong>Generated by GeoVera Intelligence Platform</strong></p>
        <p>© 2026 GeoVera. All rights reserved.</p>
        <p style="margin-top: 10px;">This report contains proprietary intelligence and should be treated as confidential.</p>
    </div>

    <script>
        // Auto-scroll to top on load
        window.scrollTo(0, 0);

        // Add print instructions
        console.log('To save as PDF: Click the Print button and select "Save as PDF" as the destination');
    </script>
</body>
</html>
"""

    # Write HTML file
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✅ HTML file created: {html_file}")
    print(f"\n📄 To convert to PDF:")
    print(f"   1. Open {html_file} in your browser")
    print(f"   2. Click the 'Print to PDF' button (or press Cmd+P)")
    print(f"   3. Select 'Save as PDF' as destination")
    print(f"   4. Save as: AQUVIVA_ONBOARDING_REPORT.pdf")
    print(f"\n   Or run: open '{html_file}'")

if __name__ == "__main__":
    md_file = "/Users/drew83/Desktop/geovera-staging/AQUVIVA_ONBOARDING_REPORT.md"
    html_file = "/Users/drew83/Desktop/geovera-staging/AQUVIVA_ONBOARDING_REPORT.html"

    try:
        convert_md_to_html(md_file, html_file)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
