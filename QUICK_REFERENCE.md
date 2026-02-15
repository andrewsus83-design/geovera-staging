# 🚀 GeoVera Quick Reference Guide

**Last Updated:** February 15, 2026

---

## 📍 Production URLs

```
Base URL: https://geovera.xyz

Authentication:
├── Login: /login-auth.html

Main Pages:
├── Dashboard: /dashboard.html
├── AI Chat: /chat.html
├── Insights: /insights.html
├── Radar: /radar.html (Partner tier only)
├── SEO: /seo.html
├── GEO: /geo.html
├── Social Search: /social-search.html
├── To Do: /todo.html
├── Content Studio: /content-studio.html
└── Hub: /hub.html
```

---

## 🎨 Design Tokens

### Colors
```css
/* Primary */
--green-primary: #16A34A
--green-hover: #15803D
--green-light: #F0FDF4

/* Neutrals */
--white: #FFFFFF
--gray-50: #F9FAFB
--gray-200: #E5E7EB
--gray-700: #374151
--gray-900: #111827
```

### Spacing
```css
/* Standard Padding */
padding: 1.5rem; /* 24px */

/* Card Gaps */
gap: 1rem; /* 16px */

/* Section Margins */
margin-bottom: 2rem; /* 32px */
```

### Border Radius
```css
/* Buttons */
border-radius: 8px;

/* Cards */
border-radius: 12px;

/* Modals */
border-radius: 16px;
```

### Typography
```css
/* Headlines */
font-family: Georgia, serif;
font-size: 28px-32px;
font-weight: 700;

/* Body */
font-family: Inter, sans-serif;
font-size: 14px-15px;
font-weight: 400;
```

---

## 📁 File Locations

```
frontend/
├── css/
│   ├── tailadmin-base.css         # Core design system
│   ├── geovera-sidebar.css        # Sidebar navigation
│   └── tailadmin-components.css   # UI components
│
├── Pages:
│   ├── login-auth.html
│   ├── dashboard.html
│   ├── chat.html
│   ├── insights.html
│   ├── radar.html
│   ├── seo.html
│   ├── geo.html
│   ├── social-search.html
│   ├── todo.html
│   ├── content-studio.html
│   └── hub.html
│
└── Assets:
    ├── env.js                     # Environment config
    └── env-loader.js              # Config loader
```

---

## 🔧 Common CSS Classes

### Layout
```css
.geovera-sidebar          /* Left navigation */
.main-content             /* Main content area */
.content-wrapper          /* Content padding wrapper */
.page-content             /* Page content wrapper */
```

### Navigation
```css
.nav-item                 /* Navigation link */
.nav-item.active          /* Active navigation */
.nav-icon                 /* Navigation icon */
```

### Buttons
```css
.btn-primary              /* Primary green button */
.btn-secondary            /* Secondary button */
.btn-sm                   /* Small button */
.btn-lg                   /* Large button */
```

### Cards
```css
.card-tailadmin           /* Standard card */
.card-title-tailadmin     /* Card title */
.card-body-tailadmin      /* Card body */
```

### Forms
```css
.form-group               /* Form group wrapper */
.form-label               /* Form label */
.form-input               /* Text input */
.form-select              /* Select dropdown */
.form-textarea            /* Textarea */
```

---

## 🎯 Page Layouts

### Two-Column (60/40)
```html
<div class="two-column-layout">
  <div class="main-column">      <!-- 60% -->
    <!-- Main content -->
  </div>
  <div class="sidebar-column">   <!-- 40% -->
    <!-- Sidebar content -->
  </div>
</div>
```

### Three-Column Kanban
```html
<div class="kanban-layout">
  <div class="kanban-column">    <!-- 31% Low -->
  <div class="kanban-column">    <!-- 36% High -->
  <div class="kanban-column">    <!-- 33% Medium -->
</div>
```

### Tab System
```html
<div class="tab-navigation">
  <button class="tab-button active">Tab 1</button>
  <button class="tab-button">Tab 2</button>
</div>
<div class="tab-content active">Content 1</div>
<div class="tab-content">Content 2</div>
```

---

## 🔐 Authentication

### Supabase Setup
```javascript
const ENV_CONFIG = window.getEnvConfig();
const SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = ENV_CONFIG.SUPABASE_ANON_KEY;
const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Check Auth
```javascript
const { data: { user } } = await sbClient.auth.getUser();
if (!user) {
  window.location.href = 'login-auth.html';
}
```

### Logout
```javascript
await sbClient.auth.signOut();
localStorage.removeItem('access_token');
window.location.href = 'login-auth.html';
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
@media (max-width: 768px) {
  .geovera-sidebar {
    transform: translateX(-100%);
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  /* Tablet styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop styles */
}
```

---

## 🚀 Deployment Commands

### Git Workflow
```bash
# Stage changes
git add .

# Commit
git commit -m "feat: Your message

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to production
git push origin main
```

### Vercel Auto-Deploy
Changes pushed to `main` branch auto-deploy to:
- **Production:** https://geovera.xyz

---

## 🔍 Debugging

### Common Issues

**1. 404 Not Found**
- ❌ Wrong: `https://geovera.xyz/frontend/page.html`
- ✅ Correct: `https://geovera.xyz/page.html`

**2. Content Cut Off**
- Check `.content-wrapper` has `padding: 1.5rem`
- Verify no inline styles overriding CSS

**3. Sidebar Not Showing**
- Check `class="geovera-sidebar"` exists
- Verify CSS files loaded in correct order

**4. Auth Redirect Loop**
- Clear localStorage
- Check Supabase credentials in env.js

---

## 📊 Subscription Tiers

| Feature | Basic | Premium | Partner |
|---------|-------|---------|---------|
| AI Chat Messages/Day | 5 | 10 | 20 |
| Radar Access | ❌ | ❌ | ✅ |
| SEO Tools | ✅ | ✅ | ✅ |
| GEO Tools | ✅ | ✅ | ✅ |
| Social Search | ✅ | ✅ | ✅ |

---

## 🛠️ Development Tips

### Adding New Page

1. **Copy template structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="css/tailadmin-base.css">
  <link rel="stylesheet" href="css/geovera-sidebar.css">
  <link rel="stylesheet" href="css/tailadmin-components.css">
</head>
<body>
  <!-- Include sidebar -->
  <div class="geovera-sidebar">...</div>

  <!-- Main content -->
  <div class="main-content">
    <div class="content-wrapper">
      <!-- Your content -->
    </div>
  </div>
</body>
</html>
```

2. **Add to sidebar navigation** in all pages
3. **Test responsive design**
4. **Deploy to production**

### CSS Best Practices

- ✅ Use existing classes from tailadmin-components.css
- ✅ Follow 1.5rem padding standard
- ✅ Use GeoVera green (#16A34A) for primary actions
- ✅ Keep border-radius between 8-16px
- ❌ Don't add inline styles
- ❌ Don't create duplicate classes

---

## 📞 Support

**Issues:** GitHub Issues
**Deployment:** Vercel Dashboard
**Database:** Supabase Dashboard

---

## 📚 Documentation

- `FRONTEND_MODERNIZATION_COMPLETE.md` - Complete guide
- `DEPLOYMENT_COMPLETE.md` - Deployment details
- `UI_FIXES_FEB15.md` - Recent UI fixes
- `QUICK_REFERENCE.md` - This file

---

*Quick reference for GeoVera development team*
*Version 1.0.0 | Feb 15, 2026*
