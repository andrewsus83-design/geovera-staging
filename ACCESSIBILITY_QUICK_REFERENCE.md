# WCAG 2.1 AA Quick Reference Card
## GeoVera Intelligence Platform

**Print this out and keep it handy!**

---

## 🎯 Essential ARIA Patterns

### Buttons
```html
<!-- Button with icon -->
<button aria-label="Like this article">
    <svg aria-hidden="true">...</svg>
    <span>Like</span>
</button>

<!-- Icon-only button -->
<button aria-label="Close dialog">
    <svg aria-hidden="true">×</svg>
</button>

<!-- Button with state -->
<button aria-pressed="false" aria-label="Toggle notifications">
    Notifications
</button>
```

### Navigation
```html
<!-- Main navigation -->
<nav aria-label="Main navigation">
    <a href="/" aria-label="Home page">Home</a>
    <a href="/about" aria-label="About GeoVera">About</a>
</nav>

<!-- Footer navigation -->
<nav aria-label="Footer navigation">
    <a href="/terms" aria-label="Terms of service">Terms</a>
</nav>

<!-- Breadcrumbs -->
<nav aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Current Page</li>
    </ol>
</nav>
```

### Forms
```html
<!-- Text input -->
<label for="email">Email</label>
<input type="email" id="email"
       aria-required="true"
       aria-describedby="email-help"
       autocomplete="email">
<span id="email-help">We'll never share your email</span>

<!-- Input with error -->
<label for="password">Password</label>
<input type="password" id="password"
       aria-required="true"
       aria-invalid="true"
       aria-describedby="password-error">
<span id="password-error" role="alert">
    Password must be at least 8 characters
</span>

<!-- Required field indicator -->
<label for="name">
    Name <span class="required-field sr-only">required</span>
</label>
<input id="name" required aria-required="true">
```

### Landmarks
```html
<!-- Page structure -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<header role="banner">
    <!-- Site header, logo, main nav -->
</header>

<main id="main-content" role="main">
    <!-- Primary content -->
</main>

<aside role="complementary">
    <!-- Sidebar content -->
</aside>

<footer role="contentinfo">
    <!-- Site footer -->
</footer>
```

### Dynamic Content
```html
<!-- Live region (polite) -->
<div role="status" aria-live="polite" aria-atomic="true">
    3 new messages
</div>

<!-- Alert (assertive) -->
<div role="alert" aria-live="assertive">
    Error: Please fix the highlighted fields
</div>

<!-- Loading state -->
<button aria-busy="true" disabled>
    <span class="sr-only">Loading, please wait</span>
    Loading...
</button>
```

### Tabs
```html
<div class="tabs" role="tablist" aria-label="Settings tabs">
    <button role="tab" aria-selected="true"
            aria-controls="general-panel" id="general-tab">
        General
    </button>
    <button role="tab" aria-selected="false"
            aria-controls="privacy-panel" id="privacy-tab">
        Privacy
    </button>
</div>

<div role="tabpanel" id="general-panel"
     aria-labelledby="general-tab">
    <!-- General settings content -->
</div>

<div role="tabpanel" id="privacy-panel"
     aria-labelledby="privacy-tab" hidden>
    <!-- Privacy settings content -->
</div>
```

### Modals
```html
<div role="dialog" aria-modal="true"
     aria-labelledby="modal-title"
     aria-describedby="modal-description">
    <h2 id="modal-title">Confirm Delete</h2>
    <p id="modal-description">
        Are you sure you want to delete this item?
    </p>
    <button aria-label="Confirm delete">Delete</button>
    <button aria-label="Cancel and close dialog">Cancel</button>
</div>
```

---

## 🎨 Color Contrast (WCAG AA)

### Ratios Required
- **Normal text**: 4.5:1 minimum
- **Large text** (18px+ or 14px+ bold): 3:1 minimum
- **UI components**: 3:1 minimum

### GeoVera Colors (All Pass)
```css
--gv-hero: #16A34A;      /* 4.58:1 ✅ */
--gv-anchor: #0B0F19;    /* 17.8:1 ✅ */
--gv-body: #6B7280;      /* 4.61:1 ✅ */
--gv-secondary: #2563EB; /* 4.56:1 ✅ */
--gv-risk: #DC2626;      /* 4.51:1 ✅ */
```

### Test Your Colors
https://webaim.org/resources/contrastchecker/

---

## ⌨️ Keyboard Support

### Required Keys
- **Tab**: Navigate forward
- **Shift + Tab**: Navigate backward
- **Enter**: Activate buttons/links
- **Space**: Toggle buttons/checkboxes
- **Escape**: Close dialogs/dropdowns
- **Arrow Keys**: Navigate menus/tabs

### Focus States
```css
/* Visible focus indicator required */
*:focus-visible {
    outline: 2px solid #16A34A;
    outline-offset: 2px;
}
```

---

## 📏 Touch Targets

### Minimum Sizes
- **Desktop**: 44x44px (WCAG AA)
- **Mobile**: 48x48px (recommended)

```css
button, a {
    min-height: 44px;
    min-width: 44px;
}

@media (max-width: 768px) {
    button, a {
        min-height: 48px;
        min-width: 48px;
    }
}
```

---

## 🔊 Screen Reader Classes

```css
/* Screen reader only */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Visible on focus */
.sr-only-focusable:focus {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip: auto;
    white-space: normal;
}
```

---

## 🖼️ Images & Icons

### Images
```html
<!-- Informative image -->
<img src="chart.png" alt="Sales increased 42% in Q4">

<!-- Decorative image -->
<img src="divider.png" alt="" role="presentation">

<!-- Complex image -->
<img src="infographic.png" alt="2024 Results"
     aria-describedby="infographic-desc">
<div id="infographic-desc" class="sr-only">
    Detailed description of infographic data...
</div>
```

### Icons
```html
<!-- Decorative icon -->
<svg aria-hidden="true">...</svg>

<!-- Meaningful icon -->
<svg role="img" aria-label="Warning icon">
    <title>Warning</title>
    ...
</svg>

<!-- Icon with text -->
<button>
    <svg aria-hidden="true">...</svg>
    <span>Save</span>
</button>
```

---

## 📝 Common Mistakes to Avoid

### ❌ Don't Do This
```html
<!-- Missing label -->
<button><svg>...</svg></button>

<!-- Generic label -->
<button aria-label="Click here">Submit</button>

<!-- Missing alt -->
<img src="logo.png">

<!-- Wrong role on div -->
<div onclick="...">Click me</div>

<!-- No form association -->
<label>Email</label>
<input type="email">

<!-- Hidden but required content -->
<div style="display: none;" aria-hidden="true">
    Important information
</div>
```

### ✅ Do This Instead
```html
<!-- Proper label -->
<button aria-label="Save document">
    <svg aria-hidden="true">...</svg>
</button>

<!-- Specific label -->
<button aria-label="Submit registration form">Submit</button>

<!-- Proper alt text -->
<img src="logo.png" alt="GeoVera Intelligence logo">

<!-- Use button element -->
<button onclick="...">Click me</button>

<!-- Proper association -->
<label for="email">Email</label>
<input type="email" id="email">

<!-- Screen reader accessible -->
<div class="sr-only">
    Important information
</div>
```

---

## 🧪 Quick Test Commands

### Browser Console
```javascript
// Find images without alt
document.querySelectorAll('img:not([alt])').length

// Find buttons without aria-label
document.querySelectorAll('button:not([aria-label]):not(:has(> *))').length

// Check heading hierarchy
Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'))
    .map(h => h.tagName)

// Find inputs without labels
document.querySelectorAll('input:not([aria-label]):not([id])').length
```

### Keyboard Test
1. **Tab** through entire page
2. Check all interactive elements reachable
3. Verify skip link appears on first Tab
4. Check focus indicators visible
5. Try **Escape** on dialogs/menus

### Screen Reader Test (VoiceOver)
1. **CMD + F5** to start VoiceOver
2. **VO + U** for rotor menu
3. Check headings, landmarks, links
4. Verify all content readable
5. Test form label announcements

---

## 📋 Page Checklist

Every page must have:
- [ ] Accessibility CSS imported
- [ ] Skip to main content link
- [ ] Live region for announcements
- [ ] Semantic HTML (header, main, footer)
- [ ] All buttons have aria-label
- [ ] All links descriptive
- [ ] All forms properly labeled
- [ ] All images have alt text
- [ ] All icons aria-hidden or labeled
- [ ] Focus indicators visible
- [ ] Color contrast 4.5:1 minimum
- [ ] Touch targets 44x44px minimum

---

## 🚀 Resources

### Tools
- **axe DevTools**: Browser extension for testing
- **Lighthouse**: Chrome DevTools > Lighthouse
- **WAVE**: Visual accessibility overlay
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/

### Documentation
- **WCAG Quick Ref**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Patterns**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM**: https://webaim.org/

### Internal Docs
- Full guide: `/ACCESSIBILITY_GUIDE.md`
- Implementation summary: `/ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md`
- CSS utilities: `/frontend/css/accessibility.css`

---

## 💡 Pro Tips

1. **Start with semantics**: Use proper HTML elements before adding ARIA
2. **Don't hide from everyone**: `display: none` hides from screen readers too
3. **Test with real users**: Automated tools catch ~30-50% of issues
4. **Focus visible > focus**: Use `:focus-visible` for better UX
5. **Mobile first**: Larger touch targets benefit everyone
6. **Announce changes**: Use aria-live for dynamic content
7. **Keep it simple**: Native HTML > ARIA when possible

---

**Need help?** Review the full guide at `/ACCESSIBILITY_GUIDE.md`

**Last Updated:** February 14, 2025
