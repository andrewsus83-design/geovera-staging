# GeoVera Icon Library

A comprehensive SVG icon library designed for GeoVera's WIRED-inspired brand identity. Features sharp corners, bold strokes, and a minimalist editorial aesthetic.

## Design Specifications

- **Style:** Sharp, editorial, authoritative (WIRED Newsletter inspired)
- **Corners:** NO rounded corners - all sharp angles
- **Primary Color:** Green `#16A34A`
- **Secondary Color:** Black `#0B0F19`
- **Stroke Weight:** 2px (bold, authoritative)
- **Grid:** 24x24px viewBox
- **Stroke Caps:** Square (sharp line endings)
- **Stroke Joins:** Miter (sharp corner joins)

## Icon Catalog

### Navigation & UI (10 icons)
- `menu` - Hamburger menu (3 horizontal lines)
- `close` - X close button
- `search` - Search magnifying glass
- `filter` - Funnel filter icon
- `sort` - Sorting arrows
- `settings` - Gear/cog settings
- `notifications` - Bell notification
- `help` - Question mark in circle
- `chevron-down` - Downward chevron
- `chevron-right` - Right chevron

### Features (15 icons)
- `dashboard` - 4-square grid dashboard
- `insights` - Lightbulb for insights
- `radar` - Target/crosshair radar
- `hub` - 4-square grid hub
- `content-studio` - Document with lines
- `ai-chat` - Chat bubble
- `analytics` - Activity waveform
- `creators` - Multiple users
- `collections` - Folder
- `viral-trends` - Trending up arrow
- `buzzsumo` - Star/sparkles
- `calendar` - Calendar grid
- `clock` - Clock face
- `globe` - Global/world
- `heart` - Heart for engagement

### Actions (10 icons)
- `plus` - Add/create plus sign
- `edit` - Pencil edit
- `delete` - Trash bin
- `download` - Download arrow
- `upload` - Upload arrow
- `share` - Share network nodes
- `copy` - Copy/duplicate
- `check` - Checkmark
- `alert` - Warning triangle
- `info` - Info circle

### Social Media Platforms (10 icons)
- `instagram` - Instagram square
- `tiktok` - TikTok logo
- `youtube` - YouTube play button
- `twitter` - Twitter/X bird
- `linkedin` - LinkedIn logo
- `facebook` - Facebook F
- `pinterest` - Pinterest P
- `snapchat` - Snapchat ghost
- `threads` - Threads logo
- `reddit` - Reddit alien

### Data & Analytics (8 icons)
- `bar-chart` - Vertical bar chart
- `line-chart` - Line graph
- `pie-chart` - Pie chart
- `growth-arrow` - Upward arrow
- `decline-arrow` - Downward arrow
- `target` - Bullseye target
- `trophy` - Achievement trophy
- `star` - Rating star

### Miscellaneous (20+ icons)
- `user` - User profile
- `email` - Email envelope
- `lock` - Security lock
- `unlock` - Unlocked
- `eye` - View/visible
- `eye-slash` - Hide/invisible
- `link` - Chain link
- `external-link` - External link arrow
- `refresh` - Refresh/reload
- `bookmark` - Bookmark
- `home` - Home house
- `arrow-left` - Left arrow
- `arrow-right` - Right arrow
- `play` - Play button
- `pause` - Pause button
- `image` - Image/photo
- `video` - Video camera
- `tag` - Tag/label
- `comment` - Comment bubble
- `lightning` - Lightning bolt (speed)
- `fire` - Fire/hot/trending

**Total: 73 icons**

---

## Usage

### Method 1: Sprite Sheet (Recommended)

Use the combined sprite sheet for optimal performance:

```html
<!-- Button with icon -->
<button class="btn btn-primary">
  <svg class="icon" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#dashboard"></use>
  </svg>
  <span>Dashboard</span>
</button>

<!-- Icon only -->
<svg class="icon icon-lg" aria-hidden="true">
  <use href="/geovera-assets/icons/icons-sprite.svg#radar"></use>
</svg>

<!-- Navigation item -->
<a href="/insights" class="nav-link">
  <svg class="icon" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#insights"></use>
  </svg>
  <span>Insights</span>
</a>
```

### Method 2: Individual SVG Files

Load individual icon files when needed:

```html
<img src="/geovera-assets/icons/dashboard.svg" alt="Dashboard" class="icon">
```

---

## CSS Styling

### Base Icon Styles

```css
/* Base icon styling */
.icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: square;
  stroke-linejoin: miter;
  display: inline-block;
  vertical-align: middle;
}

/* Size variants */
.icon-sm {
  width: 16px;
  height: 16px;
}

.icon-lg {
  width: 24px;
  height: 24px;
}

.icon-xl {
  width: 32px;
  height: 32px;
}

.icon-2xl {
  width: 48px;
  height: 48px;
}
```

### Color Variants

```css
/* Green primary color */
.icon-green {
  stroke: #16A34A;
}

/* Black secondary color */
.icon-black {
  stroke: #0B0F19;
}

/* White for dark backgrounds */
.icon-white {
  stroke: #FFFFFF;
}

/* Inherit from parent text color (default) */
.icon-inherit {
  stroke: currentColor;
}
```

### Interactive States

```css
/* Hover effect */
.icon-hover {
  transition: stroke 0.2s ease, transform 0.2s ease;
}

.icon-hover:hover {
  stroke: #16A34A;
  transform: scale(1.1);
}

/* Button icon spacing */
.btn .icon {
  margin-right: 8px;
}

.btn-icon-only .icon {
  margin-right: 0;
}

/* Disabled state */
.icon-disabled {
  stroke: #94A3B8;
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Examples

### Dashboard Navigation

```html
<nav class="sidebar">
  <a href="/dashboard" class="nav-link active">
    <svg class="icon" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#dashboard"></use>
    </svg>
    <span>Dashboard</span>
  </a>

  <a href="/insights" class="nav-link">
    <svg class="icon" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#insights"></use>
    </svg>
    <span>Insights</span>
  </a>

  <a href="/radar" class="nav-link">
    <svg class="icon" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#radar"></use>
    </svg>
    <span>Radar</span>
  </a>

  <a href="/hub" class="nav-link">
    <svg class="icon" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#hub"></use>
    </svg>
    <span>Authority Hub</span>
  </a>
</nav>
```

### Action Buttons

```html
<!-- Primary action -->
<button class="btn btn-primary">
  <svg class="icon" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#plus"></use>
  </svg>
  <span>Add Collection</span>
</button>

<!-- Secondary action -->
<button class="btn btn-secondary">
  <svg class="icon" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#edit"></use>
  </svg>
  <span>Edit</span>
</button>

<!-- Danger action -->
<button class="btn btn-danger">
  <svg class="icon" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#delete"></use>
  </svg>
  <span>Delete</span>
</button>

<!-- Icon-only button -->
<button class="btn btn-icon" aria-label="Share">
  <svg class="icon icon-lg" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#share"></use>
  </svg>
</button>
```

### Social Media Icons

```html
<div class="social-icons">
  <a href="#" class="social-link" aria-label="Instagram">
    <svg class="icon icon-lg" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#instagram"></use>
    </svg>
  </a>

  <a href="#" class="social-link" aria-label="TikTok">
    <svg class="icon icon-lg" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#tiktok"></use>
    </svg>
  </a>

  <a href="#" class="social-link" aria-label="YouTube">
    <svg class="icon icon-lg" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#youtube"></use>
    </svg>
  </a>

  <a href="#" class="social-link" aria-label="Twitter">
    <svg class="icon icon-lg" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#twitter"></use>
    </svg>
  </a>
</div>
```

### Analytics Cards

```html
<div class="stats-card">
  <div class="stats-icon">
    <svg class="icon icon-xl icon-green" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#viral-trends"></use>
    </svg>
  </div>
  <div class="stats-content">
    <h3>Viral Trends</h3>
    <p class="stats-value">+127%</p>
  </div>
</div>

<div class="stats-card">
  <div class="stats-icon">
    <svg class="icon icon-xl icon-green" aria-hidden="true">
      <use href="/geovera-assets/icons/icons-sprite.svg#heart"></use>
    </svg>
  </div>
  <div class="stats-content">
    <h3>Engagement</h3>
    <p class="stats-value">12.4K</p>
  </div>
</div>
```

### Alerts & Messages

```html
<!-- Success message -->
<div class="alert alert-success">
  <svg class="icon icon-green" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#check"></use>
  </svg>
  <span>Content saved successfully!</span>
</div>

<!-- Warning message -->
<div class="alert alert-warning">
  <svg class="icon icon-yellow" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#alert"></use>
  </svg>
  <span>Your session will expire soon.</span>
</div>

<!-- Info message -->
<div class="alert alert-info">
  <svg class="icon icon-blue" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#info"></use>
  </svg>
  <span>New features available in Radar!</span>
</div>
```

---

## Accessibility

### Best Practices

1. **Always use `aria-hidden="true"`** on decorative icons
2. **Provide text labels** for icon-only buttons using `aria-label`
3. **Use semantic HTML** alongside icons
4. **Ensure sufficient color contrast** (4.5:1 minimum)

```html
<!-- Good: Icon with visible text -->
<button>
  <svg class="icon" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#download"></use>
  </svg>
  <span>Download Report</span>
</button>

<!-- Good: Icon-only button with aria-label -->
<button aria-label="Close dialog">
  <svg class="icon" aria-hidden="true">
    <use href="/geovera-assets/icons/icons-sprite.svg#close"></use>
  </svg>
</button>

<!-- Bad: Icon without label or aria-label -->
<button>
  <svg class="icon">
    <use href="/geovera-assets/icons/icons-sprite.svg#settings"></use>
  </svg>
</button>
```

---

## React Component Example

```jsx
// Icon.jsx
import React from 'react';

const Icon = ({
  name,
  size = 'base',
  color = 'inherit',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'icon-sm',
    base: 'icon',
    lg: 'icon-lg',
    xl: 'icon-xl',
    '2xl': 'icon-2xl'
  };

  const colorClasses = {
    inherit: 'icon-inherit',
    green: 'icon-green',
    black: 'icon-black',
    white: 'icon-white'
  };

  const classes = `${sizeClasses[size]} ${colorClasses[color]} ${className}`.trim();

  return (
    <svg className={classes} aria-hidden="true" {...props}>
      <use href={`/geovera-assets/icons/icons-sprite.svg#${name}`} />
    </svg>
  );
};

export default Icon;
```

### Usage in React

```jsx
import Icon from './components/Icon';

function Dashboard() {
  return (
    <div>
      <h1>
        <Icon name="dashboard" size="lg" color="green" />
        Dashboard
      </h1>

      <button className="btn btn-primary">
        <Icon name="plus" />
        Add Collection
      </button>
    </div>
  );
}
```

---

## Vue Component Example

```vue
<!-- Icon.vue -->
<template>
  <svg :class="classes" aria-hidden="true" v-bind="$attrs">
    <use :href="`/geovera-assets/icons/icons-sprite.svg#${name}`" />
  </svg>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: 'base',
      validator: (value) => ['sm', 'base', 'lg', 'xl', '2xl'].includes(value)
    },
    color: {
      type: String,
      default: 'inherit',
      validator: (value) => ['inherit', 'green', 'black', 'white'].includes(value)
    }
  },
  computed: {
    classes() {
      const sizeClass = this.size === 'base' ? 'icon' : `icon-${this.size}`;
      const colorClass = `icon-${this.color}`;
      return `${sizeClass} ${colorClass}`;
    }
  }
};
</script>
```

### Usage in Vue

```vue
<template>
  <div>
    <h1>
      <Icon name="dashboard" size="lg" color="green" />
      Dashboard
    </h1>

    <button class="btn btn-primary">
      <Icon name="plus" />
      Add Collection
    </button>
  </div>
</template>

<script>
import Icon from './components/Icon.vue';

export default {
  components: { Icon }
};
</script>
```

---

## Performance Tips

1. **Use sprite sheet** - Load once, use everywhere
2. **Lazy load** - Load sprite sheet on page load, not inline
3. **Cache properly** - Set long cache headers for sprite sheet
4. **Minimize HTTP requests** - Sprite sheet eliminates individual file requests
5. **Preload critical icons** - Add `<link rel="preload">` for sprite sheet

```html
<!-- Preload sprite sheet -->
<link rel="preload" href="/geovera-assets/icons/icons-sprite.svg" as="image" type="image/svg+xml">
```

---

## Browser Support

- Chrome 89+
- Firefox 88+
- Safari 14+
- Edge 89+

All modern browsers support SVG sprite sheets with `<use>` elements.

---

## Customization

### Changing Colors Dynamically

Icons inherit the `currentColor` property, making them easy to customize:

```css
/* Green button with green icon */
.btn-green {
  color: #16A34A;
}

/* Icon inherits green color */
.btn-green .icon {
  stroke: currentColor;
}
```

### Changing Stroke Weight

```css
/* Lighter weight for subtle icons */
.icon-light {
  stroke-width: 1.5;
}

/* Bolder weight for emphasis */
.icon-bold {
  stroke-width: 2.5;
}
```

### Animation

```css
/* Rotate animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.icon-spin {
  animation: spin 1s linear infinite;
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.icon-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## License

These icons are proprietary to GeoVera and are part of the brand identity system. For internal use only.

---

## Credits

**Design System:** WIRED Newsletter inspired
**Created for:** GeoVera
**Total Icons:** 73
**Version:** 1.0.0
**Last Updated:** 2024
