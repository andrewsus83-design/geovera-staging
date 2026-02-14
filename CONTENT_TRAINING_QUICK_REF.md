# Content Training System - Quick Reference

## 🚀 Quick Start

### 1. Deploy System
```bash
# Apply migration
cd /Users/drew83/Desktop/geovera-staging
supabase migration up

# Deploy functions
cd supabase/functions
./deploy-content-training.sh
```

### 2. Upload Training Example
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-visual-content`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "uuid",
    file_url: "https://example.com/image.jpg",
    content_type: "image"
  })
});
```

### 3. Train Model (After 3+ Examples)
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/train-brand-model`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "uuid",
    content_type: "image"
  })
});
```

### 4. Generate Content (Automatic Brand Consistency)
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "uuid",
    prompt: "Modern office workspace"
  })
});
```

### 5. Record Feedback
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/record-content-feedback`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "uuid",
    content_id: "uuid",
    rating: 5,
    brand_consistency_rating: 5,
    quality_rating: 5
  })
});
```

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `gv_content_training_data` | Training examples storage |
| `gv_brand_visual_guidelines` | Learned brand identity |
| `gv_content_feedback_loop` | User ratings & feedback |
| `gv_visual_style_patterns` | ML-extracted patterns |

---

## 🔧 Edge Functions

| Function | Endpoint | Cost |
|----------|----------|------|
| `analyze-visual-content` | `/functions/v1/analyze-visual-content` | $0.003 |
| `train-brand-model` | `/functions/v1/train-brand-model` | $0.015 |
| `generate-image` | `/functions/v1/generate-image` | $0.040 |
| `generate-video` | `/functions/v1/generate-video` | $0.015 |
| `record-content-feedback` | `/functions/v1/record-content-feedback` | Free |

---

## 💰 Cost Breakdown

### One-Time Training (15 examples)
- Analyze 15 images: `$0.045`
- Train model: `$0.015`
- **Total**: `$0.060`

### Per Generation
- Image: `$0.040`
- Video: `$0.015`

---

## 📈 Training Requirements

| Metric | Value |
|--------|-------|
| Minimum examples | 3 |
| Recommended examples | 10-20 |
| Content types | Image, Video |
| Expected confidence | 0.8+ (with 15 examples) |

---

## 🔍 SQL Queries

### Check Training Status
```sql
SELECT brand_id, training_status, confidence_score, total_training_examples
FROM gv_brand_visual_guidelines
WHERE brand_id = 'uuid';
```

### View Training Examples
```sql
SELECT content_type, quality_score, brand_consistency_score, created_at
FROM gv_content_training_data
WHERE brand_id = 'uuid'
  AND is_active = true
ORDER BY created_at DESC;
```

### Check Feedback Trends
```sql
SELECT
  rating,
  COUNT(*) as count,
  AVG(brand_consistency_rating) as avg_consistency
FROM gv_content_feedback_loop
WHERE brand_id = 'uuid'
GROUP BY rating
ORDER BY rating DESC;
```

### View Style Patterns
```sql
SELECT pattern_type, pattern_name, confidence_score, times_used
FROM gv_visual_style_patterns
WHERE brand_id = 'uuid'
  AND is_active = true
ORDER BY confidence_score DESC;
```

---

## ⚙️ Helper Functions

```sql
-- Check brand training status
SELECT * FROM get_brand_training_status('brand-uuid');

-- Get recommended patterns
SELECT * FROM get_recommended_style_patterns('brand-uuid', 'image', 5);

-- Calculate consistency score
SELECT calculate_brand_consistency_score(
  'brand-uuid',
  ARRAY['#1E3A8A', '#3B82F6'],
  ARRAY['modern', 'minimal']
);
```

---

## 🎯 Feedback Rating Guide

| Rating | Meaning | Action |
|--------|---------|--------|
| 5 ⭐⭐⭐⭐⭐ | Perfect | Auto-adds to training data |
| 4 ⭐⭐⭐⭐ | Good | Auto-adds to training data |
| 3 ⭐⭐⭐ | Acceptable | Used for refinement |
| 2 ⭐⭐ | Poor | Issues logged |
| 1 ⭐ | Unusable | Issues logged, model flagged |

---

## 🔑 Environment Variables

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
ALLOWED_ORIGIN=https://geovera.xyz
```

---

## 📝 Common Issues

### "Insufficient training data"
**Fix**: Upload at least 3 training examples

### Low confidence score
**Fix**: Upload 10-20 high-quality, consistent examples

### Generated content not brand-consistent
**Fix**: Check `training_status`, retrain if needed

### Training status "needs_update"
**Fix**: Retrain model to incorporate new examples

---

## 📚 Documentation

- **User Guide**: `VISUAL_TRAINING_GUIDE.md`
- **Developer Docs**: `CONTENT_TRAINING_README.md`
- **Implementation**: `CONTENT_TRAINING_IMPLEMENTATION_SUMMARY.md`

---

## 🧪 Testing

```bash
# Run automated tests
deno run --allow-net --allow-env test-content-training.ts

# Set env vars first
export SUPABASE_URL=https://your-project.supabase.co
export USER_TOKEN=your-jwt-token
export BRAND_ID=your-brand-uuid
```

---

## 🎨 Visual Analysis Output

```json
{
  "dominant_colors": ["#1E3A8A", "#3B82F6", "#F59E0B"],
  "color_palette": {
    "primary": ["#1E3A8A"],
    "secondary": ["#3B82F6"],
    "accent": ["#F59E0B"]
  },
  "visual_style_tags": ["modern", "minimal", "professional"],
  "composition_type": "centered",
  "quality_score": 0.92,
  "mood": ["professional", "trustworthy"],
  "lighting": "natural",
  "background_style": "minimal"
}
```

---

## 🚦 Training Status States

| Status | Meaning |
|--------|---------|
| `untrained` | No training completed |
| `training` | Currently training |
| `trained` | Ready for use |
| `needs_update` | New examples added, retrain recommended |

---

## 📊 Performance Metrics

| Operation | Response Time |
|-----------|---------------|
| Analyze visual content | 2-4 seconds |
| Train brand model | 5-10 seconds |
| Generate image | 15-30 seconds |
| Generate video | 3-5 seconds |
| Record feedback | <1 second |

---

## 🔒 Security

- ✅ RLS policies on all tables
- ✅ Brand-scoped data access
- ✅ User authentication required
- ✅ API keys in environment only

---

## 📞 Support

- Email: support@geovera.xyz
- Docs: https://geovera.xyz/docs
- GitHub: Issues tab

---

**Last Updated**: February 14, 2026
