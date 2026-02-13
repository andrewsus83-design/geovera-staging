// GeoVera Dashboard HTML Body
export const body = `
<div class="dashboard-header">
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="logo">
        ✨ GeoVera Dashboard
      </div>
      <nav class="nav">
        <a href="#overview" class="nav-link active">Overview</a>
        <a href="#analytics" class="nav-link">Analytics</a>
        <a href="#content" class="nav-link">Content</a>
        <a href="#creators" class="nav-link">Creators</a>
      </nav>
    </div>
  </div>
</div>

<div class="container" style="margin-top: 2rem;">
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Content</div>
      <div class="stat-value">1,247</div>
      <div class="stat-change positive">↑ 12.5% from last month</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Active Creators</div>
      <div class="stat-value">342</div>
      <div class="stat-change positive">↑ 8.3% from last month</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Avg Engagement</div>
      <div class="stat-value">6.8%</div>
      <div class="stat-change positive">↑ 2.1% from last month</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">GEO Score</div>
      <div class="stat-value">87.5</div>
      <div class="stat-change positive">↑ 5.2 from last month</div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <h2 class="card-title">Recent Content Generations</h2>
      <button class="button">Generate New</button>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Title</th>
          <th>Platform</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge badge-info">Article</span></td>
          <td>5 Tips for Better SEO in 2026</td>
          <td>LinkedIn</td>
          <td><span class="badge badge-success">Published</span></td>
          <td>2 hours ago</td>
        </tr>
        <tr>
          <td><span class="badge badge-info">Image</span></td>
          <td>Brand Campaign Hero Image</td>
          <td>Instagram</td>
          <td><span class="badge badge-success">Published</span></td>
          <td>5 hours ago</td>
        </tr>
        <tr>
          <td><span class="badge badge-info">Video</span></td>
          <td>Product Demo Short</td>
          <td>TikTok</td>
          <td><span class="badge badge-warning">Processing</span></td>
          <td>1 day ago</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
    <div class="card">
      <h2 class="card-title">Top Creators</h2>
      <div style="margin-top: 1.5rem;">
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>@rachelvennya</span>
            <span style="font-weight: 600;">7.5M followers</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 95%;"></div>
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>@tasyafarasya</span>
            <span style="font-weight: 600;">4.2M followers</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 78%;"></div>
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>@nadyanissa</span>
            <span style="font-weight: 600;">850K followers</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 45%;"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-title">Platform Performance</h2>
      <div style="margin-top: 1.5rem;">
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Instagram</span>
            <span style="font-weight: 600; color: var(--success);">8.2% engagement</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 82%; background: var(--success);"></div>
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>TikTok</span>
            <span style="font-weight: 600; color: var(--success);">12.5% engagement</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 100%; background: var(--success);"></div>
          </div>
        </div>

        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>LinkedIn</span>
            <span style="font-weight: 600; color: var(--warning);">3.8% engagement</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 38%; background: var(--warning);"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <h2 class="card-title">GEO Optimization Insights</h2>
    <div style="margin-top: 1.5rem;">
      <p style="color: var(--text-secondary); line-height: 1.8;">
        Your content is currently ranking well across major AI engines.
        Focus areas for improvement: increase citation frequency (+15%) and
        improve sentiment scores in technical content (+0.2 points).
      </p>
      <div style="margin-top: 1rem; display: flex; gap: 1rem;">
        <button class="button">View Full Report</button>
        <button class="button button-outline">Export Data</button>
      </div>
    </div>
  </div>
</div>

<footer style="background: white; border-top: 1px solid var(--border); margin-top: 4rem; padding: 2rem 0;">
  <div class="container">
    <div style="text-align: center; color: var(--text-secondary);">
      <p>© 2026 GeoVera - AI-Powered Content Intelligence Platform</p>
      <p style="margin-top: 0.5rem; font-size: 0.875rem;">
        Built with Supabase, OpenAI, Runway ML, and Gemini AI
      </p>
    </div>
  </div>
</footer>
`;
