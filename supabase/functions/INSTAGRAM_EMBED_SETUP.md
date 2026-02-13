# Instagram Embed Setup - Facebook Access Token

## Overview
Instagram embeds require a Facebook access token to use the official oEmbed API. This is **FREE** but requires Facebook Developer account setup.

## Why This Is Required
- **ToS Compliance**: Instagram requires official oEmbed API for embedding posts
- **Legal Protection**: Prevents copyright/ToS violations
- **Reliability**: Official API is more stable than scraping

## Setup Steps

### 1. Create Facebook Developer Account
1. Go to https://developers.facebook.com/
2. Click "Get Started"
3. Complete registration (free)

### 2. Create a Facebook App
1. Go to https://developers.facebook.com/apps
2. Click "Create App"
3. Select "Business" type
4. Fill in app details:
   - **App Name**: "GeoVera Hub" (or any name)
   - **App Contact Email**: your email
5. Click "Create App"

### 3. Add Instagram Product
1. In your app dashboard, find "Instagram Basic Display"
2. Click "Set Up"
3. Complete basic setup
4. No need to submit for review - we only need basic oEmbed access

### 4. Generate Access Token
1. Go to **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
2. Select your app from dropdown
3. Click "Generate Access Token"
4. Grant required permissions (default is fine)
5. **IMPORTANT**: For long-lived token (60 days), follow these steps:
   - Get short-lived token from Graph API Explorer
   - Exchange for long-lived token using this URL:
   ```
   https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}
   ```
   - This gives you a token valid for 60 days

### 5. Set Environment Variable in Supabase
```bash
# Option 1: Using Supabase CLI
supabase secrets set FACEBOOK_ACCESS_TOKEN=your_long_lived_token_here

# Option 2: Using Supabase Dashboard
# 1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/settings/functions
# 2. Click "Add Secret"
# 3. Name: FACEBOOK_ACCESS_TOKEN
# 4. Value: your_long_lived_token_here
```

### 6. Verify Token Works
Test with curl:
```bash
curl "https://graph.facebook.com/v18.0/instagram_oembed?url=https://www.instagram.com/p/EXAMPLE/&access_token=YOUR_TOKEN"
```

Should return:
```json
{
  "version": "1.0",
  "title": "...",
  "author_name": "...",
  "html": "<blockquote>...</blockquote>"
}
```

## Token Expiration
- **Short-lived tokens**: Expire in 1 hour
- **Long-lived tokens**: Expire in 60 days
- **Best practice**: Set up a cron job to refresh token every 50 days

## Refresh Token (Every 50 Days)
```bash
# Run this command before token expires
curl "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={current-token}"

# Then update Supabase secret
supabase secrets set FACEBOOK_ACCESS_TOKEN=new_token_here
```

## Alternative: Use TikTok + YouTube Only
If you don't want to deal with Instagram tokens, you can:
1. Skip Instagram embeds (function will gracefully skip them)
2. Focus on TikTok + YouTube only (both work without any auth!)
3. Instagram posts will still be analyzed for articles, just not embedded

## Cost
- **FREE** - No charges from Facebook/Instagram
- Token generation: Free
- oEmbed API calls: Free (unlimited)

## Support
If you encounter issues:
- Facebook Developer Support: https://developers.facebook.com/support/
- Graph API Explorer: https://developers.facebook.com/tools/explorer/
- Instagram Platform Documentation: https://developers.facebook.com/docs/instagram-platform

---

**Note**: TikTok and YouTube embeds work immediately without any setup! Only Instagram requires this Facebook token.
