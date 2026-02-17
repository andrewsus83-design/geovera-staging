# PUBLIC REPORT SYSTEM - GEOVERA

## 📊 Overview

Sistem untuk publish brand intelligence reports secara public dengan URL yang shareable dan branded design.

**URL Structure**: `https://geovera.xyz/report-viewer.html?brand=kata-oma`

---

## 📄 Files Created

### 1. **bulletin-branded.html**
**Purpose**: Email newsletter / bulletin format dengan GeoVera branding
**Design**: Professional bulletin layout dengan brand colors
**Use Case**: Send via email, print PDF untuk client

**Features**:
- ✅ GeoVera brand colors (Green #16a34a primary)
- ✅ Bulletin header dengan issue number
- ✅ Hero section dengan gradient green
- ✅ Stats cards, comparison tables, workflow boxes
- ✅ Professional footer dengan links
- ✅ Responsive design (mobile + desktop)
- ✅ Print-friendly

**Access**: `/frontend/bulletin-branded.html`

---

### 2. **report-viewer.html** ⭐
**Purpose**: Public report viewer untuk share ke clients
**Design**: Clean, branded, professional
**Use Case**: Public URL yang bisa dishare: `report.geovera.xyz?brand=kata-oma`

**Features**:
- ✅ Dynamic URL parameter (`?brand=kata-oma`)
- ✅ Fetch report dari Supabase (or demo mode)
- ✅ Markdown rendering dengan `marked.js`
- ✅ GeoVera branded header + footer
- ✅ Print to PDF button
- ✅ CTA button "Get Your Report"
- ✅ Loading state & error handling
- ✅ SEO friendly meta tags

**Technical**:
- Supabase integration untuk fetch reports
- Marked.js untuk render markdown
- Public access (no auth required)
- Mobile responsive

**Access**: `/frontend/report-viewer.html?brand=kata-oma`

---

### 3. **showcase-article.html**
**Purpose**: Long-form article untuk blog/marketing
**Design**: Modern blog article dengan images
**Use Case**: Content marketing, SEO, blog

**Features**:
- ✅ 6 high-quality images dari Unsplash
- ✅ Purple gradient theme (original design)
- ✅ Stats grids, comparison tables
- ✅ Terminal code display
- ✅ CTA sections
- ✅ ~2,500 words content
- ✅ SEO optimized

**Access**: `/frontend/showcase-article.html`

---

## 🎨 GeoVera Brand Guidelines

### Color Palette
```css
/* Primary Green */
--gv-green-500: #16a34a;   /* Main brand color */
--gv-green-600: #15803d;   /* Hover state */
--gv-green-700: #166534;   /* Active state */
--gv-green-50:  #f0fdf4;   /* Light background */

/* Gray Scale */
--gv-gray-50:  #f9fafb;    /* Background */
--gv-gray-700: #344054;    /* Body text */
--gv-gray-900: #101828;    /* Headings */

/* Accent */
--gv-orange-500: #fb6514;  /* Highlights */
```

### Typography
```css
/* Font Families */
--font-sans:  'Inter', sans-serif;      /* Body text */
--font-serif: 'Georgia', serif;         /* Headlines */

/* Font Sizes */
h1: 2.75rem (44px) - Hero headlines
h2: 2rem (32px) - Section titles
h3: 1.4rem (22px) - Subsections
p:  1.05rem (17px) - Body text
```

### Design System
- **Border Radius**: 8px (cards), 6px (buttons)
- **Shadows**:
  - Light: `0 2px 8px rgba(0,0,0,0.03)`
  - Medium: `0 4px 20px rgba(0,0,0,0.08)`
- **Spacing**: 16px, 24px, 32px, 48px multiples
- **Max Width**: 900px for content

---

## 🚀 Deployment Strategy

### Option 1: Vercel (Recommended)
```bash
# Deploy to geovera.xyz
cd /Users/drew83/Desktop/geovera-staging
vercel --prod

# URLs will be:
# https://geovera.xyz/bulletin-branded.html
# https://geovera.xyz/report-viewer.html?brand=kata-oma
# https://geovera.xyz/showcase-article.html
```

### Option 2: Custom Subdomain
**Setup**: `report.geovera.xyz`

**DNS Config**:
```
CNAME report -> geovera.vercel.app
```

**Access**:
- `https://report.geovera.xyz?brand=kata-oma`
- `https://report.geovera.xyz?brand=aquviva`

---

## 💾 Database Schema (Supabase)

### Table: `brand_reports`
```sql
CREATE TABLE brand_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_company TEXT,
    category TEXT,
    country TEXT,
    report_markdown TEXT NOT NULL,
    metadata JSONB,
    public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast slug lookup
CREATE INDEX idx_brand_reports_slug ON brand_reports(slug);
CREATE INDEX idx_brand_reports_public ON brand_reports(public) WHERE public = true;

-- Enable Row Level Security
ALTER TABLE brand_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Public reports readable by anyone
CREATE POLICY "Public reports are viewable by everyone"
ON brand_reports FOR SELECT
USING (public = true);
```

### Slug Generation
```javascript
// Convert brand name to URL-friendly slug
function generateSlug(brandName) {
    return brandName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

// Examples:
// "Kata Oma" -> "kata-oma"
// "AQUVIVA" -> "aquviva"
// "The Watch Co." -> "the-watch-co"
```

---

## 📋 Workflow Integration

### Step 1: Generate Report (Onboarding)
```javascript
// After Step 4 (GPT-4o report generation)
const reportData = {
    brand_name: 'Kata Oma',
    slug: 'kata-oma',
    parent_company: 'PT. United Family Food (Unifam)',
    category: 'Snacks → Telur Gabus',
    country: 'Indonesia',
    report_markdown: finalReport, // From GPT-4o
    metadata: {
        step1_indexed_data,
        step3_analysis,
        generated_by: '5-step AI workflow'
    },
    public: true // Make shareable
};

// Insert to Supabase
const { data, error } = await supabase
    .from('brand_reports')
    .insert([reportData])
    .select();
```

### Step 2: Share Public URL
```javascript
// Return shareable URL after report generation
const publicURL = `https://geovera.xyz/report-viewer.html?brand=${slug}`;

// Example URLs:
// https://geovera.xyz/report-viewer.html?brand=kata-oma
// https://geovera.xyz/report-viewer.html?brand=aquviva
// https://geovera.xyz/report-viewer.html?brand=the-watch-co
```

### Step 3: Client Access
1. Client receives URL via email/dashboard
2. Opens URL in browser (no login required)
3. Report loads dynamically from Supabase
4. Client can:
   - Read full report
   - Download as PDF (Print to PDF)
   - Share URL with stakeholders
   - Access anytime (permanent link)

---

## 🔗 URL Examples

### Production URLs
```
# Public Report Viewer
https://geovera.xyz/report-viewer.html?brand=kata-oma
https://geovera.xyz/report-viewer.html?brand=aquviva

# Branded Bulletin
https://geovera.xyz/bulletin-branded.html

# Showcase Article
https://geovera.xyz/showcase-article.html

# With Custom Subdomain (future)
https://report.geovera.xyz?brand=kata-oma
```

---

## 🎯 Use Cases

### 1. **Client Onboarding**
- Client completes onboarding form
- AI generates intelligence report
- System creates public URL
- Client receives: `report.geovera.xyz?brand=their-brand`
- Client shares with team/investors

### 2. **Sales Demo**
- Sales team shares demo report
- Prospect sees: `report.geovera.xyz?brand=demo`
- Professional, branded presentation
- Clear CTA: "Get Your Report"

### 3. **Content Marketing**
- Publish bulletin as blog post
- Share showcase article on social media
- SEO benefits from public reports
- Backlinks from client websites

### 4. **Email Campaigns**
- Send bulletin HTML via email
- Include CTA linking to report viewer
- Track engagement via URL parameters

---

## ✅ Implementation Checklist

### Database Setup
- [ ] Create `brand_reports` table in Supabase
- [ ] Enable Row Level Security (RLS)
- [ ] Create public read policy
- [ ] Add indexes for performance
- [ ] Test insert/select queries

### Edge Function Update
- [ ] Modify `onboarding-workflow` to save reports
- [ ] Generate slug from brand name
- [ ] Insert report to Supabase after Step 4
- [ ] Return public URL in response
- [ ] Add error handling

### Frontend Deployment
- [ ] Deploy all 3 HTML files to Vercel
- [ ] Test `report-viewer.html?brand=demo`
- [ ] Verify Supabase connection
- [ ] Test markdown rendering
- [ ] Check responsive design
- [ ] Verify Print to PDF

### Optional: Custom Subdomain
- [ ] Setup DNS CNAME: `report.geovera.xyz`
- [ ] Configure Vercel project
- [ ] Test subdomain access
- [ ] Update all documentation URLs

---

## 🔒 Security Considerations

### Public Access (Safe)
✅ **Reports marked `public: true`** - Anyone can view
✅ **No authentication required** - Easy sharing
✅ **Read-only access** - Cannot modify reports
✅ **RLS policy enforced** - Only public reports visible

### Private Reports (Future)
🔐 **Reports marked `public: false`** - Require authentication
🔐 **Client-specific access** - JWT tokens or magic links
🔐 **Time-limited access** - Expiring URLs
🔐 **Password protection** - Optional password per report

---

## 📊 Analytics Tracking (Future)

### Track Report Views
```sql
CREATE TABLE report_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES brand_reports(id),
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT,
    referrer TEXT,
    ip_address INET
);
```

### Track User Actions
- Page views
- Time on page
- Print/download events
- CTA button clicks
- Share events

---

## 🎨 Customization Options

### Per-Brand Styling
```javascript
// Allow clients to customize report colors
const brandConfig = {
    primary_color: '#16a34a',    // Override green
    logo_url: 'https://...',     // Custom logo
    custom_domain: 'reports.brandname.com'
};
```

### White-Label Option
- Remove GeoVera branding
- Use client's logo
- Custom color scheme
- Custom domain (CNAME)

---

## 📝 Next Steps

1. **Deploy Files**
   ```bash
   cd /Users/drew83/Desktop/geovera-staging
   vercel --prod
   ```

2. **Create Database Table**
   - Run SQL schema in Supabase
   - Test with demo data

3. **Update Edge Function**
   - Modify `onboarding-workflow/index.ts`
   - Add Supabase insert after report generation

4. **Test End-to-End**
   - Generate report for "Test Brand"
   - Verify URL works: `?brand=test-brand`
   - Check markdown rendering
   - Test Print to PDF

5. **Optional: Custom Subdomain**
   - Setup `report.geovera.xyz`
   - Update all URLs

---

**Status**: ✅ Files Created, Ready for Deployment
**Date**: February 17, 2026
**Files**:
- `frontend/bulletin-branded.html` (34 KB)
- `frontend/report-viewer.html` (15 KB)
- `frontend/showcase-article.html` (22 KB)
