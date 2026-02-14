# GeoVera Content Studio - Visual Training Guide

## Overview

The **Research Model Training System** enables brands to generate high-quality, brand-consistent images and videos by learning from example content. This guide explains how to train your brand's visual model for consistent, on-brand content generation.

---

## What is the Visual Training System?

The Visual Training System uses AI (Claude 3.5 Sonnet) to analyze your brand's visual content and extract patterns including:

- **Color Palettes**: Primary, secondary, and accent colors
- **Visual Styles**: Modern, minimal, bold, elegant, corporate, artistic, etc.
- **Composition Patterns**: Centered, rule-of-thirds, symmetrical, asymmetrical
- **Lighting Preferences**: Natural, studio, dramatic, high-key, low-key
- **Mood & Aesthetic**: Professional, energetic, playful, serious, etc.

Once trained, all future image and video generations automatically incorporate these learned patterns for **brand consistency**.

---

## Prerequisites

### Subscription Requirements
- **Images**: Basic, Premium, or Partner tier
- **Videos**: Premium or Partner tier only

### Training Requirements
- **Minimum Examples**: 3 images or videos
- **Recommended**: 10-20 high-quality examples
- **Quality**: High-resolution, professionally produced content
- **Consistency**: Examples should represent your desired brand aesthetic

---

## Step-by-Step Training Guide

### Step 1: Upload Training Examples

**Endpoint**: `/supabase/functions/analyze-visual-content`

Upload 10-20 example images or videos that represent your brand's visual identity.

```typescript
// Upload training example
const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-visual-content`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "your-brand-id",
    file_url: "https://your-storage.com/example-image.jpg",
    content_type: "image", // or "video"
    training_data_id: "uuid-if-already-created"
  })
});

const { analysis, cost_usd } = await response.json();
```

**What Happens:**
1. Claude 3.5 Sonnet analyzes the visual content
2. Extracts dominant colors (hex codes)
3. Identifies visual style tags
4. Scores quality and composition
5. Saves analysis to `gv_content_training_data`

**Example Response:**
```json
{
  "success": true,
  "analysis": {
    "dominant_colors": ["#1E3A8A", "#3B82F6", "#F59E0B"],
    "color_palette": {
      "primary": ["#1E3A8A"],
      "secondary": ["#3B82F6"],
      "accent": ["#F59E0B"]
    },
    "visual_style_tags": ["modern", "minimal", "professional"],
    "composition_type": "centered",
    "quality_score": 0.92,
    "composition_score": 0.88,
    "mood": ["professional", "trustworthy"],
    "lighting": "natural",
    "background_style": "minimal"
  },
  "cost_usd": "0.0030"
}
```

### Step 2: Train Your Brand Model

**Endpoint**: `/supabase/functions/train-brand-model`

Once you've uploaded 3+ examples, trigger model training.

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/train-brand-model`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "your-brand-id",
    content_type: "image" // or "video"
  })
});

const { guidelines, training_examples_used, patterns_created } = await response.json();
```

**What Happens:**
1. Fetches all approved training examples
2. Claude analyzes patterns across all examples
3. Extracts unified brand visual guidelines
4. Generates custom prompt templates
5. Saves to `gv_brand_visual_guidelines`
6. Creates style patterns in `gv_visual_style_patterns`

**Example Response:**
```json
{
  "success": true,
  "guidelines": {
    "primary_colors": ["#1E3A8A", "#3B82F6"],
    "secondary_colors": ["#60A5FA", "#93C5FD"],
    "accent_colors": ["#F59E0B"],
    "visual_style": "modern",
    "prompt_template": "Professional image for {brand_name}, featuring {style_keywords}. {composition_preferences}. {lighting_preference} lighting. High quality, on-brand.",
    "confidence_score": 0.85
  },
  "training_examples_used": 15,
  "patterns_created": 3,
  "cost_usd": "0.0150"
}
```

### Step 3: Generate Brand-Consistent Content

After training, all image/video generations automatically use your brand guidelines.

**Image Generation Example:**
```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "your-brand-id",
    prompt: "A tech startup office with creative team collaboration",
    target_platforms: ["instagram", "linkedin"],
    size: "1024x1024"
  })
});
```

**What Happens:**
1. Fetches your brand visual guidelines
2. Enhances prompt with brand colors, style, lighting
3. Generates image via DALL-E 3
4. Saves with brand consistency metadata

**Enhanced Prompt (Automatic):**
```
Professional brand image for TechStartup Inc: A tech startup office with creative team collaboration.
Style: modern, minimal, professional. modern aesthetic. Color palette: #1E3A8A, #3B82F6, #F59E0B.
Composition: centered. natural lighting. minimal background. High quality, professional.
```

### Step 4: Provide Feedback (Feedback Loop)

**Endpoint**: `/supabase/functions/record-content-feedback`

Rate generated content to continuously improve the model.

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/record-content-feedback`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${userToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    brand_id: "your-brand-id",
    content_id: "generated-content-id",
    rating: 5, // 1-5 stars
    feedback_text: "Perfect! Exactly matches our brand aesthetic.",
    issues_reported: [], // ["wrong colors", "poor composition"]
    brand_consistency_rating: 5,
    quality_rating: 5,
    relevance_rating: 5
  })
});
```

**What Happens:**
- **Rating >= 4**: Content added to training data automatically
- **Rating >= 3**: Feedback used for prompt refinement
- **Rating < 3**: Issues logged for model improvement
- **High ratings**: Model confidence increases
- **Low ratings**: Model marked for retraining

---

## Database Schema

### 1. Content Training Data (`gv_content_training_data`)

Stores successful content examples for learning.

**Key Fields:**
- `brand_id`: Brand identifier
- `content_type`: "image" or "video"
- `training_source`: "user_upload", "generated_approved", "external_example"
- `file_url`: Content URL
- `visual_analysis`: Full Claude analysis (JSONB)
- `dominant_colors`: Array of hex colors
- `visual_style_tags`: Array of style descriptors
- `quality_score`: 0.0-1.0
- `brand_consistency_score`: 0.0-1.0

### 2. Brand Visual Guidelines (`gv_brand_visual_guidelines`)

Stores learned brand visual identity.

**Key Fields:**
- `brand_id`: Brand identifier (unique)
- `primary_colors`: Array of hex codes
- `secondary_colors`: Array of hex codes
- `accent_colors`: Array of hex codes
- `visual_style`: "minimal", "bold", "elegant", etc.
- `visual_mood`: Array of mood descriptors
- `composition_preferences`: Array of composition types
- `image_prompt_template`: Custom DALL-E prompt template
- `video_prompt_template`: Custom video script template
- `style_keywords`: Positive style keywords
- `negative_keywords`: Keywords to avoid
- `training_status`: "untrained", "training", "trained", "needs_update"
- `confidence_score`: 0.0-1.0

### 3. Content Feedback Loop (`gv_content_feedback_loop`)

Tracks user ratings and improvements.

**Key Fields:**
- `brand_id`: Brand identifier
- `content_id`: Generated content identifier
- `rating`: 1-5 stars
- `feedback_text`: User comments
- `issues_reported`: Array of issues
- `brand_consistency_rating`: 1-5 stars
- `quality_rating`: 1-5 stars
- `was_edited`: Boolean
- `edit_percentage`: 0-100%

### 4. Visual Style Patterns (`gv_visual_style_patterns`)

ML-extracted patterns for generation.

**Key Fields:**
- `brand_id`: Brand identifier
- `pattern_type`: "color_harmony", "composition", "lighting", "style", "mood"
- `content_type`: "image" or "video"
- `pattern_data`: Pattern details (JSONB)
- `confidence_score`: 0.0-1.0
- `avg_user_rating`: Average feedback rating
- `success_rate`: % of successful generations

---

## API Reference

### Analyze Visual Content
```
POST /supabase/functions/v1/analyze-visual-content
```

**Request:**
```json
{
  "brand_id": "uuid",
  "file_url": "https://...",
  "content_type": "image|video",
  "training_data_id": "uuid (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": { /* visual analysis */ },
  "cost_usd": "0.0030"
}
```

### Train Brand Model
```
POST /supabase/functions/v1/train-brand-model
```

**Request:**
```json
{
  "brand_id": "uuid",
  "content_type": "image|video"
}
```

**Response:**
```json
{
  "success": true,
  "guidelines": { /* brand guidelines */ },
  "training_examples_used": 15,
  "patterns_created": 3,
  "cost_usd": "0.0150"
}
```

### Generate Image (Enhanced)
```
POST /supabase/functions/v1/generate-image
```

**Request:**
```json
{
  "brand_id": "uuid",
  "prompt": "description",
  "target_platforms": ["instagram"],
  "size": "1024x1024"
}
```

**Response:**
```json
{
  "success": true,
  "content_id": "uuid",
  "image": {
    "url": "https://...",
    "cost_usd": "0.0400"
  }
}
```

### Generate Video (Enhanced)
```
POST /supabase/functions/v1/generate-video
```

**Request:**
```json
{
  "brand_id": "uuid",
  "topic": "description",
  "duration_seconds": 60,
  "target_platform": "tiktok"
}
```

**Response:**
```json
{
  "success": true,
  "content_id": "uuid",
  "video": {
    "script": "...",
    "duration": 60,
    "platform": "tiktok",
    "cost_usd": "0.0150"
  }
}
```

### Record Feedback
```
POST /supabase/functions/v1/record-content-feedback
```

**Request:**
```json
{
  "brand_id": "uuid",
  "content_id": "uuid",
  "rating": 5,
  "feedback_text": "optional",
  "issues_reported": [],
  "brand_consistency_rating": 5,
  "quality_rating": 5,
  "relevance_rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "feedback_id": "uuid",
  "message": "Thank you! This content has been added to your training data."
}
```

---

## Best Practices

### Training Examples

1. **Quality Over Quantity**: 10 excellent examples > 20 mediocre examples
2. **Consistency is Key**: Examples should represent a unified brand aesthetic
3. **Diverse Scenarios**: Include different content types (product shots, lifestyle, graphics)
4. **High Resolution**: Use high-quality images (1024x1024 minimum)
5. **Professional Content**: Avoid low-quality, inconsistent, or off-brand examples

### Prompt Engineering

1. **Be Specific**: "Modern tech office with blue accents" > "Office"
2. **Include Context**: Mention platform, audience, goal
3. **Trust the System**: After training, let the model apply brand guidelines
4. **Iterate**: Use feedback loop to refine results

### Feedback Loop

1. **Rate Consistently**: Use the same criteria for all ratings
2. **Be Specific**: Mention exact issues (colors, composition, style)
3. **Rate High-Quality Content 4-5**: Automatically adds to training data
4. **Provide Text Feedback**: Helps AI understand nuanced preferences

---

## Tier Limits

| Tier | Articles/Month | Images/Month | Videos/Month | Training |
|------|----------------|--------------|--------------|----------|
| Free | 0 | 0 | 0 | No |
| Basic | 1 | 1 | 0 | Yes |
| Premium | 2 | 2 | 2 | Yes |
| Partner | 3 | 3 | 3 | Yes |

---

## Cost Breakdown

| Operation | Cost per Request | Model |
|-----------|------------------|-------|
| Analyze Visual Content | $0.003 | Claude 3.5 Sonnet (Vision) |
| Train Brand Model | $0.015 | Claude 3.5 Sonnet |
| Generate Image | $0.040-0.080 | DALL-E 3 |
| Generate Video Script | $0.015 | Claude 3.5 Sonnet |

**Example Training Workflow Cost:**
- Upload 15 examples: 15 × $0.003 = $0.045
- Train model: $0.015
- **Total**: $0.060

---

## Troubleshooting

### "Insufficient training data"
- Upload at least 3 examples
- Ensure examples are approved for training
- Check examples match content_type (image vs video)

### Low confidence score
- Upload more examples (10-20 recommended)
- Ensure examples are visually consistent
- Use high-quality, professional content

### Generated content not brand-consistent
- Check training status: `gv_brand_visual_guidelines.training_status`
- Retrain model with more examples
- Provide detailed feedback on generated content
- Use feedback loop to improve results

### Training status "needs_update"
- New high-quality examples added
- Retrain model to incorporate new patterns
- Call `/train-brand-model` again

---

## Support

For questions or issues:
- Email: support@geovera.xyz
- Documentation: https://geovera.xyz/docs
- Status: https://status.geovera.xyz

---

**Last Updated**: February 14, 2026
**Version**: 1.0.0
