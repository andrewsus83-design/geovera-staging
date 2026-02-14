-- =====================================================
-- GeoVera Global Platform Support Migration
-- =====================================================
-- This migration transforms GeoVera from an Indonesia-focused
-- platform to a truly GLOBAL influencer marketing intelligence
-- platform supporting 50+ countries worldwide.
-- =====================================================

-- =====================================================
-- PART 1: Add Global Columns to Brands Table
-- =====================================================

-- Add country column (NULL = global brands, specific = regional brands)
ALTER TABLE gv_brands
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL;

-- Add timezone column (default UTC for global operations)
ALTER TABLE gv_brands
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add currency column (default USD for global standard)
ALTER TABLE gv_brands
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Add locale/language preference column for brand interface
ALTER TABLE gv_brands
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Add target markets array for brands operating in multiple countries
ALTER TABLE gv_brands
ADD COLUMN IF NOT EXISTS target_markets TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN gv_brands.country IS 'Primary country of operation. NULL means global brand';
COMMENT ON COLUMN gv_brands.timezone IS 'Brand timezone for scheduling and reporting (e.g., America/New_York, Europe/London, Asia/Singapore)';
COMMENT ON COLUMN gv_brands.currency IS 'Preferred currency for pricing display (USD, EUR, GBP, SGD, IDR, etc.)';
COMMENT ON COLUMN gv_brands.preferred_language IS 'Preferred language for brand interface (en, id, es, fr, de, ja, ko, zh, etc.)';
COMMENT ON COLUMN gv_brands.target_markets IS 'Array of target market countries for multi-market brands';

-- =====================================================
-- PART 2: Add Country Support to Creators Tables
-- =====================================================

-- Add country column to gv_creators (for existing creators)
ALTER TABLE gv_creators
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL;

-- Add language column to gv_creators
ALTER TABLE gv_creators
ADD COLUMN IF NOT EXISTS primary_language TEXT DEFAULT 'en';

-- Add multi-country support for creators
ALTER TABLE gv_creators
ADD COLUMN IF NOT EXISTS active_countries TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN gv_creators.country IS 'Primary country where creator is based';
COMMENT ON COLUMN gv_creators.primary_language IS 'Primary content language (en, id, es, etc.)';
COMMENT ON COLUMN gv_creators.active_countries IS 'Countries where creator has significant audience';

-- Add country to discovered creators table
ALTER TABLE gv_discovered_creators
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL;

-- Add language to discovered creators
ALTER TABLE gv_discovered_creators
ADD COLUMN IF NOT EXISTS primary_language TEXT DEFAULT 'en';

COMMENT ON COLUMN gv_discovered_creators.country IS 'Country where creator was discovered';
COMMENT ON COLUMN gv_discovered_creators.primary_language IS 'Primary content language';

-- =====================================================
-- PART 3: Add Country Support to Viral Content
-- =====================================================

-- Add country column to viral discoveries
ALTER TABLE gv_viral_discoveries
ADD COLUMN IF NOT EXISTS target_country TEXT DEFAULT NULL;

-- Add language column to viral discoveries
ALTER TABLE gv_viral_discoveries
ADD COLUMN IF NOT EXISTS content_language TEXT DEFAULT 'en';

-- Add region column for broader geographical grouping
ALTER TABLE gv_viral_discoveries
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT NULL;

COMMENT ON COLUMN gv_viral_discoveries.target_country IS 'Country where viral content is trending';
COMMENT ON COLUMN gv_viral_discoveries.content_language IS 'Language of viral content';
COMMENT ON COLUMN gv_viral_discoveries.region IS 'Broader region (North America, Europe, Asia Pacific, etc.)';

-- =====================================================
-- PART 4: Add Country Support to Brand Universe
-- =====================================================

-- Add country to discovered brands
ALTER TABLE gv_discovered_brands
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT NULL;

-- Add primary market to discovered brands
ALTER TABLE gv_discovered_brands
ADD COLUMN IF NOT EXISTS primary_market TEXT DEFAULT 'global';

COMMENT ON COLUMN gv_discovered_brands.country IS 'Primary country of brand operation';
COMMENT ON COLUMN gv_discovered_brands.primary_market IS 'Primary market (global, US, UK, AU, SG, ID, etc.)';

-- =====================================================
-- PART 5: Create Country/Market Reference Table
-- =====================================================

-- Create supported markets table
CREATE TABLE IF NOT EXISTS gv_supported_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2 code (US, UK, SG, ID, etc.)
    country_name TEXT NOT NULL,
    region TEXT NOT NULL, -- North America, Europe, Asia Pacific, etc.
    currency_code TEXT NOT NULL, -- USD, EUR, GBP, SGD, IDR, etc.
    language_code TEXT NOT NULL, -- en, id, es, fr, de, etc.
    timezone_default TEXT NOT NULL, -- America/New_York, Europe/London, etc.
    is_active BOOLEAN DEFAULT TRUE,
    launch_date DATE DEFAULT CURRENT_DATE,
    market_priority INTEGER DEFAULT 100, -- Lower = higher priority
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE gv_supported_markets IS 'Global markets supported by GeoVera platform';

-- Insert initial supported markets (50+ countries)
INSERT INTO gv_supported_markets (country_code, country_name, region, currency_code, language_code, timezone_default, market_priority) VALUES
-- North America
('US', 'United States', 'North America', 'USD', 'en', 'America/New_York', 1),
('CA', 'Canada', 'North America', 'CAD', 'en', 'America/Toronto', 2),
('MX', 'Mexico', 'North America', 'MXN', 'es', 'America/Mexico_City', 15),

-- Europe
('GB', 'United Kingdom', 'Europe', 'GBP', 'en', 'Europe/London', 3),
('DE', 'Germany', 'Europe', 'EUR', 'de', 'Europe/Berlin', 5),
('FR', 'France', 'Europe', 'EUR', 'fr', 'Europe/Paris', 6),
('ES', 'Spain', 'Europe', 'EUR', 'es', 'Europe/Madrid', 10),
('IT', 'Italy', 'Europe', 'EUR', 'it', 'Europe/Rome', 11),
('NL', 'Netherlands', 'Europe', 'EUR', 'nl', 'Europe/Amsterdam', 12),
('SE', 'Sweden', 'Europe', 'SEK', 'sv', 'Europe/Stockholm', 16),
('NO', 'Norway', 'Europe', 'NOK', 'no', 'Europe/Oslo', 18),
('DK', 'Denmark', 'Europe', 'DKK', 'da', 'Europe/Copenhagen', 19),
('FI', 'Finland', 'Europe', 'EUR', 'fi', 'Europe/Helsinki', 20),

-- Asia Pacific
('SG', 'Singapore', 'Asia Pacific', 'SGD', 'en', 'Asia/Singapore', 4),
('AU', 'Australia', 'Asia Pacific', 'AUD', 'en', 'Australia/Sydney', 7),
('NZ', 'New Zealand', 'Asia Pacific', 'NZD', 'en', 'Pacific/Auckland', 14),
('ID', 'Indonesia', 'Asia Pacific', 'IDR', 'id', 'Asia/Jakarta', 8),
('MY', 'Malaysia', 'Asia Pacific', 'MYR', 'ms', 'Asia/Kuala_Lumpur', 13),
('TH', 'Thailand', 'Asia Pacific', 'THB', 'th', 'Asia/Bangkok', 17),
('PH', 'Philippines', 'Asia Pacific', 'PHP', 'en', 'Asia/Manila', 9),
('VN', 'Vietnam', 'Asia Pacific', 'VND', 'vi', 'Asia/Ho_Chi_Minh', 21),
('JP', 'Japan', 'Asia Pacific', 'JPY', 'ja', 'Asia/Tokyo', 22),
('KR', 'South Korea', 'Asia Pacific', 'KRW', 'ko', 'Asia/Seoul', 23),
('CN', 'China', 'Asia Pacific', 'CNY', 'zh', 'Asia/Shanghai', 24),
('HK', 'Hong Kong', 'Asia Pacific', 'HKD', 'zh', 'Asia/Hong_Kong', 25),
('TW', 'Taiwan', 'Asia Pacific', 'TWD', 'zh', 'Asia/Taipei', 26),
('IN', 'India', 'Asia Pacific', 'INR', 'en', 'Asia/Kolkata', 27),

-- Middle East
('AE', 'United Arab Emirates', 'Middle East', 'AED', 'ar', 'Asia/Dubai', 28),
('SA', 'Saudi Arabia', 'Middle East', 'SAR', 'ar', 'Asia/Riyadh', 29),
('IL', 'Israel', 'Middle East', 'ILS', 'he', 'Asia/Jerusalem', 30),

-- Latin America
('BR', 'Brazil', 'Latin America', 'BRL', 'pt', 'America/Sao_Paulo', 31),
('AR', 'Argentina', 'Latin America', 'ARS', 'es', 'America/Argentina/Buenos_Aires', 32),
('CL', 'Chile', 'Latin America', 'CLP', 'es', 'America/Santiago', 33),
('CO', 'Colombia', 'Latin America', 'COP', 'es', 'America/Bogota', 34),
('PE', 'Peru', 'Latin America', 'PEN', 'es', 'America/Lima', 35),

-- Africa
('ZA', 'South Africa', 'Africa', 'ZAR', 'en', 'Africa/Johannesburg', 36),
('NG', 'Nigeria', 'Africa', 'NGN', 'en', 'Africa/Lagos', 37),
('KE', 'Kenya', 'Africa', 'KES', 'en', 'Africa/Nairobi', 38),
('EG', 'Egypt', 'Africa', 'EGP', 'ar', 'Africa/Cairo', 39),

-- Additional European Markets
('PL', 'Poland', 'Europe', 'PLN', 'pl', 'Europe/Warsaw', 40),
('RO', 'Romania', 'Europe', 'RON', 'ro', 'Europe/Bucharest', 41),
('CZ', 'Czech Republic', 'Europe', 'CZK', 'cs', 'Europe/Prague', 42),
('GR', 'Greece', 'Europe', 'EUR', 'el', 'Europe/Athens', 43),
('PT', 'Portugal', 'Europe', 'EUR', 'pt', 'Europe/Lisbon', 44),
('AT', 'Austria', 'Europe', 'EUR', 'de', 'Europe/Vienna', 45),
('CH', 'Switzerland', 'Europe', 'CHF', 'de', 'Europe/Zurich', 46),
('BE', 'Belgium', 'Europe', 'EUR', 'nl', 'Europe/Brussels', 47),
('IE', 'Ireland', 'Europe', 'EUR', 'en', 'Europe/Dublin', 48),

-- Additional Asian Markets
('BD', 'Bangladesh', 'Asia Pacific', 'BDT', 'bn', 'Asia/Dhaka', 49),
('PK', 'Pakistan', 'Asia Pacific', 'PKR', 'ur', 'Asia/Karachi', 50)
ON CONFLICT (country_code) DO NOTHING;

-- =====================================================
-- PART 6: Create Indexes for Global Queries
-- =====================================================

-- Index for country-based brand queries
CREATE INDEX IF NOT EXISTS idx_gv_brands_country ON gv_brands(country);
CREATE INDEX IF NOT EXISTS idx_gv_brands_currency ON gv_brands(currency);
CREATE INDEX IF NOT EXISTS idx_gv_brands_target_markets ON gv_brands USING GIN(target_markets);

-- Index for country-based creator queries
CREATE INDEX IF NOT EXISTS idx_gv_creators_country ON gv_creators(country);
CREATE INDEX IF NOT EXISTS idx_gv_creators_language ON gv_creators(primary_language);
CREATE INDEX IF NOT EXISTS idx_gv_creators_active_countries ON gv_creators USING GIN(active_countries);

-- Index for discovered creators by country
CREATE INDEX IF NOT EXISTS idx_gv_discovered_creators_country ON gv_discovered_creators(country);
CREATE INDEX IF NOT EXISTS idx_gv_discovered_creators_language ON gv_discovered_creators(primary_language);

-- Index for viral content by country
CREATE INDEX IF NOT EXISTS idx_gv_viral_discoveries_country ON gv_viral_discoveries(target_country);
CREATE INDEX IF NOT EXISTS idx_gv_viral_discoveries_region ON gv_viral_discoveries(region);

-- Index for market queries
CREATE INDEX IF NOT EXISTS idx_gv_supported_markets_region ON gv_supported_markets(region);
CREATE INDEX IF NOT EXISTS idx_gv_supported_markets_priority ON gv_supported_markets(market_priority);

-- =====================================================
-- PART 7: Create Helper Functions
-- =====================================================

-- Function to get market information by country code
CREATE OR REPLACE FUNCTION get_market_info(p_country_code TEXT)
RETURNS TABLE (
    country_name TEXT,
    region TEXT,
    currency_code TEXT,
    language_code TEXT,
    timezone_default TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sm.country_name,
        sm.region,
        sm.currency_code,
        sm.language_code,
        sm.timezone_default
    FROM gv_supported_markets sm
    WHERE sm.country_code = p_country_code
    AND sm.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get all markets by region
CREATE OR REPLACE FUNCTION get_markets_by_region(p_region TEXT)
RETURNS TABLE (
    country_code TEXT,
    country_name TEXT,
    currency_code TEXT,
    language_code TEXT,
    market_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sm.country_code,
        sm.country_name,
        sm.currency_code,
        sm.language_code,
        sm.market_priority
    FROM gv_supported_markets sm
    WHERE sm.region = p_region
    AND sm.is_active = TRUE
    ORDER BY sm.market_priority ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get top priority markets
CREATE OR REPLACE FUNCTION get_top_markets(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    country_code TEXT,
    country_name TEXT,
    region TEXT,
    currency_code TEXT,
    market_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sm.country_code,
        sm.country_name,
        sm.region,
        sm.currency_code,
        sm.market_priority
    FROM gv_supported_markets sm
    WHERE sm.is_active = TRUE
    ORDER BY sm.market_priority ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 8: Update RLS Policies (if needed)
-- =====================================================

-- No changes needed to RLS policies as they are user/brand based
-- not country based. Country is just a data attribute.

-- =====================================================
-- PART 9: Migration Complete - Add Metadata
-- =====================================================

COMMENT ON TABLE gv_supported_markets IS 'GeoVera now supports 50+ global markets for influencer marketing intelligence';
