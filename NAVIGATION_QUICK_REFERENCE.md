# Navigation Quick Reference Guide
**GeoVera Intelligence Platform**

## How to Add Navigation to a New Page

### Step 1: Copy the Template
```bash
# Copy this code from _nav-template.html
# Paste it right after <body> tag
```

### Step 2: Mark Active Page
```html
<!-- Find the current page's link and add aria-current="page" -->
<a href="/frontend/your-page.html" class="nav-link" aria-current="page">
    Your Page
</a>
```

### Step 3: Include Required Styles
```html
<style>
:root {
    --gv-hero: #16A34A;
    --gv-anchor: #0B0F19;
    /* ... other design tokens ... */
}

/* Copy all styles from _nav-template.html */
</style>
```

### Step 4: Include JavaScript
```html
<script>
// Copy user dropdown and logout functions
// from _nav-template.html
</script>
```

---

## Design System Rules

### Colors (Use CSS Variables)
```css
--gv-hero: #16A34A;      /* Primary green - CTAs, accents */
--gv-anchor: #0B0F19;    /* Dark - headers, navigation */
--gv-body: #6B7280;      /* Gray - body text */
--gv-canvas: #FFFFFF;    /* White - backgrounds */
--gv-divider: #E5E7EB;   /* Light gray - borders */
--gv-bg-light: #F9FAFB;  /* Very light gray - sections */
--gv-risk: #DC2626;      /* Red - errors, warnings */
```

### Typography
```css
/* Headlines */
h1, h2, h3, h4, h5, h6 {
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 700;
}

/* Body text */
body, p, div {
    font-family: 'Inter', system-ui, sans-serif;
}
```

### Border-Radius Rules
```css
/* DEFAULT: Sharp corners (WIRED design) */
button, input, .card, .modal {
    border-radius: 0;
}

/* EXCEPTION: Circles for logos/avatars ONLY */
.logo-icon, .avatar, .profile-pic {
    border-radius: 50%;
}
```

### Buttons
```css
.btn {
    padding: 12px 24px;
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-height: 44px; /* WCAG touch target */
    border-radius: 0;  /* Sharp corners */
}

.btn-primary {
    background: var(--gv-hero);
    color: white;
}
```

---

## Navigation Structure

### Current Navigation Links (7)
1. Dashboard - `/frontend/dashboard.html`
2. Insights - `/frontend/insights.html`
3. Hub - `/frontend/hub.html`
4. Radar - `/frontend/radar.html`
5. Content Studio - `/frontend/content-studio.html`
6. AI Chat - `/frontend/chat.html`
7. Settings - `/frontend/settings.html`

### Adding a New Navigation Link
```html
<!-- Edit _nav-template.html -->
<nav class="nav-desktop" aria-label="Main navigation">
    <a href="/frontend/dashboard.html" class="nav-link">Dashboard</a>
    <a href="/frontend/insights.html" class="nav-link">Insights</a>
    <!-- ADD YOUR NEW LINK HERE -->
    <a href="/frontend/new-page.html" class="nav-link">New Page</a>
    <!-- ... rest of links ... -->
</nav>
```

Then update ALL 11 pages to add the new link.

---

## Accessibility Checklist

When adding navigation:
- [ ] `role="banner"` on `<header>`
- [ ] `aria-label="Main navigation"` on `<nav>`
- [ ] `aria-label` on logo link describing purpose
- [ ] `aria-current="page"` on active page link
- [ ] `aria-expanded` on user menu button
- [ ] `aria-haspopup="true"` on user menu button
- [ ] `aria-label` on user menu button
- [ ] Focus states visible (2px green outline)
- [ ] Touch targets minimum 44px

---

## Common Mistakes to Avoid

### ❌ DON'T DO THIS
```css
.button {
    border-radius: 8px;  /* Rounded corners */
}

.card {
    border-radius: 12px; /* Rounded corners */
}
```

### ✅ DO THIS INSTEAD
```css
.button {
    border-radius: 0;    /* Sharp corners - WIRED design */
}

.card {
    border-radius: 0;    /* Sharp corners - WIRED design */
}
```

### ❌ DON'T DO THIS
```html
<header>
    <div class="custom-nav">
        <!-- Custom navigation -->
    </div>
</header>
```

### ✅ DO THIS INSTEAD
```html
<!-- Use standard navigation from _nav-template.html -->
<header class="site-header" role="banner">
    <div class="header-container">
        <!-- Standard GeoVera navigation -->
    </div>
</header>
```

---

## Testing Checklist

Before deploying a new page:
- [ ] Navigation renders correctly
- [ ] Active page indicator shows on current page
- [ ] Logo link returns to homepage
- [ ] All 7 navigation links work
- [ ] User dropdown opens/closes
- [ ] Logout function clears session
- [ ] Navigation is sticky on scroll
- [ ] Mobile: Navigation hidden <768px
- [ ] No border-radius violations (except logos/avatars)
- [ ] Georgia font on all headlines
- [ ] Inter font on all body text
- [ ] Green #16A34A used for primary actions

---

## File Locations

### Templates
- `/frontend/_nav-template.html` - Standard navigation template

### Stylesheets
- `/frontend/css/global.css` - Global design system
- `/frontend/css/accessibility.css` - Accessibility styles

### Documentation
- `/NAVIGATION_STANDARDIZATION_REPORT.md` - Full report
- `/NAVIGATION_QUICK_REFERENCE.md` - This guide
- `/BEFORE_AFTER_NAVIGATION.md` - Before/after comparison

### Production Pages (11)
1. `/frontend/index.html`
2. `/frontend/dashboard.html`
3. `/frontend/pricing.html`
4. `/frontend/chat.html`
5. `/frontend/content-studio.html`
6. `/frontend/radar.html`
7. `/frontend/insights.html`
8. `/frontend/settings.html`
9. `/frontend/creators.html`
10. `/frontend/analytics.html`
11. `/frontend/hub.html`

---

## Need Help?

### Questions About Navigation
- Refer to `_nav-template.html` for standard implementation
- Check `NAVIGATION_STANDARDIZATION_REPORT.md` for full details

### Questions About Design
- Refer to `global.css` for design tokens
- All elements should have `border-radius: 0` (except logos/avatars)
- Use CSS variables for colors

### Questions About Accessibility
- All navigation must have ARIA labels
- Touch targets must be 44px minimum
- Focus states must be visible

---

## Version History

**v1.0** - February 14, 2026
- Standard navigation template created
- 11 production pages standardized
- 7 border-radius violations fixed
- Global CSS framework established
- WIRED design system implemented

---

*For the complete technical report, see NAVIGATION_STANDARDIZATION_REPORT.md*
