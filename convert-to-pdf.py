#!/usr/bin/env python3
"""
Convert AQUVIVA Markdown Report to PDF
Uses markdown2 for HTML conversion and weasyprint for PDF generation
"""

import sys
import subprocess
import os

def install_package(package):
    """Install a Python package using pip"""
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])

# Install required packages
try:
    import markdown2
except ImportError:
    print("Installing markdown2...")
    install_package("markdown2")
    import markdown2

try:
    from weasyprint import HTML, CSS
except ImportError:
    print("Installing weasyprint...")
    install_package("weasyprint")
    from weasyprint import HTML, CSS

def convert_md_to_pdf(md_file, pdf_file):
    """Convert markdown file to PDF"""

    # Read markdown content
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Convert markdown to HTML
    html_content = markdown2.markdown(md_content, extras=[
        'tables',
        'fenced-code-blocks',
        'header-ids',
        'metadata',
        'strike',
        'task_list'
    ])

    # Create styled HTML document
    styled_html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AQUVIVA Brand Intelligence Report</title>
    <style>
        @page {{
            size: A4;
            margin: 2cm;
            @bottom-right {{
                content: "Page " counter(page) " of " counter(pages);
                font-size: 9pt;
                color: #666;
            }}
        }}

        body {{
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            font-size: 11pt;
        }}

        h1 {{
            color: #1a56db;
            border-bottom: 3px solid #1a56db;
            padding-bottom: 10px;
            margin-top: 30px;
            font-size: 28pt;
        }}

        h2 {{
            color: #1a56db;
            border-left: 4px solid #1a56db;
            padding-left: 15px;
            margin-top: 25px;
            font-size: 18pt;
            page-break-after: avoid;
        }}

        h3 {{
            color: #444;
            margin-top: 20px;
            font-size: 14pt;
            page-break-after: avoid;
        }}

        p {{
            margin: 10px 0;
            text-align: justify;
        }}

        ul, ol {{
            margin: 10px 0;
            padding-left: 30px;
        }}

        li {{
            margin: 5px 0;
        }}

        strong {{
            color: #1a56db;
            font-weight: 600;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10pt;
        }}

        th, td {{
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }}

        th {{
            background-color: #1a56db;
            color: white;
            font-weight: bold;
        }}

        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}

        blockquote {{
            border-left: 4px solid #e5e7eb;
            margin: 15px 0;
            padding: 10px 20px;
            background-color: #f9fafb;
            font-style: italic;
        }}

        code {{
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
        }}

        hr {{
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 20px 0;
        }}

        .report-header {{
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%);
            color: white;
            border-radius: 10px;
        }}

        .report-header h1 {{
            color: white;
            border: none;
            margin: 0;
        }}

        .report-header p {{
            margin: 5px 0;
            font-size: 10pt;
        }}

        .section {{
            page-break-inside: avoid;
            margin-bottom: 20px;
        }}

        .alert {{
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            page-break-inside: avoid;
        }}

        .alert-high {{
            background-color: #fee2e2;
            border-left: 4px solid #dc2626;
        }}

        .alert-medium {{
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
        }}

        .alert-low {{
            background-color: #dbeafe;
            border-left: 4px solid #3b82f6;
        }}
    </style>
</head>
<body>
    <div class="report-header">
        <h1>🌊 AQUVIVA</h1>
        <p><strong>BRAND INTELLIGENCE REPORT</strong></p>
        <p>GeoVera Intelligence Platform</p>
        <p>Generated: February 17, 2026</p>
    </div>

    {html_content}

    <hr>
    <p style="text-align: center; color: #666; font-size: 9pt; margin-top: 30px;">
        <strong>Generated by GeoVera Intelligence Platform</strong><br>
        © 2026 GeoVera. All rights reserved.<br>
        This report contains proprietary intelligence and should be treated as confidential.
    </p>
</body>
</html>
    """

    # Generate PDF
    print(f"Converting {md_file} to PDF...")
    HTML(string=styled_html).write_pdf(pdf_file)
    print(f"✅ PDF generated successfully: {pdf_file}")

    # Get file size
    file_size = os.path.getsize(pdf_file)
    print(f"📄 File size: {file_size:,} bytes ({file_size/1024:.1f} KB)")

if __name__ == "__main__":
    md_file = "/Users/drew83/Desktop/geovera-staging/AQUVIVA_ONBOARDING_REPORT.md"
    pdf_file = "/Users/drew83/Desktop/geovera-staging/AQUVIVA_ONBOARDING_REPORT.pdf"

    try:
        convert_md_to_pdf(md_file, pdf_file)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
