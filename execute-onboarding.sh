#!/bin/bash

set -e

BRAND_NAME="AQUVIVA"
OUTPUT_DIR="/tmp/geovera-onboarding"
mkdir -p "$OUTPUT_DIR"

echo "🚀 GeoVera Onboarding Workflow for: $BRAND_NAME"
echo "================================================"
echo ""

# Get API keys
GEMINI_KEY=$(supabase secrets get GOOGLE_AI_API_KEY 2>/dev/null | grep -v "NAME" | awk '{print $NF}')
PERPLEXITY_KEY=$(supabase secrets get PERPLEXITY_API_KEY 2>/dev/null | grep -v "NAME" | awk '{print $NF}')
ANTHROPIC_KEY=$(supabase secrets get ANTHROPIC_API_KEY 2>/dev/null | grep -v "NAME" | awk '{print $NF}')
OPENAI_KEY=$(supabase secrets get OPENAI_API_KEY 2>/dev/null | grep -v "NAME" | awk '{print $NF}')

echo "📍 Step 1: Gemini Brand Indexing..."
echo "-----------------------------------"

GEMINI_PROMPT="Brand Indexing Request for: $BRAND_NAME

Task: Perform comprehensive brand indexing to gather:
1. Official website and web presence (social media profiles, official channels)
2. Company ownership and parent company information
3. Launch date and market entry timeline
4. Product category and sub-category
5. Key product features and unique selling propositions
6. Target demographic and market positioning
7. Primary competitors in the same category
8. Geographic market presence
9. Recent news, announcements, or campaigns
10. Brand tagline, mission statement if available

Provide structured data output in JSON format with these exact fields:
{
  \"brand_name\": \"$BRAND_NAME\",
  \"parent_company\": \"string\",
  \"official_website\": \"string\",
  \"social_media\": {\"instagram\": \"string\", \"tiktok\": \"string\", \"facebook\": \"string\", \"youtube\": \"string\"},
  \"launch_date\": \"string\",
  \"category\": \"string\",
  \"sub_category\": \"string\",
  \"key_features\": [\"string\"],
  \"target_demographic\": \"string\",
  \"market_positioning\": \"string\",
  \"competitors\": [\"string\"],
  \"geographic_presence\": [\"string\"],
  \"recent_news\": [\"string\"],
  \"tagline\": \"string\",
  \"unique_selling_proposition\": \"string\"
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations."

curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"contents\":[{\"parts\":[{\"text\":$(echo "$GEMINI_PROMPT" | jq -Rs .)}]}],\"generationConfig\":{\"temperature\":0.3,\"topK\":40,\"topP\":0.95,\"maxOutputTokens\":2048}}" \
  | jq -r '.candidates[0].content.parts[0].text' | sed 's/```json//g' | sed 's/```//g' > "$OUTPUT_DIR/step1_gemini.json"

echo "✅ Step 1 Complete - Saved to: $OUTPUT_DIR/step1_gemini.json"
echo ""
echo "📊 Gemini Output Preview:"
cat "$OUTPUT_DIR/step1_gemini.json" | jq -r '.brand_name, .parent_company, .category' | head -3
echo ""

# Store for next step
GEMINI_DATA=$(cat "$OUTPUT_DIR/step1_gemini.json")

echo "🔍 Step 2: Perplexity Deep Research..."
echo "--------------------------------------"

PERPLEXITY_PROMPT="Conduct comprehensive deep research on $BRAND_NAME brand. Use the following indexed data as starting point:

$GEMINI_DATA

Perform deep research covering:
1. Market Analysis: Market size, growth trends, consumer behavior in the category
2. Competitive Landscape: Detailed competitor analysis, market share, positioning strategies
3. Brand History: Complete timeline, key milestones, evolution, pivots
4. Product Innovation: R&D efforts, technology, patents, unique processes
5. Marketing Strategy: Campaign analysis, influencer partnerships, media presence
6. Consumer Perception: Reviews, sentiment analysis, brand reputation
7. Distribution Channels: Retail presence, e-commerce, partnerships
8. Financial Performance: Revenue estimates, growth trajectory, funding (if available)
9. Crisis Management: Past controversies, responses, reputation risks
10. Future Outlook: Industry trends, growth opportunities, emerging threats

Provide comprehensive research report with specific data points, statistics, and insights. Be detailed and thorough."

curl -s https://api.perplexity.ai/chat/completions \
  -H "Authorization: Bearer ${PERPLEXITY_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"llama-3.1-sonar-large-128k-online\",\"messages\":[{\"role\":\"system\",\"content\":\"You are a professional brand research analyst. Provide comprehensive, data-driven research reports with specific insights and statistics.\"},{\"role\":\"user\",\"content\":$(echo "$PERPLEXITY_PROMPT" | jq -Rs .)}],\"temperature\":0.2,\"max_tokens\":4000}" \
  | jq -r '.choices[0].message.content' > "$OUTPUT_DIR/step2_perplexity.txt"

echo "✅ Step 2 Complete - Saved to: $OUTPUT_DIR/step2_perplexity.txt"
echo ""
echo "📊 Perplexity Research Length: $(wc -w < "$OUTPUT_DIR/step2_perplexity.txt") words"
echo ""

# Store for next step
PERPLEXITY_DATA=$(cat "$OUTPUT_DIR/step2_perplexity.txt")

echo "🧠 Step 3: Claude Sonnet Strategic Analysis..."
echo "----------------------------------------------"

CLAUDE_PROMPT="You are a strategic brand analyst using reverse engineering methodology to extract deep insights.

**Brand**: $BRAND_NAME

**Deep Research Data**:
$PERPLEXITY_DATA

**Your Task**: Perform reverse engineering analysis to extract:

1. **BRAND DNA** - Core identity elements:
   - Core values (3-5 fundamental principles)
   - Personality traits (brand character)
   - Brand voice (communication style)
   - Visual identity (design language description)

2. **COMPETITIVE ANALYSIS** - Strategic positioning:
   - Current market position (where brand stands)
   - Competitive advantages (what makes them win)
   - Weaknesses (vulnerabilities)
   - Opportunities (growth potential)
   - Threats (external risks)

3. **CONTENT STRATEGY** - Communication framework:
   - Key themes (recurring topics)
   - Content pillars (3-4 main content categories)
   - Messaging framework (core message structure)

4. **STRATEGIC FRAMEWORK** - Action roadmap:
   - Short-term priorities (next 3-6 months)
   - Long-term vision (1-3 years)
   - Success metrics (KPIs to track)

**Output Format**: Provide ONLY valid JSON with this exact structure (no markdown, no explanations):
{
  \"brand_dna\": {
    \"core_values\": [\"value1\", \"value2\"],
    \"personality_traits\": [\"trait1\", \"trait2\"],
    \"brand_voice\": \"description\",
    \"visual_identity\": \"description\"
  },
  \"competitive_analysis\": {
    \"market_position\": \"description\",
    \"competitive_advantages\": [\"advantage1\", \"advantage2\"],
    \"weaknesses\": [\"weakness1\", \"weakness2\"],
    \"opportunities\": [\"opp1\", \"opp2\"],
    \"threats\": [\"threat1\", \"threat2\"]
  },
  \"content_strategy\": {
    \"key_themes\": [\"theme1\", \"theme2\"],
    \"content_pillars\": [\"pillar1\", \"pillar2\", \"pillar3\"],
    \"messaging_framework\": \"description\"
  },
  \"strategic_framework\": {
    \"short_term_priorities\": [\"priority1\", \"priority2\"],
    \"long_term_vision\": \"description\",
    \"success_metrics\": [\"metric1\", \"metric2\"]
  }
}"

curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: ${ANTHROPIC_KEY}" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{\"model\":\"claude-sonnet-4-20250514\",\"max_tokens\":4000,\"temperature\":0.3,\"messages\":[{\"role\":\"user\",\"content\":$(echo "$CLAUDE_PROMPT" | jq -Rs .)}]}" \
  | jq -r '.content[0].text' | sed 's/```json//g' | sed 's/```//g' > "$OUTPUT_DIR/step3_claude.json"

echo "✅ Step 3 Complete - Saved to: $OUTPUT_DIR/step3_claude.json"
echo ""
echo "📊 Claude Analysis Preview:"
cat "$OUTPUT_DIR/step3_claude.json" | jq -r '.brand_dna.core_values[0], .competitive_analysis.market_position' | head -2
echo ""

# Store for next step
CLAUDE_DATA=$(cat "$OUTPUT_DIR/step3_claude.json")

echo "✍️  Step 4: OpenAI GPT-4o-mini Report Generation..."
echo "---------------------------------------------------"

# Read full prompts for OpenAI from the optimized prompts file
OPENAI_SYSTEM="You are an elite brand intelligence report writer. Create compelling, data-driven, executive-ready reports that tell powerful stories and provide actionable insights. Write with confidence, clarity, and strategic depth."

OPENAI_USER="You are an elite brand storyteller creating a compelling executive intelligence report.

**Brand**: $BRAND_NAME

**Available Data**:

**Indexed Data (Gemini)**:
$GEMINI_DATA

**Deep Research (Perplexity)**:
$PERPLEXITY_DATA

**Strategic Analysis (Claude)**:
$CLAUDE_DATA

**Your Mission**: Create a compelling 9-section brand intelligence report.

Create a markdown report with these 9 sections:
1. BRAND OVERVIEW (200-300 words)
2. BRAND CHRONICLE (400-500 words)
3. BRAND DNA (300-400 words)
4. COMPETITIVE ANALYSIS (400-500 words)
5. STRATEGIC INSIGHTS (400-500 words)
6. CRISIS ALERTS (200-300 words)
7. TOP 5 OPPORTUNITIES (400-500 words, with revenue estimates)
8. GEOVERA RECOMMENDATIONS (300-400 words)
9. DO MORE WITH GEOVERA (200-250 words)

Use professional markdown formatting. Include specific data, statistics, and insights from the research. Make it compelling and actionable.

OUTPUT: Provide ONLY the complete markdown report."

curl -s https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer ${OPENAI_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"system\",\"content\":$(echo "$OPENAI_SYSTEM" | jq -Rs .)},{\"role\":\"user\",\"content\":$(echo "$OPENAI_USER" | jq -Rs .)}],\"temperature\":0.7,\"max_tokens\":8000}" \
  | jq -r '.choices[0].message.content' > "$OUTPUT_DIR/step4_openai_report.md"

echo "✅ Step 4 Complete - Saved to: $OUTPUT_DIR/step4_openai_report.md"
echo ""
echo "📊 Final Report Length: $(wc -w < "$OUTPUT_DIR/step4_openai_report.md") words"
echo ""

echo "🎉 All 4 Steps Completed Successfully!"
echo "======================================"
echo ""
echo "📁 Output Files:"
echo "  1. $OUTPUT_DIR/step1_gemini.json"
echo "  2. $OUTPUT_DIR/step2_perplexity.txt"
echo "  3. $OUTPUT_DIR/step3_claude.json"
echo "  4. $OUTPUT_DIR/step4_openai_report.md"
echo ""
echo "📄 Final Report: $OUTPUT_DIR/step4_openai_report.md"
echo ""
