#!/usr/bin/env python3
"""
GeoVera Intelligence Platform - 5W1H Analysis PDF Generator (Compact 8-page)
Generates a branded PDF document following GeoVera's design guidelines.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
import os

# ============================================================
# GEOVERA BRAND COLORS
# ============================================================
GV_HERO = HexColor('#16A34A')
GV_HERO_DARK = HexColor('#15803D')
GV_ANCHOR = HexColor('#0B0F19')
GV_BODY = HexColor('#6B7280')
GV_CANVAS = HexColor('#FFFFFF')
GV_BG_LIGHT = HexColor('#F9FAFB')
GV_DIVIDER = HexColor('#E5E7EB')
GV_RISK = HexColor('#DC2626')
GV_SUCCESS = HexColor('#10B981')

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 18 * mm


class GeoVeraDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        frame = Frame(
            MARGIN, MARGIN + 10 * mm,
            PAGE_WIDTH - 2 * MARGIN,
            PAGE_HEIGHT - 2 * MARGIN - 14 * mm,
            id='main'
        )
        template = PageTemplate(id='geovera', frames=[frame], onPage=self._draw_page)
        self.addPageTemplates([template])

    def _draw_page(self, c, doc):
        c.saveState()
        page_num = doc.page

        # Top green accent bar
        c.setFillColor(GV_HERO)
        c.rect(0, PAGE_HEIGHT - 5 * mm, PAGE_WIDTH, 5 * mm, fill=1, stroke=0)

        # Dark header bar
        c.setFillColor(GV_ANCHOR)
        c.rect(0, PAGE_HEIGHT - 16 * mm, PAGE_WIDTH, 11 * mm, fill=1, stroke=0)

        c.setFillColor(white)
        c.setFont('Times-Bold', 9)
        c.drawString(MARGIN, PAGE_HEIGHT - 13 * mm, 'GEOVERA INTELLIGENCE PLATFORM')
        c.setFont('Helvetica', 7)
        c.drawRightString(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 12 * mm, 'Analisis 5W1H  |  Februari 2026')

        # Footer
        c.setFillColor(GV_HERO)
        c.rect(0, 8 * mm, PAGE_WIDTH, 1 * mm, fill=1, stroke=0)
        c.setFillColor(GV_BODY)
        c.setFont('Helvetica', 6.5)
        c.drawString(MARGIN, 4 * mm, 'geovera.xyz')
        c.drawCentredString(PAGE_WIDTH / 2, 4 * mm, '\u00a9 2026 GeoVera Intelligence Platform')
        c.drawRightString(PAGE_WIDTH - MARGIN, 4 * mm, f'Halaman {page_num}')
        c.restoreState()


def create_styles():
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle('CoverTitle', fontName='Times-Bold', fontSize=32, leading=37,
        textColor=GV_ANCHOR, alignment=TA_LEFT, spaceAfter=4*mm))
    styles.add(ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=12, leading=16,
        textColor=GV_BODY, spaceAfter=3*mm))
    styles.add(ParagraphStyle('SectionTitle', fontName='Times-Bold', fontSize=18, leading=22,
        textColor=GV_ANCHOR, spaceBefore=5*mm, spaceAfter=2.5*mm))
    styles.add(ParagraphStyle('SubTitle', fontName='Times-Bold', fontSize=13, leading=17,
        textColor=GV_ANCHOR, spaceBefore=4*mm, spaceAfter=2*mm))
    styles.add(ParagraphStyle('H3', fontName='Times-Bold', fontSize=11, leading=14,
        textColor=GV_ANCHOR, spaceBefore=3*mm, spaceAfter=1.5*mm))
    styles.add(ParagraphStyle('Body', fontName='Helvetica', fontSize=9, leading=13,
        textColor=GV_ANCHOR, alignment=TA_JUSTIFY, spaceAfter=2*mm))
    styles.add(ParagraphStyle('BodyGray', fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=GV_BODY, spaceAfter=1.5*mm))
    styles.add(ParagraphStyle('GVBullet', fontName='Helvetica', fontSize=9, leading=13,
        textColor=GV_ANCHOR, leftIndent=10*mm, bulletIndent=4*mm, spaceAfter=1*mm))
    styles.add(ParagraphStyle('GreenLabel', fontName='Helvetica-Bold', fontSize=9, leading=12,
        textColor=GV_HERO, spaceAfter=0.5*mm))
    styles.add(ParagraphStyle('TagStyle', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=white))
    styles.add(ParagraphStyle('FeatureTitle', fontName='Times-Bold', fontSize=10, leading=13,
        textColor=GV_HERO_DARK, spaceBefore=2*mm, spaceAfter=1*mm))
    styles.add(ParagraphStyle('FooterNote', fontName='Helvetica', fontSize=7, leading=10,
        textColor=GV_BODY, alignment=TA_CENTER))
    styles.add(ParagraphStyle('SmallBody', fontName='Helvetica', fontSize=8, leading=11,
        textColor=GV_ANCHOR, spaceAfter=1*mm))
    styles.add(ParagraphStyle('TinyBullet', fontName='Helvetica', fontSize=8, leading=11,
        textColor=GV_ANCHOR, leftIndent=8*mm, bulletIndent=3*mm, spaceAfter=0.8*mm))

    return styles


def green_divider():
    return HRFlowable(width='100%', thickness=2.5, color=GV_HERO, spaceBefore=2*mm, spaceAfter=2*mm)

def thin_divider():
    return HRFlowable(width='100%', thickness=0.5, color=GV_DIVIDER, spaceBefore=1*mm, spaceAfter=1*mm)

def section_header(number, title, styles):
    data = [[
        Paragraph(f'<font color="#FFFFFF"><b>{number}</b></font>', styles['TagStyle']),
        Paragraph(title, styles['SectionTitle'])
    ]]
    t = Table(data, colWidths=[10*mm, None])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(0,0), GV_HERO),
        ('ALIGN', (0,0),(0,0), 'CENTER'),
        ('VALIGN', (0,0),(-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0),(0,0), 2*mm),
        ('RIGHTPADDING', (0,0),(0,0), 2*mm),
        ('TOPPADDING', (0,0),(0,0), 1.5*mm),
        ('BOTTOMPADDING', (0,0),(0,0), 1.5*mm),
        ('LEFTPADDING', (1,0),(1,0), 3*mm),
    ]))
    return t

def feature_box(title, description, styles):
    content = [
        Paragraph(f'<b>{title}</b>', styles['FeatureTitle']),
        Paragraph(description, styles['SmallBody']),
    ]
    data = [[content]]
    t = Table(data, colWidths=[PAGE_WIDTH - 2*MARGIN - 6*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(-1,-1), GV_BG_LIGHT),
        ('LEFTPADDING', (0,0),(-1,-1), 5*mm),
        ('RIGHTPADDING', (0,0),(-1,-1), 3*mm),
        ('TOPPADDING', (0,0),(-1,-1), 2.5*mm),
        ('BOTTOMPADDING', (0,0),(-1,-1), 2.5*mm),
        ('LINEBEFORE', (0,0),(0,-1), 3, GV_HERO),
    ]))
    return t


def build_pdf():
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'GeoVera_5W1H_Analysis.pdf')

    doc = GeoVeraDocTemplate(
        output_path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN + 16*mm, bottomMargin=MARGIN + 10*mm,
    )

    S = create_styles()
    story = []
    CW = PAGE_WIDTH - 2*MARGIN  # content width

    # ========================================================
    # PAGE 1: COVER
    # ========================================================
    story.append(Spacer(1, 22*mm))

    # Green accent block
    accent = Table([['']], colWidths=[50*mm], rowHeights=[2.5*mm])
    accent.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), GV_HERO)]))
    story.append(accent)
    story.append(Spacer(1, 5*mm))

    story.append(Paragraph('GeoVera<br/>Intelligence<br/>Platform', S['CoverTitle']))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph('Analisis Komprehensif 5W + 1H', S['CoverSub']))
    story.append(Paragraph('<b>What \u2022 Who \u2022 When \u2022 Where \u2022 Why \u2022 How</b>',
        ParagraphStyle('CoverTags', fontName='Helvetica-Bold', fontSize=10, leading=14, textColor=GV_HERO)))

    story.append(Spacer(1, 10*mm))
    story.append(thin_divider())

    # Cover info
    cover_rows = [
        ('Platform', 'Global Influencer Marketing Intelligence SaaS'),
        ('Domain', 'geovera.xyz'),
        ('Peluncuran', '20 Februari 2026 (Soft Launch)'),
        ('Target Awal', '20 Pelanggan Berbayar  |  MRR $12,180'),
        ('Status', '87% Production Ready'),
        ('Dokumen', 'Versi 1.0 \u2014 14 Februari 2026'),
    ]
    for label, value in cover_rows:
        row = Table(
            [[Paragraph(f'<font color="{GV_BODY.hexval()}">{label}</font>', S['BodyGray']),
              Paragraph(f'<b>{value}</b>', S['Body'])]],
            colWidths=[38*mm, None]
        )
        row.setStyle(TableStyle([
            ('VALIGN',(0,0),(-1,-1),'TOP'),
            ('TOPPADDING',(0,0),(-1,-1),1.2*mm),
            ('BOTTOMPADDING',(0,0),(-1,-1),1.2*mm),
        ]))
        story.append(row)

    story.append(Spacer(1, 8*mm))

    # Metrics dashboard
    metric_vals = [('100%','Backend'), ('87%','Frontend'), ('95/100','Security'), ('95%','Features')]
    val_row = []
    lbl_row = []
    for v, l in metric_vals:
        val_row.append(Paragraph(f'<font size="14"><b>{v}</b></font>',
            ParagraphStyle('MV', fontName='Times-Bold', fontSize=14, alignment=TA_CENTER, textColor=GV_HERO)))
        lbl_row.append(Paragraph(f'<font size="7">{l}</font>',
            ParagraphStyle('ML', fontName='Helvetica', fontSize=7, alignment=TA_CENTER, textColor=GV_BODY)))

    mt = Table([val_row, lbl_row], colWidths=[CW/4]*4)
    mt.setStyle(TableStyle([
        ('ALIGN',(0,0),(-1,-1),'CENTER'),
        ('BACKGROUND',(0,0),(-1,-1), GV_BG_LIGHT),
        ('BOX',(0,0),(-1,-1), 1, GV_DIVIDER),
        ('INNERGRID',(0,0),(-1,-1), 0.5, GV_DIVIDER),
        ('TOPPADDING',(0,0),(-1,0), 3*mm),
        ('BOTTOMPADDING',(0,-1),(-1,-1), 2.5*mm),
    ]))
    story.append(mt)

    story.append(Spacer(1, 8*mm))

    # Internal notice
    notice = Table([[Paragraph(
        '<b>DOKUMEN INTERNAL</b> \u2014 Analisis komprehensif platform GeoVera Intelligence '
        'untuk keperluan internal tim pengembangan dan stakeholder.',
        ParagraphStyle('N', fontName='Helvetica', fontSize=8, leading=11, textColor=GV_ANCHOR)
    )]], colWidths=[CW - 4*mm])
    notice.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1), GV_BG_LIGHT),
        ('BOX',(0,0),(-1,-1), 0.5, GV_DIVIDER),
        ('LINEBEFORE',(0,0),(0,-1), 3, GV_HERO),
        ('TOPPADDING',(0,0),(-1,-1), 3*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 3*mm),
        ('LEFTPADDING',(0,0),(-1,-1), 5*mm),
        ('RIGHTPADDING',(0,0),(-1,-1), 3*mm),
    ]))
    story.append(notice)

    story.append(PageBreak())

    # ========================================================
    # PAGE 2: WHAT (01)
    # ========================================================
    story.append(section_header('01', 'WHAT \u2014 Apa Itu GeoVera?', S))
    story.append(green_divider())

    story.append(Paragraph(
        '<b>GeoVera Intelligence Platform</b> adalah platform SaaS berbasis AI untuk influencer marketing '
        'intelligence global. Platform ini dirancang untuk membantu brand, agensi, dan tim marketing '
        'menemukan kreator konten, menganalisis tren pasar, menghasilkan konten berkualitas, dan membangun '
        'otoritas brand secara digital di lebih dari 50 negara.',
        S['Body']))

    # Identity table
    id_data = [
        ['Jenis', 'SaaS \u2014 Influencer Marketing Intelligence'],
        ['Website', 'geovera.xyz'],
        ['Desain', 'WIRED Magazine Editorial Style (sharp corners, typography-first)'],
        ['Teknologi', 'Supabase PostgreSQL + Edge Functions (Deno) + Vercel CDN'],
        ['Database', '205+ tabel dengan Row Level Security (multi-tenant)'],
        ['Backend', '24 Edge Functions serverless \u2014 100% production ready'],
        ['Aksesibilitas', 'WCAG 2.1 AA Compliant'],
    ]
    id_table = Table(
        [[Paragraph(f'<b>{r[0]}</b>', S['SmallBody']), Paragraph(r[1], S['SmallBody'])] for r in id_data],
        colWidths=[32*mm, None]
    )
    id_table.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('TOPPADDING',(0,0),(-1,-1), 1.5*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 1.5*mm),
        ('LINEBELOW',(0,0),(-1,-2), 0.3, GV_DIVIDER),
        ('LINEBELOW',(0,-1),(-1,-1), 1, GV_HERO),
    ]))
    story.append(id_table)

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>6 Modul Produk Utama</b>', S['SubTitle']))

    products = [
        ('RADAR \u2014 Discovery Engine',
         'Temukan influencer & brand di 50+ negara. 9 Edge Functions untuk discovery kreator, analisis kompetitor, trend detection, market share, dan brand authority ranking.'),
        ('AUTHORITY HUB \u2014 Koleksi & Otoritas',
         'Bangun otoritas brand melalui koleksi konten sosial media (Instagram, TikTok, YouTube) yang dikurasi AI. Auto-generate artikel otoritas dan visualisasi data.'),
        ('CONTENT STUDIO \u2014 AI Content Creation',
         'Hasilkan artikel (GPT-4o), gambar (DALL-E 3), dan skrip video (Claude 3.5 Sonnet) yang disesuaikan dengan brand voice melalui AI multi-provider.'),
        ('AI CHAT \u2014 Asisten Marketing',
         'Konsultan AI personal berbasis GPT-4o untuk strategi influencer marketing, rekomendasi kreator, dan ide kampanye dengan riwayat percakapan.'),
        ('DAILY INSIGHTS \u2014 Insight Harian',
         '21+ jenis task harian: analisis performa konten, monitoring kompetitor, notifikasi tren, deteksi peluang pasar, dan rekomendasi SEO.'),
        ('BUZZSUMO \u2014 Konten Viral',
         'Identifikasi konten viral global di industri Anda. Auto-generate cerita dan story dari tren yang ditemukan.'),
    ]

    for title, desc in products:
        story.append(feature_box(title, desc, S))
        story.append(Spacer(1, 1.2*mm))

    story.append(PageBreak())

    # ========================================================
    # PAGE 3: WHO (02)
    # ========================================================
    story.append(section_header('02', 'WHO \u2014 Siapa Pengguna & Stakeholder?', S))
    story.append(green_divider())

    story.append(Paragraph(
        'GeoVera dirancang untuk profesional dan organisasi di bidang influencer marketing dan digital branding:',
        S['Body']))

    users = [
        ('Brand Manager & Marketing Team',
         'Tim marketing dari brand menengah hingga enterprise yang membutuhkan intelligence untuk kampanye influencer marketing global \u2014 data kreator, analisis kompetitor, dan content tools.'),
        ('Digital Marketing Agency',
         'Agensi yang mengelola banyak klien dan membutuhkan platform terpusat untuk discovery kreator, manajemen kampanye, dan pelaporan. Multi-tenant architecture mendukung isolasi data per brand.'),
        ('Content Creator & Influencer',
         'Kreator konten yang ingin memahami posisi di pasar, menemukan peluang kolaborasi, dan mengoptimalkan strategi konten menggunakan AI insights.'),
        ('E-Commerce & D2C Brands',
         'Brand direct-to-consumer yang bergantung pada influencer marketing untuk customer acquisition dan brand awareness di berbagai pasar global.'),
    ]

    for title, desc in users:
        story.append(Paragraph(f'<b>{title}</b>', S['H3']))
        story.append(Paragraph(desc, S['SmallBody']))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Model Berlangganan (Tier System)</b>', S['SubTitle']))

    tier_data = [
        ['', 'Basic', 'Premium', 'Partner'],
        ['Harga/bulan', '$399', '$609', '$899'],
        ['Harga/tahun', '$4,389', '$6,699', '$9,889'],
        ['Koleksi Hub', '3', '10', 'Unlimited'],
        ['AI Chat', '30 msg/bln', '100 msg/bln', 'Unlimited'],
        ['Artikel', '1/bulan', '3/bulan', '6/bulan'],
        ['Gambar', '1/bulan', '3/bulan', '6/bulan'],
        ['Video', '\u2014', '1/bulan', '3/bulan'],
        ['Daily Insights', '8/hari', '10/hari', '12/hari'],
        ['Radar Discovery', '5/minggu', '15/minggu', '30/minggu'],
        ['Search', '10/bulan', '50/bulan', 'Unlimited'],
        ['Support', 'Email', 'Priority', 'Dedicated'],
    ]

    tier_table = Table(
        [[Paragraph(f'<b>{c}</b>' if i==0 or j==0 else c,
          ParagraphStyle('TC', fontName='Helvetica', fontSize=7.5, leading=10, textColor=GV_ANCHOR if i>0 and j>0 else white if i==0 else GV_ANCHOR))
          for j, c in enumerate(row)] for i, row in enumerate(tier_data)],
        colWidths=[30*mm, (CW-30*mm)/3, (CW-30*mm)/3, (CW-30*mm)/3]
    )
    tier_table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0), GV_ANCHOR),
        ('BACKGROUND',(1,0),(1,0), GV_BODY),
        ('BACKGROUND',(2,0),(2,0), GV_HERO),
        ('BACKGROUND',(3,0),(3,0), GV_HERO_DARK),
        ('TEXTCOLOR',(0,0),(-1,0), white),
        ('ALIGN',(1,0),(-1,-1),'CENTER'),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('INNERGRID',(0,0),(-1,-1), 0.3, GV_DIVIDER),
        ('BOX',(0,0),(-1,-1), 0.5, GV_DIVIDER),
        ('TOPPADDING',(0,0),(-1,-1), 1.5*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 1.5*mm),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [GV_CANVAS, GV_BG_LIGHT]),
    ]))
    story.append(tier_table)

    story.append(PageBreak())

    # ========================================================
    # PAGE 4: WHEN (03) + WHERE (04)
    # ========================================================
    story.append(section_header('03', 'WHEN \u2014 Kapan Diluncurkan?', S))
    story.append(green_divider())

    story.append(Paragraph(
        'GeoVera dijadwalkan untuk <b>soft launch pada 20 Februari 2026</b> dengan target '
        '20 pelanggan berbayar dan MRR $12,180.', S['Body']))

    story.append(Paragraph('<b>Timeline Pengembangan & Peluncuran</b>', S['SubTitle']))

    timeline = [
        ('Q4 2025', 'Fase Pengembangan', 'Arsitektur database, Edge Functions, integrasi AI multi-provider'),
        ('Jan 2026', 'Backend Complete', '24 Edge Functions deployed, 205+ tabel database, RLS security'),
        ('Feb 1-14', 'Frontend Finalisasi', '14 halaman WIRED design system, accessibility audit'),
        ('Feb 14', 'Brand Guidelines v1.0', 'Dokumen resmi tipografi, warna, dan standar desain'),
        ('Feb 15-18', 'Final Fixes', 'Perbaikan aksesibilitas 3 halaman: chat, content-studio, onboarding'),
        ('Feb 20', 'SOFT LAUNCH', 'Go-live 20 pelanggan pertama dengan full feature access'),
        ('Q2 2026', 'Scale Phase', 'Ekspansi ke 100 pelanggan, optimasi performa, fitur baru'),
    ]

    tl_rows = []
    for date, phase, desc in timeline:
        is_launch = 'LAUNCH' in phase
        tl_rows.append([
            Paragraph(f'<b>{date}</b>', ParagraphStyle('TLD', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=GV_HERO)),
            Paragraph(f'<b>{phase}</b><br/><font size="7" color="{GV_BODY.hexval()}">{desc}</font>',
                ParagraphStyle('TLV', fontName='Helvetica', fontSize=8, leading=11, textColor=GV_ANCHOR)),
        ])

    tl_table = Table(tl_rows, colWidths=[28*mm, None])
    tl_table.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('TOPPADDING',(0,0),(-1,-1), 1.5*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 1.5*mm),
        ('LINEBELOW',(0,0),(-1,-2), 0.3, GV_DIVIDER),
        # Highlight launch row
        ('BACKGROUND',(0,5),(-1,5), HexColor('#F0FDF4')),
        ('LINEBEFORE',(0,5),(0,5), 3, GV_HERO),
    ]))
    story.append(tl_table)

    story.append(Spacer(1, 5*mm))

    # WHERE section on same page
    story.append(section_header('04', 'WHERE \u2014 Di Mana GeoVera Beroperasi?', S))
    story.append(green_divider())

    story.append(Paragraph(
        'GeoVera adalah platform <b>global</b> yang mendukung operasi di 50+ negara '
        'dengan infrastruktur cloud yang dioptimalkan untuk performa global.', S['Body']))

    geo_data = [
        ['Region', 'Negara', 'Contoh'],
        ['North America', '3', 'USA, Canada, Mexico'],
        ['Europe', '17', 'UK, Germany, France, Italy, Spain, dll.'],
        ['Asia Pacific', '15', 'Japan, Singapore, Indonesia, Korea, dll.'],
        ['Middle East', '3', 'UAE, Saudi Arabia, Israel'],
        ['Latin America', '5', 'Brazil, Argentina, Colombia, Chile, Peru'],
        ['Africa', '4', 'South Africa, Nigeria, Kenya, Egypt'],
    ]
    geo_table = Table(
        [[Paragraph(f'<b>{c}</b>' if i==0 else c,
          ParagraphStyle('GT', fontName='Helvetica', fontSize=8, leading=10,
                         textColor=white if i==0 else GV_ANCHOR))
          for c in row] for i, row in enumerate(geo_data)],
        colWidths=[32*mm, 20*mm, None]
    )
    geo_table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0), GV_ANCHOR),
        ('TEXTCOLOR',(0,0),(-1,0), white),
        ('ALIGN',(1,0),(1,-1),'CENTER'),
        ('INNERGRID',(0,0),(-1,-1), 0.3, GV_DIVIDER),
        ('BOX',(0,0),(-1,-1), 0.5, GV_DIVIDER),
        ('TOPPADDING',(0,0),(-1,-1), 1.2*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 1.2*mm),
        ('LEFTPADDING',(0,0),(-1,-1), 2.5*mm),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [GV_CANVAS, GV_BG_LIGHT]),
    ]))
    story.append(geo_table)

    story.append(Spacer(1, 2.5*mm))

    infra = [
        '<b>Backend:</b> Supabase Edge Functions (Tokyo, ap-northeast-1) \u2014 latensi rendah Asia Pacific',
        '<b>CDN:</b> Vercel Edge Network \u2014 100+ lokasi global, HTTP/2, Brotli compression',
        '<b>Mata Uang:</b> 30+ mata uang (USD, EUR, IDR, JPY, SGD, GBP, dll.) dengan Purchase Power Parity',
        '<b>Bahasa:</b> 20+ bahasa (Indonesia, English, Japanese, Korean, Chinese, Spanish, dll.)',
        '<b>Pembayaran:</b> Xendit (Indonesia + Global) untuk pemrosesan transaksi',
    ]
    for p in infra:
        story.append(Paragraph(f'\u2022 {p}', S['TinyBullet']))

    story.append(PageBreak())

    # ========================================================
    # PAGE 5: WHY (05)
    # ========================================================
    story.append(section_header('05', 'WHY \u2014 Mengapa GeoVera Dibutuhkan?', S))
    story.append(green_divider())

    story.append(Paragraph(
        'Industri influencer marketing global tumbuh pesat namun menghadapi tantangan signifikan. '
        'GeoVera hadir untuk menjawab 5 masalah utama:', S['Body']))

    problems = [
        ('Fragmentasi Data Kreator',
         'Brand kesulitan menemukan kreator yang tepat di berbagai platform dan negara. Radar GeoVera mengkonsolidasikan data dari 50+ negara dalam satu pencarian.'),
        ('Kurangnya Market Intelligence',
         'Tidak ada tool terpadu untuk memahami kompetitor, market share, dan tren. GeoVera menyediakan analisis kompetitor, ranking brand, dan trend detection real-time.'),
        ('Produksi Konten yang Lambat',
         'Content Studio dengan AI multi-provider (GPT-4o, DALL-E 3, Claude 3.5 Sonnet) mempercepat produksi konten marketing hingga 10x lebih cepat.'),
        ('Otoritas Brand Sulit Dibangun',
         'Authority Hub memungkinkan brand mengkurasi konten sosial media dan menghasilkan artikel otoritas secara otomatis untuk membangun kredibilitas digital.'),
        ('Skala Global yang Rumit',
         'Mengelola influencer marketing di banyak negara dengan bahasa dan mata uang berbeda \u2014 satu platform untuk 50+ negara, 30+ mata uang, 20+ bahasa.'),
    ]

    for title, desc in problems:
        story.append(feature_box(title, desc, S))
        story.append(Spacer(1, 1*mm))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Goal & Tujuan Strategis</b>', S['SubTitle']))

    goals = [
        '<b>Soft Launch (Feb 2026):</b> 20 pelanggan berbayar, MRR $12,180, profit margin 98.8%',
        '<b>Full Scale (Q3 2026):</b> 100 pelanggan, MRR $40,620, profit margin 98.1%',
        '<b>Market Position:</b> Platform influencer marketing intelligence #1 di Asia Pacific',
        '<b>Product Vision:</b> All-in-one platform: discovery + analytics + content creation + authority building',
        '<b>Revenue Model:</b> SaaS subscription 3 tier (Basic $399, Premium $609, Partner $899/bulan)',
    ]
    for g in goals:
        story.append(Paragraph(f'\u2022 {g}', S['TinyBullet']))

    story.append(Spacer(1, 3*mm))

    # Profitability box
    profit = Table([[Paragraph(
        '<b>PROYEKSI PROFITABILITAS</b><br/><br/>'
        '<b>Soft Launch (20 customers):</b> Biaya $141/bln | MRR $12,180 | Profit $12,039 (98.8%)<br/>'
        '<b>Full Scale (100 customers):</b> Biaya $767/bln | MRR $40,620 | Profit $39,853 (98.1%)<br/><br/>'
        '<font size="7">Biaya operasional mencakup: Supabase ($25), OpenAI ($18-180), Anthropic ($12-184), '
        'Perplexity ($15-168), Apify ($8-80), SerpAPI ($50)</font>',
        ParagraphStyle('PT', fontName='Helvetica', fontSize=8, leading=12, textColor=GV_ANCHOR)
    )]], colWidths=[CW - 4*mm])
    profit.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1), HexColor('#F0FDF4')),
        ('BOX',(0,0),(-1,-1), 0.5, GV_HERO),
        ('LINEBEFORE',(0,0),(0,-1), 3, GV_HERO),
        ('TOPPADDING',(0,0),(-1,-1), 3.5*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 3.5*mm),
        ('LEFTPADDING',(0,0),(-1,-1), 5*mm),
        ('RIGHTPADDING',(0,0),(-1,-1), 3*mm),
    ]))
    story.append(profit)

    story.append(PageBreak())

    # ========================================================
    # PAGE 6: HOW (06)
    # ========================================================
    story.append(section_header('06', 'HOW \u2014 Bagaimana GeoVera Bekerja?', S))
    story.append(green_divider())

    story.append(Paragraph(
        'GeoVera menggunakan arsitektur modern berbasis cloud dengan integrasi AI multi-provider:', S['Body']))

    story.append(Paragraph('<b>Arsitektur Teknologi</b>', S['SubTitle']))

    arch_data = [
        ['Komponen', 'Teknologi', 'Detail'],
        ['Database', 'Supabase PostgreSQL 15+', '205+ tabel, multi-tenant RLS'],
        ['Backend', 'Edge Functions (Deno)', '24 fungsi serverless'],
        ['Frontend', 'Vanilla HTML/CSS/JS', '14 halaman, WIRED design'],
        ['CDN', 'Vercel Edge Network', '100+ lokasi, HTTP/2, Brotli'],
        ['Auth', 'Supabase Auth (JWT)', 'Google OAuth, email/password'],
        ['Payment', 'Xendit', 'Indonesia + Global'],
    ]
    arch_table = Table(
        [[Paragraph(f'<b>{c}</b>' if i==0 else c,
          ParagraphStyle('AT', fontName='Helvetica', fontSize=8, leading=10,
                         textColor=white if i==0 else GV_ANCHOR))
          for c in row] for i, row in enumerate(arch_data)],
        colWidths=[25*mm, 40*mm, None]
    )
    arch_table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0), GV_ANCHOR),
        ('INNERGRID',(0,0),(-1,-1), 0.3, GV_DIVIDER),
        ('BOX',(0,0),(-1,-1), 0.5, GV_DIVIDER),
        ('TOPPADDING',(0,0),(-1,-1), 1.2*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 1.2*mm),
        ('LEFTPADDING',(0,0),(-1,-1), 2.5*mm),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [GV_CANVAS, GV_BG_LIGHT]),
    ]))
    story.append(arch_table)

    story.append(Spacer(1, 2.5*mm))
    story.append(Paragraph('<b>Integrasi AI Multi-Provider</b>', S['SubTitle']))

    ai_data = [
        ['Provider', 'Model', 'Fungsi'],
        ['OpenAI', 'GPT-4o', 'AI Chat, artikel, strategi marketing'],
        ['OpenAI', 'DALL-E 3', 'Pembuatan gambar kreatif'],
        ['Anthropic', 'Claude 3.5 Sonnet', 'Skrip video, analisis konten'],
        ['Perplexity', 'Sonar Pro', 'Discovery kreator & brand global'],
        ['Apify', 'Web Scraping', 'Data Instagram, TikTok, YouTube'],
        ['SerpAPI', 'Google Search', 'Search intelligence, YouTube data'],
    ]
    ai_table = Table(
        [[Paragraph(f'<b>{c}</b>' if i==0 else c,
          ParagraphStyle('AIT', fontName='Helvetica', fontSize=8, leading=10,
                         textColor=white if i==0 else GV_ANCHOR))
          for c in row] for i, row in enumerate(ai_data)],
        colWidths=[25*mm, 38*mm, None]
    )
    ai_table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0), GV_HERO),
        ('INNERGRID',(0,0),(-1,-1), 0.3, GV_DIVIDER),
        ('BOX',(0,0),(-1,-1), 0.5, GV_DIVIDER),
        ('TOPPADDING',(0,0),(-1,-1), 1.2*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 1.2*mm),
        ('LEFTPADDING',(0,0),(-1,-1), 2.5*mm),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [GV_CANVAS, GV_BG_LIGHT]),
    ]))
    story.append(ai_table)

    story.append(Spacer(1, 2.5*mm))
    story.append(Paragraph('<b>Alur Kerja Platform (6 Langkah)</b>', S['SubTitle']))

    workflow = [
        '<b>1. Onboarding</b> \u2014 Brand mendaftar via 5-step wizard: profil, industri, target market, bahasa/mata uang',
        '<b>2. Discovery (Radar)</b> \u2014 AI memindai 50+ negara untuk kreator, kompetitor, dan tren relevan',
        '<b>3. Analisis & Ranking</b> \u2014 Hitung ranking brand, market share, dan skor otoritas',
        '<b>4. Content Creation</b> \u2014 Hasilkan artikel, gambar, skrip video dengan brand voice via AI training',
        '<b>5. Authority Building</b> \u2014 Kurasi konten sosmed terbaik, generate artikel otoritas otomatis',
        '<b>6. Daily Optimization</b> \u2014 8-12 task actionable harian untuk optimasi strategi marketing',
    ]
    for w in workflow:
        story.append(Paragraph(w, S['SmallBody']))

    story.append(Spacer(1, 3*mm))

    # Security box
    sec = Table([[Paragraph(
        '<b>KEAMANAN & COMPLIANCE (Skor: 95/100)</b><br/>'
        '\u2022 <b>Row Level Security:</b> 104+ policy untuk isolasi data multi-tenant &nbsp;&nbsp;'
        '\u2022 <b>JWT Auth:</b> Token-based dengan auto-refresh<br/>'
        '\u2022 <b>CORS Protection:</b> Restricted ke geovera.xyz &nbsp;&nbsp;'
        '\u2022 <b>Enkripsi:</b> At-rest encryption via Supabase<br/>'
        '\u2022 <b>Security Headers:</b> X-Content-Type-Options, X-Frame-Options, X-XSS-Protection',
        ParagraphStyle('ST', fontName='Helvetica', fontSize=7.5, leading=11, textColor=GV_ANCHOR)
    )]], colWidths=[CW - 4*mm])
    sec.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1), GV_BG_LIGHT),
        ('BOX',(0,0),(-1,-1), 0.5, GV_DIVIDER),
        ('LINEBEFORE',(0,0),(0,-1), 3, GV_ANCHOR),
        ('TOPPADDING',(0,0),(-1,-1), 3*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 3*mm),
        ('LEFTPADDING',(0,0),(-1,-1), 5*mm),
        ('RIGHTPADDING',(0,0),(-1,-1), 3*mm),
    ]))
    story.append(sec)

    story.append(PageBreak())

    # ========================================================
    # PAGE 7: FITUR LENGKAP (07)
    # ========================================================
    story.append(section_header('07', 'Fitur Lengkap & Inventaris Platform', S))
    story.append(green_divider())

    story.append(Paragraph('<b>24 Edge Functions (100% Deployed & Operational)</b>', S['SubTitle']))

    func_cats = [
        ('Radar \u2014 Discovery Engine (9)', 'radar-discover-creators \u2022 radar-discover-brands \u2022 radar-discover-trends \u2022 radar-scrape-content \u2022 radar-scrape-serpapi \u2022 radar-analyze-content \u2022 radar-calculate-rankings \u2022 radar-calculate-marketshare \u2022 radar-learn-brand-authority'),
        ('Authority Hub (4)', 'hub-create-collection \u2022 hub-discover-content \u2022 hub-generate-article \u2022 hub-generate-charts'),
        ('Content Studio (3)', 'generate-article \u2022 generate-image \u2022 generate-video'),
        ('BuzzSumo Integration (3)', 'buzzsumo-discover-viral \u2022 buzzsumo-generate-story \u2022 buzzsumo-get-discoveries'),
        ('AI & Training (4)', 'ai-chat \u2022 train-brand-model \u2022 analyze-visual-content \u2022 record-content-feedback'),
        ('System (3)', 'generate-daily-insights \u2022 onboard-brand-v4 \u2022 simple-onboarding'),
    ]

    for cat, funcs in func_cats:
        story.append(Paragraph(f'<b>{cat}</b>', S['H3']))
        story.append(Paragraph(f'<font size="7" color="{GV_HERO.hexval()}">{funcs}</font>',
            ParagraphStyle('FC', fontName='Helvetica', fontSize=7, leading=10, textColor=GV_HERO)))
        story.append(Spacer(1, 1*mm))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>14 Halaman Frontend</b>', S['SubTitle']))

    pages_data = [
        ['Halaman', 'Route', 'Status'],
        ['Landing Page', '/', 'Ready'],
        ['Login', '/login', 'Ready'],
        ['Dashboard', '/dashboard', 'Ready'],
        ['Pricing', '/pricing', 'Ready'],
        ['Insights', '/insights', 'Ready'],
        ['Hub', '/hub', 'Ready'],
        ['Hub Collection', '/hub/:id', 'Ready'],
        ['Radar', '/radar', 'Ready'],
        ['Creators', '/creators', 'Ready'],
        ['Settings', '/settings', 'Ready'],
        ['Analytics', '/analytics', 'Ready'],
        ['Chat', '/chat', 'Fix Needed'],
        ['Content Studio', '/content-studio', 'Fix Needed'],
        ['Onboarding', '/onboarding', 'Fix Needed'],
    ]

    pages_table = Table(
        [[Paragraph(
            f'<b>{c}</b>' if i==0 else
            f'<font color="{GV_RISK.hexval()}">{c}</font>' if 'Fix' in str(c) else
            f'<font color="{GV_HERO.hexval()}">{c}</font>' if c=='Ready' else c,
            ParagraphStyle('PT2', fontName='Helvetica', fontSize=7.5, leading=10,
                           textColor=white if i==0 else GV_ANCHOR))
          for c in row] for i, row in enumerate(pages_data)],
        colWidths=[35*mm, 35*mm, None]
    )
    pages_table.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0), GV_ANCHOR),
        ('INNERGRID',(0,0),(-1,-1), 0.3, GV_DIVIDER),
        ('BOX',(0,0),(-1,-1), 0.5, GV_DIVIDER),
        ('TOPPADDING',(0,0),(-1,-1), 1*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 1*mm),
        ('LEFTPADDING',(0,0),(-1,-1), 2.5*mm),
        ('ROWBACKGROUNDS',(0,1),(-1,-1), [GV_CANVAS, GV_BG_LIGHT]),
        # Highlight fix needed rows
        ('BACKGROUND',(0,12),(-1,14), HexColor('#FEF2F2')),
    ]))
    story.append(pages_table)

    story.append(PageBreak())

    # ========================================================
    # PAGE 8: KESIMPULAN (08)
    # ========================================================
    story.append(section_header('08', 'Kesimpulan & Rekomendasi', S))
    story.append(green_divider())

    story.append(Paragraph(
        'Berdasarkan analisis komprehensif 5W1H terhadap GeoVera Intelligence Platform:', S['Body']))

    story.append(Paragraph('<b>Kekuatan Utama</b>', S['SubTitle']))

    strengths = [
        '<b>Arsitektur Matang:</b> Backend 100% production-ready \u2014 24 Edge Functions, 205+ tabel database, Row Level Security',
        '<b>AI Multi-Provider:</b> Integrasi OpenAI + Anthropic + Perplexity \u2014 tidak tergantung satu provider',
        '<b>Cakupan Global:</b> 50+ negara, 30+ mata uang, 20+ bahasa dari satu platform',
        '<b>Profitabilitas Tinggi:</b> Margin profit 98%+ berkat arsitektur serverless yang efisien',
        '<b>Keamanan Enterprise:</b> Skor 95/100 \u2014 multi-tenant isolation, RLS, security headers',
        '<b>Desain Profesional:</b> WCAG 2.1 AA compliant, WIRED design system',
    ]
    for s in strengths:
        story.append(Paragraph(f'\u2713 {s}', S['TinyBullet']))

    story.append(Spacer(1, 2*mm))
    story.append(Paragraph('<b>Area Perbaikan (Blockers)</b>', S['SubTitle']))

    blockers = [
        '<b>chat.html</b> \u2014 Missing ARIA labels, keyboard navigation',
        '<b>content-studio.html</b> \u2014 Accessibility gaps, design inconsistencies',
        '<b>onboarding.html</b> \u2014 Incomplete accessibility implementation',
        '<b>Navigasi</b> \u2014 Standardisasi di seluruh 14 halaman + border-radius WIRED compliance',
    ]
    for b in blockers:
        story.append(Paragraph(f'\u2022 {b}', S['TinyBullet']))

    story.append(Spacer(1, 3*mm))
    story.append(Paragraph('<b>Rekomendasi Strategis</b>', S['SubTitle']))

    recs = [
        ('Prioritas 1: Fix Blockers (Sebelum 18 Feb)',
         'Selesaikan perbaikan aksesibilitas pada 3 halaman untuk WCAG 2.1 AA compliance penuh.'),
        ('Prioritas 2: Soft Launch (20 Feb 2026)',
         'Lanjutkan soft launch dengan target 20 pelanggan. Backend 100% siap, fitur lengkap.'),
        ('Prioritas 3: Iterasi Cepat (Mar-Apr 2026)',
         'Kumpulkan feedback pelanggan pertama, iterasi berdasarkan data nyata. Fokus retention.'),
        ('Prioritas 4: Scale (Q2-Q3 2026)',
         'Ekspansi ke 100 pelanggan setelah validasi product-market fit. Target MRR $40,620.'),
    ]

    for title, desc in recs:
        story.append(feature_box(title, desc, S))
        story.append(Spacer(1, 1*mm))

    story.append(Spacer(1, 5*mm))

    # Final verdict
    verdict = Table([[Paragraph(
        '<font size="13"><b>VERDICT: CONDITIONAL GO</b></font><br/><br/>'
        '<font size="9">GeoVera Intelligence Platform siap untuk soft launch pada 20 Februari 2026 '
        'dengan catatan perbaikan aksesibilitas pada 3 halaman harus diselesaikan sebelum 18 Februari 2026. '
        'Platform ini memiliki fondasi teknis yang sangat kuat, model bisnis yang profitable, '
        'dan posisi unik di pasar influencer marketing intelligence global.</font>',
        ParagraphStyle('VT', fontName='Helvetica', fontSize=9, leading=14, textColor=white, alignment=TA_CENTER)
    )]], colWidths=[CW - 4*mm])
    verdict.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,-1), GV_HERO),
        ('TOPPADDING',(0,0),(-1,-1), 6*mm),
        ('BOTTOMPADDING',(0,0),(-1,-1), 6*mm),
        ('LEFTPADDING',(0,0),(-1,-1), 6*mm),
        ('RIGHTPADDING',(0,0),(-1,-1), 6*mm),
    ]))
    story.append(verdict)

    story.append(Spacer(1, 5*mm))
    story.append(thin_divider())
    story.append(Paragraph(
        'Dokumen ini dibuat berdasarkan analisis codebase GeoVera Intelligence Platform.<br/>'
        'Versi 1.0 \u2014 14 Februari 2026 \u2014 geovera.xyz',
        S['FooterNote']))

    # Build
    doc.build(story)
    print(f'PDF generated: {output_path}')
    return output_path


if __name__ == '__main__':
    build_pdf()
