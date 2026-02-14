# GeoVera Intelligence UI Component Library

**Version 3.0 - Complete Design System Documentation**

## Table of Contents
1. [Introduction](#introduction)
2. [Design Tokens](#design-tokens)
3. [Button Components](#button-components)
4. [Form Components](#form-components)
5. [Navigation Components](#navigation-components)
6. [Card Components](#card-components)
7. [Modal Components](#modal-components)
8. [Usage Limit Components](#usage-limit-components)
9. [Layout Patterns](#layout-patterns)
10. [Accessibility Patterns](#accessibility-patterns)

---

## Introduction

**Platform:** GeoVera Intelligence
**Design System:** WIRED newsletter editorial style
**Accessibility Standard:** WCAG 2.1 AA compliant
**Philosophy:** Sharp corners, editorial typography, clean hierarchy

This component library ensures consistency across the GeoVera platform. All components follow the WIRED editorial design language with sharp corners, Georgia serif headings, and Inter sans-serif body text.

---

## Design Tokens

### Colors
```css
:root {
    /* Brand Colors - WIRED Style */
    --gv-hero: #16A34A;        /* Primary green - CTAs, active states */
    --gv-anchor: #0B0F19;      /* Dark navy - headers, text */
    --gv-body: #6B7280;        /* Medium gray - body text */
    --gv-canvas: #FFFFFF;      /* Pure white - backgrounds */
    --gv-divider: #E5E7EB;     /* Light gray - borders */
    --gv-bg-light: #F9FAFB;    /* Off-white - page background */
    --gv-risk: #DC2626;        /* Red - errors, warnings */
    --gv-secondary: #2563EB;   /* Blue - links, secondary actions */
}
```

### Typography
```css
:root {
    /* Font Families */
    --font-display: Georgia, 'Times New Roman', serif;
    --font-body: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Type Scale */
.page-title {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.section-title {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.card-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.body-text {
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
}

.label-text {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
```

### Spacing
```css
:root {
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;
    --space-3xl: 64px;
}
```

### Borders
```css
/* All borders use sharp corners (border-radius: 0) */
--border-light: 1px solid var(--gv-divider);
--border-medium: 2px solid var(--gv-divider);
--border-bold: 4px solid var(--gv-anchor);
```

---

## Button Components

### Primary Button

**Purpose:** Main call-to-action buttons for critical actions.

**HTML Markup:**
```html
<button class="btn-primary" aria-label="Descriptive action text">
    Search Creators
</button>
```

**CSS Styles:**
```css
.btn-primary {
    background: var(--gv-hero);
    color: white;
    border: none;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-height: 44px;
    min-width: 44px;
    transition: all 0.2s;
}

.btn-primary:hover {
    background: #15803d;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.btn-primary:disabled {
    background: var(--gv-body);
    cursor: not-allowed;
    transform: none;
}

.btn-primary:focus {
    outline: 2px solid var(--gv-hero);
    outline-offset: 2px;
}
```

**Accessibility:**
- Always include `aria-label` for screen readers
- Minimum touch target: 44x44px
- Focus indicator with 2px outline
- Disabled state communicated via cursor and color

**Usage Example:**
```html
<button
    class="btn-primary"
    onclick="handleSearch()"
    aria-label="Search for creators in database">
    Search Creators
</button>
```

**Variants:**
- Default: Green background, white text
- Hover: Darker green with lift effect
- Disabled: Gray background, no pointer
- Loading: Add loading spinner inside button

**Do's:**
- Use for primary actions (Submit, Save, Search)
- Keep text concise and action-oriented
- Ensure proper color contrast (4.5:1 minimum)

**Don'ts:**
- Don't use multiple primary buttons in same view
- Don't use for destructive actions (use danger variant)
- Don't make buttons too wide (max 400px)

---

### Secondary Button

**Purpose:** Alternative actions, less prominent than primary buttons.

**HTML Markup:**
```html
<button class="btn-secondary" aria-label="View collection details">
    View Details
</button>
```

**CSS Styles:**
```css
.btn-secondary {
    background: transparent;
    color: var(--gv-anchor);
    border: 2px solid var(--gv-anchor);
    padding: 12px 32px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-height: 44px;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: var(--gv-anchor);
    color: white;
    transform: translateY(-2px);
}

.btn-secondary:focus {
    outline: 2px solid var(--gv-anchor);
    outline-offset: 2px;
}
```

**Usage Example:**
```html
<div class="button-group">
    <button class="btn-primary">Save Changes</button>
    <button class="btn-secondary">Cancel</button>
</div>
```

---

### Action Button (Small)

**Purpose:** Smaller buttons for card actions and inline controls.

**HTML Markup:**
```html
<button class="action-btn action-primary">
    Save
</button>
```

**CSS Styles:**
```css
.action-btn {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 0;
    min-height: 44px;
    transition: all 0.2s;
    border: none;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.action-primary {
    background: var(--gv-hero);
    color: white;
}

.action-primary:hover {
    background: #15803d;
    transform: translateY(-2px);
}

.action-secondary {
    background: transparent;
    color: var(--gv-anchor);
    border: 2px solid var(--gv-anchor);
}

.action-secondary:hover {
    background: var(--gv-anchor);
    color: white;
}
```

**Usage Example:**
```html
<div class="card-actions">
    <button class="action-btn action-primary">View Details</button>
    <button class="action-btn action-secondary">Dismiss</button>
</div>
```

---

### User Menu Button

**Purpose:** Header user account dropdown trigger.

**HTML Markup:**
```html
<button
    class="user-button"
    id="user-btn"
    aria-label="User menu"
    aria-haspopup="true"
    aria-expanded="false">
    <span id="user-name">Account</span>
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
</button>
```

**CSS Styles:**
```css
.user-button {
    background: var(--gv-hero);
    color: white;
    border: none;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 0;
}

.user-button:hover {
    background: #15803d;
}
```

---

### Filter Button

**Purpose:** Toggle buttons for filtering content.

**HTML Markup:**
```html
<button class="filter-button active" data-filter="all">
    All Tasks
</button>
```

**CSS Styles:**
```css
.filter-button {
    background: transparent;
    border: 2px solid var(--gv-divider);
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    border-radius: 0;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.filter-button.active {
    background: var(--gv-hero);
    color: white;
    border-color: var(--gv-hero);
}

.filter-button:hover:not(.active) {
    border-color: var(--gv-hero);
    color: var(--gv-hero);
}
```

**Usage Example:**
```html
<div class="filter-bar" role="group" aria-label="Filter tasks">
    <button class="filter-button active" data-filter="all">All Tasks</button>
    <button class="filter-button" data-filter="crisis">Crisis</button>
    <button class="filter-button" data-filter="radar">Radar</button>
</div>
```

---

## Form Components

### Text Input

**Purpose:** Single-line text entry for user data.

**HTML Markup:**
```html
<div class="form-group">
    <label for="brand-name" class="form-label">Brand Name</label>
    <input
        type="text"
        id="brand-name"
        class="form-input"
        aria-label="Enter your brand name"
        required>
</div>
```

**CSS Styles:**
```css
.form-group {
    margin-bottom: 24px;
}

.form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 0.05em;
    color: var(--gv-anchor);
}

.form-input {
    width: 100%;
    padding: 12px;
    border: 2px solid var(--gv-divider);
    background: white;
    font-family: var(--font-body);
    font-size: 14px;
    min-height: 44px;
    border-radius: 0;
    color: var(--gv-anchor);
}

.form-input:focus {
    outline: 2px solid var(--gv-hero);
    outline-offset: 2px;
    border-color: var(--gv-hero);
}

.form-input:disabled {
    background: var(--gv-bg-light);
    color: var(--gv-body);
    cursor: not-allowed;
}

.form-input.error {
    border-color: var(--gv-risk);
}
```

**Accessibility:**
- Always pair with `<label>` element
- Use `aria-label` for additional context
- Include `required` attribute when mandatory
- Show focus state clearly

**Usage Example:**
```html
<form id="brand-form">
    <div class="form-group">
        <label for="brand-name" class="form-label">Brand Name</label>
        <input
            type="text"
            id="brand-name"
            class="form-input"
            placeholder="Enter your brand name"
            aria-required="true"
            required>
    </div>
</form>
```

---

### Select Dropdown

**Purpose:** Choose one option from a predefined list.

**HTML Markup:**
```html
<div class="form-group">
    <label for="industry" class="form-label">Industry</label>
    <select id="industry" class="form-select" aria-label="Select your industry">
        <option value="">Choose an industry</option>
        <option value="beauty">Beauty & Cosmetics</option>
        <option value="fashion">Fashion & Apparel</option>
        <option value="travel">Travel & Hospitality</option>
    </select>
</div>
```

**CSS Styles:**
```css
.form-select {
    width: 100%;
    padding: 12px;
    border: 2px solid var(--gv-divider);
    background: white;
    font-family: var(--font-body);
    font-size: 14px;
    min-height: 44px;
    border-radius: 0;
    cursor: pointer;
    color: var(--gv-anchor);
}

.form-select:focus {
    outline: 2px solid var(--gv-hero);
    outline-offset: 2px;
    border-color: var(--gv-hero);
}
```

**Usage Example:**
```html
<div class="filters-grid">
    <div class="filter-group">
        <label for="country-select" class="filter-label">Country</label>
        <select id="country-select" class="filter-select" aria-label="Select country">
            <option value="global">Global</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
        </select>
    </div>
</div>
```

---

### Currency Selector

**Purpose:** Special dropdown for currency selection with symbols.

**HTML Markup:**
```html
<div class="currency-selector" role="group" aria-label="Currency selection">
    <label for="currency-select" class="currency-label">Currency:</label>
    <select id="currency-select" class="currency-select" aria-label="Select currency">
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="GBP">GBP (£)</option>
        <option value="IDR">IDR (Rp)</option>
        <option value="JPY">JPY (¥)</option>
        <option value="SGD">SGD (S$)</option>
    </select>
</div>
```

**CSS Styles:**
```css
.currency-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 24px;
}

.currency-label {
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.currency-select {
    padding: 12px 20px;
    font-size: 16px;
    font-family: var(--font-body);
    border: 2px solid var(--gv-anchor);
    background: white;
    cursor: pointer;
    min-height: 44px;
    min-width: 150px;
    border-radius: 0;
}

.currency-select:focus {
    outline: 2px solid var(--gv-hero);
    outline-offset: 2px;
}
```

---

### Form Validation

**Purpose:** Show error states and validation messages.

**HTML Markup:**
```html
<div class="form-group">
    <label for="email" class="form-label">Email Address</label>
    <input
        type="email"
        id="email"
        class="form-input error"
        aria-invalid="true"
        aria-describedby="email-error">
    <div class="form-error" id="email-error" role="alert">
        Please enter a valid email address
    </div>
</div>
```

**CSS Styles:**
```css
.form-input.error {
    border-color: var(--gv-risk);
}

.form-error {
    color: var(--gv-risk);
    font-size: 14px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-error::before {
    content: "⚠";
    font-size: 16px;
}

.form-success {
    color: var(--gv-hero);
    font-size: 14px;
    margin-top: 8px;
}
```

---

## Navigation Components

### Header (Global Navigation)

**Purpose:** Site-wide header with logo, navigation, and user menu.

**HTML Markup:**
```html
<header class="site-header" role="banner">
    <div class="header-container">
        <a href="/frontend/index.html" class="header-logo" aria-label="GeoVera Intelligence - Return to homepage">
            <div class="logo-icon" aria-hidden="true">G</div>
            <span class="logo-text">GeoVera</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-desktop" aria-label="Main navigation">
            <a href="/frontend/dashboard.html" class="nav-link active" aria-current="page">Dashboard</a>
            <a href="/frontend/insights.html" class="nav-link">Insights</a>
            <a href="/frontend/hub.html" class="nav-link">Hub</a>
            <a href="/frontend/radar.html" class="nav-link">Radar</a>
            <a href="/frontend/content-studio.html" class="nav-link">Content Studio</a>
            <a href="/frontend/chat.html" class="nav-link">AI Chat</a>
            <a href="/frontend/settings.html" class="nav-link">Settings</a>
        </nav>

        <!-- User Menu -->
        <div class="user-menu">
            <button class="user-button" id="user-btn" aria-label="User menu" aria-haspopup="true" aria-expanded="false">
                <span id="user-name">Account</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-toggle" id="mobile-toggle" aria-label="Toggle mobile menu" aria-expanded="false">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        </button>
    </div>
</header>
```

**CSS Styles:**
```css
.site-header {
    background: var(--gv-anchor);
    color: white;
    border-bottom: 4px solid var(--gv-hero);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 72px;
}

.header-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: white;
}

.logo-icon {
    width: 44px;
    height: 44px;
    background: var(--gv-hero);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
    color: white;
}

.logo-text {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 24px;
    letter-spacing: -0.02em;
    color: white;
}

/* Desktop Navigation */
.nav-desktop {
    display: flex;
    align-items: center;
    gap: 32px;
}

.nav-link {
    color: white;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    padding: 12px 16px;
    transition: color 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-height: 44px;
    display: flex;
    align-items: center;
}

.nav-link:hover {
    color: var(--gv-hero);
}

.nav-link.active {
    color: var(--gv-hero);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    padding: 8px;
}

@media (max-width: 768px) {
    .nav-desktop {
        display: none;
    }

    .mobile-menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
```

**Accessibility:**
- Sticky header with `position: sticky`
- `role="banner"` for landmark
- `aria-current="page"` for active link
- `aria-label` for logo link
- `aria-haspopup` and `aria-expanded` for user menu
- Mobile menu toggle with proper ARIA attributes

---

### Tab Navigation

**Purpose:** Switch between content sections within a page.

**HTML Markup:**
```html
<div class="tabs-container">
    <nav class="tabs-nav" role="tablist">
        <button class="tab-button active" data-tab="profile" role="tab" aria-selected="true">
            Profile
        </button>
        <button class="tab-button" data-tab="brand" role="tab" aria-selected="false">
            Brand Info
        </button>
        <button class="tab-button" data-tab="preferences" role="tab" aria-selected="false">
            Preferences
        </button>
        <button class="tab-button" data-tab="billing" role="tab" aria-selected="false">
            Billing
        </button>
    </nav>

    <div class="tab-content active" id="profile-tab" role="tabpanel">
        <!-- Profile content -->
    </div>

    <div class="tab-content" id="brand-tab" role="tabpanel">
        <!-- Brand content -->
    </div>
</div>
```

**CSS Styles:**
```css
.tabs-container {
    background: white;
    border: 2px solid var(--gv-divider);
}

.tabs-nav {
    display: flex;
    border-bottom: 2px solid var(--gv-divider);
    overflow-x: auto;
}

.tab-button {
    background: none;
    border: none;
    padding: 16px 32px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    cursor: pointer;
    min-height: 44px;
    border-bottom: 4px solid transparent;
    transition: all 0.2s;
    letter-spacing: 0.05em;
}

.tab-button.active {
    border-bottom-color: var(--gv-hero);
    color: var(--gv-hero);
}

.tab-button:hover:not(.active) {
    color: var(--gv-hero);
}

.tab-content {
    padding: 32px;
    display: none;
}

.tab-content.active {
    display: block;
}
```

**JavaScript Example:**
```javascript
document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active from all
        document.querySelectorAll('.tab-button').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.remove('active');
        });

        // Add active to clicked
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        document.getElementById(this.dataset.tab + '-tab').classList.add('active');
    });
});
```

---

## Card Components

### Stat Card (Dashboard Metrics)

**Purpose:** Display key performance metrics on dashboard.

**HTML Markup:**
```html
<div class="stat-card">
    <div class="stat-label">Total Creators</div>
    <div class="stat-value" id="stat-creators">0</div>
    <div class="stat-change positive" role="status" aria-live="polite">
        <span aria-label="Change from last period">+12 this week</span>
    </div>
</div>
```

**CSS Styles:**
```css
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.stat-card {
    background: white;
    border: 2px solid var(--gv-divider);
    padding: 24px;
    transition: transform 0.2s, border-color 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    border-color: var(--gv-hero);
}

.stat-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gv-body);
    margin-bottom: 8px;
}

.stat-value {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    color: var(--gv-anchor);
    letter-spacing: -0.02em;
}

.stat-change {
    font-size: 14px;
    margin-top: 8px;
}

.stat-change.positive {
    color: var(--gv-hero);
}

.stat-change.negative {
    color: var(--gv-risk);
}
```

---

### Creator Card (Radar Results)

**Purpose:** Display creator profile in search results.

**HTML Markup:**
```html
<article class="creator-card" role="article" aria-label="Creator: Emma Chen">
    <div class="creator-avatar" aria-hidden="true">E</div>
    <h3 class="creator-name">Emma Chen</h3>
    <div class="creator-stats">
        <div>125,000 followers</div>
        <div>5.2% engagement</div>
    </div>
    <div class="platform-icons" aria-label="Platforms: instagram, tiktok">
        <span class="platform-icon">📷</span>
        <span class="platform-icon">🎵</span>
    </div>
    <button class="save-button" aria-label="Save Emma Chen to collection">
        Save to Collection
    </button>
</article>
```

**CSS Styles:**
```css
.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
}

.creator-card {
    border: 2px solid var(--gv-divider);
    padding: 24px;
    transition: all 0.3s;
    background: white;
}

.creator-card:hover {
    border-color: var(--gv-hero);
    transform: translateY(-2px);
}

.creator-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--gv-bg-light);
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
    color: var(--gv-hero);
}

.creator-name {
    font-weight: 700;
    font-size: 18px;
    text-align: center;
    margin-bottom: 8px;
}

.creator-stats {
    text-align: center;
    font-size: 14px;
    color: var(--gv-body);
    margin-bottom: 16px;
}

.platform-icons {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
}

.platform-icon {
    width: 24px;
    height: 24px;
}

.save-button {
    width: 100%;
    background: transparent;
    color: var(--gv-anchor);
    border: 2px solid var(--gv-anchor);
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-height: 44px;
    transition: all 0.2s;
}

.save-button:hover {
    background: var(--gv-anchor);
    color: white;
}
```

---

### Pricing Card

**Purpose:** Display subscription tier options.

**HTML Markup:**
```html
<article class="pricing-card featured" aria-labelledby="premium-tier-name">
    <span class="featured-badge">Most Popular</span>
    <h2 class="tier-name" id="premium-tier-name">Premium</h2>
    <p class="tier-description">Advanced features for growing brands scaling their influencer programs</p>

    <div class="price-container">
        <div class="price">
            <span id="premium-price">$609</span>
            <span class="price-period">/month</span>
        </div>
        <p class="price-note">Billed monthly</p>
    </div>

    <button class="cta-button" onclick="selectTier('premium')" aria-label="Start free trial with Premium tier">
        Start Free Trial
    </button>

    <ul class="features-list" role="list" aria-label="Premium tier features">
        <li class="feature-item" role="listitem">
            <span class="feature-icon" aria-hidden="true">✓</span>
            <span class="feature-text">Hub Collections: <span class="feature-limit">10 max</span></span>
        </li>
        <li class="feature-item" role="listitem">
            <span class="feature-icon" aria-hidden="true">✓</span>
            <span class="feature-text">AI Chat: <span class="feature-limit">100 messages/month</span></span>
        </li>
    </ul>
</article>
```

**CSS Styles:**
```css
.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 32px;
    margin-bottom: 64px;
}

.pricing-card {
    background: white;
    border: 2px solid var(--gv-divider);
    padding: 40px;
    transition: all 0.3s;
    position: relative;
}

.pricing-card:hover {
    transform: translateY(-4px);
    border-color: var(--gv-hero);
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.2);
}

.pricing-card.featured {
    border: 4px solid var(--gv-hero);
}

.featured-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--gv-hero);
    color: white;
    padding: 4px 16px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.tier-name {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    color: var(--gv-anchor);
    margin-bottom: 16px;
    letter-spacing: -0.02em;
}

.tier-description {
    font-size: 16px;
    color: var(--gv-body);
    margin-bottom: 24px;
    min-height: 48px;
}

.price-container {
    margin-bottom: 32px;
}

.price {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 700;
    color: var(--gv-anchor);
    letter-spacing: -0.02em;
}

.price-period {
    font-size: 16px;
    color: var(--gv-body);
    font-weight: 400;
}

.price-note {
    font-size: 14px;
    color: var(--gv-body);
    margin-top: 8px;
}

.cta-button {
    width: 100%;
    background: var(--gv-hero);
    color: white;
    border: none;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    border-radius: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    min-height: 44px;
    transition: all 0.2s;
    margin-bottom: 32px;
}

.cta-button:hover {
    background: #15803d;
    transform: translateY(-2px);
}

.cta-button.secondary {
    background: transparent;
    color: var(--gv-anchor);
    border: 2px solid var(--gv-anchor);
}

.cta-button.secondary:hover {
    background: var(--gv-anchor);
    color: white;
}

.features-list {
    list-style: none;
}

.feature-item {
    padding: 12px 0;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    border-bottom: 1px solid var(--gv-divider);
}

.feature-item:last-child {
    border-bottom: none;
}

.feature-icon {
    color: var(--gv-hero);
    font-size: 20px;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
}

.feature-text {
    font-size: 15px;
    color: var(--gv-anchor);
}

.feature-limit {
    font-weight: 700;
    color: var(--gv-hero);
}
```

---

### Task Card (Insights)

**Purpose:** Display actionable daily insights and recommendations.

**HTML Markup:**
```html
<article class="task-card" role="listitem">
    <div class="task-icon" aria-hidden="true">🔍</div>
    <div class="task-content">
        <div class="task-header">
            <h3 class="task-title">New Trending Creator Alert</h3>
            <span class="task-priority priority-high">high</span>
        </div>
        <p class="task-description">Beauty influencer @MayaGlam gained 50K followers this week in Indonesia</p>
        <div class="task-actions">
            <button class="action-btn action-primary" onclick="viewTask(1)">
                View Details
            </button>
            <button class="action-btn action-secondary" onclick="dismissTask(1)">
                Dismiss
            </button>
        </div>
    </div>
</article>
```

**CSS Styles:**
```css
.task-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.task-card {
    background: white;
    border: 2px solid var(--gv-divider);
    padding: 24px;
    transition: all 0.3s;
    display: flex;
    gap: 20px;
}

.task-card:hover {
    border-color: var(--gv-hero);
    transform: translateX(4px);
}

.task-icon {
    width: 48px;
    height: 48px;
    background: var(--gv-bg-light);
    border: 2px solid var(--gv-divider);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
}

.task-content {
    flex: 1;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 8px;
}

.task-title {
    font-weight: 700;
    font-size: 18px;
}

.task-priority {
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.priority-high {
    background: #FEE2E2;
    color: #DC2626;
}

.priority-medium {
    background: #FEF3C7;
    color: #D97706;
}

.priority-low {
    background: #DBEAFE;
    color: #2563EB;
}

.task-description {
    color: var(--gv-body);
    margin-bottom: 12px;
}

.task-actions {
    display: flex;
    gap: 12px;
}
```

---

## Modal Components

### Limit Reached Modal

**Purpose:** Inform user they've reached their tier limit.

**HTML Markup:**
```html
<div class="modal-overlay" id="limit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-container">
        <div class="modal-header">
            <h2 class="modal-title" id="modal-title">Monthly Limit Reached</h2>
            <button class="modal-close" aria-label="Close modal">×</button>
        </div>
        <div class="modal-body">
            <p>You've reached your monthly limit for Radar searches (10/10 used).</p>
            <p>Upgrade to Premium to get 50 searches per month, or wait until next billing cycle.</p>
        </div>
        <div class="modal-footer">
            <button class="btn-primary" onclick="goToPricing()">
                Upgrade Now
            </button>
            <button class="btn-secondary" onclick="closeModal()">
                Maybe Later
            </button>
        </div>
    </div>
</div>
```

**CSS Styles:**
```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(11, 15, 25, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 24px;
}

.modal-container {
    background: white;
    border: 4px solid var(--gv-anchor);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    padding: 24px;
    border-bottom: 2px solid var(--gv-divider);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.modal-close {
    background: none;
    border: none;
    font-size: 36px;
    line-height: 1;
    cursor: pointer;
    color: var(--gv-body);
    min-width: 44px;
    min-height: 44px;
    padding: 0;
}

.modal-close:hover {
    color: var(--gv-anchor);
}

.modal-body {
    padding: 32px 24px;
    font-size: 16px;
    line-height: 1.6;
}

.modal-body p {
    margin-bottom: 16px;
}

.modal-body p:last-child {
    margin-bottom: 0;
}

.modal-footer {
    padding: 24px;
    border-top: 2px solid var(--gv-divider);
    display: flex;
    gap: 16px;
    justify-content: flex-end;
}
```

**JavaScript Example:**
```javascript
function showLimitModal() {
    document.getElementById('limit-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('limit-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function goToPricing() {
    window.location.href = '/frontend/pricing.html';
}
```

---

## Usage Limit Components

### Usage Indicator Bar

**Purpose:** Show current usage against tier limits.

**HTML Markup:**
```html
<div class="usage-info" role="region" aria-label="Usage limits">
    <h3>Your Monthly Usage</h3>
    <div class="usage-grid">
        <div class="usage-item">
            <div class="usage-label">Daily Insights</div>
            <div class="usage-value">150/240</div>
            <div class="usage-bar">
                <div class="usage-fill" style="width: 62.5%"></div>
            </div>
            <div class="usage-description">8/day</div>
        </div>

        <div class="usage-item">
            <div class="usage-label">AI Articles</div>
            <div class="usage-value">15/20</div>
            <div class="usage-bar">
                <div class="usage-fill warning" style="width: 75%"></div>
            </div>
            <div class="usage-description">per month</div>
        </div>

        <div class="usage-item">
            <div class="usage-label">Radar Searches</div>
            <div class="usage-value">9/10</div>
            <div class="usage-bar">
                <div class="usage-fill danger" style="width: 90%"></div>
            </div>
            <div class="usage-description">per month</div>
        </div>
    </div>
    <div class="upgrade-note">
        Need more? <a href="/frontend/pricing.html">Upgrade your plan</a> for higher limits.
    </div>
</div>
```

**CSS Styles:**
```css
.usage-info {
    background: white;
    border: 2px solid var(--gv-divider);
    padding: 24px 32px;
    margin-bottom: 32px;
}

.usage-info h3 {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--gv-anchor);
}

.usage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.usage-item {
    padding: 12px;
    background: var(--gv-bg-light);
    border-left: 4px solid var(--gv-hero);
}

.usage-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--gv-body);
    margin-bottom: 8px;
}

.usage-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--gv-anchor);
}

.usage-bar {
    background: var(--gv-divider);
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    margin-top: 8px;
}

.usage-fill {
    background: var(--gv-hero);
    height: 100%;
    transition: width 0.3s ease;
}

.usage-fill.warning {
    background: #f59e0b;
}

.usage-fill.danger {
    background: var(--gv-risk);
}

.usage-description {
    font-size: 12px;
    color: var(--gv-body);
    margin-top: 4px;
}

.upgrade-note {
    margin-top: 16px;
    padding: 12px;
    background: var(--gv-bg-light);
    border-left: 4px solid var(--gv-secondary);
    font-size: 14px;
    color: var(--gv-body);
}

.upgrade-note a {
    color: var(--gv-secondary);
    font-weight: 600;
    text-decoration: none;
}

.upgrade-note a:hover {
    text-decoration: underline;
}
```

---

### Tier Badge

**Purpose:** Display current subscription tier prominently.

**HTML Markup:**
```html
<span class="tier-badge" role="status" aria-label="Current subscription tier">
    PREMIUM TIER
</span>
```

**CSS Styles:**
```css
.tier-badge {
    display: inline-block;
    background: var(--gv-hero);
    color: white;
    padding: 6px 16px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border-radius: 0;
}

.tier-badge.basic {
    background: var(--gv-body);
}

.tier-badge.premium {
    background: var(--gv-hero);
}

.tier-badge.partner {
    background: var(--gv-secondary);
}
```

---

## Layout Patterns

### Dashboard Grid Layout

**Purpose:** Responsive grid for dashboard metrics and widgets.

**HTML Markup:**
```html
<main class="main-container">
    <!-- Welcome Section -->
    <section class="welcome-section">
        <h1 class="welcome-title">Welcome back, Brand Name</h1>
        <p class="welcome-subtitle">Here's what's happening with your influencer marketing today</p>
    </section>

    <!-- Stats Grid -->
    <section class="stats-grid">
        <!-- Stat cards -->
    </section>

    <!-- Quick Actions -->
    <section class="quick-actions">
        <!-- Action buttons -->
    </section>
</main>
```

**CSS Styles:**
```css
.main-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 32px 24px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}
```

---

### Page Header Pattern

**Purpose:** Consistent page titles with actions.

**HTML Markup:**
```html
<section class="page-header">
    <div>
        <h1 class="page-title">Daily Insights</h1>
        <p class="page-subtitle">AI-powered recommendations for your influencer strategy</p>
    </div>
    <div class="usage-badge">5/8 Tasks Today</div>
</section>
```

**CSS Styles:**
```css
.page-header {
    background: white;
    border: 4px solid var(--gv-anchor);
    padding: 32px;
    margin-bottom: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-title {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
}

.page-subtitle {
    font-size: 16px;
    color: var(--gv-body);
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
}
```

---

## Accessibility Patterns

### Skip Link

**Purpose:** Allow keyboard users to skip to main content.

**HTML Markup:**
```html
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Later in the page -->
<main class="main-container" id="main-content" role="main">
    <!-- Content -->
</main>
```

**CSS Styles:**
```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--gv-hero);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    font-weight: 600;
    z-index: 10000;
}

.skip-link:focus {
    top: 0;
}
```

---

### Screen Reader Only Text

**Purpose:** Provide information for screen readers without visual display.

**HTML Markup:**
```html
<span class="sr-only">
    This content is only for screen readers
</span>
```

**CSS Styles:**
```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

---

### Live Region for Announcements

**Purpose:** Announce dynamic content changes to screen readers.

**HTML Markup:**
```html
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only live-region" id="announcements"></div>

<script>
// Announce changes
document.getElementById('announcements').textContent = 'Dashboard loaded successfully';
</script>
```

**Usage:**
- Use `aria-live="polite"` for non-urgent updates
- Use `aria-live="assertive"` for urgent updates
- Use `aria-atomic="true"` to read entire message

---

### ARIA Labels and Roles

**Best Practices:**

```html
<!-- Navigation landmarks -->
<header role="banner">...</header>
<nav aria-label="Main navigation">...</nav>
<main role="main" id="main-content">...</main>

<!-- Interactive elements -->
<button aria-label="Close modal" aria-pressed="false">X</button>
<a href="#" aria-current="page">Dashboard</a>

<!-- Form accessibility -->
<input
    type="text"
    id="email"
    aria-label="Email address"
    aria-required="true"
    aria-invalid="false"
    aria-describedby="email-error">
<div id="email-error" role="alert">Invalid email</div>

<!-- Status updates -->
<div role="status" aria-live="polite">
    Saved successfully
</div>

<!-- Dialogs -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Confirmation</h2>
</div>
```

---

### Focus States

**Purpose:** Clear visual indication of keyboard focus.

**CSS Styles:**
```css
/* Global focus styles */
*:focus {
    outline: 2px solid var(--gv-hero);
    outline-offset: 2px;
}

/* Focus visible (only show on keyboard navigation) */
*:focus:not(:focus-visible) {
    outline: none;
}

*:focus-visible {
    outline: 2px solid var(--gv-hero);
    outline-offset: 2px;
}

/* Custom focus for dark backgrounds */
.site-header *:focus-visible {
    outline-color: white;
}
```

---

### Empty States

**Purpose:** Inform users when no data is available.

**HTML Markup:**
```html
<div class="empty-state" role="status">
    <div class="empty-icon" aria-hidden="true">📭</div>
    <h3 class="empty-title">No creators found</h3>
    <p class="empty-description">Try adjusting your filters or search criteria</p>
    <button class="btn-primary">Reset Filters</button>
</div>
```

**CSS Styles:**
```css
.empty-state {
    text-align: center;
    padding: 64px 32px;
    color: var(--gv-body);
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 24px;
}

.empty-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--gv-anchor);
    margin-bottom: 12px;
}

.empty-description {
    font-size: 16px;
    margin-bottom: 24px;
}
```

---

### Loading States

**Purpose:** Show when content is being fetched.

**HTML Markup:**
```html
<div class="loading-spinner" role="status" aria-live="polite">
    <div class="spinner" aria-hidden="true"></div>
    <p>Loading creators...</p>
</div>
```

**CSS Styles:**
```css
.loading-spinner {
    text-align: center;
    padding: 64px;
    font-size: 18px;
    color: var(--gv-body);
}

.spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto 16px;
    border: 4px solid var(--gv-divider);
    border-top-color: var(--gv-hero);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

---

## FAQ Section Pattern

**Purpose:** Expandable FAQ accordion.

**HTML Markup:**
```html
<section class="faq-section" aria-labelledby="faq-title">
    <h2 class="section-title" id="faq-title">Frequently Asked Questions</h2>

    <ul class="faq-list" role="list">
        <li class="faq-item" role="listitem">
            <button class="faq-question" aria-expanded="false" aria-controls="faq-1">
                <span>Do all tiers get access to all features?</span>
                <span class="faq-icon" aria-hidden="true">↓</span>
            </button>
            <div class="faq-answer" id="faq-1">
                Yes! All tiers have access to all GeoVera features. The difference is in the usage limits for each feature.
            </div>
        </li>
    </ul>
</section>
```

**CSS Styles:**
```css
.faq-section {
    background: white;
    border: 2px solid var(--gv-divider);
    padding: 48px;
    margin-bottom: 64px;
}

.faq-list {
    list-style: none;
}

.faq-item {
    border-bottom: 1px solid var(--gv-divider);
}

.faq-question {
    width: 100%;
    background: none;
    border: none;
    padding: 24px 0;
    font-size: 18px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 44px;
    color: var(--gv-anchor);
}

.faq-question:hover {
    color: var(--gv-hero);
}

.faq-icon {
    font-size: 24px;
    transition: transform 0.3s;
}

.faq-item.active .faq-icon {
    transform: rotate(180deg);
}

.faq-answer {
    padding: 0 0 24px 0;
    color: var(--gv-body);
    display: none;
}

.faq-item.active .faq-answer {
    display: block;
}
```

**JavaScript:**
```javascript
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', function() {
        const item = this.parentElement;
        const isActive = item.classList.contains('active');

        // Close all items
        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('active');
            i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
            this.setAttribute('aria-expanded', 'true');
        }
    });
});
```

---

## Responsive Design Breakpoints

### Mobile First Approach

```css
/* Mobile: Default styles (320px+) */

/* Tablet: 768px+ */
@media (min-width: 768px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) {
    .main-container {
        padding: 48px 64px;
    }
}
```

### Common Mobile Adjustments

```css
@media (max-width: 768px) {
    /* Hide desktop nav, show mobile menu */
    .nav-desktop {
        display: none;
    }

    .mobile-menu-toggle {
        display: flex;
    }

    /* Stack columns */
    .stats-grid {
        grid-template-columns: 1fr;
    }

    /* Reduce font sizes */
    .page-title {
        font-size: 28px;
    }

    .pricing-title {
        font-size: 36px;
    }

    /* Full width buttons */
    .modal-footer {
        flex-direction: column;
    }

    .modal-footer button {
        width: 100%;
    }
}
```

---

## Component Checklist

When creating new components, ensure:

- [ ] Sharp corners (border-radius: 0)
- [ ] Georgia serif for headings
- [ ] Inter sans-serif for body text
- [ ] Minimum 44x44px touch targets
- [ ] 4.5:1 color contrast ratio
- [ ] Proper ARIA labels
- [ ] Keyboard navigation support
- [ ] Focus states visible
- [ ] Responsive at all breakpoints
- [ ] Loading and error states
- [ ] Screen reader tested

---

## Quick Reference: Color Usage

| Color | Usage | Example |
|-------|-------|---------|
| `--gv-hero` (#16A34A) | Primary actions, success, active states | Primary buttons, active nav links |
| `--gv-anchor` (#0B0F19) | Headers, primary text, borders | Page titles, body text |
| `--gv-body` (#6B7280) | Secondary text, labels | Descriptions, metadata |
| `--gv-canvas` (#FFFFFF) | Backgrounds, cards | Card backgrounds, modals |
| `--gv-divider` (#E5E7EB) | Borders, separators | Card borders, hr elements |
| `--gv-bg-light` (#F9FAFB) | Page backgrounds, subtle fills | Body background, usage items |
| `--gv-risk` (#DC2626) | Errors, warnings, destructive actions | Error messages, delete buttons |
| `--gv-secondary` (#2563EB) | Links, secondary actions | Text links, info badges |

---

## Version History

**v3.0.0** - February 2026
- Complete comprehensive documentation
- All component patterns extracted from production pages
- Copy-paste ready code snippets
- Detailed accessibility guidelines
- Real-world usage examples

**v2.0.0** - February 2026
- Initial component library documentation
- WIRED editorial design system
- WCAG 2.1 AA compliant components

---

**Last Updated:** February 14, 2026
**Author:** Agent 3 - UI Component Documentation Specialist
**Status:** Production Ready

For implementation questions or new component requests, refer to the reference pages in `/Users/drew83/Desktop/geovera-staging/frontend/`.
