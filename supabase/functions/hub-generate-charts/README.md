# Hub Generate Charts Function

Create Statista-style charts and visualizations from data templates.

## Purpose

This function generates professional charts (line, bar, pie) using pre-defined SQL templates and transforms the data into Chart.js-compatible format with auto-generated insights.

## API Endpoint

```
POST /functions/v1/hub-generate-charts
```

## Request Body

```typescript
{
  collection_id: string;      // Collection UUID to attach charts to
  category: string;           // Category for data filtering
  templates: string[];        // Chart template names to generate
}
```

## Response

```typescript
{
  success: true,
  result: {
    charts: [
      {
        id: string;                 // Chart UUID
        type: "line" | "bar" | "pie";
        title: string;              // Chart title
        data: {                     // Chart.js data format
          labels: string[];
          datasets: [{
            label: string;
            data: number[];
            borderColor?: string;
            backgroundColor?: string;
          }]
        };
        insight: string;            // Auto-generated key insight
      }
    ],
    total_charts: number;
  }
}
```

## Process Flow

### 1. Fetch Chart Templates
- Query `gv_hub_chart_templates` table
- Get template metadata (SQL query, chart type, config)
- Validate template is active

### 2. Execute SQL Query
- Run template's SQL query with category parameter
- Handle query errors gracefully
- Fallback to mock data if query fails

### 3. Transform to Chart.js Format
**Input**: Raw SQL results
```json
[
  { "date": "2024-01-01", "engagement_rate": 4.2 },
  { "date": "2024-01-02", "engagement_rate": 4.5 }
]
```

**Output**: Chart.js data
```json
{
  "labels": ["2024-01-01", "2024-01-02"],
  "datasets": [{
    "label": "Engagement Rate",
    "data": [4.2, 4.5],
    "borderColor": "#3B82F6",
    "backgroundColor": "#3B82F620"
  }]
}
```

### 4. Generate Key Insight
Auto-analyze data to create insights:
- **Line charts**: Trend analysis (increasing/decreasing/stable)
- **Bar charts**: Top performer identification
- **Pie charts**: Largest share analysis

Example:
```
"Engagement Rate shows an increasing trend with an average of 4.5.
Peak value of 5.1 was observed at Week 4."
```

### 5. Save to Database
- Insert into `gv_hub_charts`
- Link to collection
- Store Chart.js data as JSONB

## Default Chart Templates

### 1. `engagement_trend` (Line Chart)
**Description**: Engagement rate trend over time

**SQL Query**:
```sql
SELECT
  DATE_TRUNC('day', posted_at) as date,
  AVG((likes + comments + shares)::float / NULLIF(reach, 0) * 100) as engagement_rate
FROM gv_creator_content
WHERE category = $1
  AND posted_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date
```

**Insight Example**:
"Engagement Rate shows an increasing trend with an average of 4.5%."

---

### 2. `top_creators_by_reach` (Bar Chart)
**Description**: Top 10 creators by total reach

**SQL Query**:
```sql
SELECT
  c.name,
  SUM(cc.reach) as total_reach
FROM gv_creators c
JOIN gv_creator_content cc ON c.id = cc.creator_id
WHERE c.category = $1
GROUP BY c.id, c.name
ORDER BY total_reach DESC
LIMIT 10
```

**Insight Example**:
"Creator A leads with 2.5M reach, followed by Creator B. Overall average is 1.2M."

---

### 3. `content_type_distribution` (Pie Chart)
**Description**: Distribution of content types

**SQL Query**:
```sql
SELECT
  CASE
    WHEN caption LIKE '%tutorial%' THEN 'Tutorial'
    WHEN caption LIKE '%review%' THEN 'Review'
    ELSE 'Other'
  END as type,
  COUNT(*) as count
FROM gv_creator_content
WHERE category = $1
GROUP BY type
```

**Insight Example**:
"Tutorial accounts for 35% of the total, representing the largest share."

## Example Usage

### cURL

```bash
curl -X POST https://your-project.supabase.co/functions/v1/hub-generate-charts \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "collection_id": "uuid-here",
    "category": "beauty",
    "templates": ["engagement_trend", "top_creators_by_reach", "content_type_distribution"]
  }'
```

### JavaScript

```javascript
const { data, error } = await supabase.functions.invoke('hub-generate-charts', {
  body: {
    collection_id: 'uuid-here',
    category: 'beauty',
    templates: ['engagement_trend', 'top_creators_by_reach']
  }
});

if (error) {
  console.error('Chart generation failed:', error);
} else {
  console.log(`Generated ${data.result.total_charts} charts`);
  data.result.charts.forEach(chart => {
    console.log(`${chart.title}: ${chart.insight}`);
  });
}
```

### TypeScript

```typescript
interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }>;
}

interface ChartResult {
  id: string;
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: ChartData;
  insight: string;
}

const response = await fetch('https://your-project.supabase.co/functions/v1/hub-generate-charts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    collection_id: 'uuid-here',
    category: 'food',
    templates: ['engagement_trend']
  })
});

const { result } = await response.json();
const charts: ChartResult[] = result.charts;
```

## Color Schemes

### Default Colors
```typescript
{
  primary: "#3B82F6",    // Blue
  secondary: "#8B5CF6",  // Purple
  success: "#10B981",    // Green
  warning: "#F59E0B",    // Amber
  danger: "#EF4444"      // Red
}
```

### Gradient Palette (Multi-dataset)
```typescript
[
  "#3B82F6",  // Blue
  "#8B5CF6",  // Purple
  "#EC4899",  // Pink
  "#F59E0B",  // Amber
  "#10B981",  // Green
  "#06B6D4",  // Cyan
  "#6366F1",  // Indigo
  "#F97316"   // Orange
]
```

## Chart.js Integration

### Frontend Example (React)

```javascript
import { Line, Bar, Pie } from 'react-chartjs-2';

function ChartDisplay({ chart }) {
  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie
  }[chart.type];

  return (
    <div>
      <h3>{chart.title}</h3>
      <ChartComponent data={chart.data} />
      <p className="insight">{chart.insight}</p>
    </div>
  );
}
```

## Fallback Data

If SQL query execution fails, the function generates mock data:

### Line Chart Fallback
```json
{
  "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
  "datasets": [{
    "label": "Engagement Rate",
    "data": [4.2, 4.5, 4.8, 5.1]
  }]
}
```

### Bar Chart Fallback
```json
{
  "labels": ["Creator 1", "Creator 2", "Creator 3", "Creator 4", "Creator 5"],
  "datasets": [{
    "label": "Total Reach",
    "data": [150000, 120000, 95000, 80000, 65000]
  }]
}
```

### Pie Chart Fallback
```json
{
  "labels": ["Tutorial", "Review", "Lifestyle", "Other"],
  "datasets": [{
    "label": "Content Type",
    "data": [35, 28, 22, 15]
  }]
}
```

## Insight Generation Algorithm

```typescript
// Calculate statistics
const max = Math.max(...values);
const min = Math.min(...values);
const avg = values.reduce((a, b) => a + b, 0) / values.length;

// Detect trend (time series only)
const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
const olderAvg = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

let trend = 'stable';
if (recentAvg > olderAvg * 1.1) trend = 'increasing';
else if (recentAvg < olderAvg * 0.9) trend = 'decreasing';

// Generate insight based on chart type
```

## Error Handling

### Common Errors

1. **Template Not Found**
   ```json
   {
     "error": "Failed to generate charts",
     "details": "Chart template not found: invalid_template"
   }
   ```

2. **Query Execution Failed**
   - Automatically falls back to mock data
   - Logs warning to console
   - Continues with other templates

3. **Invalid Request**
   ```json
   {
     "error": "templates must be a non-empty array"
   }
   ```

## Environment Variables

Required:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

## Database Schema

### Input Table: `gv_hub_chart_templates`
```sql
- id (UUID)
- template_name (TEXT, unique)
- chart_type (TEXT)
- description (TEXT)
- data_query (TEXT)  -- SQL query template
- query_params (JSONB)
- config_template (JSONB)  -- Chart.js config
- category (TEXT)
- is_active (BOOLEAN)
```

### Output Table: `gv_hub_charts`
```sql
- id (UUID)
- collection_id (UUID, FK)
- chart_type (TEXT: line/bar/pie/area/scatter/heatmap)
- title (TEXT)
- subtitle (TEXT)
- chart_data (JSONB)  -- Chart.js data
- chart_config (JSONB)  -- Chart.js config
- color_scheme (TEXT)
- theme (TEXT: light/dark)
- data_source (TEXT)
- data_period (TEXT)
- last_updated (TIMESTAMPTZ)
- key_insight (TEXT)
- insight_summary (TEXT)
```

## Performance

- **Average execution time**: 3-8 seconds (for 3 charts)
  - Template fetch: ~0.5 seconds
  - Query execution: ~1-2 seconds per chart
  - Data transformation: <0.5 seconds per chart
  - Save to DB: ~0.5 seconds

## Creating Custom Templates

```sql
INSERT INTO gv_hub_chart_templates (
  template_name,
  chart_type,
  description,
  data_query,
  config_template,
  category
) VALUES (
  'custom_metric',
  'line',
  'My custom metric over time',
  'SELECT date, metric FROM my_table WHERE category = $1',
  '{"xAxis": {"type": "timeseries"}}',
  'all'
);
```

## Testing

```bash
# Test locally
supabase functions serve hub-generate-charts

# In another terminal
curl -X POST http://localhost:54321/functions/v1/hub-generate-charts \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "collection_id": "test-uuid",
    "category": "beauty",
    "templates": ["engagement_trend"]
  }'
```

## Deployment

```bash
# Deploy to Supabase
supabase functions deploy hub-generate-charts
```

## Best Practices

1. **Template Design**: Keep SQL queries performant (<2 seconds)
2. **Data Points**: Limit to 50 data points per chart
3. **Error Handling**: Always provide fallback data
4. **Insights**: Keep insights concise (1-2 sentences)
5. **Colors**: Use consistent color schemes across charts

## Next Steps

After generating charts:
- Display in Hub Tab 3 (Charts)
- Render with Chart.js library
- Show key insights below each chart
- Allow users to toggle between chart types

## Support

For issues or questions, contact the development team or refer to the main project documentation.
