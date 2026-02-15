# Two-Column Layout Specification
**Date:** February 15, 2026
**Inspired By:** Claude.ai interface
**Pages:** AI Chat, SEO, GEO, Social Search

---

## 🎨 LAYOUT STRUCTURE

```
┌────────────┬─────────────────────┬──────────────────────┐
│  Sidebar   │   Left Column      │   Right Column       │
│  (260px)   │   (Main Chat)      │   (Insights)         │
│            │                     │                      │
│ GeoVera    │  AI Chat            │  💡 Suggestions      │
│            │  ───────────        │  ────────────────    │
│ Dashboard  │                     │  • Try asking...     │
│ ○ AI Chat  │  [Message 1]       │  • Related topics    │
│ SEO        │                     │                      │
│ GEO        │  [Message 2]       │  📊 Rankings         │
│ Social     │                     │  ────────────────    │
│            │  [Message 3]       │  #1 Keyword          │
│ Content    │                     │  #5 Domain           │
│ Studio     │                     │                      │
│ Hub        │                     │  📈 Progress         │
│            │                     │  ────────────────    │
│            │  [Input Box]       │  Tasks: 3/10         │
│            │  [Send]            │  Score: 85/100       │
│            │                     │                      │
│ [User]     │                     │  🎯 Opportunities    │
│            │                     │  ────────────────    │
│            │                     │  • Optimize X        │
│            │                     │  • Improve Y         │
└────────────┴─────────────────────┴──────────────────────┘
    260px          60% flexible          40% flexible
```

---

## 📐 LAYOUT SPECIFICATIONS

### Overall Structure
```css
.geovera-layout {
  display: flex;
  /* Sidebar (260px) + Two columns (flex) */
}

.geovera-main {
  margin-left: 260px;
  width: calc(100% - 260px);
  display: flex; /* Two columns side by side */
  gap: 0; /* No gap, clean split */
}

/* Left Column (Main Content) */
.main-column {
  flex: 1 1 60%;
  min-width: 500px;
  background: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Right Column (Insights Panel) */
.insights-column {
  flex: 1 1 40%;
  min-width: 320px;
  max-width: 480px;
  background: #F9FAFB;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  padding: 24px;
}
```

---

## 📱 PAGE-SPECIFIC IMPLEMENTATIONS

### 1. AI CHAT PAGE

#### Left Column (Chat Room)
```html
<div class="main-column">
  <!-- Header -->
  <div class="chat-header">
    <h1 class="page-title">AI Chat</h1>
    <button class="new-chat-btn">+ New Chat</button>
  </div>

  <!-- Messages Area -->
  <div class="messages-area" id="messagesArea">

    <!-- User Message -->
    <div class="message message-user">
      <div class="message-content">
        How can I improve my Instagram engagement?
      </div>
      <div class="message-meta">
        <span class="message-time">2:45 PM</span>
      </div>
    </div>

    <!-- AI Message -->
    <div class="message message-ai">
      <div class="message-avatar">
        <img src="geovera-ai-avatar.svg">
      </div>
      <div class="message-content">
        Based on your brand data, here are 5 strategies...
      </div>
      <div class="message-meta">
        <span class="message-time">2:45 PM</span>
        <button class="copy-btn">Copy</button>
      </div>
    </div>

  </div>

  <!-- Input Area (Fixed at bottom) -->
  <div class="chat-input-container">
    <textarea
      class="chat-input"
      placeholder="Ask me anything..."
      rows="1"
    ></textarea>
    <div class="input-actions">
      <button class="attach-btn">📎</button>
      <button class="send-btn btn-primary-tailadmin">Send</button>
    </div>

    <!-- Usage indicator -->
    <div class="usage-indicator">
      <span>5/10 questions today</span>
    </div>
  </div>
</div>
```

#### Right Column (Suggestions & Insights)
```html
<div class="insights-column">

  <!-- Suggestions Section -->
  <div class="insight-section">
    <h3 class="insight-title">💡 Suggestions</h3>

    <div class="suggestion-card">
      <p>Try asking about:</p>
      <button class="suggestion-item">
        "What content works best for my audience?"
      </button>
      <button class="suggestion-item">
        "How do I find creators in my niche?"
      </button>
      <button class="suggestion-item">
        "What are trending topics in my industry?"
      </button>
    </div>
  </div>

  <!-- Progress Section -->
  <div class="insight-section">
    <h3 class="insight-title">📈 Your Progress</h3>

    <div class="progress-card">
      <div class="progress-item">
        <span class="progress-label">Questions Used</span>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: 50%;"></div>
        </div>
        <span class="progress-value">5/10 today</span>
      </div>

      <div class="progress-item">
        <span class="progress-label">Monthly Quota</span>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: 20%;"></div>
        </div>
        <span class="progress-value">60/300 this month</span>
      </div>
    </div>
  </div>

  <!-- Recent Topics -->
  <div class="insight-section">
    <h3 class="insight-title">🕒 Recent Topics</h3>

    <div class="recent-topics">
      <button class="topic-item">
        <span class="topic-icon">💬</span>
        <span class="topic-text">Instagram Strategy</span>
        <span class="topic-time">2h ago</span>
      </button>
      <button class="topic-item">
        <span class="topic-icon">🎯</span>
        <span class="topic-text">Creator Discovery</span>
        <span class="topic-time">1d ago</span>
      </button>
    </div>
  </div>

  <!-- Opportunities -->
  <div class="insight-section">
    <h3 class="insight-title">🎯 Opportunities</h3>

    <div class="opportunity-card">
      <div class="opportunity-item">
        <span class="opportunity-icon">📈</span>
        <div class="opportunity-content">
          <strong>Boost Visibility</strong>
          <p>3 trending hashtags to use today</p>
        </div>
      </div>
      <div class="opportunity-item">
        <span class="opportunity-icon">🔍</span>
        <div class="opportunity-content">
          <strong>Improve Discovery</strong>
          <p>Update your SEO keywords</p>
        </div>
      </div>
    </div>
  </div>

</div>
```

---

### 2. SEO PAGE

#### Left Column (SEO Tool)
```html
<div class="main-column">
  <!-- Header -->
  <div class="seo-header">
    <h1 class="page-title">SEO Analysis</h1>
    <button class="analyze-btn btn-primary-tailadmin">
      Analyze URL
    </button>
  </div>

  <!-- Input Area -->
  <div class="seo-input-section">
    <input
      type="url"
      class="input-tailadmin input-lg"
      placeholder="Enter your website URL..."
    >
    <button class="btn-primary-tailadmin">Analyze</button>
  </div>

  <!-- Results Area -->
  <div class="seo-results">

    <!-- Overall Score -->
    <div class="seo-score-card">
      <div class="score-circle">
        <span class="score-value">85</span>
        <span class="score-max">/100</span>
      </div>
      <div class="score-details">
        <h3>Good SEO Score</h3>
        <p>Your site is well-optimized with room for improvement</p>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card">
        <h4>Domain Authority</h4>
        <span class="metric-value">72</span>
        <span class="metric-change positive">+5</span>
      </div>
      <!-- More metrics... -->
    </div>

    <!-- Issues & Recommendations -->
    <div class="seo-issues">
      <h3>Issues Found</h3>
      <div class="issue-item warning">
        <span class="issue-icon">⚠️</span>
        <div class="issue-content">
          <strong>Missing Meta Descriptions</strong>
          <p>12 pages need meta descriptions</p>
        </div>
        <button class="fix-btn">Fix</button>
      </div>
    </div>

  </div>
</div>
```

#### Right Column (Rankings & Opportunities)
```html
<div class="insights-column">

  <!-- Rankings Section -->
  <div class="insight-section">
    <h3 class="insight-title">📊 Keyword Rankings</h3>

    <div class="ranking-list">
      <div class="ranking-item">
        <span class="ranking-position rank-1">#1</span>
        <div class="ranking-details">
          <strong>luxury wedding decor</strong>
          <span class="ranking-change positive">↑ 2</span>
        </div>
      </div>

      <div class="ranking-item">
        <span class="ranking-position rank-5">#5</span>
        <div class="ranking-details">
          <strong>wedding planning tips</strong>
          <span class="ranking-change neutral">→ 0</span>
        </div>
      </div>

      <div class="ranking-item">
        <span class="ranking-position rank-12">#12</span>
        <div class="ranking-details">
          <strong>bridal fashion trends</strong>
          <span class="ranking-change negative">↓ 3</span>
        </div>
      </div>
    </div>

    <button class="view-all-btn">View All Rankings</button>
  </div>

  <!-- Progress Section -->
  <div class="insight-section">
    <h3 class="insight-title">📈 SEO Progress</h3>

    <div class="progress-stats">
      <div class="stat-item">
        <span class="stat-label">Pages Indexed</span>
        <span class="stat-value">127/150</span>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: 85%;"></div>
        </div>
      </div>

      <div class="stat-item">
        <span class="stat-label">Issues Fixed</span>
        <span class="stat-value">18/25</span>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: 72%;"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Opportunities -->
  <div class="insight-section">
    <h3 class="insight-title">🎯 Quick Wins</h3>

    <div class="opportunity-list">
      <div class="opportunity-card">
        <span class="opportunity-priority high">High Impact</span>
        <h4>Add Alt Text to Images</h4>
        <p>45 images missing alt text</p>
        <button class="btn-outline-tailadmin btn-sm-tailadmin">
          Fix Now
        </button>
      </div>

      <div class="opportunity-card">
        <span class="opportunity-priority medium">Medium Impact</span>
        <h4>Improve Page Speed</h4>
        <p>8 pages load slowly</p>
        <button class="btn-outline-tailadmin btn-sm-tailadmin">
          Optimize
        </button>
      </div>
    </div>
  </div>

  <!-- Competitor Insights -->
  <div class="insight-section">
    <h3 class="insight-title">🔍 Competitor Watch</h3>

    <div class="competitor-list">
      <div class="competitor-item">
        <strong>competitor1.com</strong>
        <span class="competitor-change">Gained 3 rankings</span>
      </div>
      <div class="competitor-item">
        <strong>competitor2.com</strong>
        <span class="competitor-change">Lost 5 rankings</span>
      </div>
    </div>
  </div>

</div>
```

---

### 3. GEO PAGE

#### Left Column (Map & Data)
```html
<div class="main-column">
  <!-- Header -->
  <div class="geo-header">
    <h1 class="page-title">Geographic Analytics</h1>
    <div class="geo-filters">
      <select class="select-tailadmin">
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 90 days</option>
      </select>
    </div>
  </div>

  <!-- Map Container -->
  <div class="geo-map-container">
    <div id="geoMap" class="geo-map">
      <!-- Interactive map goes here -->
    </div>
  </div>

  <!-- Regional Data Table -->
  <div class="geo-data-table">
    <h3>Performance by Region</h3>

    <table class="data-table">
      <thead>
        <tr>
          <th>Country</th>
          <th>Impressions</th>
          <th>Engagement</th>
          <th>Growth</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>🇮🇩 Indonesia</td>
          <td>125,432</td>
          <td>4.2%</td>
          <td class="positive">+12%</td>
        </tr>
        <tr>
          <td>🇸🇬 Singapore</td>
          <td>45,123</td>
          <td>5.8%</td>
          <td class="positive">+8%</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

#### Right Column (Rankings & Opportunities)
```html
<div class="insights-column">

  <!-- Top Locations -->
  <div class="insight-section">
    <h3 class="insight-title">📊 Top Performing Locations</h3>

    <div class="location-ranking">
      <div class="location-item">
        <span class="location-rank">#1</span>
        <div class="location-details">
          <strong>Jakarta, Indonesia</strong>
          <span class="location-metric">25K engagements</span>
        </div>
        <span class="location-change positive">↑ 15%</span>
      </div>

      <div class="location-item">
        <span class="location-rank">#2</span>
        <div class="location-details">
          <strong>Singapore</strong>
          <span class="location-metric">18K engagements</span>
        </div>
        <span class="location-change positive">↑ 8%</span>
      </div>
    </div>
  </div>

  <!-- Progress -->
  <div class="insight-section">
    <h3 class="insight-title">📈 Market Penetration</h3>

    <div class="penetration-stats">
      <div class="penetration-item">
        <span class="country-flag">🇮🇩</span>
        <div class="penetration-info">
          <strong>Indonesia</strong>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: 65%;"></div>
          </div>
          <span>65% market coverage</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Opportunities -->
  <div class="insight-section">
    <h3 class="insight-title">🎯 Growth Opportunities</h3>

    <div class="geo-opportunities">
      <div class="geo-opportunity-card">
        <span class="geo-opportunity-icon">🌏</span>
        <div class="geo-opportunity-content">
          <strong>Expand to Malaysia</strong>
          <p>High interest, low competition</p>
          <span class="opportunity-metric">Est. +5K reach</span>
        </div>
      </div>

      <div class="geo-opportunity-card">
        <span class="geo-opportunity-icon">📍</span>
        <div class="geo-opportunity-content">
          <strong>Focus on Surabaya</strong>
          <p>Growing engagement</p>
          <span class="opportunity-metric">+22% last month</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Regional Trends -->
  <div class="insight-section">
    <h3 class="insight-title">🔥 Regional Trends</h3>

    <div class="trend-list">
      <div class="trend-item">
        <strong>🇮🇩 Indonesia</strong>
        <p>"Sustainable fashion" trending</p>
        <span class="trend-volume">+45% searches</span>
      </div>

      <div class="trend-item">
        <strong>🇸🇬 Singapore</strong>
        <p>"Luxury brands" interest spike</p>
        <span class="trend-volume">+32% searches</span>
      </div>
    </div>
  </div>

</div>
```

---

### 4. SOCIAL SEARCH PAGE

#### Left Column (Search Interface)
```html
<div class="main-column">
  <!-- Header -->
  <div class="search-header">
    <h1 class="page-title">Social Search</h1>
  </div>

  <!-- Search Input -->
  <div class="search-input-section">
    <div class="search-input-container">
      <input
        type="text"
        class="input-tailadmin input-lg"
        placeholder="Search across all platforms..."
      >
      <button class="search-btn btn-primary-tailadmin">
        🔍 Search
      </button>
    </div>

    <!-- Platform filters -->
    <div class="platform-filters">
      <button class="filter-chip active">All</button>
      <button class="filter-chip">Instagram</button>
      <button class="filter-chip">TikTok</button>
      <button class="filter-chip">YouTube</button>
      <button class="filter-chip">Pinterest</button>
    </div>
  </div>

  <!-- Search Results -->
  <div class="search-results">

    <!-- Result item -->
    <div class="search-result-card">
      <div class="result-header">
        <img src="profile.jpg" class="result-avatar">
        <div class="result-meta">
          <strong>@creator_name</strong>
          <span class="result-platform badge-instagram">Instagram</span>
        </div>
        <span class="result-time">2h ago</span>
      </div>

      <div class="result-content">
        <p>Beautiful wedding decor inspiration for summer...</p>
      </div>

      <div class="result-image">
        <img src="post-image.jpg">
      </div>

      <div class="result-stats">
        <span>❤️ 1.2K</span>
        <span>💬 45</span>
        <span>🔄 89</span>
      </div>

      <div class="result-actions">
        <button class="btn-outline-tailadmin btn-sm-tailadmin">
          View Original
        </button>
        <button class="btn-outline-tailadmin btn-sm-tailadmin">
          Add to Collection
        </button>
      </div>
    </div>

    <!-- More results... -->

  </div>
</div>
```

#### Right Column (Rankings & Insights)
```html
<div class="insights-column">

  <!-- Trending Searches -->
  <div class="insight-section">
    <h3 class="insight-title">🔥 Trending Now</h3>

    <div class="trending-list">
      <div class="trending-item">
        <span class="trending-rank">1</span>
        <div class="trending-details">
          <strong>#SummerWedding</strong>
          <span class="trending-volume">25K posts</span>
        </div>
        <span class="trending-change">↑ 145%</span>
      </div>

      <div class="trending-item">
        <span class="trending-rank">2</span>
        <div class="trending-details">
          <strong>#LuxuryDecor</strong>
          <span class="trending-volume">18K posts</span>
        </div>
        <span class="trending-change">↑ 89%</span>
      </div>
    </div>
  </div>

  <!-- Progress -->
  <div class="insight-section">
    <h3 class="insight-title">📈 Search Analytics</h3>

    <div class="search-stats">
      <div class="stat-item">
        <span class="stat-label">Searches Today</span>
        <span class="stat-value">24/50</span>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: 48%;"></div>
        </div>
      </div>

      <div class="stat-item">
        <span class="stat-label">Results Saved</span>
        <span class="stat-value">156</span>
      </div>
    </div>
  </div>

  <!-- Saved Collections -->
  <div class="insight-section">
    <h3 class="insight-title">💾 Saved Collections</h3>

    <div class="saved-collections">
      <button class="collection-item">
        <span class="collection-icon">📁</span>
        <div class="collection-details">
          <strong>Summer Inspiration</strong>
          <span>32 items</span>
        </div>
      </button>

      <button class="collection-item">
        <span class="collection-icon">📁</span>
        <div class="collection-details">
          <strong>Competitor Content</strong>
          <span>18 items</span>
        </div>
      </button>
    </div>

    <button class="btn-outline-tailadmin btn-sm-tailadmin w-full">
      View All Collections
    </button>
  </div>

  <!-- Opportunities -->
  <div class="insight-section">
    <h3 class="insight-title">🎯 Content Opportunities</h3>

    <div class="content-opportunities">
      <div class="content-opportunity-card">
        <strong>Underserved Niche</strong>
        <p>"Eco-friendly wedding" has low competition</p>
        <button class="btn-outline-tailadmin btn-sm-tailadmin">
          Explore
        </button>
      </div>

      <div class="content-opportunity-card">
        <strong>Rising Topic</strong>
        <p>"Minimalist decor" gaining traction</p>
        <button class="btn-outline-tailadmin btn-sm-tailadmin">
          Explore
        </button>
      </div>
    </div>
  </div>

</div>
```

---

## 🎨 CSS FOR TWO-COLUMN LAYOUT

```css
/* Two-column layout for specific pages */
.geovera-main.two-column {
  display: flex;
  gap: 0;
  padding: 0;
}

/* Main column (left) */
.main-column {
  flex: 1 1 60%;
  min-width: 500px;
  background: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 0px);
  overflow: hidden;
}

/* Messages/content area */
.messages-area,
.seo-results,
.geo-map-container,
.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Input area (fixed at bottom) */
.chat-input-container,
.seo-input-section,
.search-input-section {
  border-top: 1px solid #E5E7EB;
  padding: 16px 24px;
  background: #FFFFFF;
}

/* Insights column (right) */
.insights-column {
  flex: 1 1 40%;
  min-width: 320px;
  max-width: 480px;
  background: #F9FAFB;
  overflow-y: auto;
  padding: 24px;
}

.insights-column::-webkit-scrollbar {
  width: 6px;
}

.insights-column::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 3px;
}

/* Insight sections */
.insight-section {
  margin-bottom: 32px;
}

.insight-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Responsive */
@media (max-width: 1024px) {
  .geovera-main.two-column {
    flex-direction: column;
  }

  .insights-column {
    max-width: 100%;
    border-top: 1px solid #E5E7EB;
    border-right: none;
  }
}
```

---

## 📋 SUMMARY

### Pages with Two-Column Layout:
1. **AI Chat** - Chat room + Suggestions/Progress
2. **SEO** - Analysis tool + Rankings/Opportunities
3. **GEO** - Map/Data + Regional insights
4. **Social Search** - Search results + Trending/Collections

### Common Right Column Sections:
- 💡 Suggestions
- 📊 Rankings
- 📈 Progress/Stats
- 🎯 Opportunities
- 🔥 Trending
- 💾 Saved items

---

**Status:** Ready for implementation
**Priority:** Implement after basic sidebar migration

*Claude-Inspired Two-Column Layout for GeoVera*
