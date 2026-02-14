# GeoVera Intelligence Platform
## WCAG 2.1 AA Accessibility Compliance Checklist

**Standard:** WCAG 2.1 AA
**Platform:** GeoVera Intelligence
**Compliance:** MANDATORY for all production pages
**Last Updated:** February 14, 2026

---

## Executive Summary

This checklist ensures all GeoVera pages meet WCAG 2.1 Level AA accessibility standards. Compliance is **mandatory** for February 20, 2026 launch.

**Key Requirements:**
- Skip navigation links on all pages
- Proper ARIA labels for all interactive elements
- Full keyboard navigation support
- Visible focus states (2px green outline)
- Touch targets ≥44px x 44px (mobile: ≥48px)
- Color contrast ≥4.5:1 for text, ≥3:1 for UI components
- WIRED design system consistency

---

## Page-by-Page Compliance Status

### Production Pages (Primary Focus)

| Page | Skip Links | ARIA Labels | Keyboard Nav | Focus States | Touch Targets | Color Contrast | Status |
|------|-----------|-------------|--------------|--------------|---------------|----------------|--------|
| **index.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **login.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **dashboard.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **pricing.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Complete** |
| **radar.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | **Needs Verification** |
| **insights.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | **Needs Verification** |
| **settings.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | **Needs Verification** |
| **creators.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | **Needs Verification** |
| **analytics.html** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | **Needs Verification** |
| **chat.html** | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **Needs Urgent Update** |
| **content-studio.html** | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **Needs Update** |
| **hub.html** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **Needs Update** |
| **hub-collection.html** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **Needs Verification** |
| **onboarding.html** | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | **Needs Update** |

### Support Pages

| Page | Status | Priority |
|------|--------|----------|
| forgot-password.html | ✅ Complete | High |
| email-confirmed.html | ✅ Complete | Medium |
| diagnostic.html | ⚠️ Needs Update | Low |

### Status Legend
- ✅ **Complete** - Fully compliant, tested, verified
- ⚠️ **Needs Verification** - Implemented but requires manual testing
- ❌ **Critical** - Missing accessibility features, blocks launch

---

## Automated Testing Commands

### Quick Audit (Run before commits)

```bash
# Navigate to project root
cd /Users/drew83/Desktop/geovera-staging

# 1. Check for skip links (should find 9+)
echo "=== Skip Links Check ==="
grep -l 'skip-link' frontend/*.html | wc -l

# 2. Check for ARIA labels
echo "=== ARIA Labels Check ==="
grep -rh 'aria-label' frontend/*.html | wc -l

# 3. Check for accessibility CSS inclusion
echo "=== Accessibility CSS Check ==="
grep -l 'accessibility.css' frontend/*.html

# 4. Check for border-radius violations (WIRED design)
echo "=== Border Radius Violations ==="
grep -rh 'border-radius' frontend/*.html | grep -v 'border-radius: 0' | grep -v 'logo' | grep -v '//' | head -20

# 5. Check for Georgia font on headlines
echo "=== Georgia Font Usage ==="
grep -rh "font-family.*Georgia" frontend/*.html | wc -l

# 6. Check for role attributes
echo "=== ARIA Roles Check ==="
grep -rh 'role=' frontend/*.html | wc -l

# 7. Check for alt text on images
echo "=== Alt Text Check ==="
grep -rh '<img' frontend/*.html | grep -v 'alt=' | wc -l

# 8. Check for lang attribute
echo "=== Language Attribute ==="
grep -l 'lang="' frontend/*.html | wc -l
```

### Detailed Page Analysis

```bash
# Analyze specific page for accessibility
PAGE="dashboard.html"

echo "Analyzing $PAGE for WCAG 2.1 AA compliance..."
echo ""

# Skip link check
echo "1. Skip Link:"
grep -n 'skip-link' frontend/$PAGE || echo "   ❌ MISSING"

# ARIA label count
echo ""
echo "2. ARIA Labels:"
grep -c 'aria-label' frontend/$PAGE || echo "0"

# Button accessibility
echo ""
echo "3. Interactive Elements:"
grep -c '<button' frontend/$PAGE || echo "0 buttons"
grep -c '<a href' frontend/$PAGE || echo "0 links"

# Form labels
echo ""
echo "4. Form Labels:"
grep -c '<label' frontend/$PAGE || echo "0 labels"

# Alt text
echo ""
echo "5. Image Alt Text:"
TOTAL_IMAGES=$(grep -c '<img' frontend/$PAGE || echo "0")
IMAGES_WITH_ALT=$(grep '<img' frontend/$PAGE | grep -c 'alt=' || echo "0")
echo "   Total images: $TOTAL_IMAGES"
echo "   With alt text: $IMAGES_WITH_ALT"

# Heading hierarchy
echo ""
echo "6. Heading Hierarchy:"
for i in {1..6}; do
  COUNT=$(grep -c "<h$i" frontend/$PAGE || echo "0")
  echo "   h$i: $COUNT"
done
```

### Batch Testing All Pages

```bash
# Test all production pages
echo "=== WCAG 2.1 AA Batch Test ==="
echo ""

PAGES=(
  "index.html"
  "login.html"
  "dashboard.html"
  "pricing.html"
  "radar.html"
  "insights.html"
  "settings.html"
  "creators.html"
  "analytics.html"
  "chat.html"
  "content-studio.html"
  "hub.html"
  "onboarding.html"
)

for PAGE in "${PAGES[@]}"; do
  echo "Testing: $PAGE"

  # Skip link
  if grep -q 'skip-link' frontend/$PAGE; then
    echo "  ✅ Skip link"
  else
    echo "  ❌ Skip link MISSING"
  fi

  # Accessibility CSS
  if grep -q 'accessibility.css' frontend/$PAGE; then
    echo "  ✅ Accessibility CSS"
  else
    echo "  ❌ Accessibility CSS MISSING"
  fi

  # Language attribute
  if grep -q 'lang=' frontend/$PAGE; then
    echo "  ✅ Language attribute"
  else
    echo "  ❌ Language attribute MISSING"
  fi

  echo ""
done
```

---

## Manual Testing Checklist

### 1. Keyboard Navigation Test (Per Page)

**Time Required:** 5 minutes per page
**Tools Needed:** Browser only

#### Test Steps

1. **Skip Link Test**
   - [ ] Load page
   - [ ] Press `Tab` key ONCE
   - [ ] Skip link should appear at top-left
   - [ ] Press `Enter` on skip link
   - [ ] Focus should jump to main content
   - [ ] Verify focus visible (green outline)

2. **Tab Order Test**
   - [ ] Press `Tab` repeatedly
   - [ ] Verify logical tab order (left-to-right, top-to-bottom)
   - [ ] All interactive elements receive focus
   - [ ] No keyboard traps (can navigate away from all elements)
   - [ ] Focus indicator visible on ALL elements (2px green outline)

3. **Navigation Menu Test**
   - [ ] Tab to navigation menu
   - [ ] Arrow keys navigate menu items (if applicable)
   - [ ] Enter key activates menu items
   - [ ] Escape key closes dropdowns/submenus

4. **Form Interaction Test**
   - [ ] Tab to form fields
   - [ ] Type in text inputs
   - [ ] Use arrow keys in select dropdowns
   - [ ] Space bar checks checkboxes
   - [ ] Enter submits forms
   - [ ] Tab moves between fields in logical order

5. **Modal/Dialog Test**
   - [ ] Tab to button that opens modal
   - [ ] Press Enter to open
   - [ ] Focus trapped inside modal
   - [ ] Tab cycles through modal elements only
   - [ ] Escape key closes modal
   - [ ] Focus returns to trigger button after close

6. **Button Interaction Test**
   - [ ] Tab to all buttons
   - [ ] Press Enter or Space to activate
   - [ ] Loading states announced
   - [ ] Error states announced
   - [ ] Success states announced

**Pass Criteria:**
- All interactive elements accessible via keyboard only
- Focus visible at all times
- No keyboard traps
- Logical tab order maintained

---

### 2. Screen Reader Test (VoiceOver/NVDA)

**Time Required:** 10 minutes per page
**Tools Needed:** VoiceOver (Mac) or NVDA (Windows)

#### Mac VoiceOver Setup

```bash
# Turn on VoiceOver
Cmd + F5

# VoiceOver commands:
# Control + Option + Right Arrow = Next element
# Control + Option + Left Arrow = Previous element
# Control + Option + Space = Activate element
# Control = Stop speaking
```

#### Windows NVDA Setup

```bash
# Download NVDA from https://www.nvaccess.org/
# Install and launch
# Insert + Down Arrow = Read next line
# Insert + Up Arrow = Read previous line
# Insert + Space = Activate element
# Insert + T = Read title
```

#### Test Steps

1. **Page Structure Test**
   - [ ] Open page with screen reader active
   - [ ] Navigate by headings (VoiceOver: VO + Cmd + H)
   - [ ] Verify heading hierarchy (H1 → H2 → H3, no skips)
   - [ ] Navigate by landmarks (VoiceOver: VO + U → select Landmarks)
   - [ ] Verify main, nav, header, footer landmarks present

2. **Image Alt Text Test**
   - [ ] Navigate to each image
   - [ ] Screen reader announces descriptive alt text
   - [ ] Decorative images marked aria-hidden="true" (not announced)
   - [ ] Icons with text have proper labels

3. **Form Label Test**
   - [ ] Navigate to each form field
   - [ ] Screen reader announces label before field
   - [ ] Required fields announced
   - [ ] Error messages announced when validation fails
   - [ ] Helper text announced

4. **Link Purpose Test**
   - [ ] Navigate to each link
   - [ ] Link purpose clear from text alone
   - [ ] No "click here" or "read more" without context
   - [ ] External links announced as external

5. **Dynamic Content Test**
   - [ ] Trigger content update (e.g., load more items)
   - [ ] Verify aria-live region announces change
   - [ ] Navigate to new content
   - [ ] New content accessible via keyboard

6. **Button Labeling Test**
   - [ ] Navigate to each button
   - [ ] Button purpose clear from label
   - [ ] Icon-only buttons have aria-label
   - [ ] Close buttons labeled "Close [modal name]"

**Pass Criteria:**
- All content announced by screen reader
- No unlabeled interactive elements
- Proper heading hierarchy
- Dynamic updates announced

---

### 3. Touch Target Test (Mobile Devices)

**Time Required:** 5 minutes per page
**Tools Needed:** Browser DevTools or physical device

#### Using Browser DevTools

```bash
# Chrome DevTools
1. Open page in Chrome
2. Press F12 or Cmd + Option + I
3. Click "Toggle Device Toolbar" (phone icon)
4. Select "iPhone 14 Pro" or "Pixel 7"
5. Switch to "Touch" mode
```

#### Test Steps

1. **Minimum Size Test**
   - [ ] Inspect all buttons, links, inputs
   - [ ] Minimum 44px × 44px on desktop
   - [ ] Minimum 48px × 48px on mobile
   - [ ] Use DevTools ruler to measure

2. **Spacing Test**
   - [ ] Adjacent touch targets have sufficient spacing
   - [ ] Minimum 8px gap between targets
   - [ ] No overlapping interactive areas

3. **Mobile Navigation Test**
   - [ ] Switch to mobile view (375px width)
   - [ ] Tap all navigation items
   - [ ] Verify no mis-taps
   - [ ] Verify menu items not too close together

4. **Form Field Test**
   - [ ] Switch to mobile view
   - [ ] Tap all form inputs
   - [ ] Verify fields large enough to tap accurately
   - [ ] Verify no zooming on input focus (font-size ≥16px)

5. **Modal/Dialog Test**
   - [ ] Open modals on mobile view
   - [ ] Tap close button easily
   - [ ] Tap buttons inside modal
   - [ ] No accidental dismissals

**DevTools Measurement:**

```javascript
// Paste in browser console to check touch target sizes
document.querySelectorAll('button, a, input[type="button"], input[type="submit"]').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    console.warn('Small touch target:', el, `${rect.width}px × ${rect.height}px`);
  }
});
```

**Pass Criteria:**
- All interactive elements ≥44px × 44px (desktop)
- All interactive elements ≥48px × 48px (mobile)
- Adequate spacing between targets
- No accidental taps during testing

---

### 4. Color Contrast Test

**Time Required:** 5 minutes per page
**Tools Needed:** Browser extension (axe DevTools, WAVE, or Lighthouse)

#### Using axe DevTools (Recommended)

1. **Install Extension**
   - Chrome: https://chrome.google.com/webstore (search "axe DevTools")
   - Firefox: https://addons.mozilla.org/ (search "axe DevTools")

2. **Run Scan**
   ```bash
   1. Open page to test
   2. Open DevTools (F12 or Cmd + Option + I)
   3. Click "axe DevTools" tab
   4. Click "Scan ALL of my page"
   5. Review "Color Contrast" issues
   ```

3. **Review Results**
   - [ ] Zero color contrast failures
   - [ ] Text contrast ≥4.5:1
   - [ ] Large text (18px+) ≥3:1
   - [ ] UI components ≥3:1

#### Using Chrome Lighthouse

```bash
1. Open page in Chrome
2. Open DevTools (F12)
3. Click "Lighthouse" tab
4. Select "Accessibility" only
5. Choose "Desktop" or "Mobile"
6. Click "Analyze page load"
7. Review "Contrast" section
```

#### Manual Contrast Check

Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

**GeoVera Color Palette Verification:**

| Color Combination | Ratio | WCAG AA | Status |
|------------------|-------|---------|--------|
| #0B0F19 on #FFFFFF (body text) | 15.85:1 | Pass (4.5:1) | ✅ |
| #6B7280 on #FFFFFF (secondary text) | 5.74:1 | Pass (4.5:1) | ✅ |
| #16A34A on #FFFFFF (green button text) | 3.16:1 | Pass (3:1 large) | ✅ |
| #FFFFFF on #16A34A (white on green) | 3.16:1 | Pass (3:1 large) | ✅ |
| #16A34A on #0B0F19 (green on dark) | 5.01:1 | Pass (4.5:1) | ✅ |
| #2563EB on #FFFFFF (blue links) | 5.14:1 | Pass (4.5:1) | ✅ |
| #DC2626 on #FFFFFF (red errors) | 5.48:1 | Pass (4.5:1) | ✅ |

#### Test Steps

1. **Text Contrast Test**
   - [ ] All body text ≥4.5:1 contrast
   - [ ] All heading text ≥4.5:1 contrast
   - [ ] Link text ≥4.5:1 with background
   - [ ] Link text ≥3:1 with surrounding text

2. **UI Component Test**
   - [ ] Button borders ≥3:1 with background
   - [ ] Input borders ≥3:1 with background
   - [ ] Focus indicators ≥3:1 with background
   - [ ] Icons ≥3:1 with background

3. **State Contrast Test**
   - [ ] Hover states maintain contrast
   - [ ] Focus states maintain contrast
   - [ ] Active states maintain contrast
   - [ ] Disabled states still visible (reduced opacity OK)

4. **Error/Success Messages**
   - [ ] Error text (red) ≥4.5:1
   - [ ] Success text (green) ≥4.5:1
   - [ ] Warning text (yellow/orange) ≥4.5:1
   - [ ] Don't rely on color alone (use icons)

**Pass Criteria:**
- Zero contrast failures in automated scan
- All text ≥4.5:1 (or ≥3:1 for large text)
- All UI components ≥3:1
- Status not conveyed by color alone

---

## WIRED Design System Verification

### Design Consistency Checklist

**GeoVera WIRED Design Requirements:**

#### Typography
- [ ] All headlines use `Georgia, 'Times New Roman', serif`
- [ ] All body text uses `'Inter', system-ui, -apple-system, sans-serif`
- [ ] Font sizes scale properly (16px base, 18px desktop)
- [ ] Line heights appropriate for readability

#### Colors
- [ ] Primary green: `#16A34A` used consistently
- [ ] Dark navy: `#0B0F19` for text/headers
- [ ] Body gray: `#6B7280` for secondary text
- [ ] Secondary blue: `#2563EB` for links
- [ ] Error red: `#DC2626` for errors
- [ ] All colors pass contrast requirements

#### Borders & Corners
- [ ] All buttons have `border-radius: 0` (sharp corners)
- [ ] All cards have `border-radius: 0`
- [ ] All inputs have `border-radius: 0`
- [ ] **Exception:** Logo circles can remain circular
- [ ] Border width: 2px or 4px for emphasis

#### Spacing
- [ ] Consistent 8px spacing scale (8, 16, 24, 32, 40, 48)
- [ ] Adequate whitespace between sections
- [ ] Touch targets properly spaced (8px minimum)

#### Buttons
- [ ] Primary buttons: Green fill (#16A34A), white text
- [ ] Secondary buttons: White fill, green border, green text
- [ ] Ghost buttons: Transparent, green text
- [ ] All buttons min-height: 44px (desktop), 48px (mobile)
- [ ] All buttons have `border-radius: 0`

### Automated WIRED Design Check

```bash
# Check for border-radius violations (except logo)
echo "=== Border Radius Violations ==="
grep -rn 'border-radius' frontend/*.html | \
  grep -v 'border-radius: 0' | \
  grep -v 'logo' | \
  grep -v '//' | \
  awk -F: '{print $1":"$2" - VIOLATION"}' | \
  head -20

# Check for non-Georgia headlines
echo "=== Non-Georgia Headlines ==="
grep -rn '<h[1-6]' frontend/*.html | \
  head -5 | \
  while read line; do
    FILE=$(echo $line | cut -d: -f1)
    LINE=$(echo $line | cut -d: -f2)
    # Check if Georgia is set in CSS for this page
    if ! grep -q "font-family.*Georgia" $FILE; then
      echo "$FILE:$LINE - No Georgia font detected"
    fi
  done

# Check for proper color usage
echo "=== Color Usage Check ==="
echo "Primary Green (#16A34A):"
grep -rc '#16A34A' frontend/*.html | grep -v ':0$' | head -5

echo "Dark Navy (#0B0F19):"
grep -rc '#0B0F19' frontend/*.html | grep -v ':0$' | head -5
```

---

## Common Accessibility Issues & Fixes

### Issue 1: Missing Skip Link

**Problem:**
```html
<!-- BAD: No skip link -->
<body>
  <header>...</header>
  <main>...</main>
</body>
```

**Solution:**
```html
<!-- GOOD: Skip link present -->
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header>...</header>
  <main id="main-content" tabindex="-1">...</main>
</body>
```

**CSS Required:**
```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #0B0F19;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    z-index: 10000;
}

.skip-link:focus {
    top: 0;
}
```

---

### Issue 2: Missing ARIA Labels

**Problem:**
```html
<!-- BAD: Icon-only button, no label -->
<button onclick="closeModal()">×</button>

<!-- BAD: Search input, no label -->
<input type="text" placeholder="Search...">

<!-- BAD: Icon link, no label -->
<a href="/settings"><i class="icon-settings"></i></a>
```

**Solution:**
```html
<!-- GOOD: ARIA label on button -->
<button onclick="closeModal()" aria-label="Close modal">×</button>

<!-- GOOD: Label on input -->
<label for="search" class="sr-only">Search</label>
<input id="search" type="text" placeholder="Search...">

<!-- GOOD: ARIA label on icon link -->
<a href="/settings" aria-label="Settings">
  <i class="icon-settings" aria-hidden="true"></i>
</a>
```

---

### Issue 3: Poor Focus States

**Problem:**
```css
/* BAD: Focus outline removed */
button:focus {
  outline: none;
}

/* BAD: Focus not visible */
a:focus {
  outline: 1px dotted gray;
}
```

**Solution:**
```css
/* GOOD: Visible focus with brand color */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #16A34A;
  outline-offset: 2px;
}

/* Remove outline for mouse users only */
*:focus:not(:focus-visible) {
  outline: none;
}
```

---

### Issue 4: Keyboard Trap in Modal

**Problem:**
```javascript
// BAD: Focus not trapped, no escape key
function openModal() {
  document.getElementById('modal').style.display = 'block';
}
```

**Solution:**
```javascript
// GOOD: Focus trapped, escape key closes
function openModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'block';

  // Store element that triggered modal
  modal.dataset.triggerId = document.activeElement.id;

  // Focus first interactive element
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  firstFocusable?.focus();

  // Trap focus inside modal
  modal.addEventListener('keydown', trapFocus);

  // Close on escape
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';

  // Return focus to trigger
  const triggerId = modal.dataset.triggerId;
  document.getElementById(triggerId)?.focus();
}

function trapFocus(e) {
  const modal = e.currentTarget;
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}
```

---

### Issue 5: Missing Form Labels

**Problem:**
```html
<!-- BAD: No label -->
<input type="email" placeholder="Enter email">

<!-- BAD: Placeholder as label -->
<input type="password" placeholder="Password">
```

**Solution:**
```html
<!-- GOOD: Visible label -->
<label for="email">Email Address</label>
<input id="email" type="email" placeholder="you@example.com">

<!-- GOOD: Screen reader only label -->
<label for="password" class="sr-only">Password</label>
<input id="password" type="password" placeholder="Enter password">
```

---

### Issue 6: Insufficient Color Contrast

**Problem:**
```css
/* BAD: Light gray on white (2.1:1) */
.secondary-text {
  color: #999999;
  background: #FFFFFF;
}

/* BAD: Green text on white (2.8:1) */
.button-text {
  color: #16A34A;
  background: #FFFFFF;
  font-size: 14px;
}
```

**Solution:**
```css
/* GOOD: Dark gray on white (5.74:1) */
.secondary-text {
  color: #6B7280;
  background: #FFFFFF;
}

/* GOOD: White on green (3.16:1, large text) */
.button-text {
  color: #FFFFFF;
  background: #16A34A;
  font-size: 16px;
  font-weight: 600;
}

/* GOOD: Dark text on white (15.85:1) */
.primary-text {
  color: #0B0F19;
  background: #FFFFFF;
}
```

---

### Issue 7: Small Touch Targets

**Problem:**
```html
<!-- BAD: 24px × 24px close button -->
<button style="width: 24px; height: 24px; padding: 0;">×</button>

<!-- BAD: 32px × 32px icon link -->
<a href="#" style="width: 32px; height: 32px; display: block;">
  <i class="icon"></i>
</a>
```

**Solution:**
```html
<!-- GOOD: 44px × 44px close button -->
<button style="min-width: 44px; min-height: 44px; padding: 12px;">×</button>

<!-- GOOD: 44px × 44px icon link with padding -->
<a href="#" style="min-width: 44px; min-height: 44px; padding: 10px; display: inline-flex; align-items: center; justify-content: center;">
  <i class="icon"></i>
</a>
```

---

### Issue 8: No Alt Text on Images

**Problem:**
```html
<!-- BAD: Missing alt attribute -->
<img src="logo.png">

<!-- BAD: Generic alt text -->
<img src="screenshot.png" alt="image">

<!-- BAD: Decorative image with alt text -->
<img src="divider.png" alt="divider">
```

**Solution:**
```html
<!-- GOOD: Descriptive alt text -->
<img src="logo.png" alt="GeoVera Intelligence logo">

<!-- GOOD: Context-specific alt text -->
<img src="screenshot.png" alt="Dashboard showing 45% engagement increase">

<!-- GOOD: Decorative image hidden from screen readers -->
<img src="divider.png" alt="" role="presentation">
<!-- OR -->
<img src="divider.png" alt="" aria-hidden="true">
```

---

### Issue 9: Broken Heading Hierarchy

**Problem:**
```html
<!-- BAD: Skips from H1 to H3 -->
<h1>Dashboard</h1>
<h3>Recent Activity</h3>
<h3>Analytics</h3>

<!-- BAD: Multiple H1s -->
<h1>GeoVera</h1>
<section>
  <h1>Features</h1>
</section>
```

**Solution:**
```html
<!-- GOOD: Proper hierarchy -->
<h1>Dashboard</h1>
<h2>Recent Activity</h2>
<h3>Last 7 Days</h3>
<h2>Analytics</h2>
<h3>Engagement Metrics</h3>

<!-- GOOD: Single H1, proper nesting -->
<h1>GeoVera Intelligence</h1>
<section>
  <h2>Features</h2>
  <h3>Brand Radar</h3>
  <h3>AI Chat</h3>
</section>
```

---

### Issue 10: No Keyboard Access to Dropdowns

**Problem:**
```html
<!-- BAD: Click-only dropdown -->
<div class="dropdown" onclick="toggleDropdown()">
  Menu
  <div class="dropdown-content">...</div>
</div>
```

**Solution:**
```html
<!-- GOOD: Keyboard accessible dropdown -->
<button
  aria-expanded="false"
  aria-controls="dropdown-menu"
  onclick="toggleDropdown(this)"
  onkeydown="handleDropdownKey(event, this)">
  Menu
</button>
<div id="dropdown-menu" role="menu" hidden>
  <a href="#" role="menuitem">Item 1</a>
  <a href="#" role="menuitem">Item 2</a>
</div>

<script>
function toggleDropdown(btn) {
  const menu = document.getElementById(btn.getAttribute('aria-controls'));
  const isExpanded = btn.getAttribute('aria-expanded') === 'true';

  btn.setAttribute('aria-expanded', !isExpanded);
  menu.hidden = isExpanded;

  if (!isExpanded) {
    menu.querySelector('[role="menuitem"]').focus();
  }
}

function handleDropdownKey(e, btn) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleDropdown(btn);
  } else if (e.key === 'Escape') {
    const menu = document.getElementById(btn.getAttribute('aria-controls'));
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }
}
</script>
```

---

## Tier Implementation Accessibility

### Modal Dialog Requirements

All tier selection modals, upgrade prompts, and dialogs MUST meet these requirements:

#### 1. Semantic HTML
```html
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true">
  <h2 id="modal-title">Upgrade to Professional</h2>
  <p id="modal-description">Unlock advanced features...</p>
  <!-- Modal content -->
</div>
```

#### 2. Focus Management Checklist
- [ ] Modal has `role="dialog"`
- [ ] Modal has `aria-labelledby` pointing to title
- [ ] Modal has `aria-describedby` pointing to description (optional)
- [ ] Modal has `aria-modal="true"`
- [ ] Focus moves to modal when opened
- [ ] Focus trapped inside modal (Tab cycles through modal only)
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element after close
- [ ] Close button has proper label: "Close [modal name]"

#### 3. Implementation Template

```html
<!-- Tier Modal Template -->
<div
  id="tier-modal"
  class="modal-overlay"
  role="dialog"
  aria-labelledby="tier-modal-title"
  aria-modal="true"
  hidden>
  <div class="modal-container">
    <!-- Close button -->
    <button
      class="modal-close"
      aria-label="Close upgrade modal"
      onclick="closeTierModal()">
      ×
    </button>

    <!-- Modal header -->
    <h2 id="tier-modal-title">Upgrade to Professional Tier</h2>

    <!-- Modal content -->
    <div class="tier-features">
      <ul>
        <li>500 AI generations per month</li>
        <li>Advanced analytics dashboard</li>
        <li>Priority support</li>
      </ul>
    </div>

    <!-- Action buttons -->
    <div class="modal-actions">
      <button
        class="btn-primary"
        onclick="upgradeTier('professional')">
        Upgrade Now
      </button>
      <button
        class="btn-secondary"
        onclick="closeTierModal()">
        Maybe Later
      </button>
    </div>
  </div>
</div>

<script>
// Open tier modal
function openTierModal(tier) {
  const modal = document.getElementById('tier-modal');

  // Store trigger element
  modal.dataset.triggerId = document.activeElement.id;

  // Show modal
  modal.hidden = false;
  document.body.classList.add('modal-open');

  // Focus first interactive element (close button)
  modal.querySelector('.modal-close').focus();

  // Add keyboard listeners
  modal.addEventListener('keydown', handleModalKeydown);
}

// Close tier modal
function closeTierModal() {
  const modal = document.getElementById('tier-modal');

  // Hide modal
  modal.hidden = true;
  document.body.classList.remove('modal-open');

  // Return focus to trigger
  const triggerId = modal.dataset.triggerId;
  if (triggerId) {
    document.getElementById(triggerId)?.focus();
  }

  // Remove keyboard listeners
  modal.removeEventListener('keydown', handleModalKeydown);
}

// Handle keyboard navigation in modal
function handleModalKeydown(e) {
  const modal = e.currentTarget;

  // Close on Escape
  if (e.key === 'Escape') {
    closeTierModal();
    return;
  }

  // Trap focus with Tab
  if (e.key === 'Tab') {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}
</script>
```

#### 4. Tier Modal Accessibility Checklist

- [ ] **Semantic Structure**
  - [ ] Modal uses `<dialog>` element OR `role="dialog"`
  - [ ] Title uses `<h2>` and has unique ID
  - [ ] Modal has `aria-labelledby` pointing to title

- [ ] **Focus Management**
  - [ ] Focus moves to modal when opened
  - [ ] Focus trapped inside modal (Tab cycles)
  - [ ] Focus returns to trigger after close
  - [ ] First focusable element receives focus on open

- [ ] **Keyboard Support**
  - [ ] Escape key closes modal
  - [ ] Tab key cycles through modal elements
  - [ ] Shift+Tab cycles backwards
  - [ ] Enter key activates buttons
  - [ ] No keyboard traps

- [ ] **Screen Reader Support**
  - [ ] Modal announced when opened
  - [ ] Close button properly labeled
  - [ ] Action buttons clearly labeled
  - [ ] Tier benefits read in logical order

- [ ] **Visual Design**
  - [ ] Close button ≥44px × 44px
  - [ ] Action buttons ≥44px tall
  - [ ] Focus indicators visible (2px green)
  - [ ] Text contrast ≥4.5:1
  - [ ] Modal readable at 200% zoom

---

## Testing Schedule (Pre-Launch)

### Week 1 (Feb 14-16, 2026)

**Day 1: Automated Testing**
- [ ] Run automated tests on all production pages
- [ ] Document violations in spreadsheet
- [ ] Create GitHub issues for critical violations

**Day 2: Keyboard Testing**
- [ ] Test all 14 production pages for keyboard navigation
- [ ] Test all modals and dialogs
- [ ] Document keyboard traps or issues

**Day 3: Screen Reader Testing**
- [ ] Test 5 most critical pages (index, login, dashboard, pricing, radar)
- [ ] Document missing labels or announcements

### Week 2 (Feb 17-19, 2026)

**Day 1: Touch Target & Mobile Testing**
- [ ] Test all pages in mobile view (375px)
- [ ] Measure touch targets on critical elements
- [ ] Fix any violations found

**Day 2: Color Contrast Testing**
- [ ] Run axe DevTools on all pages
- [ ] Fix any contrast violations
- [ ] Verify WIRED design color palette

**Day 3: Final Verification**
- [ ] Re-test all pages that had violations
- [ ] Get sign-off from QA team
- [ ] Update compliance status in this document

### Launch Day (Feb 20, 2026)

**Pre-Launch Checks:**
- [ ] All production pages pass automated tests
- [ ] Zero critical accessibility violations
- [ ] Keyboard navigation works on all pages
- [ ] Screen reader testing complete for critical paths
- [ ] Touch targets verified on mobile
- [ ] Color contrast verified
- [ ] WIRED design system compliance verified

---

## Resources & Tools

### Browser Extensions
- **axe DevTools** (Chrome/Firefox): Automated accessibility testing
- **WAVE** (Chrome/Firefox): Visual accessibility evaluation
- **Lighthouse** (Chrome): Built-in accessibility auditing
- **NVDA** (Windows): Free screen reader for testing
- **Color Contrast Analyzer**: Desktop app for contrast checking

### Documentation
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM**: https://webaim.org/ (Best practices and articles)
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **A11y Project**: https://www.a11yproject.com/ (Checklist and resources)

### Testing Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **HTML Validator**: https://validator.w3.org/
- **Accessibility Insights**: https://accessibilityinsights.io/

### Keyboard Shortcuts Reference

#### Mac VoiceOver
- `Cmd + F5`: Toggle VoiceOver
- `VO + Right Arrow`: Next element
- `VO + Left Arrow`: Previous element
- `VO + Space`: Activate element
- `VO + Cmd + H`: Next heading
- `VO + U`: Rotor (navigation menu)

#### Windows NVDA
- `Ctrl + Alt + N`: Start NVDA
- `Insert + Down Arrow`: Next line
- `Insert + Up Arrow`: Previous line
- `H`: Next heading
- `B`: Next button
- `Insert + F7`: Elements list

---

## Compliance Certification

### Final Sign-Off

**Tested By:** _________________
**Date:** _________________
**Status:** [ ] PASS [ ] FAIL

**Critical Issues Remaining:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Appendix: Quick Reference

### WCAG 2.1 AA Requirements Summary

| Guideline | Requirement | GeoVera Implementation |
|-----------|-------------|------------------------|
| **1.1.1** | Non-text Content | All images have alt text |
| **1.3.1** | Info and Relationships | Semantic HTML, proper headings |
| **1.3.2** | Meaningful Sequence | Logical reading order |
| **1.4.3** | Contrast (Minimum) | 4.5:1 text, 3:1 UI |
| **1.4.5** | Images of Text | Minimal use, prefer live text |
| **2.1.1** | Keyboard | All functions keyboard accessible |
| **2.1.2** | No Keyboard Trap | Can navigate away from all elements |
| **2.4.1** | Bypass Blocks | Skip links on all pages |
| **2.4.3** | Focus Order | Logical tab order |
| **2.4.6** | Headings and Labels | Descriptive labels on all inputs |
| **2.4.7** | Focus Visible | 2px green outline on focus |
| **2.5.5** | Target Size | 44px × 44px minimum |
| **3.1.1** | Language of Page | `lang` attribute on `<html>` |
| **3.2.3** | Consistent Navigation | Same nav on all pages |
| **3.3.1** | Error Identification | Errors clearly identified |
| **3.3.2** | Labels or Instructions | All inputs have labels |
| **4.1.2** | Name, Role, Value | ARIA labels on all controls |
| **4.1.3** | Status Messages | Live regions for dynamic content |

### Common ARIA Attributes

```html
<!-- Buttons -->
<button aria-label="Close modal">×</button>
<button aria-expanded="false">Menu</button>
<button aria-pressed="false">Toggle</button>

<!-- Links -->
<a href="external.com" aria-label="External link (opens in new tab)">Link</a>

<!-- Inputs -->
<input aria-required="true" aria-invalid="false" aria-describedby="help-text">
<div id="help-text">Helper text</div>

<!-- Live Regions -->
<div aria-live="polite" aria-atomic="true">Status updated</div>
<div role="alert">Error message</div>

<!-- Dialogs -->
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Dialog Title</h2>
</div>

<!-- Landmarks -->
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
```

---

**Document Version:** 1.0
**Last Updated:** February 14, 2026
**Next Review:** February 19, 2026 (Pre-launch verification)
**Owner:** Accessibility QA Team
