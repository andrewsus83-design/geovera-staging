# Quick Start Guide: radar-scrape-content

## TL;DR

This function scrapes social media posts from creators and filters out promotional/giveaway content.

## Deploy in 3 Steps

```bash
# 1. Set Apify token
supabase secrets set APIFY_API_TOKEN=apify_api_YOUR_TOKEN

# 2. Deploy function
supabase functions deploy radar-scrape-content

# 3. Test it
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/radar-scrape-content' \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"creator_id": "UUID", "platform": "instagram"}'
```

## What It Does

1. Fetches last 30 posts from creator's platform (Instagram/TikTok/YouTube)
2. Filters out promo, giveaway, and life update posts
3. Selects top ~9 posts by engagement
4. Saves to `gv_creator_content` table

## Request Format

```typescript
POST /radar-scrape-content
{
  "creator_id": "uuid",           // From gv_creators table
  "platform": "instagram"         // instagram | tiktok | youtube
}
```

## Response Format

```json
{
  "success": true,
  "creator_name": "Creator Name",
  "platform": "instagram",
  "scraped_count": 30,
  "saved_count": 9,
  "summary": {
    "removed_promo": 8,
    "removed_giveaway": 3,
    "removed_life_update": 1
  }
}
```

## Common Use Cases

### Scrape Single Creator
```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/radar-scrape-content', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    creator_id: 'creator-uuid',
    platform: 'instagram'
  })
});
```

### Scrape All Platforms for Creator
```typescript
const platforms = ['instagram', 'tiktok', 'youtube'];

for (const platform of platforms) {
  await scrapeCreator(creator_id, platform);
  await sleep(5000); // 5 second delay
}
```

### Batch Scrape Category
```typescript
const { data: creators } = await supabase
  .from('gv_creators')
  .select('id, platform_primary')
  .eq('category', 'beauty')
  .eq('is_active', true)
  .limit(10);

for (const creator of creators) {
  await scrapeCreator(creator.id, creator.platform_primary);
  await sleep(5000);
}
```

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `CREATOR_NOT_FOUND` | Creator doesn't exist | Check creator_id is valid UUID |
| `HANDLE_NOT_FOUND` | No platform handle | Update creator with handle |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait 5 minutes, retry |
| `TIMEOUT` | Scraping took too long | Retry after 5 minutes |
| `SCRAPING_FAILED` | General error | Check logs for details |

## Cost Estimates

| Platform | Posts | Time | Cost |
|----------|-------|------|------|
| Instagram | 30 | ~2 min | $0.01 |
| TikTok | 30 | ~3 min | $0.02 |
| YouTube | 30 | ~2.5 min | $0.015 |

**Monthly estimate**: 240 creators × 3 platforms × 4 weeks = ~$70/month

## Monitoring

### Check Recent Scrapes
```sql
SELECT
  c.name,
  cc.platform,
  COUNT(*) as posts,
  MAX(cc.scraped_at) as last_scraped
FROM gv_creator_content cc
JOIN gv_creators c ON c.id = cc.creator_id
WHERE cc.scraped_at > NOW() - INTERVAL '24 hours'
GROUP BY c.name, cc.platform;
```

### Check Logs
```bash
supabase functions logs radar-scrape-content --tail
```

### Check Apify Usage
Visit: https://console.apify.com/usage

## Best Practices

1. **Frequency**: Scrape each creator once per week
2. **Rate Limiting**: Wait 5 seconds between scrapes
3. **Error Handling**: Retry failed scrapes once after 5 minutes
4. **Cost Control**: Monitor Apify usage daily
5. **Data Quality**: Verify filtering works correctly

## Troubleshooting

### "Apify API token not configured"
```bash
supabase secrets set APIFY_API_TOKEN=apify_api_YOUR_TOKEN
```

### "No instagram handle found"
```sql
UPDATE gv_creators
SET instagram_handle = '@handle'
WHERE id = 'creator-uuid';
```

### Rate Limit Errors
- Wait 5 minutes
- Check Apify dashboard for usage
- Upgrade plan if needed

### No Posts Returned
- Check if creator has public posts
- Verify handle is correct
- Check if account exists

## Next Steps

After scraping content:

1. **Analyze Content**: Use Claude to analyze post quality
2. **Calculate Rankings**: Compute mindshare for creators
3. **Extract Brands**: Identify brand mentions in posts
4. **Detect Trends**: Find hashtags and topics

## Links

- [Full Documentation](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Apify Console](https://console.apify.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
