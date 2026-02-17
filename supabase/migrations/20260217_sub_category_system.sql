-- ============================================================================
-- SUB-CATEGORY FOCUS SYSTEM
-- ============================================================================
-- Purpose: Enable smart product filtering within broad categories
-- Example: Coca-Cola vs Pepsi (makes sense), NOT Coca-Cola vs Chipotle!
-- Date: February 17, 2026
-- ============================================================================

-- ============================================================================
-- 1. CREATE SUB-CATEGORIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gv_sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID, -- Will reference gv_categories when that table exists
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  active BOOLEAN DEFAULT true,
  creator_count INTEGER DEFAULT 0,
  brand_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sub_categories_category ON gv_sub_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_sub_categories_slug ON gv_sub_categories(slug);
CREATE INDEX IF NOT EXISTS idx_sub_categories_active ON gv_sub_categories(active);

-- ============================================================================
-- 2. ADD SUB-CATEGORY FIELDS TO BRANDS
-- ============================================================================

-- Add sub-category tracking to brands
ALTER TABLE gv_brands
ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES gv_sub_categories(id),
ADD COLUMN IF NOT EXISTS sub_category_confidence DECIMAL(3,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS sub_category_detected_by TEXT CHECK (sub_category_detected_by IN ('auto', 'keyword_match', 'perplexity_ai', 'manual'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_brands_sub_category ON gv_brands(sub_category_id);

-- ============================================================================
-- 3. INSERT FOOD & BEVERAGE SUB-CATEGORIES
-- ============================================================================

-- Note: category_id will be NULL until gv_categories table is created
-- These can be updated later with proper foreign keys

INSERT INTO gv_sub_categories (name, slug, keywords, description) VALUES
(
  'Beverages',
  'beverages',
  ARRAY[
    'cola', 'soda', 'soft drink', 'drink', 'water', 'juice', 'tea', 'coffee',
    'energy', 'energy drink', 'gatorade', 'sprite', 'pepsi', 'coca', 'aqua',
    'pocari', 'fanta', 'minute maid', 'powerade', 'red bull', 'monster',
    'refreshing', 'beverage', 'teh botol', 'kopi', 'latte', 'bubble tea',
    'boba', 'smoothie', 'milkshake', 'isotonic'
  ],
  'Soft drinks, energy drinks, water, juice, and other beverages'
),
(
  'Fast Food',
  'fast_food',
  ARRAY[
    'burger', 'pizza', 'chicken', 'mcdonald', 'kfc', 'sandwich', 'chipotle',
    'subway', 'wendy', 'taco', 'burger king', 'pizza hut', 'domino',
    'fried chicken', 'fast food', 'quick service', 'drive thru', 'takeaway',
    'delivery', 'jollibee', 'popeyes', 'chick-fil-a', 'five guys'
  ],
  'Fast food restaurants, burgers, pizza, and fried chicken'
),
(
  'Snacks',
  'snacks',
  ARRAY[
    'chips', 'chocolate', 'candy', 'oreo', 'lay', 'lays', 'doritos',
    'snickers', 'kitkat', 'snack', 'crisp', 'cookie', 'biscuit',
    'cheetos', 'pringles', 'ruffles', 'twix', 'mars', 'milky way',
    'skittles', 'haribo', 'gummy', 'popcorn', 'pretzel', 'crackers'
  ],
  'Chips, chocolate, candy, cookies, and packaged snacks'
),
(
  'Coffee & Tea',
  'coffee_tea',
  ARRAY[
    'coffee', 'tea', 'starbucks', 'kopi', 'teh', 'latte', 'espresso',
    'cappuccino', 'mocha', 'cafe', 'coffeeshop', 'barista', 'brew',
    'arabica', 'robusta', 'matcha', 'green tea', 'black tea', 'iced tea',
    'kopi kenangan', 'janji jiwa', 'fore coffee'
  ],
  'Coffee shops, tea brands, and specialty beverages'
),
(
  'Packaged Foods',
  'packaged_foods',
  ARRAY[
    'noodles', 'indomie', 'sedaap', 'frozen', 'instant', 'packaged',
    'ramen', 'pasta', 'cereal', 'canned', 'ready to eat', 'microwaveable',
    'instant noodles', 'cup noodles', 'frozen food', 'processed food',
    'rice', 'bread', 'sauce', 'condiment', 'soup', 'meal kit'
  ],
  'Instant noodles, frozen foods, packaged meals, and groceries'
);

-- ============================================================================
-- 4. INSERT BEAUTY & SKINCARE SUB-CATEGORIES
-- ============================================================================

INSERT INTO gv_sub_categories (name, slug, keywords, description) VALUES
(
  'Skincare',
  'skincare',
  ARRAY[
    'skincare', 'skin care', 'moisturizer', 'cleanser', 'serum', 'toner',
    'sunscreen', 'spf', 'cream', 'lotion', 'face wash', 'facial', 'mask',
    'anti aging', 'acne', 'brightening', 'hydrating', 'exfoliant',
    'wardah', 'somethinc', 'skin1004', 'skintific', 'avoskin', 'npure'
  ],
  'Moisturizers, cleansers, serums, and facial skincare products'
),
(
  'Makeup',
  'makeup',
  ARRAY[
    'makeup', 'cosmetic', 'lipstick', 'foundation', 'eyeshadow', 'mascara',
    'eyeliner', 'blush', 'powder', 'concealer', 'lip gloss', 'lip tint',
    'beauty', 'cosmetics', 'maybelline', 'nyx', 'emina', 'makeover',
    'revlon', 'mac', 'urban decay', 'fenty'
  ],
  'Lipstick, foundation, eyeshadow, and decorative cosmetics'
),
(
  'Haircare',
  'haircare',
  ARRAY[
    'shampoo', 'conditioner', 'hair', 'haircare', 'hair care', 'styling',
    'hair oil', 'hair mask', 'treatment', 'pantene', 'dove', 'tresemme',
    'herbal essences', 'head and shoulders', 'loreal', 'garnier',
    'hair spray', 'gel', 'mousse', 'serum'
  ],
  'Shampoo, conditioner, hair styling, and hair treatment products'
),
(
  'Personal Care',
  'personal_care',
  ARRAY[
    'deodorant', 'body wash', 'perfume', 'fragrance', 'soap', 'shower gel',
    'body lotion', 'hand cream', 'antiperspirant', 'cologne', 'body spray',
    'rexona', 'lux', 'gatsby', 'axe', 'dove', 'nivea', 'vaseline',
    'body care', 'bath', 'personal hygiene'
  ],
  'Deodorant, body wash, perfume, and personal hygiene products'
);

-- ============================================================================
-- 5. INSERT FASHION & LIFESTYLE SUB-CATEGORIES
-- ============================================================================

INSERT INTO gv_sub_categories (name, slug, keywords, description) VALUES
(
  'Apparel',
  'apparel',
  ARRAY[
    'clothing', 'clothes', 'shirt', 'pants', 'dress', 'shoes', 'sneakers',
    'jacket', 'jeans', 'hoodie', 't-shirt', 'tshirt', 'apparel', 'fashion',
    'uniqlo', 'h&m', 'hm', 'zara', 'adidas', 'nike', 'puma', 'gap',
    'forever 21', 'pull and bear', 'berska', 'levis', 'converse'
  ],
  'Clothing, shoes, accessories, and fashion apparel'
),
(
  'Bags & Luggage',
  'bags_luggage',
  ARRAY[
    'bag', 'backpack', 'luggage', 'suitcase', 'handbag', 'purse', 'wallet',
    'travel bag', 'duffle', 'tote', 'messenger', 'crossbody', 'clutch',
    'herschel', 'samsonite', 'eiger', 'jansport', 'fjallraven', 'kanken',
    'coach', 'michael kors', 'kate spade'
  ],
  'Backpacks, handbags, luggage, and travel accessories'
),
(
  'Watches & Jewelry',
  'watches_jewelry',
  ARRAY[
    'watch', 'watches', 'jewelry', 'jewellery', 'necklace', 'bracelet',
    'ring', 'earrings', 'timepiece', 'smartwatch', 'accessories',
    'casio', 'daniel wellington', 'dw', 'pandora', 'swarovski', 'fossil',
    'seiko', 'citizen', 'rolex', 'omega', 'tissot', 'tiffany'
  ],
  'Watches, jewelry, and fashion accessories'
),
(
  'Home & Living',
  'home_living',
  ARRAY[
    'home', 'furniture', 'decor', 'living', 'interior', 'homeware',
    'kitchen', 'bedroom', 'dining', 'storage', 'organization', 'lighting',
    'ikea', 'muji', 'informa', 'ace hardware', 'dekoruma', 'fabelio',
    'the home depot', 'bed bath beyond', 'crate and barrel'
  ],
  'Furniture, home decor, and living essentials'
);

-- ============================================================================
-- 6. INSERT TECHNOLOGY & GADGETS SUB-CATEGORIES
-- ============================================================================

INSERT INTO gv_sub_categories (name, slug, keywords, description) VALUES
(
  'Smartphones & Tablets',
  'smartphones_tablets',
  ARRAY[
    'smartphone', 'phone', 'mobile', 'tablet', 'ipad', 'iphone', 'android',
    'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'huawei', 'galaxy',
    'pixel', 'oneplus', 'poco', 'redmi', 'mi', 'note', 'pro', 'ultra'
  ],
  'Smartphones, tablets, and mobile devices'
),
(
  'Laptops & Computers',
  'laptops_computers',
  ARRAY[
    'laptop', 'computer', 'pc', 'desktop', 'macbook', 'notebook', 'ultrabook',
    'gaming laptop', 'workstation', 'chromebook', 'asus', 'dell', 'hp',
    'lenovo', 'acer', 'apple', 'msi', 'razer', 'alienware', 'surface',
    'thinkpad', 'vivobook', 'zenbook'
  ],
  'Laptops, desktops, and computing devices'
),
(
  'Audio',
  'audio',
  ARRAY[
    'headphones', 'earphones', 'earbuds', 'speaker', 'audio', 'sound',
    'wireless', 'bluetooth', 'airpods', 'buds', 'sony', 'jbl', 'bose',
    'beats', 'sennheiser', 'marshall', 'harman kardon', 'ultimate ears',
    'soundbar', 'home theater', 'tws', 'noise cancelling', 'anc'
  ],
  'Headphones, speakers, and audio equipment'
),
(
  'Smart Home & Wearables',
  'smart_home_wearables',
  ARRAY[
    'smart home', 'smartwatch', 'wearable', 'fitness tracker', 'smart speaker',
    'voice assistant', 'iot', 'connected', 'alexa', 'google home', 'nest',
    'apple watch', 'fitbit', 'garmin', 'samsung watch', 'galaxy watch',
    'mi band', 'amazfit', 'huawei band', 'smart bulb', 'smart plug'
  ],
  'Smart home devices, wearables, and IoT products'
);

-- ============================================================================
-- 7. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to update sub-category counts
CREATE OR REPLACE FUNCTION update_sub_category_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update brand count for old sub-category
  IF (TG_OP = 'UPDATE' AND OLD.sub_category_id IS NOT NULL) THEN
    UPDATE gv_sub_categories
    SET brand_count = (
      SELECT COUNT(*) FROM gv_brands
      WHERE sub_category_id = OLD.sub_category_id AND is_active = true
    ),
    updated_at = NOW()
    WHERE id = OLD.sub_category_id;
  END IF;

  -- Update brand count for new sub-category
  IF (NEW.sub_category_id IS NOT NULL) THEN
    UPDATE gv_sub_categories
    SET brand_count = (
      SELECT COUNT(*) FROM gv_brands
      WHERE sub_category_id = NEW.sub_category_id AND is_active = true
    ),
    updated_at = NOW()
    WHERE id = NEW.sub_category_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic count updates
DROP TRIGGER IF EXISTS trigger_update_sub_category_counts ON gv_brands;
CREATE TRIGGER trigger_update_sub_category_counts
  AFTER INSERT OR UPDATE OF sub_category_id ON gv_brands
  FOR EACH ROW
  EXECUTE FUNCTION update_sub_category_counts();

-- ============================================================================
-- 8. ENABLE RLS (Row Level Security)
-- ============================================================================

ALTER TABLE gv_sub_categories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read sub-categories
CREATE POLICY "Allow authenticated users to read sub-categories"
  ON gv_sub_categories
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Allow service role to manage sub-categories
CREATE POLICY "Allow service role to manage sub-categories"
  ON gv_sub_categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE gv_sub_categories IS 'Sub-categories for focused product filtering within broad categories';
COMMENT ON COLUMN gv_sub_categories.keywords IS 'Keywords for automatic brand sub-category detection';
COMMENT ON COLUMN gv_sub_categories.creator_count IS 'Number of creators tagged with this sub-category';
COMMENT ON COLUMN gv_sub_categories.brand_count IS 'Number of brands in this sub-category';

COMMENT ON COLUMN gv_brands.sub_category_id IS 'Detected sub-category for focused monitoring';
COMMENT ON COLUMN gv_brands.sub_category_confidence IS 'Confidence score (0-1) of sub-category detection';
COMMENT ON COLUMN gv_brands.sub_category_detected_by IS 'Method used to detect sub-category: keyword_match, perplexity_ai, or manual';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
