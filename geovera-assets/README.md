# GeoVera Design System - WIRED Newsletter Style

**Purpose:** Centralized UI components, styles, and assets inspired by WIRED magazine's editorial design - bold, sharp, and authoritative.

**Created:** February 14, 2026
**Style:** WIRED Newsletter - Sharp corners, conservative colors, editorial typography
**Based on:** geovera.xyz homepage design + UI/UX Engineer Audit

---

## Design Philosophy

### WIRED-Inspired Principles

1. **Sharp Corners** - NO border-radius on buttons, forms, or containers
2. **Conservative Colors** - Minimal palette: Green (#16A34A), Black (#0B0F19), White
3. **Editorial Typography** - Georgia serif for headlines, Inter for body
4. **Bold Borders** - 4px accent borders for visual authority
5. **Newsletter-First** - Clean, readable, modern publishing aesthetic

---

## Folder Structure

```
geovera-assets/
├── components/          # Reusable HTML/JS components
│   ├── buttons.html     # WIRED-style buttons (sharp corners)
│   ├── forms.html       # Newsletter forms (connected inputs)
│   ├── navigation.html  # Dark header with bold border
│   └── loading-states.html
├── styles/              # CSS design system
│   ├── colors.css       # WIRED-inspired palette
│   ├── typography.css   # Editorial fonts (Georgia + Inter)
│   ├── spacing.css      # 4px grid system
│   └── utilities.css    # Layout utilities
├── icons/               # SVG icon library
├── images/              # Optimized images & logos
└── examples/            # Implementation examples
```

---

## Color System

### Primary Colors (GeoVera Brand)

```css
--gv-hero: #16A34A;           /* Primary green - CTAs, accents */
--gv-anchor: #0B0F19;         /* Deep black - Headers, titles */
--gv-body: #6B7280;           /* Medium gray - Body text */
--gv-canvas: #FFFFFF;         /* Pure white - Background */
--gv-secondary: #2563EB;      /* Blue - Links, secondary CTAs */
--gv-risk: #DC2626;           /* Red - Errors, warnings */
--gv-divider: #E5E7EB;        /* Light gray - Borders */
```

### Usage

- **Primary Green (#16A34A):** All primary CTAs, brand accents, active states
- **Deep Black (#0B0F19):** Header backgrounds, important headlines
- **Medium Gray (#6B7280):** Body text, secondary information
- **Pure White (#FFFFFF):** Backgrounds, text on dark surfaces

**NO dark mode** - WIRED-style is light-first for editorial readability

---

## Typography System

### Font Families

```css
--font-display: Georgia, 'Times New Roman', serif;      /* Headlines */
--font-body: 'Inter', system-ui, sans-serif;            /* Body, UI */
```

### Font Scale

```
Headings:
- h1: 42px (Georgia, 800 weight) - Hero headlines
- h2: 36px (Georgia, 800 weight) - Section titles
- h3: 30px (Georgia, 700 weight) - Subsections
- h4: 24px (Georgia, 700 weight) - Card titles

Body:
- Base: 18px (Inter) - Comfortable reading
- Small: 14px (Inter) - Captions, labels
- Tiny: 11px (Inter) - Badges, tags
```

### Editorial Style

- **Georgia Serif:** Authority and editorial credibility for headlines
- **Inter Sans-Serif:** Modern, clean readability for body text
- **Line Height:** 1.7 for body text (editorial comfort)
- **Letter Spacing:** -0.02em for headings, 0.05em for uppercase labels

---

## Component Guidelines

### Buttons

**Critical:** NO border-radius - All buttons have sharp corners (border-radius: 0)

```html
<!-- Primary Button -->
<button class="btn btn-primary">Get Started</button>

<!-- Secondary Outline Button -->
<button class="btn btn-secondary">Learn More</button>

<!-- Dark Button (for light backgrounds) -->
<button class="btn btn-dark">Sign In</button>

<!-- WIRED-Style Uppercase -->
<button class="btn btn-primary btn-uppercase">Subscribe</button>
```

**Variants:**
- `.btn-primary` - Hero green (#16A34A) with shadow
- `.btn-secondary` - Black outline, transparent background
- `.btn-outline` - Green outline, transparent background
- `.btn-dark` - Black background, white text
- `.btn-ghost` - Transparent, minimal

**Sizes:** `.btn-sm`, `.btn-md` (default), `.btn-lg`, `.btn-xl`

### Forms

**Critical:** Sharp corners on all inputs (border-radius: 0)

```html
<!-- Basic Input -->
<div class="form-group">
  <label for="email" class="form-label">Email</label>
  <input type="email" id="email" class="form-input" placeholder="you@example.com">
</div>

<!-- Newsletter Form (WIRED Style) -->
<form class="newsletter-form">
  <input type="email" class="form-input" placeholder="Enter your email">
  <button type="submit" class="btn btn-primary">Subscribe</button>
</form>
```

**Features:**
- 2px borders (not 1px) for visual weight
- Green focus state (#16A34A)
- Connected input+button for newsletter signups
- No box-shadows (clean WIRED style)

### Navigation

**WIRED Dark Header:**

```html
<header class="header">
  <div class="header-container">
    <a href="/" class="header-logo">
      <div class="header-logo-icon">G</div>
      <span class="header-logo-text">GeoVera</span>
    </a>

    <nav class="nav-desktop">
      <a href="#" class="nav-link active">Home</a>
      <a href="#" class="nav-link">Features</a>
      <a href="#" class="header-cta">Get Started</a>
    </nav>
  </div>
</header>
```

**Features:**
- Dark background (#0B0F19) with white text
- 4px green bottom border for bold accent
- Uppercase navigation links (letter-spacing: 0.05em)
- Georgia serif logo for authority
- Sticky positioning
- Mobile hamburger menu

**Variants:**
- `.header` (default) - Dark WIRED style
- `.header-light` - Light variant for content pages

---

## Quick Start

### Import All Styles

```html
<link rel="stylesheet" href="/geovera-assets/styles/colors.css">
<link rel="stylesheet" href="/geovera-assets/styles/typography.css">
<link rel="stylesheet" href="/geovera-assets/styles/spacing.css">
<link rel="stylesheet" href="/geovera-assets/styles/utilities.css">
```

### Example Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GeoVera - WIRED Style</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/geovera-assets/styles/colors.css">
  <link rel="stylesheet" href="/geovera-assets/styles/typography.css">
  <link rel="stylesheet" href="/geovera-assets/styles/spacing.css">
  <link rel="stylesheet" href="/geovera-assets/styles/utilities.css">
</head>
<body>
  <!-- Dark WIRED Header -->
  <header class="header">
    <div class="header-container">
      <a href="/" class="header-logo">
        <span class="header-logo-text">GeoVera</span>
      </a>
      <nav class="nav-desktop">
        <a href="#" class="nav-link">Features</a>
        <a href="#" class="header-cta">Get Started</a>
      </nav>
    </div>
  </header>

  <!-- Content -->
  <main class="container py-8">
    <h1 class="font-display">Editorial Headline</h1>
    <p class="text-secondary">Body text in Inter font for clean readability.</p>
    <button class="btn btn-primary">Sharp Cornered Button</button>
  </main>
</body>
</html>
```

---

## Design Tokens Reference

### Colors

```css
/* Brand Primary */
--gv-hero: #16A34A
--gv-anchor: #0B0F19
--gv-body: #6B7280
--gv-canvas: #FFFFFF

/* Semantic */
--success: #10B981
--warning: #F59E0B
--error: #DC2626
--info: #2563EB
```

### Typography

```css
/* Families */
--font-display: Georgia, serif
--font-body: 'Inter', sans-serif

/* Sizes */
--text-5xl: 2.625rem  (42px)
--text-4xl: 2.25rem   (36px)
--text-base: 1rem     (16px)
--text-sm: 0.875rem   (14px)
```

### Spacing

```css
/* Based on 4px grid */
--space-1: 0.25rem   (4px)
--space-4: 1rem      (16px)
--space-6: 1.5rem    (24px)
--space-8: 2rem      (32px)
--space-12: 3rem     (48px)
```

---

## Sharp Corners Everywhere

### Critical Design Rule

**NO border-radius** - WIRED-style uses sharp corners for all UI elements:

```css
/* Buttons */
.btn { border-radius: 0; }

/* Forms */
.form-input { border-radius: 0; }
.form-select { border-radius: 0; }
.form-textarea { border-radius: 0; }

/* Cards (if used) */
.card { border-radius: 0; }
```

**Exception:** Only use `border-radius: 50%` for circular avatars and icons.

---

## WIRED-Style Checklist

When building new components, ensure:

- [ ] NO border-radius (sharp corners only)
- [ ] Georgia serif for headlines
- [ ] Inter sans-serif for body/UI
- [ ] Primary green (#16A34A) for CTAs
- [ ] Dark header (#0B0F19) with 4px green border
- [ ] 2px borders (not 1px) for form inputs
- [ ] Uppercase + letter-spacing for labels
- [ ] Line-height 1.7 for body text
- [ ] 44px minimum touch targets
- [ ] Clean, minimal color palette
- [ ] No unnecessary shadows

---

## Component Showcase

Open these files in a browser to see all components:

- `/geovera-assets/components/buttons.html` - All button variants
- `/geovera-assets/components/forms.html` - Form components and newsletter signup
- `/geovera-assets/components/navigation.html` - WIRED-style headers

---

## Accessibility

All components meet WCAG 2.1 AA standards:

- Minimum 4.5:1 contrast ratio for text
- 44px minimum touch targets
- Keyboard navigation support
- Clear focus states (2px outline)
- Screen reader friendly labels
- Semantic HTML structure

---

## Responsive Design

### Breakpoints

```css
Mobile:    < 768px
Tablet:    768px - 1024px
Desktop:   > 1024px
Max Width: 1440px
```

### Mobile-First Approach

- Mobile navigation with hamburger menu
- Stacked layouts on mobile
- Flexible typography scaling
- Touch-friendly 44px targets

---

## Migration from Old Design

### Key Changes

1. **Border Radius:** Remove all `border-radius` values (set to 0)
2. **Colors:** Replace old blues/purples with GeoVera green (#16A34A)
3. **Typography:** Change headings to Georgia serif
4. **Headers:** Switch to dark background (#0B0F19) with bold border
5. **Forms:** Use 2px borders instead of 1px
6. **Buttons:** Remove rounded corners, use sharp edges

### Before/After

```css
/* OLD STYLE (Generic) */
.btn {
  border-radius: 0.5rem;          /* Rounded */
  background: #3B82F6;            /* Generic blue */
  font-family: Inter, sans-serif; /* Sans everywhere */
}

/* NEW STYLE (WIRED) */
.btn {
  border-radius: 0;               /* Sharp corners */
  background: #16A34A;            /* GeoVera green */
  font-family: var(--font-body);  /* Strategic font use */
}

/* OLD HEADING */
h1 {
  font-family: Inter, sans-serif; /* Sans */
  font-size: 48px;
}

/* NEW HEADING (WIRED Editorial) */
h1 {
  font-family: Georgia, serif;    /* Editorial serif */
  font-size: 42px;
  letter-spacing: -0.02em;
}
```

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

---

## Credits

**Design Inspiration:** WIRED Magazine newsletter style
**Brand Colors:** geovera.xyz homepage
**UI/UX Audit:** 47 issues identified & fixed
**Created:** February 2026

---

**For questions or updates, see the component showcase files or audit documentation.**
