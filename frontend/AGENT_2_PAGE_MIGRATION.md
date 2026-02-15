# Agent 2: Page Migration Specialist
**Role:** HTML Modernization & Visual Consistency
**Expertise:** TailAdmin, Next.js, Frontend Development, CSS-in-HTML

---

## 🎯 PRIMARY MISSION

Apply modern design system (created by Agent 1) to all GeoVera frontend pages, replacing WIRED editorial styling with modern rounded aesthetic while maintaining functionality.

---

## 🧠 AGENT PROFILE

### Specialization
- **HTML Modernization:** Update inline styles and classes
- **Visual QA:** Ensure consistent appearance
- **Component Integration:** Apply new design system
- **Testing:** Cross-page consistency checks

### Core Responsibilities
1. Import new CSS files into all pages
2. Replace sharp corners with rounded styles
3. Replace heavy borders with subtle shadows
4. Add smooth transitions
5. Test visual consistency
6. Ensure no functionality breaks

---

## 📋 TASK LIST

### Phase 1: Setup (15 min)

#### Task 1.1: Update Global CSS Imports
**Action:** Add modern CSS files to all pages

**Find this in each HTML file:**
```html
<!-- Old CSS imports -->
<link rel="stylesheet" href="/frontend/css/components.css">
```

**Replace with:**
```html
<!-- Modern design system -->
<link rel="stylesheet" href="/frontend/css/modern-variables.css">
<link rel="stylesheet" href="/frontend/css/modern-utilities.css">
<link rel="stylesheet" href="/frontend/css/modern-components.css">
<link rel="stylesheet" href="/frontend/css/components.css">
```

**Files to update:**
- dashboard.html
- chat.html
- hub.html
- insights.html
- analytics.html
- content-studio.html
- radar.html
- settings.html
- creators.html
- pricing.html
- login.html
- onboarding.html

---

### Phase 2: Component Migration (2 hours)

#### Task 2.1: Dashboard (dashboard.html)

**Find and replace patterns:**

1. **Stat Cards:**
```html
<!-- BEFORE -->
<div class="stat-card" style="border: 4px solid #000; border-radius: 0;">
    <h3>Total Creators</h3>
    <p class="stat-value">1,234</p>
</div>

<!-- AFTER -->
<div class="stat-card card rounded-lg shadow-sm">
    <h3>Total Creators</h3>
    <p class="stat-value">1,234</p>
</div>
```

2. **Action Buttons:**
```html
<!-- BEFORE -->
<button class="btn-primary" style="border: 4px solid #16A34A; border-radius: 0;">
    View Insights
</button>

<!-- AFTER -->
<button class="btn btn-primary rounded-md shadow-sm transition-base">
    View Insights
</button>
```

3. **Chart Containers:**
```html
<!-- BEFORE -->
<div class="chart-container" style="border: 3px solid #E5E7EB; border-radius: 0;">
    <!-- Chart content -->
</div>

<!-- AFTER -->
<div class="chart-container card rounded-lg shadow-md">
    <!-- Chart content -->
</div>
```

---

#### Task 2.2: Chat (chat.html)

**Find and replace patterns:**

1. **Chat Bubbles:**
```html
<!-- BEFORE -->
<div class="chat-bubble-user" style="border-radius: 0; border: 2px solid #16A34A;">
    Message text here
</div>

<!-- AFTER -->
<div class="chat-bubble-user rounded-lg shadow-sm" style="border: 1px solid #16A34A;">
    Message text here
</div>
```

2. **Input Container:**
```html
<!-- BEFORE -->
<div class="chat-input-container" style="border: 3px solid #E5E7EB; border-radius: 0;">
    <input type="text" class="chat-input">
</div>

<!-- AFTER -->
<div class="chat-input-container rounded-xl shadow-md" style="border: 1px solid #E5E7EB;">
    <input type="text" class="chat-input rounded-md">
</div>
```

3. **Limit Modal:**
```html
<!-- BEFORE -->
<div class="modal" style="border: 4px solid #000; border-radius: 0;">
    <h2>Daily Limit Reached</h2>
</div>

<!-- AFTER -->
<div class="modal rounded-xl shadow-2xl">
    <h2>Daily Limit Reached</h2>
</div>
```

---

#### Task 2.3: Hub (hub.html)

**Find and replace patterns:**

1. **Collection Cards:**
```html
<!-- BEFORE -->
<div class="collection-card" style="border: 4px solid #000; border-radius: 0;">
    <h3>Fashion Influencers</h3>
    <p>12 creators</p>
</div>

<!-- AFTER -->
<div class="collection-card card rounded-lg shadow-md transition-base">
    <h3>Fashion Influencers</h3>
    <p>12 creators</p>
</div>
```

2. **Add Collection Button:**
```html
<!-- BEFORE -->
<button class="add-collection-btn" style="border: 4px solid #16A34A; border-radius: 0;">
    + Create Collection
</button>

<!-- AFTER -->
<button class="add-collection-btn btn btn-primary rounded-md shadow-sm">
    + Create Collection
</button>
```

3. **Creator Avatars:**
```html
<!-- BEFORE -->
<img class="creator-avatar" style="border-radius: 0; border: 3px solid #E5E7EB;">

<!-- AFTER -->
<img class="creator-avatar rounded-full shadow-sm" style="border: 2px solid #E5E7EB;">
```

---

#### Task 2.4: Insights (insights.html)

**Find and replace patterns:**

1. **Insight Cards:**
```html
<!-- BEFORE -->
<div class="insight-card" style="border: 4px solid #16A34A; border-radius: 0;">
    <span class="badge">Trending</span>
    <h3>Content Strategy Tip</h3>
</div>

<!-- AFTER -->
<div class="insight-card card rounded-lg shadow-md transition-base">
    <span class="badge badge-primary rounded-full">Trending</span>
    <h3>Content Strategy Tip</h3>
</div>
```

2. **Task Items:**
```html
<!-- BEFORE -->
<div class="task-item" style="border: 2px solid #E5E7EB; border-radius: 0;">
    <input type="checkbox">
    <span>Review competitor content</span>
</div>

<!-- AFTER -->
<div class="task-item rounded-md shadow-xs transition-fast" style="border: 1px solid #E5E7EB;">
    <input type="checkbox" class="checkbox rounded-sm">
    <span>Review competitor content</span>
</div>
```

---

#### Task 2.5: Analytics (analytics.html)

**Find and replace patterns:**

1. **Metric Cards:**
```html
<!-- BEFORE -->
<div class="metric-card" style="border: 4px solid #000; border-radius: 0;">
    <h4>Engagement Rate</h4>
    <p class="metric-value">4.2%</p>
</div>

<!-- AFTER -->
<div class="metric-card card rounded-lg shadow-md">
    <h4>Engagement Rate</h4>
    <p class="metric-value">4.2%</p>
</div>
```

2. **Filter Buttons:**
```html
<!-- BEFORE -->
<button class="filter-btn" style="border: 2px solid #E5E7EB; border-radius: 0;">
    Last 7 Days
</button>

<!-- AFTER -->
<button class="filter-btn btn-secondary rounded-md shadow-xs transition-base">
    Last 7 Days
</button>
```

---

#### Task 2.6: Content Studio (content-studio.html)

**Find and replace patterns:**

1. **Generation Cards:**
```html
<!-- BEFORE -->
<div class="generation-type-card" style="border: 4px solid #16A34A; border-radius: 0;">
    <h3>Article Generation</h3>
    <p>15/month</p>
</div>

<!-- AFTER -->
<div class="generation-type-card card rounded-lg shadow-md transition-base">
    <h3>Article Generation</h3>
    <p>15/month</p>
</div>
```

2. **Generate Button:**
```html
<!-- BEFORE -->
<button class="generate-btn" style="border: 4px solid #16A34A; border-radius: 0;">
    Generate Content
</button>

<!-- AFTER -->
<button class="generate-btn btn btn-primary btn-lg rounded-lg shadow-md">
    Generate Content
</button>
```

---

#### Task 2.7: Radar (radar.html)

**Find and replace patterns:**

1. **Creator Result Cards:**
```html
<!-- BEFORE -->
<div class="creator-card" style="border: 4px solid #000; border-radius: 0;">
    <img class="creator-avatar" style="border-radius: 0;">
    <h3>Creator Name</h3>
</div>

<!-- AFTER -->
<div class="creator-card card rounded-lg shadow-md transition-base">
    <img class="creator-avatar rounded-full shadow-sm">
    <h3>Creator Name</h3>
</div>
```

2. **Search Filters:**
```html
<!-- BEFORE -->
<select class="filter-select" style="border: 3px solid #E5E7EB; border-radius: 0;">
    <option>All Categories</option>
</select>

<!-- AFTER -->
<select class="filter-select input rounded-md shadow-xs">
    <option>All Categories</option>
</select>
```

---

#### Task 2.8: Settings (settings.html)

**Find and replace patterns:**

1. **Settings Sections:**
```html
<!-- BEFORE -->
<div class="settings-section" style="border: 3px solid #E5E7EB; border-radius: 0;">
    <h3>Account Settings</h3>
</div>

<!-- AFTER -->
<div class="settings-section card rounded-lg shadow-sm">
    <h3>Account Settings</h3>
</div>
```

2. **Save Button:**
```html
<!-- BEFORE -->
<button class="save-btn" style="border: 4px solid #16A34A; border-radius: 0;">
    Save Changes
</button>

<!-- AFTER -->
<button class="save-btn btn btn-primary rounded-md shadow-sm">
    Save Changes
</button>
```

---

#### Task 2.9: Pricing (pricing.html)

**Find and replace patterns:**

1. **Pricing Cards:**
```html
<!-- BEFORE -->
<div class="pricing-card" style="border: 4px solid #000; border-radius: 0;">
    <h2>Premium</h2>
    <p class="price">$699/month</p>
</div>

<!-- AFTER -->
<div class="pricing-card card rounded-xl shadow-lg transition-base">
    <h2>Premium</h2>
    <p class="price">$699/month</p>
</div>
```

2. **Feature Lists:**
```html
<!-- BEFORE -->
<div class="feature-item" style="border-radius: 0;">
    <span>✓</span> All features
</div>

<!-- AFTER -->
<div class="feature-item rounded-md">
    <span>✓</span> All features
</div>
```

---

### Phase 3: Navigation Template (30 min)

#### Task 3.1: Update Navigation Template
**File:** `_nav-template.html`

**Find and replace:**

1. **Navigation Container:**
```html
<!-- BEFORE -->
<nav class="sidebar" style="border-radius: 0;">

<!-- AFTER -->
<nav class="sidebar">
```

2. **Navigation Items:**
```html
<!-- BEFORE -->
<a href="/dashboard" class="nav-item" style="border-radius: 0;">
    Dashboard
</a>

<!-- AFTER -->
<a href="/dashboard" class="nav-item rounded-md transition-base">
    Dashboard
</a>
```

3. **User Menu:**
```html
<!-- BEFORE -->
<div class="user-menu" style="border: 3px solid #E5E7EB; border-radius: 0;">
    User options
</div>

<!-- AFTER -->
<div class="user-menu rounded-lg shadow-md">
    User options
</div>
```

---

## 🎯 MIGRATION PATTERNS

### Global Search & Replace (use with caution)

```javascript
// Pattern 1: Remove border-radius: 0
Find: border-radius:\s*0;?
Replace: (delete)

// Pattern 2: Update border widths
Find: border:\s*[3-4]px\s*solid
Replace: border: 1px solid

// Pattern 3: Add shadows to cards
Find: class="([^"]*card[^"]*)"
Replace: class="$1 shadow-md"

// Pattern 4: Round buttons
Find: class="([^"]*btn[^"]*)"
Replace: class="$1 rounded-md"
```

### Common Class Additions

```html
<!-- Cards -->
Add: rounded-lg shadow-md transition-base

<!-- Buttons -->
Add: rounded-md shadow-sm transition-base

<!-- Inputs -->
Add: rounded-md shadow-xs

<!-- Modals -->
Add: rounded-xl shadow-2xl

<!-- Badges -->
Add: rounded-full

<!-- Avatars -->
Add: rounded-full shadow-sm
```

---

## ✅ QUALITY CHECKLIST

### Per-Page Checklist

For each page, verify:

#### Visual
- [ ] All sharp corners replaced with rounded
- [ ] Heavy borders replaced with subtle ones
- [ ] Shadows applied appropriately
- [ ] Hover states work smoothly
- [ ] No visual glitches

#### Functional
- [ ] All buttons clickable
- [ ] Forms submit correctly
- [ ] Modals open/close properly
- [ ] Navigation works
- [ ] No JavaScript errors

#### Accessibility
- [ ] Focus states visible
- [ ] Color contrast maintained
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

---

## 🔍 TESTING STRATEGY

### Visual Regression Testing

1. **Take screenshots BEFORE migration**
   ```bash
   # Screenshot all pages
   npm run screenshot:before
   ```

2. **Apply migrations**

3. **Take screenshots AFTER migration**
   ```bash
   # Screenshot all pages
   npm run screenshot:after
   ```

4. **Compare visually**
   - Check layout hasn't broken
   - Verify rounded corners applied
   - Ensure shadows visible

### Functional Testing

Test each page:
1. Load page successfully
2. Click all interactive elements
3. Submit forms
4. Open/close modals
5. Navigate between pages

### Browser Testing

Test in:
- ✅ Chrome (primary)
- ✅ Safari (macOS)
- ✅ Firefox
- ✅ Edge

---

## 🚨 CRITICAL RULES

### DO NOT CHANGE
- ❌ JavaScript functionality
- ❌ Data flow
- ❌ API calls
- ❌ Business logic
- ❌ Color palette
- ❌ Typography

### MUST CHANGE
- ✅ Border radius (0 → rounded)
- ✅ Border width (3-4px → 1px)
- ✅ Add shadows
- ✅ Add transitions
- ✅ Update button classes

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Broken Layouts
**Symptom:** Content overflows or misaligned
**Fix:** Check padding/margins weren't removed

### Issue 2: Missing Shadows
**Symptom:** Components look flat
**Fix:** Add shadow-sm or shadow-md class

### Issue 3: Transitions Too Slow
**Symptom:** Hover feels sluggish
**Fix:** Use transition-fast instead of transition-base

### Issue 4: Focus States Invisible
**Symptom:** Can't see keyboard focus
**Fix:** Ensure focus classes applied

---

## 📊 PROGRESS TRACKING

### Page Migration Status

| Page | CSS Imported | Components Updated | Tested | Status |
|------|-------------|-------------------|--------|---------|
| dashboard.html | ⏳ | ⏳ | ⏳ | Pending |
| chat.html | ⏳ | ⏳ | ⏳ | Pending |
| hub.html | ⏳ | ⏳ | ⏳ | Pending |
| insights.html | ⏳ | ⏳ | ⏳ | Pending |
| analytics.html | ⏳ | ⏳ | ⏳ | Pending |
| content-studio.html | ⏳ | ⏳ | ⏳ | Pending |
| radar.html | ⏳ | ⏳ | ⏳ | Pending |
| settings.html | ⏳ | ⏳ | ⏳ | Pending |
| pricing.html | ⏳ | ⏳ | ⏳ | Pending |

---

## 🎯 DELIVERABLES

### Updated Files
1. ✅ All 12+ HTML pages with modern styles
2. ✅ Navigation template modernized
3. ✅ No visual regressions

### Documentation
4. ✅ Before/after screenshots
5. ✅ Migration report
6. ✅ Known issues list

---

## 🤝 COLLABORATION WITH AGENT 1

### Required from Agent 1
- ✅ modern-variables.css
- ✅ modern-utilities.css
- ✅ modern-components.css
- ✅ Class name mapping guide

### Report back to Agent 1
- Any missing utility classes needed
- Edge cases found
- Suggested component improvements

---

## 📈 SUCCESS METRICS

### Visual Quality
- 100% of sharp corners replaced
- 100% of heavy borders updated
- All components have appropriate shadows
- Smooth transitions on all interactive elements

### Code Quality
- No inline border-radius: 0
- No 3-4px borders
- Consistent class usage
- Clean, maintainable code

### User Experience
- No broken functionality
- Improved visual hierarchy
- Professional appearance
- Smooth interactions

---

**Agent Status:** Ready for deployment after Agent 1
**Estimated Time:** 2.5 hours
**Priority:** High
**Dependencies:** Agent 1 completion

---

*Agent 2 - Page Migration Specialist - GeoVera Modernization Project*
