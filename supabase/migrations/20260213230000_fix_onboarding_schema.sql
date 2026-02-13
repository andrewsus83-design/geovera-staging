-- ============================================================
-- Migration: Fix Onboarding Schema
-- Date: 2026-02-13 23:00:00
-- Purpose: Add missing social media columns to brands table
--          and fix onboarding-related tables
-- ============================================================

-- ============================================================
-- 1. Add social media URL columns to brands table
-- ============================================================
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Add comments for clarity
COMMENT ON COLUMN brands.instagram_url IS 'Instagram profile URL (collected during onboarding Step 2)';
COMMENT ON COLUMN brands.tiktok_url IS 'TikTok profile URL (collected during onboarding Step 2)';
COMMENT ON COLUMN brands.youtube_url IS 'YouTube channel URL (collected during onboarding Step 2)';
COMMENT ON COLUMN brands.facebook_url IS 'Facebook page URL (collected during onboarding Step 2)';

-- ============================================================
-- 2. Ensure gv_brand_confirmations table exists with correct schema
-- ============================================================
CREATE TABLE IF NOT EXISTS gv_brand_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  confirmed_brand_name VARCHAR(255) NOT NULL,
  confirmed_category TEXT NOT NULL,
  confirmed_tier TEXT,
  confirmed_billing_cycle VARCHAR(20),
  understood_30day_lock BOOLEAN DEFAULT false,
  confirmation_text TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gv_brand_confirmations_brand_id
  ON gv_brand_confirmations(brand_id);
CREATE INDEX IF NOT EXISTS idx_gv_brand_confirmations_user_id
  ON gv_brand_confirmations(user_id);

COMMENT ON TABLE gv_brand_confirmations IS 'Stores user confirmation records during onboarding Step 4';

-- ============================================================
-- 3. Ensure gv_onboarding_email_queue table uses correct FK
-- ============================================================
-- Drop old FK constraint if exists (pointing to gv_brands)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'gv_onboarding_email_queue_brand_id_fkey'
      AND table_name = 'gv_onboarding_email_queue'
  ) THEN
    ALTER TABLE gv_onboarding_email_queue
      DROP CONSTRAINT gv_onboarding_email_queue_brand_id_fkey;
  END IF;
END $$;

-- Add correct FK constraint (pointing to brands)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'gv_onboarding_email_queue_brand_id_fk_brands'
      AND table_name = 'gv_onboarding_email_queue'
  ) THEN
    ALTER TABLE gv_onboarding_email_queue
      ADD CONSTRAINT gv_onboarding_email_queue_brand_id_fk_brands
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================
-- 4. Ensure user_brands table has correct structure
-- ============================================================
-- Add role column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_brands' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_brands ADD COLUMN role TEXT NOT NULL DEFAULT 'viewer';
  END IF;
END $$;

COMMENT ON COLUMN user_brands.role IS 'User role for brand: owner, editor, viewer';

-- ============================================================
-- 5. Add helper function to check if user already owns a brand
-- ============================================================
CREATE OR REPLACE FUNCTION user_owns_brand(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_brands
    WHERE user_id = p_user_id AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION user_owns_brand IS 'Returns true if user already owns a brand (business rule: 1 brand per user)';

-- ============================================================
-- 6. Grant necessary permissions
-- ============================================================
-- Allow authenticated users to insert/update their own brand data
GRANT SELECT, INSERT, UPDATE ON brands TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_brands TO authenticated;
GRANT SELECT, INSERT ON gv_brand_confirmations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON gv_onboarding_email_queue TO authenticated;

-- ============================================================
-- Migration complete
-- ============================================================
