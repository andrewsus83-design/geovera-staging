# Plan: Fix Tab Click Issue in Login Page

## Context
User reported that tab clicking doesn't work in `login.html`. Diagnostic test confirmed:
- ✅ Supabase connection: GOOD
- ✅ Login form: GOOD
- ❌ Tab click test: NOT WORKING

The tab switching code exists (lines 225-239 in login.html) but onclick handlers may not be attaching properly.

## Root Cause Analysis
The JavaScript code runs immediately when parsed, but DOM elements might not be ready yet. The script is at the bottom of `<body>`, which should work, but there could be a timing issue with Supabase library loading.

## Solution
Wrap all JavaScript initialization in `DOMContentLoaded` event to ensure DOM is fully loaded before attaching event handlers.

## Implementation

### File to Modify
- `/Users/drew83/Desktop/geovera-staging/frontend/login.html`

### Changes
1. Wrap entire script (lines 211-340) in:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // All existing code here
});
```

2. Add console.log to verify DOM ready
3. Add console.log when tabs are clicked to debug

### Alternative: Inline onclick
If DOMContentLoaded doesn't work, change HTML tabs to use inline onclick:
```html
<button class="tab-btn active" onclick="switchToLogin()">Login</button>
<button class="tab-btn" onclick="switchToSignup()">Sign Up</button>
```

And create simple global functions.

## Verification
1. Open `http://localhost:8000/login.html`
2. Open browser console (F12)
3. Click "Sign Up" tab
4. Should see console log and tab should switch
5. Form should change from Login to Sign Up

## Fallback
If issue persists, create even simpler version with inline onclick attributes (most compatible approach).
