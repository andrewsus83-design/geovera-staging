// ============================================================================
// SUB-CATEGORY DETECTOR TYPES
// ============================================================================
// Shared TypeScript types for sub-category detection system
// Can be imported by both Edge Functions and frontend code
// ============================================================================

/**
 * Sub-Category Database Record
 */
export interface SubCategory {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  keywords: string[];
  description: string | null;
  active: boolean;
  creator_count: number;
  brand_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Brand with Sub-Category Information
 */
export interface BrandWithSubCategory {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  sub_category_id: string | null;
  sub_category_confidence: number | null;
  sub_category_detected_by: DetectionMethod | null;
  created_at: string;
  updated_at: string;
}

/**
 * Detection Method Types
 */
export type DetectionMethod =
  | "keyword_match"   // Matched using keywords array
  | "perplexity_ai"   // Detected using Perplexity AI
  | "manual"          // User manually selected
  | "auto";           // Legacy: generic auto-detection

/**
 * Request to detect sub-category for a brand
 */
export interface SubCategoryDetectionRequest {
  brand_name: string;
  category_id?: string;
  industry?: string;
  brand_id?: string;
}

/**
 * Response from sub-category detection
 */
export interface SubCategoryDetectionResponse {
  success: boolean;
  sub_category_id?: string;
  sub_category_name?: string;
  sub_category_slug?: string;
  confidence: number;
  detection_method: DetectionMethod;
  matched_keywords?: string[];
  cost_usd?: number;
  error?: string;
}

/**
 * Keyword Match Result (Internal)
 */
export interface KeywordMatchResult {
  sub_category: SubCategory;
  matched_keywords: string[];
  confidence: number;
}

/**
 * Perplexity Detection Result (Internal)
 */
export interface PerplexityDetectionResult {
  sub_category: SubCategory;
  confidence: number;
}

/**
 * Sub-Category with Brand Count (for dashboards)
 */
export interface SubCategoryWithStats extends SubCategory {
  brand_count: number;
  creator_count: number;
  avg_confidence?: number;
  top_brands?: Array<{
    id: string;
    name: string;
    confidence: number;
  }>;
}

/**
 * Confidence Levels
 */
export enum ConfidenceLevel {
  VERY_HIGH = 0.9,  // 90%+ - Very confident
  HIGH = 0.7,       // 70%+ - High confidence, skip Perplexity
  MEDIUM = 0.5,     // 50%+ - Medium confidence
  LOW = 0.3,        // 30%+ - Low confidence
  VERY_LOW = 0.0,   // <30% - No match
}

/**
 * Detection Statistics (for monitoring)
 */
export interface DetectionStatistics {
  total_detections: number;
  keyword_matches: number;
  perplexity_calls: number;
  manual_overrides: number;
  average_confidence: number;
  keyword_match_rate: number; // percentage
  total_cost_usd: number;
}

/**
 * Sub-Category Distribution (for analytics)
 */
export interface SubCategoryDistribution {
  sub_category_id: string;
  sub_category_name: string;
  brand_count: number;
  percentage: number;
  avg_confidence: number;
}

/**
 * Validation result for sub-category assignment
 */
export interface ValidationResult {
  is_valid: boolean;
  confidence: number;
  suggestions?: SubCategory[];
  warnings?: string[];
}
