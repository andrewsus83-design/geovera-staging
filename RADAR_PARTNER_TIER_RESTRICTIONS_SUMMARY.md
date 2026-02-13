# Radar Partner Tier Restrictions - Implementation Summary

**Date:** 2026-02-13
**Status:** ✅ Complete
**Functions Updated:** 9/9

## Overview

All Radar Edge Functions have been updated to require Partner tier subscription. This ensures that advanced Radar analytics features are only available to Partner tier subscribers.

---

## Implementation Pattern

### For Functions with `brand_id` Parameter

Functions that receive a `brand_id` in the request body check the brand's subscription tier directly:

```typescript
// Get brand details and check subscription tier
const { data: brand, error: brandError } = await supabaseClient
  .from("brands")
  .select("brand_name, category, subscription_tier")
  .eq("id", brand_id)
  .single();

if (brandError || !brand) {
  return new Response(
    JSON.stringify({ success: false, error: "Brand not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Check subscription tier - Radar feature requires Partner tier
if (brand.subscription_tier !== 'partner') {
  return new Response(
    JSON.stringify({
      error: "Radar feature is only available for Partner tier subscribers",
      current_tier: brand.subscription_tier || 'none',
      required_tier: 'partner',
      upgrade_url: `${Deno.env.get("FRONTEND_URL") || 'https://geovera.xyz'}/pricing`,
      message: "Upgrade to Partner tier to access advanced Radar analytics"
    }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### For Batch Operations (No `brand_id`)

Functions that don't receive a `brand_id` look up the user's brand through `user_brands` table:

```typescript
// Check subscription tier - For batch operations, check user's brand tier
const { data: userBrands } = await supabaseClient
  .from('user_brands')
  .select('brand_id, role')
  .eq('user_id', user.id)
  .eq('role', 'owner')
  .single();

if (!userBrands) {
  return new Response(
    JSON.stringify({ error: "No brand found for user" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

const { data: brand } = await supabaseClient
  .from('brands')
  .select('subscription_tier')
  .eq('id', userBrands.brand_id)
  .single();

if (!brand || brand.subscription_tier !== 'partner') {
  return new Response(
    JSON.stringify({
      error: "Radar feature is only available for Partner tier subscribers",
      current_tier: brand?.subscription_tier || 'none',
      required_tier: 'partner',
      upgrade_url: `${Deno.env.get("FRONTEND_URL") || 'https://geovera.xyz'}/pricing`,
      message: "Upgrade to Partner tier to access advanced Radar analytics"
    }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

---

## Updated Functions

### 1. ✅ radar-discover-brands
**File:** `/supabase/functions/radar-discover-brands/index.ts`
**Type:** Brand ID-based
**Change:** Added subscription tier check after brand lookup (line ~109-126)
**Pattern:** Direct brand_id lookup

### 2. ✅ radar-discover-creators
**File:** `/supabase/functions/radar-discover-creators/index.ts`
**Type:** Batch operation
**Change:** Added user_brands lookup and subscription tier check (line ~96-136)
**Pattern:** User → user_brands → brand → subscription_tier

### 3. ✅ radar-scrape-content
**File:** `/supabase/functions/radar-scrape-content/index.ts`
**Type:** Batch operation
**Change:** Added user_brands lookup and subscription tier check (line ~317-357)
**Pattern:** User → user_brands → brand → subscription_tier

### 4. ✅ radar-scrape-serpapi
**File:** `/supabase/functions/radar-scrape-serpapi/index.ts`
**Type:** Batch operation
**Change:** Added user_brands lookup and subscription tier check (line ~460-500)
**Pattern:** User → user_brands → brand → subscription_tier

### 5. ✅ radar-analyze-content
**File:** `/supabase/functions/radar-analyze-content/index.ts`
**Type:** Batch operation
**Change:** Added authentication validation and subscription tier check (line ~461-509)
**Pattern:** User → user_brands → brand → subscription_tier
**Note:** Also added missing authorization header validation

### 6. ✅ radar-learn-brand-authority
**File:** `/supabase/functions/radar-learn-brand-authority/index.ts`
**Type:** Batch operation
**Change:** Added authentication validation and subscription tier check (line ~409-457)
**Pattern:** User → user_brands → brand → subscription_tier
**Note:** Also added missing authorization header validation

### 7. ✅ radar-calculate-rankings
**File:** `/supabase/functions/radar-calculate-rankings/index.ts`
**Type:** Batch operation
**Change:** Added authentication validation and subscription tier check (line ~371-419)
**Pattern:** User → user_brands → brand → subscription_tier
**Note:** Also added missing authorization header validation

### 8. ✅ radar-calculate-marketshare
**File:** `/supabase/functions/radar-calculate-marketshare/index.ts`
**Type:** Batch operation
**Change:** Added authentication validation and subscription tier check (line ~313-361)
**Pattern:** User → user_brands → brand → subscription_tier
**Note:** Also added missing authorization header validation

### 9. ✅ radar-discover-trends
**File:** `/supabase/functions/radar-discover-trends/index.ts`
**Type:** Batch operation
**Change:** Added authentication validation and subscription tier check (line ~540-588)
**Pattern:** User → user_brands → brand → subscription_tier
**Note:** Also added missing authorization header validation

---

## Error Response Format

When a non-Partner tier user attempts to access Radar features, they receive a **403 Forbidden** response with this payload:

```json
{
  "error": "Radar feature is only available for Partner tier subscribers",
  "current_tier": "starter",
  "required_tier": "partner",
  "upgrade_url": "https://geovera.xyz/pricing",
  "message": "Upgrade to Partner tier to access advanced Radar analytics"
}
```

This provides:
- Clear error message
- Current subscription tier visibility
- Required tier information
- Direct upgrade URL
- User-friendly message

---

## Security Improvements

In addition to subscription tier checks, several functions were updated with missing authentication validation:

1. **radar-analyze-content** - Added Authorization header validation
2. **radar-learn-brand-authority** - Added Authorization header validation
3. **radar-calculate-rankings** - Added Authorization header validation
4. **radar-calculate-marketshare** - Added Authorization header validation
5. **radar-discover-trends** - Added Authorization header validation

These functions now properly validate the user's authentication token before processing requests.

---

## Database Requirements

The implementation assumes the following database structure:

### `brands` table
- `id` (uuid, primary key)
- `subscription_tier` (text) - Values: 'starter', 'partner', or null
- Other brand fields...

### `user_brands` table
- `user_id` (uuid, references auth.users)
- `brand_id` (uuid, references brands)
- `role` (text) - Values: 'owner', 'admin', 'member'
- Composite primary key: (user_id, brand_id)

---

## Testing Checklist

To verify the implementation:

- [ ] Test with Partner tier user (should succeed)
- [ ] Test with Starter tier user (should return 403)
- [ ] Test with no subscription tier (should return 403)
- [ ] Test with invalid/missing brand (should return 404)
- [ ] Test with missing Authorization header (should return 401)
- [ ] Test with invalid JWT token (should return 401)
- [ ] Verify error response format matches specification
- [ ] Verify upgrade_url points to correct pricing page

---

## Frontend Integration

Frontend applications should:

1. Handle 403 responses gracefully
2. Display upgrade prompts with the `upgrade_url`
3. Show the user's `current_tier` and `required_tier`
4. Provide clear messaging using the `message` field
5. Consider caching subscription tier status to reduce API calls

Example frontend error handling:

```typescript
try {
  const response = await fetch('/functions/v1/radar-discover-brands', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ brand_id, category, country })
  });

  if (response.status === 403) {
    const error = await response.json();
    showUpgradeModal({
      message: error.message,
      currentTier: error.current_tier,
      requiredTier: error.required_tier,
      upgradeUrl: error.upgrade_url
    });
    return;
  }

  const data = await response.json();
  // Handle success...
} catch (err) {
  // Handle other errors...
}
```

---

## Deployment Notes

1. **Environment Variables:** Ensure `FRONTEND_URL` is set in production (defaults to https://geovera.xyz)
2. **Database Migration:** Verify `brands.subscription_tier` column exists
3. **Backward Compatibility:** Existing Partner tier users will have uninterrupted access
4. **Grace Period:** Consider implementing a grace period for existing Starter tier users
5. **Monitoring:** Track 403 responses to understand feature adoption and upgrade conversion

---

## Related Documentation

- [Subscription Tiers](/docs/subscription-tiers.md)
- [Radar Analytics Overview](/docs/radar-analytics.md)
- [Partner Tier Features](/docs/partner-features.md)
- [Pricing Page](https://geovera.xyz/pricing)

---

**Implementation completed by:** Claude Sonnet 4.5
**Review status:** Ready for review
**Next steps:** Deploy functions and test with Partner/Starter tier accounts
