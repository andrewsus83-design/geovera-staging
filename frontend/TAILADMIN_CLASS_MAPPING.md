# TailAdmin Class Mapping for GeoVera
**Date:** February 15, 2026
**Purpose:** Quick reference for migrating WIRED components to TailAdmin

---

## 🎯 QUICK MIGRATION GUIDE

### How to Use This Guide:
1. Find your current WIRED component below
2. Copy the TailAdmin replacement
3. Paste into your HTML
4. Test the result

---

## 📦 BUTTONS

### Primary Button (Green)

**BEFORE (WIRED Style):**
```html
<button style="border: 4px solid #16A34A; border-radius: 0; padding: 12px 24px; background: #16A34A; color: white;">
  Create Collection
</button>
```

**AFTER (TailAdmin):**
```html
<button class="btn-primary-tailadmin">
  Create Collection
</button>
```

**With Icon:**
```html
<button class="btn-primary-tailadmin">
  <svg class="btn-icon"><!-- Plus icon SVG --></svg>
  Create Collection
</button>
```

---

### Secondary/Outline Button

**BEFORE:**
```html
<button style="border: 3px solid #E5E7EB; border-radius: 0; padding: 12px 24px; background: white;">
  Cancel
</button>
```

**AFTER:**
```html
<button class="btn-outline-tailadmin">
  Cancel
</button>
```

---

### Ghost Button

**BEFORE:**
```html
<button style="border: none; background: transparent; padding: 12px 24px;">
  View Details
</button>
```

**AFTER:**
```html
<button class="btn-ghost-tailadmin">
  View Details
</button>
```

---

### Button Sizes

**Small:**
```html
<button class="btn-primary-tailadmin btn-sm-tailadmin">Save</button>
```

**Large:**
```html
<button class="btn-primary-tailadmin btn-lg-tailadmin">Get Started</button>
```

---

## 🎴 CARDS

### Basic Card

**BEFORE (WIRED):**
```html
<div style="border: 4px solid #000; border-radius: 0; padding: 24px; background: white;">
  <h3>Card Title</h3>
  <p>Card content here...</p>
</div>
```

**AFTER (TailAdmin):**
```html
<div class="card-tailadmin">
  <h4 class="card-title-tailadmin">Card Title</h4>
  <p class="card-subtitle-tailadmin">Card content here...</p>
</div>
```

---

### Card with Header & Footer

**AFTER:**
```html
<div class="card-tailadmin">
  <div class="card-header-tailadmin">
    <h4 class="card-title-tailadmin">Card Title</h4>
    <p class="card-subtitle-tailadmin">Subtitle text</p>
  </div>

  <div class="card-body-tailadmin">
    Main content here...
  </div>

  <div class="card-footer-tailadmin">
    <button class="btn-outline-tailadmin">Cancel</button>
    <button class="btn-primary-tailadmin">Save</button>
  </div>
</div>
```

---

### Interactive Card (Clickable)

**AFTER:**
```html
<div class="card-tailadmin card-interactive" onclick="handleClick()">
  <h4 class="card-title-tailadmin">Click Me</h4>
  <p class="card-subtitle-tailadmin">This card is clickable</p>
</div>
```

---

## 📊 STAT CARDS

**BEFORE:**
```html
<div style="border: 4px solid #000; border-radius: 0; padding: 24px; text-align: center;">
  <h3>Total Creators</h3>
  <p style="font-size: 36px; font-weight: bold;">1,234</p>
  <p>+12% from last month</p>
</div>
```

**AFTER:**
```html
<div class="stat-card-tailadmin">
  <p class="stat-label-tailadmin">Total Creators</p>
  <p class="stat-value-tailadmin">1,234</p>
  <p class="stat-change-tailadmin stat-change-positive">
    ↑ 12% from last month
  </p>
</div>
```

**Stat Change Variants:**
- `.stat-change-positive` - Green (growth)
- `.stat-change-negative` - Red (decline)
- `.stat-change-neutral` - Gray (no change)

---

## 📝 FORM ELEMENTS

### Text Input

**BEFORE:**
```html
<input type="text" style="border: 3px solid #E5E7EB; border-radius: 0; padding: 12px; width: 100%;">
```

**AFTER:**
```html
<input type="text" class="input-tailadmin" placeholder="Enter text...">
```

---

### Input with Label

**AFTER:**
```html
<label class="label-tailadmin">Email Address</label>
<input type="email" class="input-tailadmin" placeholder="you@example.com">
```

---

### Select Dropdown

**BEFORE:**
```html
<select style="border: 3px solid #E5E7EB; border-radius: 0; padding: 12px; width: 100%;">
  <option>Option 1</option>
</select>
```

**AFTER:**
```html
<select class="select-tailadmin">
  <option>Select an option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

### Textarea

**BEFORE:**
```html
<textarea style="border: 3px solid #E5E7EB; border-radius: 0; padding: 12px; width: 100%;"></textarea>
```

**AFTER:**
```html
<textarea class="textarea-tailadmin" placeholder="Enter description..."></textarea>
```

---

### Checkbox

**BEFORE:**
```html
<input type="checkbox" style="width: 20px; height: 20px;">
```

**AFTER:**
```html
<input type="checkbox" class="checkbox-tailadmin">
```

**With Label:**
```html
<div style="display: flex; align-items: center; gap: 8px;">
  <input type="checkbox" class="checkbox-tailadmin" id="agree">
  <label for="agree">I agree to the terms</label>
</div>
```

---

### Radio Button

**AFTER:**
```html
<div style="display: flex; align-items: center; gap: 8px;">
  <input type="radio" class="radio-tailadmin" name="option" id="opt1">
  <label for="opt1">Option 1</label>
</div>
```

---

## 🏷️ BADGES

### Success Badge (Green)

**BEFORE:**
```html
<span style="background: #F0FDF4; color: #16A34A; padding: 4px 12px; border-radius: 999px; font-size: 12px;">
  Active
</span>
```

**AFTER:**
```html
<span class="badge-tailadmin badge-success">Active</span>
```

---

### Badge Variants

```html
<!-- Success (Green) -->
<span class="badge-tailadmin badge-success">Success</span>

<!-- Primary (Blue) -->
<span class="badge-tailadmin badge-primary">New</span>

<!-- Warning (Orange) -->
<span class="badge-tailadmin badge-warning">Pending</span>

<!-- Error (Red) -->
<span class="badge-tailadmin badge-error">Failed</span>

<!-- Gray (Neutral) -->
<span class="badge-tailadmin badge-gray">Inactive</span>
```

---

## 🪟 MODALS

**BEFORE:**
```html
<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; border: 4px solid #000; border-radius: 0; padding: 24px;">
  <h2>Modal Title</h2>
  <p>Modal content...</p>
  <button>Close</button>
</div>
```

**AFTER:**
```html
<!-- Overlay -->
<div class="modal-overlay-tailadmin">

  <!-- Modal -->
  <div class="modal-tailadmin">

    <!-- Header -->
    <div class="modal-header-tailadmin">
      <h3 class="modal-title-tailadmin">Modal Title</h3>
      <button class="modal-close-button">
        <svg><!-- Close icon --></svg>
      </button>
    </div>

    <!-- Body -->
    <div class="modal-body-tailadmin">
      <p>Modal content goes here...</p>
    </div>

    <!-- Footer -->
    <div class="modal-footer-tailadmin">
      <button class="btn-outline-tailadmin">Cancel</button>
      <button class="btn-primary-tailadmin">Confirm</button>
    </div>

  </div>
</div>
```

---

## 🚨 ALERTS

```html
<!-- Success Alert -->
<div class="alert-tailadmin alert-success">
  <svg class="alert-icon"><!-- Success icon --></svg>
  <div>Your changes have been saved successfully.</div>
</div>

<!-- Warning Alert -->
<div class="alert-tailadmin alert-warning">
  <svg class="alert-icon"><!-- Warning icon --></svg>
  <div>Please review your input before submitting.</div>
</div>

<!-- Error Alert -->
<div class="alert-tailadmin alert-error">
  <svg class="alert-icon"><!-- Error icon --></svg>
  <div>An error occurred. Please try again.</div>
</div>

<!-- Info Alert -->
<div class="alert-tailadmin alert-info">
  <svg class="alert-icon"><!-- Info icon --></svg>
  <div>Did you know? You can save time by using keyboard shortcuts.</div>
</div>
```

---

## 🔄 LOADING STATES

### Spinner

```html
<div class="spinner-tailadmin"></div>
```

**In Button:**
```html
<button class="btn-primary-tailadmin" disabled>
  <div class="spinner-tailadmin"></div>
  Loading...
</button>
```

---

### Skeleton Loader

```html
<!-- Text skeleton -->
<div class="skeleton-tailadmin" style="height: 16px; width: 200px;"></div>

<!-- Card skeleton -->
<div class="card-tailadmin">
  <div class="skeleton-tailadmin" style="height: 24px; width: 60%; margin-bottom: 12px;"></div>
  <div class="skeleton-tailadmin" style="height: 16px; width: 100%; margin-bottom: 8px;"></div>
  <div class="skeleton-tailadmin" style="height: 16px; width: 80%;"></div>
</div>
```

---

## 📈 PROGRESS BARS

```html
<div class="progress-bar-container">
  <div class="progress-bar-fill" style="width: 65%;"></div>
</div>
```

**With Label:**
```html
<div>
  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
    <span style="font-size: 14px; color: #6B7280;">Progress</span>
    <span style="font-size: 14px; font-weight: 500;">65%</span>
  </div>
  <div class="progress-bar-container">
    <div class="progress-bar-fill" style="width: 65%;"></div>
  </div>
</div>
```

---

## 🎨 COMPLETE CLASS REFERENCE

| Component | TailAdmin Class | Usage |
|-----------|----------------|-------|
| **Buttons** |
| Primary | `.btn-primary-tailadmin` | Green action button |
| Outline | `.btn-outline-tailadmin` | Secondary action |
| Ghost | `.btn-ghost-tailadmin` | Tertiary action |
| Small size | `.btn-sm-tailadmin` | Smaller variant |
| Large size | `.btn-lg-tailadmin` | Larger variant |
| **Cards** |
| Card | `.card-tailadmin` | Basic card container |
| Card title | `.card-title-tailadmin` | Card heading |
| Card subtitle | `.card-subtitle-tailadmin` | Card description |
| Card header | `.card-header-tailadmin` | Top section |
| Card body | `.card-body-tailadmin` | Main content |
| Card footer | `.card-footer-tailadmin` | Bottom actions |
| **Stats** |
| Stat card | `.stat-card-tailadmin` | Stat container |
| Stat value | `.stat-value-tailadmin` | Large number |
| Stat label | `.stat-label-tailadmin` | Stat description |
| Stat change | `.stat-change-tailadmin` | Change indicator |
| **Forms** |
| Input | `.input-tailadmin` | Text input |
| Select | `.select-tailadmin` | Dropdown |
| Textarea | `.textarea-tailadmin` | Multi-line input |
| Label | `.label-tailadmin` | Form label |
| Checkbox | `.checkbox-tailadmin` | Checkbox input |
| Radio | `.radio-tailadmin` | Radio input |
| **Badges** |
| Base badge | `.badge-tailadmin` | Badge container |
| Success | `.badge-success` | Green badge |
| Primary | `.badge-primary` | Blue badge |
| Warning | `.badge-warning` | Orange badge |
| Error | `.badge-error` | Red badge |
| Gray | `.badge-gray` | Neutral badge |
| **Modals** |
| Overlay | `.modal-overlay-tailadmin` | Dark backdrop |
| Modal | `.modal-tailadmin` | Modal container |
| Modal header | `.modal-header-tailadmin` | Top section |
| Modal title | `.modal-title-tailadmin` | Modal heading |
| Modal body | `.modal-body-tailadmin` | Content area |
| Modal footer | `.modal-footer-tailadmin` | Action buttons |
| **Alerts** |
| Alert | `.alert-tailadmin` | Alert container |
| Success | `.alert-success` | Green alert |
| Warning | `.alert-warning` | Orange alert |
| Error | `.alert-error` | Red alert |
| Info | `.alert-info` | Blue alert |
| **Loading** |
| Spinner | `.spinner-tailadmin` | Loading spinner |
| Skeleton | `.skeleton-tailadmin` | Content placeholder |

---

## 💡 COMMON PATTERNS

### Form with Validation

```html
<div>
  <label class="label-tailadmin">Email</label>
  <input type="email" class="input-tailadmin" placeholder="you@example.com">
  <p style="font-size: 12px; color: #EF4444; margin-top: 4px;">
    Please enter a valid email
  </p>
</div>
```

---

### Card Grid (Responsive)

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
  <div class="card-tailadmin">...</div>
  <div class="card-tailadmin">...</div>
  <div class="card-tailadmin">...</div>
</div>
```

---

### Button Group

```html
<div style="display: flex; gap: 12px;">
  <button class="btn-outline-tailadmin">Cancel</button>
  <button class="btn-primary-tailadmin">Save Changes</button>
</div>
```

---

## 🎯 MIGRATION CHECKLIST

For each page, replace:

- [ ] All buttons → TailAdmin button classes
- [ ] All cards → `.card-tailadmin`
- [ ] All inputs → `.input-tailadmin`
- [ ] All selects → `.select-tailadmin`
- [ ] All badges → `.badge-tailadmin` + variant
- [ ] All modals → TailAdmin modal structure
- [ ] Remove all `border-radius: 0`
- [ ] Remove all heavy borders (3-4px)
- [ ] Add proper spacing with padding
- [ ] Test hover states work

---

**Created by:** Agent 1 - TailAdmin Design System Specialist
**Date:** February 15, 2026
**For:** GeoVera Frontend Modernization

---

*This guide helps Agent 2 quickly migrate all GeoVera pages to TailAdmin design*
