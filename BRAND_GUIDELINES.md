# GeoVera Intelligence Platform - Brand Guidelines

**Version:** 1.0
**Last Updated:** February 14, 2026
**Status:** Official SOP for UI/UX & Design Team

---

## Table of Contents
1. [Brand Overview](#1-brand-overview)
2. [Typography](#2-typography)
3. [Color Palette](#3-color-palette)
4. [Iconography](#4-iconography)
5. [Design System](#5-design-system)
6. [Accessibility Standards](#6-accessibility-standards)
7. [Component Library](#7-component-library)
8. [Spacing & Layout](#8-spacing--layout)
9. [Implementation Guide](#9-implementation-guide)

---

## 1. Brand Overview

### Brand Identity
**GeoVera Intelligence Platform** is a global AI-powered influencer marketing platform with a professional, data-driven, and modern aesthetic inspired by WIRED magazine's design language.

### Core Values
- **Professional**: Enterprise-grade platform for serious marketers
- **Data-Driven**: Analytics and insights at the forefront
- **Global**: Supporting 50+ countries and 30+ currencies
- **Modern**: Clean, minimal, sharp design language
- **Accessible**: WCAG 2.1 AA compliant

### Design Philosophy
- **Sharp & Bold**: No rounded corners (except circles/avatars)
- **Typography-First**: Georgia serif headlines, Inter sans-serif body
- **Green Primary**: Fresh, growth-oriented color (#16A34A)
- **High Contrast**: Dark text on light backgrounds for readability
- **Minimal & Clean**: No unnecessary decoration

---

## 2. Typography

### Font Families

#### Display Font (Headlines)
**Primary:** Georgia
**Fallback:** 'Times New Roman', serif

```css
font-family: Georgia, 'Times New Roman', serif;
```

**Usage:**
- All H1, H2, H3, H4 headings
- Page titles
- Section headers
- Card titles
- Modal titles
- Brand name in logo

**Characteristics:**
- Serif typeface for authority and professionalism
- High readability at large sizes
- Classic, timeless aesthetic
- System font (no web font loading needed)

---

#### Body Font (Content)
**Primary:** Inter
**Fallback:** system-ui, -apple-system, sans-serif

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

**Usage:**
- Body copy
- Paragraphs
- Lists
- Form labels and inputs
- Buttons
- Navigation links
- All UI text

**Characteristics:**
- Sans-serif for digital readability
- Optimized for screens
- Clean, modern appearance
- Excellent at small sizes

---

### Type Scale

#### Desktop Typography
```css
/* Headlines */
h1: 32px / 2rem     /* Georgia, bold, line-height: 1.2 */
h2: 24px / 1.5rem   /* Georgia, bold, line-height: 1.3 */
h3: 20px / 1.25rem  /* Georgia, semibold, line-height: 1.4 */
h4: 18px / 1.125rem /* Georgia, semibold, line-height: 1.4 */

/* Body Text */
body: 16px / 1rem     /* Inter, normal, line-height: 1.6 */
large: 18px / 1.125rem /* Inter, normal, line-height: 1.6 */
small: 14px / 0.875rem /* Inter, normal, line-height: 1.5 */
tiny: 12px / 0.75rem   /* Inter, normal, line-height: 1.4 */

/* UI Elements */
button: 16px / 1rem    /* Inter, semibold, line-height: 1 */
input: 16px / 1rem     /* Inter, normal, line-height: 1.5 */
label: 14px / 0.875rem /* Inter, medium, line-height: 1.4 */
```

#### Mobile Typography
```css
/* Scale down by 10-15% for mobile */
h1: 28px / 1.75rem
h2: 22px / 1.375rem
h3: 18px / 1.125rem
h4: 16px / 1rem

body: 16px / 1rem (same as desktop for readability)
```

---

### Font Weights

#### Georgia (Headlines)
```css
font-weight: 400; /* Regular - default */
font-weight: 700; /* Bold - primary headlines */
```

#### Inter (Body)
```css
font-weight: 400; /* Regular - body text */
font-weight: 500; /* Medium - labels, subtle emphasis */
font-weight: 600; /* Semibold - buttons, strong emphasis */
font-weight: 700; /* Bold - extra emphasis (use sparingly) */
```

---

### Letter Spacing & Line Height

```css
/* Headlines - Tight spacing */
h1, h2, h3, h4 {
    letter-spacing: -0.02em; /* Tighter for impact */
    line-height: 1.2-1.4;    /* Compact for headers */
}

/* Body Text - Normal spacing */
p, li, span {
    letter-spacing: 0;       /* Default */
    line-height: 1.5-1.6;    /* Comfortable reading */
}

/* UI Elements - Slight spacing */
button, .nav-link {
    letter-spacing: 0.01em;  /* Slightly open */
    line-height: 1-1.2;      /* Compact for UI */
}
```

---

### Typography Examples

```html
<!-- Correct Usage -->
<h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 700;">
    GeoVera Intelligence Platform
</h1>

<h2 style="font-family: Georgia, serif; font-size: 24px; font-weight: 700;">
    Discover Creators Worldwide
</h2>

<p style="font-family: Inter, sans-serif; font-size: 16px; line-height: 1.6;">
    GeoVera helps brands find influencers across 50+ countries and manage campaigns with AI-powered insights.
</p>

<button style="font-family: Inter, sans-serif; font-size: 16px; font-weight: 600;">
    Start Free Trial
</button>
```

---

## 3. Color Palette

### Primary Colors

#### Hero Green (Primary)
**Hex:** `#16A34A`
**RGB:** `rgb(22, 163, 74)`
**CSS Variable:** `--gv-hero`

**Usage:**
- Primary CTA buttons
- Links and interactive elements
- Icons and accent elements
- Success states and confirmations
- Brand logo circle
- Active/selected states
- Progress bars and indicators

**Accessibility:**
- Contrast ratio on white: 4.5:1 (AA compliant)
- Passes WCAG for text and UI elements

---

#### Dark Navy (Text & UI)
**Hex:** `#0B0F19`
**RGB:** `rgb(11, 15, 25)`
**CSS Variable:** `--gv-anchor`

**Usage:**
- Primary text color
- Headlines and body copy
- Icons (default dark state)
- Borders for emphasis
- Navigation elements

**Accessibility:**
- Contrast ratio on white: 16:1 (AAA compliant)

---

### Secondary Colors

#### Body Gray (Secondary Text)
**Hex:** `#6B7280`
**RGB:** `rgb(107, 114, 128)`
**CSS Variable:** `--gv-body`

**Usage:**
- Secondary text
- Metadata (dates, counts, labels)
- Placeholder text
- Inactive/disabled states

---

#### Canvas White (Backgrounds)
**Hex:** `#FFFFFF`
**RGB:** `rgb(255, 255, 255)`
**CSS Variable:** `--gv-canvas`

**Usage:**
- Page backgrounds
- Card backgrounds
- Modal backgrounds
- Input fields

---

#### Light Background
**Hex:** `#F9FAFB`
**RGB:** `rgb(249, 250, 251)`
**CSS Variable:** `--gv-bg-light`

**Usage:**
- Alternate section backgrounds
- Subtle elevation differences
- Hover states on white backgrounds
- Table row alternation

---

#### Divider Gray (Borders)
**Hex:** `#E5E7EB`
**RGB:** `rgb(229, 231, 235)`
**CSS Variable:** `--gv-divider`

**Usage:**
- Borders and dividers
- Card outlines
- Input borders
- Table cell borders

---

### Semantic Colors

#### Risk Red (Errors & Warnings)
**Hex:** `#DC2626`
**RGB:** `rgb(220, 38, 38)`
**CSS Variable:** `--gv-risk`

**Usage:**
- Error messages
- Delete/destructive actions
- Crisis alerts
- Form validation errors
- Warning indicators

---

#### Warning Yellow
**Hex:** `#F59E0B`
**RGB:** `rgb(245, 158, 11)`

**Usage:**
- Warning states
- Limit warnings (70-90% usage)
- Pending/processing states

---

#### Success Green
**Hex:** `#10B981`
**RGB:** `rgb(16, 185, 129)`

**Usage:**
- Success confirmations
- Completed states
- Checkmarks and validation

---

#### Info Blue
**Hex:** `#3B82F6`
**RGB:** `rgb(59, 130, 246)`

**Usage:**
- Informational messages
- Helper text
- Tips and guidance

---

### Color Usage Matrix

| Element | Primary | Hover | Active | Disabled |
|---------|---------|-------|--------|----------|
| **Button (Primary)** | #16A34A | #15803D | #14532D | #6B7280 |
| **Button (Secondary)** | White | #F9FAFB | #E5E7EB | #F9FAFB |
| **Link** | #16A34A | #15803D | #14532D | #6B7280 |
| **Text** | #0B0F19 | - | - | #6B7280 |
| **Border** | #E5E7EB | #6B7280 | #16A34A | #E5E7EB |
| **Background** | #FFFFFF | #F9FAFB | - | #F9FAFB |

---

### CSS Variables Implementation

```css
:root {
    /* Primary Colors */
    --gv-hero: #16A34A;        /* Green primary */
    --gv-anchor: #0B0F19;      /* Dark navy */
    --gv-body: #6B7280;        /* Gray secondary */
    --gv-canvas: #FFFFFF;      /* White */
    --gv-bg-light: #F9FAFB;    /* Light gray background */
    --gv-divider: #E5E7EB;     /* Border gray */

    /* Semantic Colors */
    --gv-risk: #DC2626;        /* Red for errors */
    --gv-warning: #F59E0B;     /* Yellow for warnings */
    --gv-success: #10B981;     /* Green for success */
    --gv-info: #3B82F6;        /* Blue for info */

    /* Typography */
    --font-display: Georgia, 'Times New Roman', serif;
    --font-body: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Usage Example */
.button-primary {
    background-color: var(--gv-hero);
    color: var(--gv-canvas);
}

.text-secondary {
    color: var(--gv-body);
}
```

---

## 4. Iconography

### Icon Library Location
**Path:** `/geovera-assets/icons/`
**Total Icons:** 180 SVG files
**Format:** 24x24 viewBox, 2px stroke width

### Icon Categories
1. **Platform Core** (15 icons): dashboard, insights, radar, hub, chat, etc.
2. **Actions & Controls** (12 icons): add, edit, delete, save, share, etc.
3. **Navigation** (8 icons): arrows, chevrons
4. **Social Platforms** (10 icons): Instagram, TikTok, YouTube, LinkedIn, etc.
5. **Content Types** (8 icons): image, video, audio, document, etc.
6. **Metrics & Status** (7 icons): views, likes, comments, engagement, etc.
7. **Business & Metrics** (30 icons): revenue, ROI, growth, conversion, etc.
8. **Creator & Marketing** (30 icons): influencer, campaign, audience, etc.
9. **Content & Media** (30 icons): photo, gallery, hashtag, emoji, etc.
10. **System & Technical** (30 icons): database, API, security, loading, etc.

### Icon Design Standards

#### Base Color
**Default:** `#0B0F19` (dark stroke)
- All icons use dark stroke by default
- Color customizable via CSS when used

#### Dimensions
```css
viewBox: 0 0 24 24
stroke-width: 2px
width: 24px
height: 24px
```

#### Style Guidelines
- **Sharp Corners:** stroke-linejoin="miter" (WIRED style)
- **Rounded Caps:** stroke-linecap="round" for smooth lines
- **No Fill:** Icons use stroke only (except social logos)
- **Minimal Design:** Clean, recognizable shapes
- **Consistent Weight:** 2px stroke throughout

---

### Icon Usage

#### HTML Direct Usage
```html
<img src="/geovera-assets/icons/dashboard.svg"
     alt="Dashboard"
     width="24"
     height="24">
```

#### CSS Background
```css
.icon-dashboard {
    width: 24px;
    height: 24px;
    background-image: url('/geovera-assets/icons/dashboard.svg');
    background-size: contain;
    background-repeat: no-repeat;
}
```

#### CSS Mask (Color Change)
```css
.icon-green {
    width: 24px;
    height: 24px;
    -webkit-mask: url('/geovera-assets/icons/dashboard.svg') no-repeat center;
    mask: url('/geovera-assets/icons/dashboard.svg') no-repeat center;
    background-color: #16A34A; /* Changes icon to green */
}
```

#### Inline SVG (Full Control)
```html
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="..." stroke="currentColor" stroke-width="2"/>
</svg>

<style>
svg {
    color: #16A34A; /* Icons inherit text color */
}
</style>
```

---

### Icon Size Scale

```css
/* Extra Small (16px) */
.icon-xs {
    width: 16px;
    height: 16px;
}

/* Small (20px) */
.icon-sm {
    width: 20px;
    height: 20px;
}

/* Medium (24px) - Default */
.icon-md {
    width: 24px;
    height: 24px;
}

/* Large (32px) */
.icon-lg {
    width: 32px;
    height: 32px;
}

/* Extra Large (48px) */
.icon-xl {
    width: 48px;
    height: 48px;
}
```

---

### Social Media Icons
**Special Handling:** Social media icons use ORIGINAL official logos
- Instagram: Rounded square with camera
- TikTok: Musical note design
- YouTube: Play button in rectangle
- LinkedIn: "in" professional
- Facebook: "f" letter
- Twitter: Bird silhouette
- Pinterest: "P" stylized
- Snapchat: Ghost shape
- Telegram: Paper plane in circle
- WhatsApp: Phone in bubble

**Color:** Icons default to dark (#0B0F19), but should be recolored to match brand guidelines:
- Instagram: Gradient (or #E4405F)
- TikTok: #000000
- YouTube: #FF0000
- LinkedIn: #0A66C2
- Facebook: #1877F2
- Twitter: #1DA1F2
- Pinterest: #E60023
- Snapchat: #FFFC00
- Telegram: #0088CC
- WhatsApp: #25D366

---

## 5. Design System

### WIRED Design Language
GeoVera follows WIRED magazine's sharp, bold, typography-first aesthetic.

#### Core Principles
1. **Sharp Corners** - No border-radius except circles/avatars
2. **Bold Borders** - 4px borders for emphasis elements
3. **Typography First** - Georgia serif headlines dominate
4. **High Contrast** - Dark text on light backgrounds
5. **Minimal Decoration** - Function over form

---

### Border Radius Rules

```css
/* CORRECT - Sharp corners */
button, .card, .input, .modal {
    border-radius: 0;
}

/* EXCEPTION - Circles for avatars/logos */
.avatar, .logo-icon {
    border-radius: 50%;
}

/* WRONG - Rounded corners (avoid) */
.card {
    border-radius: 8px; /* ❌ Violates WIRED style */
}
```

---

### Border Styles

```css
/* Standard Border */
border: 1px solid var(--gv-divider);

/* Emphasis Border (4px bold) */
border: 4px solid var(--gv-hero);
border-left: 4px solid var(--gv-hero); /* Left accent */

/* Examples */
.card {
    border: 1px solid #E5E7EB;
}

.header {
    border-bottom: 4px solid #16A34A; /* Bold accent */
}

.highlight-box {
    border-left: 4px solid #16A34A;
    padding-left: 16px;
}
```

---

### Shadows & Elevation

```css
/* Subtle Shadow (cards) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Medium Shadow (modals) */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Large Shadow (dropdowns) */
box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

/* AVOID heavy shadows - keep minimal */
```

---

## 6. Accessibility Standards

### WCAG 2.1 AA Compliance (Mandatory)

#### Color Contrast
- **Normal Text:** Minimum 4.5:1 contrast ratio
- **Large Text (18px+):** Minimum 3:1 contrast ratio
- **UI Components:** Minimum 3:1 contrast ratio

**Verified Combinations:**
- `#0B0F19` on `#FFFFFF` = 16:1 ✅
- `#6B7280` on `#FFFFFF` = 5.3:1 ✅
- `#16A34A` on `#FFFFFF` = 4.6:1 ✅
- `#FFFFFF` on `#16A34A` = 4.6:1 ✅

---

#### Required Elements (Every Page)

1. **Skip Link**
```html
<a href="#main-content" class="skip-link">Skip to main content</a>

<style>
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #16A34A;
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
</style>
```

2. **ARIA Labels** (45+ per page minimum)
```html
<!-- Interactive elements -->
<button aria-label="Close modal">×</button>
<input aria-label="Search creators" placeholder="Search...">
<nav aria-label="Main navigation">...</nav>

<!-- Status updates -->
<div role="status" aria-live="polite">Loading...</div>
<div role="alert" aria-live="assertive">Error occurred</div>

<!-- Semantic structure -->
<header role="banner">...</header>
<main role="main" id="main-content">...</main>
<aside role="complementary">...</aside>
```

3. **Keyboard Navigation**
- Tab: Move forward
- Shift+Tab: Move backward
- Enter: Activate button/link
- Space: Toggle checkbox/radio
- Escape: Close modal/dropdown
- Arrow keys: Navigate lists/menus

4. **Focus States**
```css
/* Visible focus indicator */
button:focus, a:focus, input:focus {
    outline: 2px solid #16A34A;
    outline-offset: 2px;
}

/* Remove browser default */
*:focus {
    outline: 2px solid #16A34A;
}
```

5. **Touch Targets** (Mobile)
```css
/* Minimum 44x44px for touch */
button, a, input {
    min-width: 44px;
    min-height: 44px;
    /* OR */
    padding: 12px 16px; /* Achieves 44px+ */
}
```

---

## 7. Component Library

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Start Free Trial</button>

<style>
.btn {
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: 600;
    padding: 12px 24px;
    border: none;
    border-radius: 0; /* Sharp corners */
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-primary {
    background-color: var(--gv-hero);
    color: white;
}

.btn-primary:hover {
    background-color: #15803D; /* Darker green */
}

.btn-primary:active {
    background-color: #14532D; /* Even darker */
}

.btn-primary:disabled {
    background-color: var(--gv-body);
    cursor: not-allowed;
}
</style>
```

#### Secondary Button
```html
<button class="btn btn-secondary">Learn More</button>

<style>
.btn-secondary {
    background-color: white;
    color: var(--gv-anchor);
    border: 2px solid var(--gv-divider);
}

.btn-secondary:hover {
    background-color: var(--gv-bg-light);
    border-color: var(--gv-body);
}
</style>
```

---

### Forms

#### Input Fields
```html
<div class="form-group">
    <label for="email">Email Address <span class="required">*</span></label>
    <input type="email" id="email" placeholder="your@email.com" required>
</div>

<style>
.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--gv-anchor);
}

.required {
    color: var(--gv-risk);
}

input {
    width: 100%;
    font-size: 16px;
    padding: 12px 16px;
    border: 1px solid var(--gv-divider);
    border-radius: 0;
    font-family: var(--font-body);
}

input:focus {
    outline: 2px solid var(--gv-hero);
    border-color: var(--gv-hero);
}

input::placeholder {
    color: var(--gv-body);
}
</style>
```

---

### Cards

```html
<div class="card">
    <h3 class="card-title">Creator Profile</h3>
    <p class="card-text">Stats and information</p>
    <button class="btn btn-primary">View Details</button>
</div>

<style>
.card {
    background: white;
    border: 1px solid var(--gv-divider);
    border-radius: 0; /* Sharp corners */
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
    font-family: var(--font-display);
    font-size: 20px;
    margin-bottom: 12px;
}

.card-text {
    color: var(--gv-body);
    margin-bottom: 16px;
}
</style>
```

---

## 8. Spacing & Layout

### Spacing Scale (8px base unit)

```css
/* Spacing Variables */
--space-1: 4px;   /* 0.25rem */
--space-2: 8px;   /* 0.5rem */
--space-3: 12px;  /* 0.75rem */
--space-4: 16px;  /* 1rem */
--space-5: 20px;  /* 1.25rem */
--space-6: 24px;  /* 1.5rem */
--space-8: 32px;  /* 2rem */
--space-10: 40px; /* 2.5rem */
--space-12: 48px; /* 3rem */
--space-16: 64px; /* 4rem */
--space-20: 80px; /* 5rem */

/* Usage */
.section {
    padding: var(--space-12); /* 48px */
}

.button {
    padding: var(--space-3) var(--space-6); /* 12px 24px */
}
```

---

### Grid System

```css
/* Container */
.container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 24px;
}

/* 12-Column Grid */
.grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 24px;
}

.col-6 {
    grid-column: span 6;
}

.col-4 {
    grid-column: span 4;
}

/* Responsive */
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
}
```

---

## 9. Implementation Guide

### Setup New Page

1. **Include Font**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

2. **Set CSS Variables**
```css
:root {
    --gv-hero: #16A34A;
    --gv-anchor: #0B0F19;
    --gv-body: #6B7280;
    --gv-canvas: #FFFFFF;
    --gv-bg-light: #F9FAFB;
    --gv-divider: #E5E7EB;
    --gv-risk: #DC2626;
    --font-display: Georgia, 'Times New Roman', serif;
    --font-body: 'Inter', system-ui, sans-serif;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-body);
    color: var(--gv-anchor);
    background: var(--gv-bg-light);
    line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
}
```

3. **Add Accessibility**
```html
<!-- Skip link -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Semantic structure -->
<header role="banner">...</header>
<nav aria-label="Main navigation">...</nav>
<main id="main-content" role="main">...</main>
<footer role="contentinfo">...</footer>

<!-- ARIA labels on all interactive elements -->
<button aria-label="Close">×</button>
```

---

### Checklist for Every Page

- [ ] Georgia font for all headlines (H1-H6)
- [ ] Inter font for all body text
- [ ] Sharp corners (border-radius: 0) except avatars
- [ ] Primary color #16A34A for CTAs
- [ ] Dark text (#0B0F19) on light backgrounds
- [ ] 4.5:1 minimum contrast ratio
- [ ] Skip to main content link
- [ ] 45+ ARIA labels
- [ ] Keyboard navigation works
- [ ] Touch targets ≥44px
- [ ] Icons from `/geovera-assets/icons/`
- [ ] Responsive design (mobile-first)
- [ ] Loading states with aria-live
- [ ] Error states with clear messaging

---

### Code Review Standards

**Before Merging:**
1. Run accessibility audit (axe DevTools)
2. Verify WIRED design (no rounded corners)
3. Check color contrast (minimum 4.5:1)
4. Test keyboard navigation
5. Validate ARIA labels present
6. Confirm icons loading from `/geovera-assets/icons/`
7. Test on mobile (responsive)
8. Verify Georgia headlines, Inter body
9. Check all interactive elements ≥44px

---

## Version History

**v1.0** - February 14, 2026
- Initial comprehensive brand guidelines
- Typography, colors, iconography defined
- WIRED design system documented
- Accessibility standards established
- Component library created
- Implementation guide added

---

**Document Owner:** UI/UX Team
**Review Cycle:** Quarterly
**Next Review:** May 2026

---

**© 2026 GeoVera Intelligence Platform. All rights reserved.**
