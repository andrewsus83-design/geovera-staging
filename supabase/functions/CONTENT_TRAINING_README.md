# Content Training System - Edge Functions

## Overview

The Content Training System provides 4 Edge Functions for brand-consistent visual content generation:

1. **analyze-visual-content**: Analyze images/videos to extract visual patterns
2. **train-brand-model**: Train brand visual guidelines from examples
3. **generate-image**: Generate brand-consistent images (enhanced)
4. **generate-video**: Generate brand-consistent video scripts (enhanced)
5. **record-content-feedback**: Record user feedback for continuous improvement

---

## 1. analyze-visual-content

Analyzes uploaded images or videos using Claude 3.5 Sonnet (Vision) to extract visual patterns.

### Endpoint
```
POST /supabase/functions/v1/analyze-visual-content
```

### Request Body
```typescript
{
  brand_id: string;
  file_url: string;
  content_type: "image" | "video";
  training_data_id?: string; // Optional: UUID if updating existing training data
}
```

### Response
```typescript
{
  success: boolean;
  analysis: {
    dominant_colors: string[];
    color_palette: {
      primary: string[];
      secondary: string[];
      accent: string[];
    };
    visual_style_tags: string[];
    composition_type: string;
    quality_score: number;
    brand_consistency_score: number;
    composition_score: number;
    mood: string[];
    subject_matter: string;
    lighting: string;
    background_style: string;
    text_overlay_detected: boolean;
    recommendations: string[];
  };
  cost_usd: string;
}
```

### Usage Example
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-visual-content`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "uuid",
    file_url: "https://storage.com/example.jpg",
    content_type: "image"
  })
});

const { analysis } = await response.json();
console.log("Dominant colors:", analysis.dominant_colors);
```

### What It Does
1. Fetches image from `file_url`
2. Converts to base64 for Claude vision API
3. Analyzes visual content (colors, style, composition)
4. Calculates brand consistency score (if guidelines exist)
5. Updates training data record (if `training_data_id` provided)
6. Returns detailed visual analysis

### Cost
- **$0.003 per analysis** (Claude 3.5 Sonnet vision)

---

## 2. train-brand-model

Trains brand visual guidelines from uploaded training examples using Claude 3.5 Sonnet.

### Endpoint
```
POST /supabase/functions/v1/train-brand-model
```

### Request Body
```typescript
{
  brand_id: string;
  content_type: "image" | "video";
}
```

### Response
```typescript
{
  success: boolean;
  guidelines: {
    primary_colors: string[];
    secondary_colors: string[];
    accent_colors: string[];
    visual_style: string;
    prompt_template: string;
    confidence_score: number;
  };
  training_examples_used: number;
  patterns_created: number;
  cost_usd: string;
}
```

### Usage Example
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

const { guidelines, confidence_score } = await response.json();
console.log("Training complete! Confidence:", confidence_score);
```

### What It Does
1. Validates minimum 3 training examples exist
2. Fetches all approved training examples for brand
3. Uses Claude to extract patterns across examples
4. Generates unified brand visual guidelines
5. Creates custom prompt templates
6. Saves to `gv_brand_visual_guidelines`
7. Creates style patterns in `gv_visual_style_patterns`

### Requirements
- **Minimum**: 3 training examples
- **Recommended**: 10-20 examples
- **Quality**: High-resolution, brand-consistent content

### Cost
- **$0.015 per training** (Claude 3.5 Sonnet)

---

## 3. generate-image (Enhanced)

Generates brand-consistent images using DALL-E 3 with automatic brand guideline injection.

### Endpoint
```
POST /supabase/functions/v1/generate-image
```

### Request Body
```typescript
{
  brand_id: string;
  prompt: string;
  target_platforms?: string[];
  size?: string; // "1024x1024" or "1024x1792"
}
```

### Response
```typescript
{
  success: boolean;
  content_id: string;
  image: {
    url: string;
    cost_usd: string;
  };
}
```

### Enhancements Over Original
1. **Fetches brand visual guidelines** before generation
2. **Enhances prompt** with brand colors, style keywords, lighting
3. **Injects composition preferences** and visual style
4. **Uses custom prompt template** (if trained)
5. **Saves brand metadata** in content library

### Example Prompt Enhancement

**Original Prompt:**
```
"A tech startup office with creative team collaboration"
```

**Enhanced Prompt (After Training):**
```
Professional brand image for TechStartup Inc: A tech startup office with creative team collaboration.
Style: modern, minimal, professional. modern aesthetic.
Color palette: #1E3A8A, #3B82F6, #F59E0B.
Composition: centered. natural lighting. minimal background.
High quality, professional.
```

### Usage Example
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "uuid",
    prompt: "Modern office workspace",
    target_platforms: ["instagram", "linkedin"],
    size: "1024x1024"
  })
});

const { content_id, image } = await response.json();
```

### Cost
- **$0.040** (1024x1024)
- **$0.080** (1024x1792)

---

## 4. generate-video (Enhanced)

Generates brand-consistent video scripts using Claude 3.5 Sonnet with brand guideline injection.

### Endpoint
```
POST /supabase/functions/v1/generate-video
```

### Request Body
```typescript
{
  brand_id: string;
  topic: string;
  duration_seconds?: number;
  target_platform?: string;
}
```

### Response
```typescript
{
  success: boolean;
  content_id: string;
  video: {
    script: string;
    duration: number;
    platform: string;
    cost_usd: string;
  };
}
```

### Enhancements Over Original
1. **Fetches brand visual guidelines** before generation
2. **Injects brand colors** into visual suggestions
3. **Applies visual style** to scene descriptions
4. **Includes lighting preferences** in script
5. **Composition guidance** for camera angles
6. **Brand consistency notes** throughout script

### Usage Example
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-video`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "uuid",
    topic: "Product launch announcement",
    duration_seconds: 60,
    target_platform: "tiktok"
  })
});

const { content_id, video } = await response.json();
console.log("Script:", video.script);
```

### Cost
- **$0.015 per video script** (Claude 3.5 Sonnet)

---

## 5. record-content-feedback

Records user feedback for continuous model improvement.

### Endpoint
```
POST /supabase/functions/v1/record-content-feedback
```

### Request Body
```typescript
{
  brand_id: string;
  content_id: string;
  rating: number; // 1-5
  feedback_text?: string;
  issues_reported?: string[];
  brand_consistency_rating?: number;
  quality_rating?: number;
  relevance_rating?: number;
  was_edited?: boolean;
  edit_percentage?: number;
}
```

### Response
```typescript
{
  success: boolean;
  feedback_id: string;
  message: string;
}
```

### What It Does
1. Records feedback in `gv_content_feedback_loop`
2. **Rating >= 4**: Automatically adds content to training data
3. **Rating >= 3**: Uses feedback for prompt refinement
4. **Rating < 3**: Logs issues for model improvement
5. Updates brand voice approval rates
6. Triggers model retraining suggestions

### Usage Example
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
    feedback_text: "Perfect brand consistency!",
    brand_consistency_rating: 5,
    quality_rating: 5
  })
});

const { message } = await response.json();
console.log(message);
```

---

## Deployment

### Deploy All Functions
```bash
cd /Users/drew83/Desktop/geovera-staging/supabase/functions

# Deploy analyze-visual-content
supabase functions deploy analyze-visual-content

# Deploy train-brand-model
supabase functions deploy train-brand-model

# Deploy record-content-feedback
supabase functions deploy record-content-feedback

# Deploy updated generate-image
supabase functions deploy generate-image

# Deploy updated generate-video
supabase functions deploy generate-video
```

### Environment Variables Required
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
ALLOWED_ORIGIN=https://geovera.xyz
```

### Test Functions
```bash
# Test analyze-visual-content
curl -X POST "https://your-project.supabase.co/functions/v1/analyze-visual-content" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "uuid",
    "file_url": "https://example.com/image.jpg",
    "content_type": "image"
  }'

# Test train-brand-model
curl -X POST "https://your-project.supabase.co/functions/v1/train-brand-model" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "uuid",
    "content_type": "image"
  }'
```

---

## Database Migration

Apply the migration first:

```bash
cd /Users/drew83/Desktop/geovera-staging

# Apply migration
supabase migration up
```

Migration creates 4 new tables:
1. `gv_content_training_data`
2. `gv_brand_visual_guidelines`
3. `gv_content_feedback_loop`
4. `gv_visual_style_patterns`

---

## Workflow Example

### Complete Training Workflow

```typescript
// 1. Upload training examples (repeat 10-20 times)
for (const imageUrl of trainingImages) {
  await fetch(`${SUPABASE_URL}/functions/v1/analyze-visual-content`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${userToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      brand_id: brandId,
      file_url: imageUrl,
      content_type: "image"
    })
  });
}

// 2. Train model
const trainResponse = await fetch(`${SUPABASE_URL}/functions/v1/train-brand-model`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: brandId,
    content_type: "image"
  })
});

const { guidelines, confidence_score } = await trainResponse.json();
console.log("Training complete! Confidence:", confidence_score);

// 3. Generate brand-consistent content
const genResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: brandId,
    prompt: "Modern office workspace",
    target_platforms: ["instagram"]
  })
});

const { content_id, image } = await genResponse.json();

// 4. Provide feedback
await fetch(`${SUPABASE_URL}/functions/v1/record-content-feedback`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: brandId,
    content_id: content_id,
    rating: 5,
    brand_consistency_rating: 5,
    quality_rating: 5
  })
});
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Content Training System                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     analyze-visual-content              │
        │  (Claude 3.5 Sonnet Vision)             │
        │  - Extract colors, styles, composition  │
        │  - Score quality & consistency          │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │   gv_content_training_data              │
        │  (Training Examples Storage)            │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │     train-brand-model                   │
        │  (Claude 3.5 Sonnet)                    │
        │  - Extract patterns across examples     │
        │  - Generate prompt templates            │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │   gv_brand_visual_guidelines            │
        │  (Brand Visual Identity)                │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │   generate-image / generate-video       │
        │  (DALL-E 3 / Claude 3.5 Sonnet)         │
        │  - Fetch guidelines                     │
        │  - Enhance prompts                      │
        │  - Generate content                     │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │   record-content-feedback               │
        │  (Feedback Loop)                        │
        │  - Record ratings                       │
        │  - Add to training data (rating >= 4)   │
        │  - Trigger retraining                   │
        └─────────────────────────────────────────┘
```

---

## Error Handling

### Common Errors

**Insufficient Training Data**
```json
{
  "success": false,
  "error": "Insufficient training data. Please upload at least 3 examples.",
  "code": "INSUFFICIENT_TRAINING_DATA"
}
```
**Solution**: Upload more training examples

**Quota Exceeded**
```json
{
  "success": false,
  "error": "Monthly image quota exceeded",
  "code": "QUOTA_EXCEEDED"
}
```
**Solution**: Upgrade subscription tier

**Training Failed**
```json
{
  "success": false,
  "error": "Failed to parse training results",
  "code": "TRAINING_FAILED"
}
```
**Solution**: Check training data quality, retry

---

## Performance Metrics

### Expected Response Times
- **analyze-visual-content**: 2-4 seconds
- **train-brand-model**: 5-10 seconds
- **generate-image**: 15-30 seconds (DALL-E 3)
- **generate-video**: 3-5 seconds (script only)
- **record-content-feedback**: <1 second

### Cost Estimates

**Training Workflow (15 examples):**
- Analyze 15 images: 15 × $0.003 = $0.045
- Train model: $0.015
- **Total**: $0.060

**Generation (Monthly):**
- Basic tier: 1 image × $0.040 = $0.040/month
- Premium tier: 2 images + 2 videos = $0.110/month
- Partner tier: 3 images + 3 videos = $0.165/month

---

## Support

For questions or issues:
- Documentation: [VISUAL_TRAINING_GUIDE.md](../VISUAL_TRAINING_GUIDE.md)
- Email: support@geovera.xyz

**Last Updated**: February 14, 2026
