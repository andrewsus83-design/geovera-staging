# 🎯 SUB-CATEGORY FOCUS SYSTEM
## Smart Product Filtering Within Categories

**Date**: February 17, 2026
**Purpose**: Focus monitoring on relevant products within broad categories
**Goal**: Coca-Cola vs Pepsi (makes sense), NOT Coca-Cola vs Chipotle (nonsense)!

---

## 💡 THE PROBLEM

### **Current System** (Too Broad):
```
Category: Food & Beverage
├─ ALL F&B brands mixed together
└─ Coca-Cola ranked against Chipotle ❌ (doesn't make sense!)
```

### **Better System** (Sub-Category Focus):
```
Category: Food & Beverage
├─ Sub-Category: Beverages
│   ├─ Coca-Cola
│   ├─ Pepsi
│   ├─ Gatorade
│   └─ Sprite
└─ Sub-Category: Fast Food
    ├─ McDonald's
    ├─ Chipotle
    └─ KFC
```

**When Coca-Cola joins**: Machine focuses on **Beverages sub-category**, NOT entire F&B!

---

## 📊 SUB-CATEGORY STRUCTURE

### **4 Main Categories** (Unchanged):
1. **Food & Beverage**
2. **Beauty & Skincare**
3. **Fashion & Lifestyle**
4. **Technology & Gadgets**

### **Sub-Categories Within Each**:

#### **1. Food & Beverage**:
```
├─ Beverages (Soft Drinks, Energy Drinks, Water)
│   Examples: Coca-Cola, Pepsi, Gatorade, Red Bull, Aqua
│
├─ Fast Food (Burgers, Pizza, Chicken)
│   Examples: McDonald's, KFC, Pizza Hut, Burger King
│
├─ Snacks (Chips, Chocolate, Candy)
│   Examples: Lay's, Oreo, Snickers, Doritos
│
├─ Coffee & Tea
│   Examples: Starbucks, Kopi Kenangan, Teh Botol Sosro
│
└─ Packaged Foods (Instant Noodles, Frozen Foods)
    Examples: Indomie, Sedaap, Walls
```

#### **2. Beauty & Skincare**:
```
├─ Skincare (Moisturizers, Cleansers, Serums)
│   Examples: Wardah, Somethinc, Skin1004
│
├─ Makeup (Lipstick, Foundation, Eyeshadow)
│   Examples: Maybelline, NYX, Emina
│
├─ Haircare (Shampoo, Conditioner, Styling)
│   Examples: Pantene, Dove, TRESemmé
│
└─ Personal Care (Deodorant, Body Wash, Perfume)
    Examples: Rexona, Lux, Gatsby
```

#### **3. Fashion & Lifestyle**:
```
├─ Apparel (Clothing, Shoes, Accessories)
│   Examples: Uniqlo, H&M, Zara, Adidas
│
├─ Bags & Luggage
│   Examples: Herschel, Samsonite, Eiger
│
├─ Watches & Jewelry
│   Examples: Casio, Daniel Wellington, Pandora
│
└─ Home & Living
    Examples: IKEA, Muji, Informa
```

#### **4. Technology & Gadgets**:
```
├─ Smartphones & Tablets
│   Examples: Samsung, iPhone, Xiaomi
│
├─ Laptops & Computers
│   Examples: Asus, Dell, Apple MacBook
│
├─ Audio (Headphones, Speakers)
│   Examples: Sony, JBL, AirPods
│
└─ Smart Home & Wearables
    Examples: Google Home, Apple Watch, Fitbit
```

---

## 🎯 SUB-CATEGORY FOCUS LOGIC

### **When Coca-Cola Joins**:

```
Brand: Coca-Cola
Category: Food & Beverage
Sub-Category: Beverages ← AUTO-DETECTED!

System Behavior:
1. ✅ Monitor ALL 4 categories (unchanged)
2. ✅ Focus F&B on "Beverages" sub-category
3. ✅ Compare Coca-Cola vs Pepsi, Gatorade (makes sense!)
4. ❌ Exclude Chipotle, McDonald's (different sub-category)
```

### **Resource Allocation**:

```
BEFORE Coca-Cola joins:
├─ F&B Category: 25% resources
│   ├─ Beverages: 5%
│   ├─ Fast Food: 5%
│   ├─ Snacks: 5%
│   ├─ Coffee & Tea: 5%
│   └─ Packaged Foods: 5%
│
└─ Other 3 categories: 75% resources (25% each)

AFTER Coca-Cola joins (Beverages):
├─ F&B Category: 50% resources
│   ├─ Beverages: 40% ← FOCUS HERE! (Coca-Cola)
│   ├─ Fast Food: 2.5% (reduced)
│   ├─ Snacks: 2.5% (reduced)
│   ├─ Coffee & Tea: 2.5% (reduced)
│   └─ Packaged Foods: 2.5% (reduced)
│
└─ Other 3 categories: 50% resources (16.7% each)
```

**Result**: Coca-Cola gets deep beverage insights, not mixed F&B!

---

## 🔍 AUTO SUB-CATEGORY DETECTION

### **Method 1: Brand Name Analysis** (Primary):

```typescript
async function detectSubCategory(brandName: string, category: string) {
  // Beverage keywords
  const beverageKeywords = [
    'cola', 'soda', 'drink', 'water', 'juice', 'tea', 'coffee',
    'energy', 'gatorade', 'sprite', 'pepsi', 'aqua'
  ];

  // Fast food keywords
  const fastFoodKeywords = [
    'burger', 'pizza', 'chicken', 'mcdonald', 'kfc', 'sandwich',
    'chipotle', 'subway', 'wendys'
  ];

  // Snacks keywords
  const snacksKeywords = [
    'chips', 'chocolate', 'candy', 'oreo', 'lay', 'doritos',
    'snickers', 'kitkat', 'snack'
  ];

  const lowerName = brandName.toLowerCase();

  if (beverageKeywords.some(kw => lowerName.includes(kw))) {
    return 'beverages';
  }
  if (fastFoodKeywords.some(kw => lowerName.includes(kw))) {
    return 'fast_food';
  }
  if (snacksKeywords.some(kw => lowerName.includes(kw))) {
    return 'snacks';
  }

  // Default: ask Perplexity
  return await perplexityDetectSubCategory(brandName, category);
}
```

---

### **Method 2: Perplexity Research** (Fallback):

```typescript
async function perplexityDetectSubCategory(
  brandName: string,
  category: string
): Promise<string> {
  const prompt = `
    Brand: "${brandName}"
    Category: "${category}"

    What specific sub-category does this brand belong to?
    Choose ONE from: ${SUB_CATEGORIES[category].join(', ')}

    Answer with ONLY the sub-category name, nothing else.
  `;

  const response = await perplexity.query(prompt);
  return response.trim().toLowerCase().replace(/ /g, '_');
}
```

**Cost**: $0.005 per brand (one-time detection)

---

### **Method 3: User Selection** (Manual Override):

During brand onboarding:
```typescript
// Frontend form
<Select label="Product Category">
  <Option value="beverages">Beverages (Soft Drinks, Energy Drinks)</Option>
  <Option value="fast_food">Fast Food (Burgers, Pizza, Chicken)</Option>
  <Option value="snacks">Snacks (Chips, Chocolate, Candy)</Option>
  <Option value="coffee_tea">Coffee & Tea</Option>
  <Option value="packaged_foods">Packaged Foods (Noodles, Frozen)</Option>
</Select>
```

User can override if auto-detection is wrong!

---

## 📊 SUB-CATEGORY MONITORING

### **Coca-Cola Example** (Beverages Sub-Category):

```
CATEGORY: Food & Beverage (50% resources allocated)

SUB-CATEGORY FOCUS: Beverages (40% of F&B resources)

MONITORED BRANDS IN BEVERAGES:
├─ Coca-Cola (YOUR BRAND) ⭐⭐⭐⭐⭐
├─ Pepsi (Competitor #1)
├─ Sprite (Competitor #2)
├─ Fanta (Competitor #3)
├─ Gatorade (Competitor #4)
├─ Red Bull (Competitor #5)
├─ Aqua (Competitor #6)
├─ Pocari Sweat (Competitor #7)
├─ Teh Botol Sosro (Competitor #8)
└─ ... (more beverage brands)

EXCLUDED FROM COMPARISON:
❌ McDonald's (Fast Food sub-category)
❌ KFC (Fast Food sub-category)
❌ Lay's (Snacks sub-category)
❌ Indomie (Packaged Foods sub-category)
❌ Starbucks (Coffee & Tea sub-category)
```

**Result**: Coca-Cola competes ONLY with relevant beverage brands!

---

## 🎯 CREATOR FILTERING BY SUB-CATEGORY

### **450 Creators in F&B Category**:

When Coca-Cola joins:
```
BEFORE (Broad F&B):
├─ 450 F&B creators (ALL types)
│   ├─ 100 beverage creators
│   ├─ 100 fast food creators
│   ├─ 100 snacks creators
│   ├─ 75 coffee/tea creators
│   └─ 75 packaged food creators
│
└─ Coca-Cola sees ALL 450 (too broad!)

AFTER (Beverages Focus):
├─ 450 F&B creators (still monitored for authority)
│   But Coca-Cola dashboard shows:
│   ├─ 100 beverage creators ⭐⭐⭐⭐⭐ (FOCUS)
│   └─ 350 other F&B creators (background data)
│
└─ Coca-Cola sees RELEVANT 100 beverage creators!
```

### **Creator Ranking for Coca-Cola**:

```
TOP 10 CREATORS FOR COCA-COLA (Beverages):
1. @DrinkReviewer (Beverage reviewer, 2M followers)
2. @CocaColaIndonesia (Official brand account)
3. @SoftDrinkLover (Beverage enthusiast)
4. @BeverageTrends (Industry news)
5. @CocaColaVsPepsi (Comparison content)
6. @DrinkChallenges (Taste tests)
7. @RefreshingDrinks (Lifestyle creator)
8. @EnergyDrinksFan (Energy drink focus, includes Coke Energy)
9. @SummerDrinks (Seasonal beverage content)
10. @BubblySoda (Carbonated drinks)

EXCLUDED:
❌ @FastFoodReviews (Fast Food sub-category)
❌ @ChipsTasting (Snacks sub-category)
```

**Much more relevant!** 🎯

---

## 💰 SUB-CATEGORY COST IMPACT

### **Does Sub-Category Filtering Cost More?**

**NO! Same fixed cost** ($1,345.16/month)

**Why?**
- Still monitor ALL 450 creators in F&B (for authority)
- Just FILTER dashboard view for Coca-Cola
- Ranking algorithm focuses on beverage subset
- Variable cost unchanged: $1.80 per brand

**Example**:
```
Fixed Cost (F&B Category): $819.20/month
├─ Monitor 450 creators (ALL sub-categories)
├─ Generate 1,500 QA pairs (ALL sub-categories)
└─ Track 500 topics (ALL sub-categories)

Variable Cost (Coca-Cola): $1.80
├─ Filter to 100 beverage creators
├─ Rank against beverage competitors
└─ Personalized beverage insights

Total: $819.20 + $1.80 = $821.00
(Same as before, just smarter filtering!)
```

---

## 📊 DATABASE SCHEMA UPDATES

### **Add Sub-Category Support**:

```sql
-- Add sub_category to brands
ALTER TABLE gv_brands
ADD COLUMN sub_category TEXT,
ADD COLUMN sub_category_confidence DECIMAL(3,2) DEFAULT 1.00,
ADD COLUMN sub_category_detected_by TEXT; -- 'auto', 'perplexity', 'manual'

-- Add sub_category to creators
ALTER TABLE gv_sso_creators
ADD COLUMN sub_categories TEXT[], -- Array: can belong to multiple
ADD COLUMN primary_sub_category TEXT;

-- Create sub_categories table
CREATE TABLE gv_sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES gv_categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  keywords TEXT[],
  description TEXT,
  active BOOLEAN DEFAULT true,
  creator_count INTEGER DEFAULT 0,
  brand_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert F&B sub-categories
INSERT INTO gv_sub_categories (category_id, name, slug, keywords) VALUES
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Beverages',
  'beverages',
  ARRAY['cola', 'soda', 'drink', 'water', 'juice', 'energy', 'gatorade', 'sprite', 'pepsi']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Fast Food',
  'fast_food',
  ARRAY['burger', 'pizza', 'chicken', 'mcdonald', 'kfc', 'sandwich', 'chipotle']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Snacks',
  'snacks',
  ARRAY['chips', 'chocolate', 'candy', 'oreo', 'lay', 'doritos', 'snickers']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Coffee & Tea',
  'coffee_tea',
  ARRAY['coffee', 'tea', 'starbucks', 'kopi', 'teh', 'latte', 'espresso']
),
(
  (SELECT id FROM gv_categories WHERE slug = 'food_beverage'),
  'Packaged Foods',
  'packaged_foods',
  ARRAY['noodles', 'indomie', 'sedaap', 'frozen', 'instant', 'packaged']
);
```

---

## 🎯 CREATOR SUB-CATEGORY TAGGING

### **Auto-Tagging Creators**:

```typescript
async function tagCreatorSubCategories() {
  // Get all F&B creators
  const creators = await supabase
    .from('gv_sso_creators')
    .select('*')
    .eq('category', 'food_beverage');

  for (const creator of creators) {
    const subCategories = [];

    // Analyze creator's content
    const recentPosts = await getCreatorRecentPosts(creator.id, 20);
    const contentText = recentPosts.map(p => p.caption).join(' ');

    // Check against each sub-category keywords
    const subCatKeywords = {
      beverages: ['cola', 'soda', 'drink', 'juice', 'sprite', 'pepsi'],
      fast_food: ['burger', 'pizza', 'mcdonald', 'kfc', 'fries'],
      snacks: ['chips', 'chocolate', 'candy', 'oreo', 'snickers'],
      coffee_tea: ['coffee', 'tea', 'latte', 'espresso', 'starbucks'],
      packaged_foods: ['noodles', 'indomie', 'instant', 'frozen']
    };

    for (const [subCat, keywords] of Object.entries(subCatKeywords)) {
      const matches = keywords.filter(kw =>
        contentText.toLowerCase().includes(kw)
      );

      if (matches.length >= 3) {
        subCategories.push(subCat);
      }
    }

    // Update creator
    await supabase
      .from('gv_sso_creators')
      .update({
        sub_categories: subCategories,
        primary_sub_category: subCategories[0] || null
      })
      .eq('id', creator.id);
  }
}
```

**Cost**: $0 (uses existing content data, no API calls)

---

## 🔍 FILTERED DASHBOARD FOR COCA-COLA

### **What Coca-Cola Sees**:

```
┌─────────────────────────────────────────────────────────┐
│ COCA-COLA DASHBOARD                                     │
├─────────────────────────────────────────────────────────┤
│ Your Category: Food & Beverage > Beverages             │
│ Competitors in Beverages: 12 brands                     │
│ Relevant Creators: 100 (filtered from 450)             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🏆 YOUR RANKINGS (Beverages Only)                      │
├─────────────────────────────────────────────────────────┤
│ Overall Rank: #2 / 12 beverage brands                  │
│                                                          │
│ 1. Pepsi ⭐⭐⭐⭐⭐ (Ahead of you)                      │
│ 2. Coca-Cola (YOU) ⭐⭐⭐⭐                            │
│ 3. Sprite ⭐⭐⭐                                        │
│ 4. Fanta ⭐⭐⭐                                         │
│ 5. Gatorade ⭐⭐                                        │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📊 TOP BEVERAGE CREATORS FOR YOUR BRAND                │
├─────────────────────────────────────────────────────────┤
│ 1. @DrinkReviewer (2M followers) ⭐⭐⭐⭐⭐            │
│    └─ Fit: 95% (Beverage focus, high engagement)       │
│ 2. @SoftDrinkLover (1.5M) ⭐⭐⭐⭐                     │
│    └─ Fit: 92% (Coca-Cola mentions, positive sentiment)│
│ 3. @BeverageTrends (1M) ⭐⭐⭐⭐                       │
│    └─ Fit: 88% (Industry news, trend analysis)         │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🎯 BEVERAGE INSIGHTS (Your Sub-Category)               │
├─────────────────────────────────────────────────────────┤
│ • Trending: "Zero Sugar" beverages (+45% mentions)     │
│ • Competitor Move: Pepsi launched new flavor           │
│ • Creator Opportunity: @DrinkReviewer open to collab   │
│ • Market Gap: "Eco-friendly packaging" underserved     │
└─────────────────────────────────────────────────────────┘
```

**vs McDonald's Dashboard** (Fast Food sub-category):
```
McDonald's would see:
- Competitors: KFC, Pizza Hut, Burger King (NOT Coca-Cola!)
- Creators: @FastFoodReviews, @BurgerLovers (NOT @DrinkReviewer!)
- Insights: Fast food trends (NOT beverage trends!)
```

**Perfect separation!** 🎯

---

## 💡 SUB-CATEGORY QA DISTRIBUTION

### **1500 QA Pairs for F&B Category**:

```
BEFORE Coca-Cola (Broad F&B):
├─ 600 Social QA (40%) - Mixed F&B topics
├─ 500 GEO QA (33%) - Mixed F&B topics
└─ 400 SEO QA (27%) - Mixed F&B keywords

AFTER Coca-Cola joins (Beverages Focus):
├─ 600 Social QA (40%)
│   ├─ 400 QA focused on Beverages (67%)
│   └─ 200 QA other F&B topics (33%)
│
├─ 500 GEO QA (33%)
│   ├─ 333 QA focused on Beverages (67%)
│   └─ 167 QA other F&B topics (33%)
│
└─ 400 SEO QA (27%)
    ├─ 267 QA focused on Beverages (67%)
    └─ 133 QA other F&B topics (33%)

Total Beverage QA: 1,000 / 1,500 (67%)
Total Other F&B QA: 500 / 1,500 (33%)
```

**Result**: Coca-Cola gets 1,000 beverage-specific QA pairs!

---

## ✅ IMPLEMENTATION CHECKLIST

### **Database**:
- [ ] Add `sub_category` to `gv_brands`
- [ ] Add `sub_categories` array to `gv_sso_creators`
- [ ] Create `gv_sub_categories` table
- [ ] Insert initial sub-categories for all 4 main categories
- [ ] Create sub-category detection function

### **Processing Logic**:
- [ ] Auto-detect sub-category on brand creation
- [ ] Tag creators with sub-categories (one-time migration)
- [ ] Filter creator rankings by sub-category
- [ ] Focus QA generation on client sub-categories
- [ ] Update dashboard to show sub-category insights

### **Frontend**:
- [ ] Add sub-category selector in brand onboarding
- [ ] Show sub-category in brand dashboard
- [ ] Filter competitors by sub-category
- [ ] Filter creators by sub-category
- [ ] Display sub-category-specific insights

---

## 🎉 SUMMARY

**SUB-CATEGORY FOCUS = RELEVANT COMPARISONS!**

### **The Improvement**:
- ❌ **Before**: Coca-Cola vs Chipotle (nonsense!)
- ✅ **After**: Coca-Cola vs Pepsi, Gatorade, Sprite (makes sense!)

### **How It Works**:
1. Auto-detect brand sub-category (Beverages, Fast Food, etc.)
2. Focus monitoring on relevant sub-category
3. Filter dashboard to show relevant competitors
4. Rank creators by sub-category relevance
5. Generate sub-category-specific insights

### **Cost Impact**:
- **NO EXTRA COST!** ($1,345.16 fixed + $1.80 variable)
- Still monitor ALL 450 creators (authority building)
- Just filter views for relevance
- Smart allocation, not more work!

### **Result**:
- Coca-Cola gets beverage-specific insights
- McDonald's gets fast food-specific insights
- Both in F&B category, different sub-categories
- **Much more actionable data!** 🎯

---

**Status**: ✅ Ready to Implement
**Complexity**: Medium (detection + filtering logic)
**Impact**: VERY HIGH (relevance + client satisfaction)
**Timeline**: 1-2 weeks to implement

---

**END OF SUB-CATEGORY FOCUS SYSTEM**
