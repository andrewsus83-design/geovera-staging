#!/usr/bin/env python3
"""
GeoVera Intelligence Platform - Analisa & Positioning Document
Menghasilkan PDF 5-8 halaman dengan brand guidelines GeoVera
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from datetime import datetime

# GeoVera Brand Colors
GV_HERO = HexColor('#16A34A')      # Primary green
GV_ANCHOR = HexColor('#0B0F19')    # Dark navy
GV_BODY = HexColor('#6B7280')      # Medium gray
GV_CANVAS = HexColor('#FFFFFF')    # White
GV_DIVIDER = HexColor('#E5E7EB')   # Light gray
GV_BG_LIGHT = HexColor('#F9FAFB')  # Off-white
GV_RISK = HexColor('#DC2626')      # Red
GV_SECONDARY = HexColor('#2563EB') # Blue

class GeoVeraPDF:
    def __init__(self, filename):
        self.filename = filename
        self.doc = SimpleDocTemplate(
            filename,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2.5*cm,
            bottomMargin=2*cm
        )
        self.story = []
        self.styles = self.create_styles()

    def create_styles(self):
        """Create custom styles following GeoVera brand guidelines"""
        styles = getSampleStyleSheet()

        # Cover Title - Georgia 48px
        if 'CoverTitle' not in styles:
            styles.add(ParagraphStyle(
                name='CoverTitle',
                fontName='Times-Bold',  # Georgia substitute
                fontSize=42,
                textColor=GV_ANCHOR,
                spaceAfter=12,
                alignment=TA_CENTER,
                leading=48
            ))

        # Cover Subtitle
        if 'CoverSubtitle' not in styles:
            styles.add(ParagraphStyle(
                name='CoverSubtitle',
                fontName='Helvetica',  # Inter substitute
                fontSize=18,
                textColor=GV_BODY,
                spaceAfter=30,
                alignment=TA_CENTER,
                leading=24
            ))

        # Section Title - Georgia 36px
        if 'SectionTitle' not in styles:
            styles.add(ParagraphStyle(
                name='SectionTitle',
                fontName='Times-Bold',
                fontSize=32,
                textColor=GV_ANCHOR,
                spaceAfter=16,
                spaceBefore=20,
                leading=38
            ))

        # Subsection Title - Georgia 24px
        if 'SubsectionTitle' not in styles:
            styles.add(ParagraphStyle(
                name='SubsectionTitle',
                fontName='Times-Bold',
                fontSize=20,
                textColor=GV_ANCHOR,
                spaceAfter=10,
                spaceBefore=14,
                leading=24
            ))

        # Body Text - Inter 16px
        if 'GVBodyText' not in styles:
            styles.add(ParagraphStyle(
                name='GVBodyText',
                fontName='Helvetica',
                fontSize=11,
                textColor=GV_ANCHOR,
                spaceAfter=10,
                alignment=TA_JUSTIFY,
                leading=16
            ))

        # Bullet Points
        if 'BulletPoint' not in styles:
            styles.add(ParagraphStyle(
                name='BulletPoint',
                fontName='Helvetica',
                fontSize=10,
                textColor=GV_ANCHOR,
                leftIndent=20,
                spaceAfter=6,
                leading=14
            ))

        # Highlight Box
        if 'HighlightBox' not in styles:
            styles.add(ParagraphStyle(
                name='HighlightBox',
                fontName='Helvetica-Bold',
                fontSize=11,
                textColor=GV_HERO,
                spaceAfter=10,
                leftIndent=10,
                leading=16
            ))

        # Footer
        if 'GVFooter' not in styles:
            styles.add(ParagraphStyle(
                name='GVFooter',
                fontName='Helvetica',
                fontSize=8,
                textColor=GV_BODY,
                alignment=TA_CENTER
            ))

        return styles

    def add_cover_page(self):
        """Halaman cover dengan branding GeoVera"""
        # Spacer untuk posisi vertikal
        self.story.append(Spacer(1, 2*inch))

        # Logo/Title
        title = Paragraph("GeoVera Intelligence", self.styles['CoverTitle'])
        self.story.append(title)

        subtitle = Paragraph("Platform Analisis & Positioning", self.styles['CoverSubtitle'])
        self.story.append(subtitle)

        self.story.append(Spacer(1, 0.5*inch))

        # Separator line
        separator_data = [['', '']]
        separator_table = Table(separator_data, colWidths=[6*inch])
        separator_table.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, 0), 3, GV_HERO),
            ('LINEBELOW', (0, 0), (-1, 0), 3, GV_HERO),
        ]))
        self.story.append(separator_table)

        self.story.append(Spacer(1, 0.5*inch))

        # Document title
        doc_title = Paragraph(
            "<b>Analisis Fitur, Problem Statement (5W+1H),<br/>dan Market Positioning</b>",
            self.styles['SubsectionTitle']
        )
        self.story.append(doc_title)

        self.story.append(Spacer(1, 1*inch))

        # Metadata
        metadata = f"""
        <para alignment="center">
        <font color="#6B7280" size="10">
        Dokumen Strategis<br/>
        Platform Global Influencer Marketing Intelligence<br/>
        <br/>
        Tanggal: {datetime.now().strftime('%d %B %Y')}<br/>
        Versi: 1.0<br/>
        </font>
        </para>
        """
        self.story.append(Paragraph(metadata, self.styles['GVBodyText']))

        self.story.append(PageBreak())

    def add_executive_summary(self):
        """Executive Summary"""
        self.story.append(Paragraph("Executive Summary", self.styles['SectionTitle']))

        summary_text = """
        <b>GeoVera Intelligence</b> adalah platform SaaS global yang mendemokratisasi
        akses terhadap influencer marketing intelligence melalui teknologi AI terdepan.
        Platform ini mengintegrasikan kemampuan discovery, content generation, analytics,
        dan authority building dalam satu ekosistem yang seamless.
        """
        self.story.append(Paragraph(summary_text, self.styles['GVBodyText']))

        self.story.append(Spacer(1, 0.2*inch))

        # Key highlights
        highlights = [
            ["Jangkauan Global", "50+ negara, 30+ mata uang, 20+ bahasa"],
            ["AI-Powered", "GPT-4o, Claude 3.5 Sonnet, Perplexity Sonar Pro"],
            ["Pricing Model", "$399-$899/bulan dengan 98%+ gross margin"],
            ["Launch Date", "20 Februari 2026 (6 hari lagi)"],
            ["Target Market", "SMB hingga Enterprise (global democratization)"],
        ]

        table = Table(highlights, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), GV_BG_LIGHT),
            ('TEXTCOLOR', (0, 0), (-1, -1), GV_ANCHOR),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 1, GV_DIVIDER),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        self.story.append(table)

        self.story.append(PageBreak())

    def add_features_overview(self):
        """Overview Fitur-fitur Utama GeoVera"""
        self.story.append(Paragraph("Fitur-Fitur Utama GeoVera", self.styles['SectionTitle']))

        intro = """
        GeoVera Intelligence menawarkan 8 modul utama yang saling terintegrasi untuk
        memberikan solusi end-to-end dalam influencer marketing intelligence.
        """
        self.story.append(Paragraph(intro, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.2*inch))

        features = [
            {
                'name': '1. Radar - Creator & Brand Discovery',
                'desc': 'Platform discovery global dengan jangkauan 50+ negara. Temukan influencer, brand kompetitor, dan trending topics sebelum viral.',
                'capabilities': [
                    'Global Creator Discovery dengan AI-powered search',
                    'Competitor Brand Intelligence & monitoring',
                    'Trend Discovery dengan Perplexity Sonar Pro',
                    'Content Analysis menggunakan Claude 3.5 Sonnet',
                    'SerpAPI-powered Search Intelligence & Google Trends',
                    'Brand & Creator Rankings (Mindshare tracking)',
                    'Market Share Analysis kompetitif',
                    'Brand Authority Pattern Learning (ML-based)'
                ],
                'limits': 'Basic: 5/minggu • Premium: 15/minggu • Partner: 30/minggu'
            },
            {
                'name': '2. Authority Hub - Collections Management',
                'desc': 'Bangun otoritas brand melalui kurasi konten social media yang ToS-compliant dengan 3 tab terintegrasi.',
                'capabilities': [
                    'Tab 1 (Embeds): Instagram, TikTok, YouTube embeds',
                    'Tab 2 (Articles): AI-generated content (Hot, Review, Education, Nice to Know)',
                    'Tab 3 (Charts): Data visualizations (line, bar, pie, heatmap)',
                    'AI-curated content recommendations',
                    'Auto-generated authority articles (200-500 kata)',
                    'Statista-inspired chart generation'
                ],
                'limits': 'Basic: 3 koleksi • Premium: 10 • Partner: Unlimited'
            },
            {
                'name': '3. Content Studio - AI Content Generation',
                'desc': 'Studio kreasi konten dengan multi-AI models untuk berbagai format output.',
                'capabilities': [
                    'Article Generation dengan GPT-4o (long-form content)',
                    'Image Generation menggunakan DALL-E 3',
                    'Video Script Generation dengan Claude 3.5 Sonnet',
                    'Multi-language support (20+ bahasa)',
                    'Brand voice learning & customization'
                ],
                'limits': 'Basic: 1/1/0 • Premium: 3/3/1 • Partner: 6/6/3 per bulan'
            },
            {
                'name': '4. AI Chat - Marketing Assistant',
                'desc': 'GPT-4o powered AI consultant untuk strategi influencer marketing real-time.',
                'capabilities': [
                    'Brand Strategy & positioning advice',
                    'Creator Recommendations berbasis data',
                    'Campaign Ideas & creative concepts',
                    'Trend Analysis & market insights',
                    'Competitor Intelligence briefing'
                ],
                'limits': 'Basic: 30 • Premium: 100 • Partner: Unlimited pesan/bulan'
            },
            {
                'name': '5. Daily Insights - Personalized Tasks',
                'desc': '21+ tipe task yang digenerate AI setiap hari, termasuk 5 tipe crisis response.',
                'capabilities': [
                    '5 Crisis Types: Viral negative, sentiment crash, ranking crash, competitor surge, GEO score crash',
                    '7 Radar Tasks: Competitor alerts, ranking drops, viral trends, creator collabs',
                    '5 Search Tasks: Keyword tracking, GEO score monitoring',
                    '5 Hub Tasks: Content publishing, performance analysis',
                    '4 Chat Tasks: AI insights, conversation follow-ups'
                ],
                'limits': 'Basic: 8 • Premium: 10 • Partner: 12 tasks/hari'
            },
            {
                'name': '6. BuzzSumo Integration',
                'desc': 'Discover konten viral global dalam industri Anda dengan real-time trend data.',
                'capabilities': [
                    'Multi-country viral content discovery',
                    'Multi-language content tracking',
                    'Real-time engagement metrics',
                    'Auto-generate stories dari viral trends',
                    'Discovery management & organization'
                ],
                'limits': 'Tersedia untuk semua paid tiers (Basic+)'
            },
            {
                'name': '7. Content Training System',
                'desc': 'Continuous learning loop untuk meningkatkan AI output sesuai brand voice Anda.',
                'capabilities': [
                    'Brand Model Training (voice & style learning)',
                    'Visual Content Analysis dengan Claude',
                    'Feedback Recording untuk improvement',
                    'Pattern recognition & optimization'
                ],
                'limits': 'Active learning untuk semua tier'
            },
            {
                'name': '8. Onboarding & Multi-Auth',
                'desc': '5-step wizard untuk setup brand profile dengan multiple authentication options.',
                'capabilities': [
                    'Complete brand setup wizard (5 langkah)',
                    'Quick start flow untuk fast onboarding',
                    'Email + Google OAuth support',
                    'Multi-tenant architecture dengan RLS'
                ],
                'limits': 'Semua tier mendapat onboarding lengkap'
            }
        ]

        for feature in features:
            # Feature name
            self.story.append(Paragraph(feature['name'], self.styles['SubsectionTitle']))

            # Description
            self.story.append(Paragraph(feature['desc'], self.styles['GVBodyText']))

            # Capabilities
            self.story.append(Paragraph('<b>Capabilities:</b>', self.styles['GVBodyText']))
            for cap in feature['capabilities']:
                bullet = f"• {cap}"
                self.story.append(Paragraph(bullet, self.styles['BulletPoint']))

            # Limits
            limits_text = f"<font color='#16A34A'><b>Tier Limits:</b> {feature['limits']}</font>"
            self.story.append(Paragraph(limits_text, self.styles['GVBodyText']))

            self.story.append(Spacer(1, 0.15*inch))

        self.story.append(PageBreak())

    def add_5w1h_analysis(self):
        """5W + 1H Problem Statement Analysis"""
        self.story.append(Paragraph("Analisis 5W + 1H", self.styles['SectionTitle']))

        intro = """
        Framework 5W+1H memberikan pemahaman komprehensif tentang problem yang
        diselesaikan GeoVera dan pendekatan solusinya.
        """
        self.story.append(Paragraph(intro, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.2*inch))

        # WHO
        self.story.append(Paragraph("1. WHO - Siapa Target Market Kami?", self.styles['SubsectionTitle']))
        who_text = """
        <b>Primary Audience:</b><br/>
        • <b>Marketing Managers & CMOs</b> di SMB hingga Enterprise (50-5000 karyawan)<br/>
        • <b>Brand Strategists</b> yang fokus pada influencer marketing & social commerce<br/>
        • <b>Digital Marketing Agencies</b> yang mengelola multiple brand clients<br/>
        • <b>E-commerce Brands</b> yang mengandalkan creator partnerships untuk sales<br/>
        • <b>PR & Communications Teams</b> yang perlu brand monitoring & reputation management<br/>
        <br/>
        <b>Geographic Reach:</b><br/>
        Global democratization - 50+ negara termasuk North America, Europe, Asia Pacific,
        Middle East, Latin America, dan Africa dengan PPP pricing untuk market access equity.
        <br/><br/>
        <b>Company Size:</b><br/>
        • SMB (10-50 employees): Basic tier ($399/mo)<br/>
        • Mid-Market (50-500): Premium tier ($609/mo)<br/>
        • Enterprise (500+): Partner tier ($899/mo)<br/>
        """
        self.story.append(Paragraph(who_text, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.15*inch))

        # WHAT
        self.story.append(Paragraph("2. WHAT - Apa Problem yang Diselesaikan?", self.styles['SubsectionTitle']))
        what_text = """
        <b>Core Problem:</b> Influencer marketing intelligence yang existing sangat
        <font color="#DC2626"><b>mahal, fragmented, dan geo-restricted</b></font>.<br/>
        <br/>
        <b>Pain Points yang Diatasi:</b><br/>
        • <b>High Cost Barrier:</b> Enterprise tools seperti Brandwatch ($3K-10K/mo),
        Talkwalker ($5K+/mo) tidak terjangkau SMB. GeoVera democratize dengan $399-899/mo.<br/>
        • <b>Tool Fragmentation:</b> Brand harus subscribe 5-7 tools terpisah (discovery,
        analytics, content creation, social listening). GeoVera = all-in-one platform.<br/>
        • <b>Geographic Limitations:</b> Most tools fokus US/Europe only. GeoVera support
        50+ countries dengan multi-language & multi-currency.<br/>
        • <b>Manual Research Overhead:</b> Tim marketing spend 20+ jam/minggu untuk manual
        research. GeoVera automate dengan AI-powered insights & daily tasks.<br/>
        • <b>Lack of Actionable Intelligence:</b> Data tanpa context. GeoVera provide
        actionable tasks, crisis alerts, dan AI recommendations.<br/>
        • <b>No Authority Building Tools:</b> Platform lain fokus analytics saja. GeoVera
        include Authority Hub untuk build thought leadership.<br/>
        """
        self.story.append(Paragraph(what_text, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.15*inch))

        # WHEN
        self.story.append(Paragraph("3. WHEN - Kapan Timing & Context Market?", self.styles['SubsectionTitle']))
        when_text = """
        <b>Market Timing:</b><br/>
        • <b>Influencer Marketing Boom:</b> Global influencer market projected $24B (2024)
        → $84B (2028) - 36% CAGR menurut Statista & Business Insider Intelligence.<br/>
        • <b>AI Adoption Wave:</b> 2024-2026 adalah "AI gold rush" untuk martech. Early
        movers dapat significant first-mover advantage.<br/>
        • <b>Creator Economy Growth:</b> 50M+ creators worldwide, dengan $250B+ total
        creator economy value (Goldman Sachs, 2023).<br/>
        • <b>SMB Digitalization:</b> Post-pandemic SMB adoption of digital marketing tools
        accelerated 5x. Budget allocation shifting from traditional → influencer marketing.<br/>
        <br/>
        <b>Launch Timeline:</b><br/>
        • <b>Soft Launch:</b> 20 Februari 2026 (target: 20 customers, $12K MRR)<br/>
        • <b>Full Launch:</b> 20 Mei 2026 (target: 100 customers, $40K MRR)<br/>
        • <b>Scale Phase:</b> Q3 2026 onwards (30% MoM growth target)<br/>
        """
        self.story.append(Paragraph(when_text, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.15*inch))

        # WHERE
        self.story.append(Paragraph("4. WHERE - Dimana Geographic & Channel Focus?", self.styles['SubsectionTitle']))
        where_text = """
        <b>Geographic Markets (50+ Countries):</b><br/>
        • <b>Tier 1 (Primary):</b> United States, United Kingdom, Singapore, Australia,
        Canada - high ARPU, English-speaking, strong SaaS adoption<br/>
        • <b>Tier 2 (Growth):</b> Indonesia, India, Malaysia, Philippines, Thailand,
        Vietnam - large SMB market, high growth potential, PPP pricing advantage<br/>
        • <b>Tier 3 (Expansion):</b> Europe (Germany, France, Spain, Italy), Latin America
        (Brazil, Mexico, Argentina), Middle East (UAE, Saudi Arabia)<br/>
        <br/>
        <b>Distribution Channels:</b><br/>
        • <b>Self-Service SaaS:</b> Direct signup via geovera.xyz (no sales calls required)<br/>
        • <b>Content Marketing:</b> SEO-optimized blog, thought leadership articles<br/>
        • <b>Influencer Partnerships:</b> Practice what we preach - collaborate dengan
        marketing influencers & thought leaders<br/>
        • <b>Agency Partnerships:</b> White-label atau reseller model untuk digital agencies<br/>
        • <b>Community Building:</b> Slack/Discord untuk users, webinars, case studies<br/>
        """
        self.story.append(Paragraph(where_text, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.15*inch))

        # WHY
        self.story.append(Paragraph("5. WHY - Mengapa Sekarang & Mengapa GeoVera?", self.styles['SubsectionTitle']))
        why_text = """
        <b>Why Now?</b><br/>
        • <b>AI Maturity:</b> GPT-4, Claude 3.5, Perplexity mencapai production-grade
        reliability. AI costs turun 90% dalam 2 tahun (OpenAI pricing history).<br/>
        • <b>API Economy:</b> Best-in-class APIs tersedia (Apify scraping, SerpAPI search,
        BuzzSumo viral tracking) dengan affordable pricing.<br/>
        • <b>Market Gap:</b> Incumbent tools (Brandwatch, Sprinklr, Hootsuite) slow to
        innovate, masih legacy tech, dan pricing model outdated.<br/>
        • <b>Global Infrastructure:</b> Supabase, Vercel, Cloudflare enable global deployment
        dengan minimal ops overhead.<br/>
        <br/>
        <b>Why GeoVera?</b><br/>
        • <b>AI-First Architecture:</b> Bukan "AI bolt-on" tetapi native AI integration
        di semua features. 5 AI providers untuk best-of-breed approach.<br/>
        • <b>True Global Platform:</b> 50+ countries, 30+ currencies, 20+ languages -
        bukan geo-restricted seperti competitors.<br/>
        • <b>Transparent Pricing:</b> $399-899/mo self-service, no "contact sales" BS.
        14-day free trial untuk semua tiers.<br/>
        • <b>All-in-One Solution:</b> Discovery + Content + Analytics + Authority Building
        dalam single platform. Competitor perlu 4-5 tools terpisah.<br/>
        • <b>SMB-First Mindset:</b> Democratize enterprise-grade tools untuk SMB market
        yang underserved.<br/>
        """
        self.story.append(Paragraph(why_text, self.styles['GVBodyText']))

        self.story.append(PageBreak())

        # HOW
        self.story.append(Paragraph("6. HOW - Bagaimana Solusi & Teknologi?", self.styles['SubsectionTitle']))
        how_text = """
        <b>Technology Stack:</b><br/>
        • <b>Backend:</b> Supabase (PostgreSQL 15+ with 200+ RLS policies), Edge Functions
        (Deno runtime) - 26 deployed functions<br/>
        • <b>Frontend:</b> Vanilla HTML/CSS/JS (no framework bloat), Vercel hosting,
        WIRED editorial design system<br/>
        • <b>AI Layer:</b> Perplexity Sonar Pro (discovery), GPT-4o (chat/articles),
        Claude 3.5 Sonnet (video/analysis), DALL-E 3 (images)<br/>
        • <b>Data Sources:</b> Apify (social scraping), SerpAPI (search intelligence),
        BuzzSumo (viral content)<br/>
        • <b>Security:</b> Multi-tenant RLS (99.5% coverage), JWT auth, no hardcoded credentials<br/>
        <br/>
        <b>Architecture Approach:</b><br/>
        • <b>Multi-Tenant SaaS:</b> Single codebase, per-brand isolation via RLS policies<br/>
        • <b>API-First Design:</b> All features accessible via REST APIs untuk future
        integrations & mobile apps<br/>
        • <b>Serverless Functions:</b> Edge Functions auto-scale, pay-per-use model,
        zero server management<br/>
        • <b>Cost Optimization:</b> Caching (33% cost reduction), batching, smart routing
        across AI providers<br/>
        <br/>
        <b>Business Model:</b><br/>
        • <b>Subscription Tiers:</b> Free (data only) → Basic ($399) → Premium ($609) →
        Partner ($899) monthly atau yearly (1 month free)<br/>
        • <b>Gross Margins:</b> 97-99% (typical SaaS excellence). Infrastructure $46/mo fixed,
        API costs variable based on usage<br/>
        • <b>Unit Economics:</b> CAC target $200-400, LTV target $4K-10K (12-24 month payback),
        churn target <5%<br/>
        • <b>Expansion Revenue:</b> Upsells (tier upgrades), add-ons (extra credits),
        API access for enterprises<br/>
        """
        self.story.append(Paragraph(how_text, self.styles['GVBodyText']))

        self.story.append(PageBreak())

    def add_market_positioning(self):
        """Market Positioning Analysis"""
        self.story.append(Paragraph("Market Positioning & Competitive Landscape", self.styles['SectionTitle']))

        intro = """
        GeoVera Intelligence memposisikan diri sebagai <b>global democratizer</b>
        dalam influencer marketing intelligence, mengambil middle ground antara
        tools murah-terbatas dan enterprise platforms mahal-kompleks.
        """
        self.story.append(Paragraph(intro, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.2*inch))

        # Positioning Statement
        self.story.append(Paragraph("Positioning Statement", self.styles['SubsectionTitle']))
        positioning = """
        <font color="#16A34A"><b>
        "For marketing teams worldwide who struggle with fragmented, expensive, and
        geo-restricted influencer marketing tools, GeoVera Intelligence is the AI-powered
        all-in-one platform that democratizes enterprise-grade intelligence at SMB-friendly
        pricing across 50+ countries."
        </b></font>
        """
        self.story.append(Paragraph(positioning, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.2*inch))

        # Competitive Matrix
        self.story.append(Paragraph("Competitive Positioning Matrix", self.styles['SubsectionTitle']))

        competitors = [
            ['Platform', 'Pricing', 'Global Support', 'AI Integration', 'All-in-One', 'Target Market'],
            ['GeoVera', '$399-899/mo', '50+ countries', 'Native AI (5 models)', 'Yes ✓', 'SMB-Enterprise'],
            ['Brandwatch', '$3K-10K/mo', 'US/EU focused', 'Limited AI add-on', 'Social only', 'Enterprise'],
            ['Sprinklr', '$5K+/mo', 'Global', 'Basic AI', 'Yes (complex)', 'Enterprise'],
            ['HypeAuditor', '$399-999/mo', '35+ countries', 'Fraud detection', 'Influencer only', 'SMB-Mid'],
            ['Tagger', '$2K-5K/mo', 'US/EU', 'Limited', 'Influencer only', 'Mid-Enterprise'],
            ['BuzzSumo', '$99-499/mo', 'Global', 'No AI', 'Content only', 'SMB'],
            ['Hootsuite', '$99-739/mo', 'Global', 'Basic AI', 'Social mgmt', 'SMB'],
        ]

        comp_table = Table(competitors, colWidths=[1.2*inch, 1*inch, 1*inch, 1.1*inch, 0.8*inch, 1*inch])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), GV_ANCHOR),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (-1, 1), GV_HERO),
            ('TEXTCOLOR', (0, 1), (-1, 1), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, GV_DIVIDER),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        self.story.append(comp_table)
        self.story.append(Spacer(1, 0.2*inch))

        # Unique Value Propositions
        self.story.append(Paragraph("7 Unique Value Propositions", self.styles['SubsectionTitle']))

        uvps = [
            {
                'title': '1. True Global Democratization',
                'desc': '50+ countries dengan 30+ currencies & PPP pricing. Competitors fokus US/EU only atau charge sama globally (unfair untuk emerging markets).'
            },
            {
                'title': '2. Native AI Integration (Not Bolt-On)',
                'desc': '5 best-in-class AI providers (Perplexity, GPT-4o, Claude 3.5, DALL-E, Anthropic) terintegrasi native, bukan "AI feature" yang ditambahkan setelahnya.'
            },
            {
                'title': '3. All-in-One Platform (Truly)',
                'desc': 'Discovery + Analytics + Content Generation + Authority Building + Crisis Management dalam single subscription. Competitors require 4-5 separate tools.'
            },
            {
                'title': '4. Transparent Self-Service Pricing',
                'desc': 'No "contact sales", no hidden fees, no annual-only contracts. 14-day free trial, monthly or yearly billing, cancel anytime.'
            },
            {
                'title': '5. SMB-First, Enterprise-Ready',
                'desc': 'Pricing mulai $399/mo (accessible untuk SMB) dengan fitur enterprise-grade (RLS security, global infrastructure, multi-tenant).'
            },
            {
                'title': '6. Daily Actionable Intelligence',
                'desc': '21+ task types dengan 5 crisis response categories delivered daily. Bukan hanya "analytics dashboard" pasif seperti competitors.'
            },
            {
                'title': '7. Authority Building (Not Just Analytics)',
                'desc': 'Authority Hub dengan embeds, AI articles, charts untuk build thought leadership. Competitors fokus monitoring/analytics only.'
            }
        ]

        for uvp in uvps:
            self.story.append(Paragraph(f"<b>{uvp['title']}</b>", self.styles['GVBodyText']))
            self.story.append(Paragraph(uvp['desc'], self.styles['BulletPoint']))
            self.story.append(Spacer(1, 0.1*inch))

        self.story.append(PageBreak())

        # Market Segmentation Strategy
        self.story.append(Paragraph("Market Segmentation Strategy", self.styles['SubsectionTitle']))

        segments = """
        <b>Primary Segment (60% revenue target):</b><br/>
        • <b>E-commerce Brands (D2C):</b> Fashion, beauty, lifestyle brands yang heavily
        rely on influencer partnerships. High intent, clear ROI tracking, budget allocated.<br/>
        <br/>
        <b>Secondary Segment (25% revenue):</b><br/>
        • <b>Digital Marketing Agencies:</b> Manage 5-20 brand clients, need white-label
        atau multi-brand access. High LTV potential (manage multiple accounts).<br/>
        <br/>
        <b>Tertiary Segment (15% revenue):</b><br/>
        • <b>Corporate Brands (Traditional):</b> FMCG, automotive, finance yang mulai
        adopt influencer marketing. Slower adoption tapi larger contracts.<br/>
        """
        self.story.append(Paragraph(segments, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.2*inch))

        # Go-to-Market Strategy
        self.story.append(Paragraph("Go-to-Market Strategy (First 90 Days)", self.styles['SubsectionTitle']))

        gtm = """
        <b>Phase 1: Soft Launch (Feb 20 - Mar 20, 2026):</b><br/>
        • Target: 10 paying customers via warm outreach & personal network<br/>
        • Focus: Product validation, bug fixes, testimonial gathering<br/>
        • Channels: Direct outreach, LinkedIn, founder network<br/>
        <br/>
        <b>Phase 2: Content Marketing (Mar 20 - Apr 20):</b><br/>
        • Launch SEO blog dengan 20+ articles (influencer marketing, creator economy)<br/>
        • Guest posts di martech publications (MarTech Today, Social Media Examiner)<br/>
        • Case studies dari Phase 1 customers (with metrics & results)<br/>
        <br/>
        <b>Phase 3: Paid Acquisition (Apr 20 - May 20):</b><br/>
        • Google Ads (search intent: "influencer marketing tool", "creator discovery platform")<br/>
        • LinkedIn Ads (targeting: Marketing Manager, CMO, Brand Manager titles)<br/>
        • Retargeting campaigns untuk website visitors<br/>
        <br/>
        <b>Success Metrics:</b><br/>
        • Month 1: 5-10 customers, $3K-5K MRR, <$500 CAC<br/>
        • Month 2: 10-15 customers, $7K-10K MRR, product-market fit validation<br/>
        • Month 3: 20+ customers, $12K+ MRR, break-even achieved, ramp up marketing<br/>
        """
        self.story.append(Paragraph(gtm, self.styles['GVBodyText']))

        self.story.append(PageBreak())

    def add_business_model(self):
        """Business Model & Financial Projections"""
        self.story.append(Paragraph("Business Model & Financial Outlook", self.styles['SectionTitle']))

        # Revenue Streams
        self.story.append(Paragraph("Revenue Streams", self.styles['SubsectionTitle']))

        revenue = """
        <b>Primary: Subscription Revenue (95%)</b><br/>
        • Basic tier: $399/mo × 40% of customers = target segment<br/>
        • Premium tier: $609/mo × 35% of customers = main revenue driver<br/>
        • Partner tier: $899/mo × 25% of customers = high-value accounts<br/>
        • Yearly discounts: 1 month free (drive annual commitments)<br/>
        <br/>
        <b>Secondary: Usage Overages (3%)</b><br/>
        • Extra AI Chat messages: $0.50/message beyond tier limit<br/>
        • Extra Content Generation: $10/article, $5/image, $30/video<br/>
        • Extra Discoveries: $5/discovery beyond weekly limit<br/>
        <br/>
        <b>Tertiary: API Access & White Label (2%)</b><br/>
        • Enterprise API access: $500-2,000/mo add-on<br/>
        • White-label for agencies: 20% markup on tier pricing<br/>
        """
        self.story.append(Paragraph(revenue, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.2*inch))

        # Financial Projections
        self.story.append(Paragraph("Financial Projections (5-Year)", self.styles['SubsectionTitle']))

        projections = [
            ['Metric', 'Year 1', 'Year 2', 'Year 3', 'Year 5'],
            ['Customers', '100', '350', '1,000', '2,500'],
            ['MRR', '$48K', '$168K', '$480K', '$1.2M'],
            ['ARR', '$576K', '$2.0M', '$5.8M', '$14.4M'],
            ['Gross Margin', '98%', '98%', '97%', '96%'],
            ['Churn Rate', '8%', '5%', '3%', '3%'],
            ['CAC', '$300', '$250', '$200', '$150'],
            ['LTV', '$4.8K', '$9.6K', '$16K', '$19.2K'],
            ['LTV:CAC Ratio', '16:1', '38:1', '80:1', '128:1'],
        ]

        proj_table = Table(projections, colWidths=[1.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
        proj_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), GV_ANCHOR),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, 1), (0, -1), GV_BG_LIGHT),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, GV_DIVIDER),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        self.story.append(proj_table)
        self.story.append(Spacer(1, 0.2*inch))

        # Key Assumptions
        assumptions = """
        <b>Key Assumptions:</b><br/>
        • 30% month-over-month customer growth (conservative untuk SaaS dengan PMF)<br/>
        • Average tier distribution: 40% Basic, 35% Premium, 25% Partner<br/>
        • Blended ARPU: $480/mo (year 1) → $576/mo (year 5) via upsells & expansion<br/>
        • Churn reduction: 8% → 3% through better onboarding & customer success<br/>
        • CAC reduction: $300 → $150 via content marketing, SEO, word-of-mouth<br/>
        • LTV expansion: $4.8K → $19.2K through longer retention & upsells<br/>
        """
        self.story.append(Paragraph(assumptions, self.styles['GVBodyText']))

        self.story.append(PageBreak())

    def add_conclusion(self):
        """Conclusion & Next Steps"""
        self.story.append(Paragraph("Kesimpulan & Strategic Outlook", self.styles['SectionTitle']))

        conclusion = """
        GeoVera Intelligence berada di posisi unik untuk mendisrupsi pasar
        influencer marketing intelligence yang bernilai $24B+ dengan pendekatan
        <b>global democratization</b>, <b>AI-first architecture</b>, dan
        <b>transparent pricing</b>.<br/>
        <br/>
        Platform ini tidak hanya menawarkan tools, tetapi menghadirkan <b>paradigm shift</b>
        dalam bagaimana brand worldwide - dari SMB hingga Enterprise - mengakses dan
        memanfaatkan influencer marketing intelligence.<br/>
        """
        self.story.append(Paragraph(conclusion, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.2*inch))

        # Strategic Advantages
        self.story.append(Paragraph("Strategic Competitive Advantages", self.styles['SubsectionTitle']))

        advantages = [
            '<b>1. First-Mover in AI-Native Global Platform:</b> Tidak ada competitor yang combine native multi-AI integration dengan true global support (50+ countries).',
            '<b>2. Best-of-Breed AI Stack:</b> Integrasi 5 leading AI providers (Perplexity, GPT-4o, Claude 3.5, DALL-E) memberikan superior output quality vs single-AI competitors.',
            '<b>3. All-in-One Eliminates Tool Fatigue:</b> Discovery + Content + Analytics + Authority Building menggantikan 4-5 tools terpisah, reducing friction & costs.',
            '<b>4. SMB Market Blue Ocean:</b> Enterprise tools terlalu mahal untuk SMB, basic tools terlalu limited. GeoVera perfect middle ground dengan enterprise features at SMB pricing.',
            '<b>5. Network Effects via Authority Hub:</b> User-generated collections & articles create content flywheel, improve SEO, attract organic traffic.',
            '<b>6. High Gross Margins (97-99%):</b> SaaS unit economics excellent dengan infrastructure costs minimal, API costs variable, near-zero marginal cost per customer.',
            '<b>7. Global Infrastructure Arbitrage:</b> Supabase + Vercel enable global deployment dengan CapEx minimal, operational excellence dari day 1.'
        ]

        for adv in advantages:
            self.story.append(Paragraph(f"• {adv}", self.styles['BulletPoint']))

        self.story.append(Spacer(1, 0.2*inch))

        # Risks & Mitigations
        self.story.append(Paragraph("Risk Assessment & Mitigation", self.styles['SubsectionTitle']))

        risks = """
        <b>Risk 1: AI API Costs Volatility</b><br/>
        Mitigation: Multi-provider strategy, caching (33% reduction achieved), smart routing,
        cost caps per tier.<br/>
        <br/>
        <b>Risk 2: Competitor Response (Price War)</b><br/>
        Mitigation: Focus differentiation (global support, all-in-one), build moat via
        network effects, superior UX.<br/>
        <br/>
        <b>Risk 3: Platform Dependencies (Supabase, OpenAI, etc.)</b><br/>
        Mitigation: Modular architecture, dapat migrate database, swap AI providers,
        contracts dengan multiple vendors.<br/>
        <br/>
        <b>Risk 4: Market Adoption Speed</b><br/>
        Mitigation: Free tier untuk lead gen, 14-day trial, aggressive content marketing,
        focus quick wins & ROI proof.<br/>
        """
        self.story.append(Paragraph(risks, self.styles['GVBodyText']))
        self.story.append(Spacer(1, 0.2*inch))

        # Next Steps
        self.story.append(Paragraph("Immediate Next Steps (Pre-Launch)", self.styles['SubsectionTitle']))

        next_steps = """
        <b>Technical (2 days):</b><br/>
        • Fix 3 frontend pages accessibility issues (chat.html, content-studio.html, onboarding.html)<br/>
        • Complete final security audit & penetration testing<br/>
        • Load testing untuk 1,000 concurrent users<br/>
        <br/>
        <b>Business (3 days):</b><br/>
        • Finalize pricing & payment gateway (Xendit production keys)<br/>
        • Prepare launch materials (landing page copy, demo video, screenshots)<br/>
        • Outreach list preparation (50 warm leads for soft launch)<br/>
        <br/>
        <b>Marketing (ongoing):</b><br/>
        • Content calendar (20 blog posts untuk first 60 days)<br/>
        • Social media presence (LinkedIn company page, Twitter account)<br/>
        • Email sequences (onboarding, activation, retention, upsell)<br/>
        <br/>
        <b>Launch Day (Feb 20, 2026):</b><br/>
        • Deploy to production (Vercel + Supabase)<br/>
        • Announce on LinkedIn, Twitter, Product Hunt<br/>
        • Email blast to warm lead list (50 contacts)<br/>
        • Monitor analytics, bug reports, user feedback real-time<br/>
        """
        self.story.append(Paragraph(next_steps, self.styles['GVBodyText']))

        self.story.append(Spacer(1, 0.3*inch))

        # Final statement
        final = """
        <font color="#16A34A" size="12">
        <b>GeoVera Intelligence: Democratizing Influencer Marketing Intelligence, Globally.</b>
        </font>
        """
        self.story.append(Paragraph(final, self.styles['GVBodyText']))

        self.story.append(Spacer(1, 0.2*inch))

        # Footer info
        footer = """
        <para alignment="center">
        <font color="#6B7280" size="9">
        —————————————————————————————<br/>
        <br/>
        Platform: geovera.xyz<br/>
        Launch: 20 Februari 2026<br/>
        Global Coverage: 50+ Countries, 30+ Currencies, 20+ Languages<br/>
        <br/>
        © 2026 GeoVera Intelligence. All Rights Reserved.<br/>
        </font>
        </para>
        """
        self.story.append(Paragraph(footer, self.styles['GVBodyText']))

    def add_page_number(self, canvas, doc):
        """Add page numbers and footer to each page"""
        canvas.saveState()

        # Page number
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(GV_BODY)
        canvas.drawRightString(A4[0] - 2*cm, 1.5*cm, text)

        # Footer line
        canvas.setStrokeColor(GV_DIVIDER)
        canvas.setLineWidth(0.5)
        canvas.line(2*cm, 2*cm, A4[0] - 2*cm, 2*cm)

        canvas.restoreState()

    def generate(self):
        """Generate the complete PDF document"""
        print("🎨 Generating GeoVera Analysis PDF...")
        print("📄 Following brand guidelines: WIRED editorial style")
        print("🎨 Colors: #16A34A (green), #0B0F19 (navy), #6B7280 (gray)")
        print("✍️  Fonts: Georgia (headings) + Helvetica (body)")
        print()

        # Build document structure
        self.add_cover_page()
        print("✓ Cover page")

        self.add_executive_summary()
        print("✓ Executive Summary")

        self.add_features_overview()
        print("✓ Features Overview (8 modules)")

        self.add_5w1h_analysis()
        print("✓ 5W+1H Analysis")

        self.add_market_positioning()
        print("✓ Market Positioning")

        self.add_business_model()
        print("✓ Business Model & Financials")

        self.add_conclusion()
        print("✓ Conclusion & Next Steps")

        # Generate PDF
        self.doc.build(self.story, onFirstPage=self.add_page_number, onLaterPages=self.add_page_number)
        print()
        print(f"✅ PDF generated successfully: {self.filename}")
        print(f"📊 Estimated pages: 7-8 pages")
        print(f"🎯 Content: Features, 5W+1H, Market Positioning, Business Model")

if __name__ == "__main__":
    pdf = GeoVeraPDF("GeoVera_Analysis_Positioning.pdf")
    pdf.generate()
    print()
    print("🌍 GeoVera Intelligence - Global Influencer Marketing Intelligence")
    print("📅 Launch: February 20, 2026")
    print("🚀 Ready for democratization!")
