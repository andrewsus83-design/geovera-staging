# AI Chat Edge Function

## Overview
This Edge Function provides AI-powered chat functionality for GeoVera brands using OpenAI's GPT models. It handles user messages, maintains conversation history, tracks token usage, and manages costs.

## Features
- User authentication and brand ownership verification
- Session-based conversation management
- OpenAI API integration (GPT-3.5-turbo or GPT-4-turbo)
- Automatic token usage and cost tracking
- Conversation history storage
- CORS support for frontend integration

## Environment Variables

Set the following environment variables in your Supabase project:

```bash
OPENAI_API_KEY=sk-...          # Required: Your OpenAI API key
OPENAI_MODEL=gpt-3.5-turbo     # Optional: Default is gpt-3.5-turbo
```

### Available Models
- `gpt-3.5-turbo` - Fast, cost-effective ($0.0015/1K input, $0.002/1K output)
- `gpt-4-turbo` - More capable ($0.01/1K input, $0.03/1K output)
- `gpt-4` - Most capable ($0.03/1K input, $0.06/1K output)

## API Endpoint

### POST /ai-chat

Send a message and receive an AI response.

#### Request Headers
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "brand_id": "uuid",           // Required: Brand ID
  "session_id": "uuid",         // Optional: Existing session ID
  "message": "Your question"    // Required: User message
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "session_id": "uuid",
  "message_id": "uuid",
  "response": "AI response text",
  "metadata": {
    "ai_provider": "openai",
    "model_used": "gpt-3.5-turbo",
    "tokens_used": 450,
    "cost_usd": 0.0009,
    "prompt_tokens": 350,
    "completion_tokens": 100
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized - Authorization header required"
}
```

**403 Forbidden**
```json
{
  "error": "Brand not found or access denied"
}
```

**400 Bad Request**
```json
{
  "error": "brand_id and message are required"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "details": "Error description"
}
```

## Usage Examples

### JavaScript/TypeScript
```typescript
const response = await fetch('https://your-project.supabase.co/functions/v1/ai-chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    brand_id: 'brand-uuid',
    message: 'What are the best marketing strategies for my brand?'
  })
});

const data = await response.json();
console.log(data.response);
```

### cURL
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/ai-chat' \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "brand-uuid",
    "message": "How can I improve my social media presence?"
  }'
```

## Database Schema

### Tables Used

#### gv_ai_chat_sessions
Stores chat session metadata.

```sql
CREATE TABLE gv_ai_chat_sessions (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  message_count INTEGER,
  total_tokens INTEGER,
  total_cost_usd DECIMAL(10, 4),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### gv_ai_conversations
Stores individual messages.

```sql
CREATE TABLE gv_ai_conversations (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES gv_brands(id),
  user_id UUID REFERENCES auth.users(id),
  session_id UUID REFERENCES gv_ai_chat_sessions(id),
  message TEXT,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  ai_provider TEXT,
  model_used TEXT,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMPTZ
);
```

## Security

### Authentication
- Requires valid Supabase user JWT token
- Users can only access brands they own (verified via `user_brands` table)

### Row Level Security (RLS)
- Enabled on all tables
- Users can only read/write their own brand's data
- Service role required for system operations

### Rate Limiting
- Implement rate limiting at the application level
- Consider OpenAI's rate limits (varies by model and tier)

## Cost Tracking

The function automatically tracks:
- **Token usage** per message (prompt + completion tokens)
- **Cost in USD** based on current OpenAI pricing
- **Total session costs** aggregated automatically

### Cost Optimization Tips
1. Use `gpt-3.5-turbo` for most use cases (~80% cheaper than GPT-4)
2. Keep conversation history to last 10 messages
3. Set max_tokens to 1000 to control response length
4. Monitor costs via `gv_ai_chat_sessions.total_cost_usd`

## Deployment

### Deploy Function
```bash
supabase functions deploy ai-chat
```

### Set Environment Variables
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set OPENAI_MODEL=gpt-3.5-turbo
```

## Testing

### Test Locally
```bash
# Start local Supabase
supabase start

# Serve function locally
supabase functions serve ai-chat --env-file .env.local

# Test with curl
curl -X POST 'http://localhost:54321/functions/v1/ai-chat' \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "test-uuid", "message": "Hello!"}'
```

## Migration

Apply the database migration before deploying:

```bash
supabase db push
```

Or manually apply the migration file:
```
supabase/migrations/20260213135543_create_ai_conversations.sql
```

## Troubleshooting

### "OPENAI_API_KEY environment variable is not set"
- Set the secret: `supabase secrets set OPENAI_API_KEY=sk-...`
- Verify: `supabase secrets list`

### "Unauthorized - Invalid token"
- Ensure you're sending a valid user JWT token
- Check token expiration
- Verify token format: `Bearer <token>`

### "Brand not found or access denied"
- Verify the user has access to the brand in `user_brands` table
- Check brand_id is correct and exists

### "OpenAI API error"
- Check OpenAI API key validity
- Verify OpenAI account has credits
- Check rate limits

## Future Enhancements

Potential improvements:
1. Add support for multiple AI providers (Gemini, Claude, Perplexity)
2. Implement conversation summarization for long sessions
3. Add streaming responses for real-time chat
4. Implement context-aware AI routing
5. Add conversation export functionality
6. Implement daily AI briefs and insights
