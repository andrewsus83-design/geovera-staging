# Supabase Email Confirmation Configuration

This document provides instructions for configuring email confirmation redirects in Supabase to direct users to the new confirmation page.

## Target Redirect URL
```
https://www.geovera.xyz/email-confirmed
```

## Configuration Methods

### Method 1: Configure Email Templates (Recommended)

1. **Navigate to Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project (geovera-staging or production)

2. **Access Email Templates**
   - Click on **Authentication** in the left sidebar
   - Click on **Email Templates**

3. **Update Confirm Signup Template**
   - Find the **"Confirm signup"** template
   - Locate the confirmation link in the template body
   - Update the redirect URL to use:
     ```
     {{ .SiteURL }}/email-confirmed
     ```

4. **Example Template Structure**
   ```html
   <h2>Confirm your signup</h2>

   <p>Follow this link to confirm your user:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

   <!-- Or with custom redirect: -->
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&redirect_to={{ .SiteURL }}/email-confirmed">Confirm your email</a></p>
   ```

5. **Save Changes**
   - Click **Save** to apply the updated template

### Method 2: Configure Site URL in Project Settings

1. **Navigate to Project Settings**
   - Go to **Settings** → **Authentication**

2. **Update Site URL**
   - Find **Site URL** field
   - Set to: `https://www.geovera.xyz`

3. **Configure Redirect URLs**
   - Scroll to **Redirect URLs** section
   - Add the following allowed redirect URLs:
     ```
     https://www.geovera.xyz/email-confirmed
     https://www.geovera.xyz/*
     ```

4. **Save Settings**

### Method 3: Configure via Supabase Client (Application Level)

If you need to set this programmatically in your application code:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      redirectTo: 'https://www.geovera.xyz/email-confirmed'
    }
  }
)

// Or when signing up:
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    emailRedirectTo: 'https://www.geovera.xyz/email-confirmed'
  }
})
```

## Email Template Variables

Supabase provides the following variables for email templates:

- `{{ .SiteURL }}` - The site URL configured in your project settings
- `{{ .ConfirmationURL }}` - Auto-generated confirmation URL with token
- `{{ .Token }}` - The confirmation token
- `{{ .TokenHash }}` - Hashed version of the token
- `{{ .Email }}` - The user's email address

## Testing the Configuration

1. **Test Signup Flow**
   - Create a new user account
   - Check the confirmation email received
   - Click the confirmation link
   - Verify redirect to: `https://www.geovera.xyz/email-confirmed`

2. **Verify in Development**
   - For local testing, temporarily set Site URL to `http://localhost:3000`
   - Add `http://localhost:3000/email-confirmed` to Redirect URLs
   - Test the complete flow

## Troubleshooting

### Issue: Redirect not working
- Verify the redirect URL is added to **Allowed Redirect URLs** in Authentication settings
- Check that Site URL matches your domain
- Ensure email template uses correct variable syntax

### Issue: Invalid redirect URL error
- Confirm URL is in the whitelist under **Redirect URLs**
- Check for typos in the URL
- Verify protocol (https vs http)

### Issue: Email not sent
- Check Supabase project email settings
- Verify SMTP configuration (if using custom SMTP)
- Check spam folder

## Production Checklist

Before deploying to production:

- [ ] Site URL set to: `https://www.geovera.xyz`
- [ ] Redirect URL added: `https://www.geovera.xyz/email-confirmed`
- [ ] Email template updated with correct redirect
- [ ] Test signup flow end-to-end
- [ ] Verify email delivery
- [ ] Confirm redirect works as expected
- [ ] Check mobile email client compatibility

## Additional Resources

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Redirect URLs Guide](https://supabase.com/docs/guides/auth/redirect-urls)
- [Auth Configuration Reference](https://supabase.com/docs/reference/javascript/auth-signup)

## Notes

- Email template changes apply immediately to new signups
- Existing pending confirmations will use the old template
- Always test in a staging environment first
- Consider maintaining separate configurations for staging and production
