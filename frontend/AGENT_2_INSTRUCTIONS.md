# Agent 2: Page Migration Instructions
**Mission:** Migrate 10 GeoVera pages to TailAdmin with white sidebar
**Priority:** Complete all pages systematically
**Estimated Time:** 3-4 hours

---

## 🎯 QUICK START

### Files Created by Agent 1 (Ready to Use):
✅ `css/tailadmin-base.css` - Design system
✅ `css/geovera-sidebar.css` - White sidebar
✅ `css/tailadmin-components.css` - Components
✅ `TAILADMIN_CLASS_MAPPING.md` - Migration guide
✅ `NAVIGATION_TEMPLATE.html` - Copy this structure

---

## 📋 10 PAGES TO MIGRATE

### Priority 1 (Core Pages):
1. ✅ dashboard.html
2. ✅ chat.html
3. ✅ insights.html
4. ✅ todo.html (or task.html)
5. ✅ hub.html

### Priority 2 (Feature Pages):
6. ✅ content-studio.html
7. ✅ radar.html
8. ✅ seo.html
9. ✅ geo.html (or analytics.html if geo doesn't exist)
10. ✅ social-search.html

---

## 🔧 STEP-BY-STEP FOR EACH PAGE

### Step 1: Update `<head>` Section

**Find:**
```html
<head>
    <meta charset="UTF-8">
    <title>...</title>

    <!-- Old styles -->
    <link rel="stylesheet" href="css/...">
```

**Replace with:**
```html
<head>
    <meta charset="UTF-8">
    <title>Page Title - GeoVera</title>

    <!-- TailAdmin Design System -->
    <link rel="stylesheet" href="/frontend/css/tailadmin-base.css">
    <link rel="stylesheet" href="/frontend/css/geovera-sidebar.css">
    <link rel="stylesheet" href="/frontend/css/tailadmin-components.css">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Existing config (keep if exists) -->
    <script type="module" src="/frontend/config.js"></script>
```

---

### Step 2: Replace `<body>` Structure

**Current structure (varies by page):**
```html
<body>
    <header class="site-header">
        <!-- Top navigation -->
    </header>

    <main>
        <!-- Page content -->
    </main>
</body>
```

**New structure (from NAVIGATION_TEMPLATE.html):**
```html
<body>
  <!-- Skip to main (accessibility) -->
  <a href="#main-content" class="skip-to-main">Skip to main content</a>

  <!-- GeoVera Layout -->
  <div class="geovera-layout">

    <!-- Mobile toggle -->
    <button class="mobile-menu-toggle">...</button>

    <!-- LEFT SIDEBAR (White) -->
    <aside class="geovera-sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">...</div>

      <!-- Navigation sections -->
      <nav class="nav-section">...</nav>

      <!-- User menu -->
      <div class="sidebar-user">...</div>
    </aside>

    <!-- Overlay for mobile -->
    <div class="sidebar-overlay"></div>

    <!-- MAIN CONTENT (White) -->
    <main class="geovera-main" id="main-content">
      <!-- Page header -->
      <header class="page-header">
        <h1 class="page-title">PAGE_TITLE_HERE</h1>
        <p class="page-subtitle">PAGE_SUBTITLE_HERE</p>
      </header>

      <!-- Page content -->
      <div class="page-content">
        <!-- EXISTING PAGE CONTENT GOES HERE -->
        <!-- Just wrap existing content, don't rewrite everything -->
      </div>
    </main>

  </div>

  <!-- JavaScript from NAVIGATION_TEMPLATE.html -->
  <script>
    // Mobile menu, user menu, etc.
  </script>
</body>
```

---

### Step 3: Update Active Nav Item

In sidebar navigation, mark current page as active:

**Dashboard:**
```html
<a href="/dashboard.html" class="nav-item active">Dashboard</a>
```

**Chat:**
```html
<a href="/chat.html" class="nav-item active">AI Chat</a>
```

**And so on...**

---

### Step 4: Modernize Components in Content

Use `TAILADMIN_CLASS_MAPPING.md` for quick reference.

#### Buttons
**Before:**
```html
<button style="border: 4px solid #16A34A; border-radius: 0;">Click</button>
```

**After:**
```html
<button class="btn-primary-tailadmin">Click</button>
```

#### Cards
**Before:**
```html
<div style="border: 4px solid #000; border-radius: 0; padding: 24px;">
    Content
</div>
```

**After:**
```html
<div class="card-tailadmin">
    <h4 class="card-title-tailadmin">Title</h4>
    <p class="card-subtitle-tailadmin">Content</p>
</div>
```

#### Inputs
**Before:**
```html
<input style="border: 3px solid #E5E7EB; border-radius: 0;">
```

**After:**
```html
<input class="input-tailadmin">
```

---

## 📄 PAGE-SPECIFIC UPDATES

### 1. dashboard.html
**Page Title:** "Dashboard"
**Subtitle:** "Welcome back! Here's your overview."

**Update:**
- Import CSS
- Add sidebar
- Modernize stat cards
- Update charts containers
- Keep existing JavaScript

---

### 2. chat.html
**Page Title:** "AI Chat"
**Subtitle:** "Ask me anything about your brand intelligence"

**Update:**
- Import CSS
- Add sidebar
- Modernize chat bubbles (add rounded corners)
- Update input container
- Keep chat functionality

---

### 3. insights.html
**Page Title:** "Insights"
**Subtitle:** "Daily insights for your brand"

**Update:**
- Import CSS
- Add sidebar
- Modernize insight cards
- Update task items
- Keep existing logic

---

### 4. todo.html
**Page Title:** "To Do"
**Subtitle:** "Manage your brand tasks"

**Update:**
- Import CSS
- Add sidebar
- Modernize task items with checkboxes
- Update action buttons

---

### 5. hub.html
**Page Title:** "Hub"
**Subtitle:** "Your creator collection hub"

**Update:**
- Import CSS
- Add sidebar
- Modernize collection cards
- Update creator avatars (make rounded-full)
- Keep geographic filtering logic

---

### 6. content-studio.html
**Page Title:** "Content Studio"
**Subtitle:** "AI-powered content generation"

**Update:**
- Import CSS
- Add sidebar
- **Special:** Implement masonry layout (see CONTENT_STUDIO_SPEC.md)
- Modernize generation cards
- Update progress bars

---

### 7. radar.html
**Page Title:** "Radar"
**Subtitle:** "Discover creators in your market"

**Update:**
- Import CSS
- Add sidebar
- Modernize creator result cards
- Update search filters
- Keep geographic filtering
- Keep Partner-tier check

---

### 8. seo.html
**Page Title:** "SEO"
**Subtitle:** "Search engine optimization tools"

**Update:**
- Import CSS
- Add sidebar
- Modernize metric cards
- Update tool containers

---

### 9. geo.html (or analytics.html)
**Page Title:** "GEO"
**Subtitle:** "Geographic analytics for your brand"

**Update:**
- Import CSS
- Add sidebar
- Modernize map container
- Update stat cards

---

### 10. social-search.html
**Page Title:** "Social Search"
**Subtitle:** "Search across social platforms"

**Update:**
- Import CSS
- Add sidebar
- Modernize search results
- Update filter buttons

---

## 🔍 TESTING CHECKLIST

For each page after migration:

### Visual
- [ ] White sidebar visible on left
- [ ] Current page marked as active
- [ ] All corners rounded (no sharp edges)
- [ ] Cards have subtle shadows
- [ ] Buttons are modern green
- [ ] Page looks spacious and clean

### Functional
- [ ] Page loads without errors
- [ ] Sidebar navigation works
- [ ] Mobile menu toggles
- [ ] All buttons clickable
- [ ] Forms still work
- [ ] Existing JavaScript works

### Responsive
- [ ] Sidebar collapses on mobile
- [ ] Content readable on tablet
- [ ] All elements accessible

---

## ⚡ OPTIMIZATION TIPS

### 1. Don't Recreate Everything
- **Keep** existing content structure
- **Keep** existing JavaScript
- **Keep** existing data logic
- **Only update** CSS and HTML structure

### 2. Use Search & Replace
```javascript
// Find all inline styles
border-radius:\s*0

// Find buttons
style="border: [3-4]px

// Find cards
<div.*?style="border: 4px
```

### 3. Work Systematically
1. Start with dashboard (reference for others)
2. Do all "Priority 1" pages first
3. Then "Priority 2" pages
4. Test each page before moving to next

---

## 🎯 SUCCESS CRITERIA

**Each page is complete when:**
- ✅ TailAdmin CSS imported
- ✅ White sidebar navigation added
- ✅ Components use modern classes
- ✅ No sharp corners (border-radius: 0)
- ✅ No heavy borders (3-4px)
- ✅ All functionality works
- ✅ Looks professional and modern

---

## 📊 PROGRESS TRACKING

| Page | CSS | Sidebar | Components | Tested | Status |
|------|-----|---------|------------|--------|---------|
| dashboard.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| chat.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| insights.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| todo.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| hub.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| content-studio.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| radar.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| seo.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| geo.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |
| social-search.html | ⏳ | ⏳ | ⏳ | ⏳ | Pending |

---

## 🚨 CRITICAL RULES

### DO NOT CHANGE:
- ❌ JavaScript functionality
- ❌ API calls
- ❌ Data flow
- ❌ Business logic
- ❌ Form submissions

### MUST CHANGE:
- ✅ CSS imports (add TailAdmin)
- ✅ Body structure (add sidebar)
- ✅ Component classes (WIRED → TailAdmin)
- ✅ All border-radius: 0 → rounded
- ✅ Heavy borders → 1px subtle

---

## 📁 FILES TO REFERENCE

1. **NAVIGATION_TEMPLATE.html** - Copy sidebar structure from here
2. **TAILADMIN_CLASS_MAPPING.md** - Quick component replacements
3. **Agent 1 CSS files** - Already created and ready to import

---

## 💡 WHEN STUCK

1. **Check NAVIGATION_TEMPLATE.html** - Complete working example
2. **Check TAILADMIN_CLASS_MAPPING.md** - Component examples
3. **Check Agent 1 CSS files** - All styles are defined
4. **Test in browser** - See if it works visually

---

**Agent 2 Status:** Ready to start migration
**Total Pages:** 10
**Estimated Time:** 3-4 hours
**Priority:** Complete systematically

---

*Start with dashboard.html and use it as reference for all other pages!*
