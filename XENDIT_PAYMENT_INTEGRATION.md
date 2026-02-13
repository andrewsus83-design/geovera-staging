# 💳 XENDIT PAYMENT INTEGRATION - GEOVERA

**Date**: 12 February 2026
**Status**: Ready for TEST MODE
**Payment Gateway**: Xendit (Indonesia)

---

## 🎯 OVERVIEW

GeoVera uses **Xendit** for payment processing in Indonesia, supporting multiple local payment methods.

### **Why Xendit?**
✅ Support payment methods Indonesia (VA, E-Wallet, QRIS, Credit Card, Retail)
✅ IDR currency native
✅ Lower fees for local payments
✅ Recurring subscription support
✅ Webhook for real-time payment notifications

---

## 💰 PRICING (IDR - Indonesian Rupiah)

**Exchange Rate**: $1 USD = 15,000 IDR

| Plan | Monthly (IDR) | Yearly (IDR) | USD Equivalent |
|------|---------------|--------------|----------------|
| **BASIC** | Rp 5,990,000 | Rp 65,835,000 | $399 / $4,389 |
| **PREMIUM** | Rp 10,485,000 | Rp 115,335,000 | $699 / $7,689 |
| **PARTNER** | Rp 16,485,000 | Rp 181,335,000 | $1,099 / $12,089 |

**Note**: Yearly = 1 month FREE (sama seperti pricing USD)

---

## 💳 SUPPORTED PAYMENT METHODS

### **1. Virtual Account (VA)**
- **Banks**: BCA, Mandiri, BRI, BNI, Permata
- **Fee**: Rp 4,000 flat per transaction
- **Process**: Customer transfers to unique VA number
- **Time**: Instant confirmation

### **2. E-Wallet**
- **Providers**: OVO, DANA, LinkAja, ShopeePay
- **Fee**: 2% per transaction
- **Process**: Redirect to e-wallet app
- **Time**: Instant confirmation

### **3. QRIS**
- **All Banks**: Universal QR code
- **Fee**: 0.7% per transaction
- **Process**: Scan QR with any banking app
- **Time**: Instant confirmation

### **4. Credit Card**
- **Cards**: Visa, Mastercard, JCB
- **Fee**: 2.9% + Rp 2,000 per transaction
- **Process**: Enter card details
- **Time**: Instant confirmation

### **5. Retail (Over-the-Counter)**
- **Stores**: Alfamart, Indomaret
- **Fee**: Rp 5,000 flat per transaction
- **Process**: Customer pays at retail store
- **Time**: Up to 3 hours confirmation

---

## 🔧 SETUP XENDIT

### **Step 1: Get API Keys**

**TEST MODE** (for development):
```bash
# Xendit Dashboard → Settings → API Keys → Test Keys
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_CALLBACK_TOKEN=...
```

**LIVE MODE** (for production):
```bash
# Xendit Dashboard → Settings → API Keys → Live Keys
XENDIT_SECRET_KEY=xnd_production_...
XENDIT_CALLBACK_TOKEN=...
```

### **Step 2: Add to Supabase Environment Variables**

```bash
# In Supabase Dashboard → Settings → Edge Functions → Secrets
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_CALLBACK_TOKEN=your_webhook_token
FRONTEND_URL=https://your-app.com
```

### **Step 3: Configure Webhook**

**Xendit Dashboard → Settings → Webhooks**

Add webhook URL:
```
https://YOUR_PROJECT.supabase.co/functions/v1/xendit-payment-handler
```

**Events to subscribe:**
- ✅ invoice.paid
- ✅ invoice.expired
- ✅ invoice.failed

**Callback Token**: Same as `XENDIT_CALLBACK_TOKEN` env var

---

## 📋 DATABASE TABLES

### **1. gv_invoices**
Stores all payment invoices from Xendit.

```sql
{
  id: uuid,
  invoice_id: text (Xendit invoice ID),
  external_id: text (our unique ID),
  user_id: uuid,
  brand_id: uuid,
  plan: 'BASIC' | 'PREMIUM' | 'PARTNER',
  billing_cycle: 'monthly' | 'yearly',
  amount: numeric (in IDR),
  currency: 'IDR',
  status: text (PENDING, PAID, EXPIRED, etc.),
  invoice_url: text (Xendit payment URL),
  payment_channel: text (BCA, OVO, QRIS, etc.),
  paid_at: timestamptz,
  xendit_data: jsonb (raw Xendit response),
  created_at: timestamptz,
  updated_at: timestamptz
}
```

### **2. gv_subscriptions**
Active subscriptions (1 brand = 1 subscription).

```sql
{
  id: uuid,
  user_id: uuid,
  brand_id: uuid UNIQUE,
  plan: 'BASIC' | 'PREMIUM' | 'PARTNER',
  billing_cycle: 'monthly' | 'yearly',
  status: 'active' | 'cancelled' | 'expired' | 'past_due',
  current_period_start: timestamptz,
  current_period_end: timestamptz,
  invoice_id: text,
  amount_paid: numeric,
  currency: 'IDR',
  payment_method: text,
  activated_at: timestamptz,
  cancelled_at: timestamptz,
  created_at: timestamptz,
  updated_at: timestamptz
}
```

### **3. brands table (updated)**
Added subscription fields:

```sql
{
  // ... existing fields ...
  subscription_status: text,
  subscription_plan: text,
  subscription_activated_at: timestamptz
}
```

---

## 🔌 API ENDPOINTS

### **1. Create Invoice (Payment Link)**

**Request:**
```bash
POST /xendit-payment-handler
{
  "action": "create_invoice",
  "user_id": "uuid",
  "brand_id": "uuid",
  "plan": "BASIC",
  "billing_cycle": "monthly",
  "customer_email": "user@example.com",
  "customer_name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "invoice": {
    "id": "xendit_invoice_id",
    "external_id": "geovera_brand_id_timestamp",
    "amount": 5990000,
    "currency": "IDR",
    "status": "PENDING",
    "invoice_url": "https://checkout.xendit.co/web/...",
    "expiry_date": "2026-02-13T..."
  },
  "message": "Invoice created successfully. Please complete payment."
}
```

**What happens:**
1. Creates invoice in Xendit
2. Saves invoice to `gv_invoices` table
3. Returns payment URL
4. User redirected to Xendit checkout page
5. User selects payment method (VA, E-Wallet, QRIS, etc.)
6. User completes payment
7. Xendit sends webhook notification
8. Subscription activated automatically

---

### **2. Check Payment Status**

**Request:**
```bash
POST /xendit-payment-handler
{
  "action": "check_payment_status",
  "invoice_id": "xendit_invoice_id"
}
```

**Response:**
```json
{
  "success": true,
  "invoice": {
    "id": "xendit_invoice_id",
    "status": "PAID",
    "amount": 5990000,
    "currency": "IDR",
    "paid_at": "2026-02-12T...",
    "payment_channel": "BCA"
  }
}
```

---

### **3. Webhook Handler (Automatic)**

**Xendit sends notification when payment status changes:**

```bash
POST /xendit-payment-handler
Headers:
  x-callback-token: your_webhook_token
Body:
{
  "action": "webhook",
  "id": "xendit_invoice_id",
  "status": "PAID",
  "paid_at": "2026-02-12T...",
  "payment_channel": "BCA",
  // ... other Xendit data
}
```

**What happens automatically:**
1. Verifies callback token
2. Updates invoice status in database
3. If status = PAID:
   - Creates/activates subscription in `gv_subscriptions`
   - Updates `brands` table with subscription status
   - Sets `current_period_end` (+30 days for monthly, +365 days for yearly)
4. Returns success to Xendit

---

### **4. Get Subscription Status**

**Request:**
```bash
POST /xendit-payment-handler
{
  "action": "get_subscription",
  "brand_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "plan": "BASIC",
    "status": "active",
    "current_period_end": "2026-03-12T...",
    "payment_method": "BCA"
  },
  "has_active_subscription": true
}
```

---

### **5. Cancel Subscription**

**Request:**
```bash
POST /xendit-payment-handler
{
  "action": "cancel_subscription",
  "brand_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully. Access will remain until end of billing period."
}
```

**Note**: User tetap bisa akses sampai `current_period_end`

---

### **6. Get Payment Methods**

**Request:**
```bash
POST /xendit-payment-handler
{
  "action": "get_payment_methods"
}
```

**Response:**
```json
{
  "success": true,
  "payment_methods": {
    "virtual_accounts": [
      { "code": "BCA", "name": "Bank BCA", "fee": 4000 },
      { "code": "MANDIRI", "name": "Bank Mandiri", "fee": 4000 }
    ],
    "e_wallets": [
      { "code": "OVO", "name": "OVO", "fee_percentage": 2 },
      { "code": "DANA", "name": "DANA", "fee_percentage": 2 }
    ],
    "qris": [
      { "code": "QRIS", "name": "QRIS (All Banks)", "fee_percentage": 0.7 }
    ]
  }
}
```

---

## 🔄 PAYMENT FLOW

### **Complete User Journey:**

```
1. User completes 6-step onboarding (FREE)
   ↓
2. User sees FREE report
   ↓
3. User clicks "Subscribe to Unlock Full Access"
   ↓
4. User selects plan (BASIC, PREMIUM, PARTNER)
   ↓
5. User selects billing cycle (monthly or yearly)
   ↓
6. Frontend calls create_invoice API
   ↓
7. Backend creates Xendit invoice
   ↓
8. User redirected to Xendit checkout page
   ↓
9. User selects payment method:
   - Virtual Account (BCA, Mandiri, BRI, BNI, Permata)
   - E-Wallet (OVO, DANA, LinkAja, ShopeePay)
   - QRIS (scan with any banking app)
   - Credit Card (Visa/Mastercard/JCB)
   - Retail (Alfamart/Indomaret)
   ↓
10. User completes payment
   ↓
11. Xendit sends webhook to backend
   ↓
12. Backend activates subscription automatically
   ↓
13. User redirected to success page
   ↓
14. User can now access full dashboard
```

---

## 🧪 TESTING (TEST MODE)

### **Test Cards (Credit Card)**

```
Successful Payment:
  Card: 4000 0000 0000 0002
  CVV: 123
  Expiry: Any future date

Failed Payment:
  Card: 4000 0000 0000 0101
  CVV: 123
  Expiry: Any future date
```

### **Test Virtual Accounts**

**BCA VA**: Any amount will be auto-paid in test mode
**Mandiri VA**: Any amount will be auto-paid in test mode

### **Test E-Wallets**

All e-wallet payments in test mode are automatically successful.

### **Test QRIS**

QRIS payments in test mode are automatically successful.

---

## 💰 TRANSACTION FEES

### **Fee Breakdown by Payment Method:**

| Method | Fee | Who Pays |
|--------|-----|----------|
| Virtual Account | Rp 4,000 flat | Customer (can be absorbed by merchant) |
| E-Wallet | 2% | Merchant |
| QRIS | 0.7% | Merchant |
| Credit Card | 2.9% + Rp 2,000 | Merchant |
| Retail | Rp 5,000 flat | Customer |

**Recommendation**:
- Absorb VA fee (Rp 4,000) untuk better UX
- E-Wallet & QRIS fees reasonable (2% & 0.7%)
- Credit Card highest fee (2.9%) but international standard

---

## 🔒 SECURITY

### **Best Practices:**

1. ✅ **API Keys**: Never expose secret key in frontend
2. ✅ **Webhook Token**: Verify all webhook requests
3. ✅ **HTTPS Only**: All API calls use HTTPS
4. ✅ **Idempotency**: Use unique `external_id` for each invoice
5. ✅ **Data Validation**: Validate all webhook data before processing
6. ✅ **Error Handling**: Log all errors for debugging

### **Webhook Security:**

```typescript
// Verify callback token
const callbackToken = req.headers.get('x-callback-token');
if (callbackToken !== Deno.env.get('XENDIT_CALLBACK_TOKEN')) {
  return error('Invalid callback token');
}
```

---

## 📊 MONITORING

### **Key Metrics to Track:**

1. **Invoice Creation Rate**: How many invoices created per day
2. **Payment Success Rate**: Paid invoices / Total invoices
3. **Payment Method Distribution**: Which methods are most popular
4. **Average Time to Payment**: From invoice creation to payment
5. **Failed Payment Reasons**: Why payments fail
6. **Subscription Churn**: Cancellation rate

### **Database Queries:**

```sql
-- Active subscriptions
SELECT COUNT(*) FROM gv_subscriptions WHERE status = 'active';

-- Revenue by plan (monthly)
SELECT plan, SUM(amount_paid)
FROM gv_subscriptions
WHERE activated_at >= NOW() - INTERVAL '30 days'
GROUP BY plan;

-- Payment method popularity
SELECT payment_method, COUNT(*)
FROM gv_invoices
WHERE status = 'PAID'
GROUP BY payment_method
ORDER BY COUNT(*) DESC;
```

---

## 🚀 DEPLOYMENT CHECKLIST

### **Before Going Live:**

- [ ] Test all payment methods in TEST MODE
- [ ] Verify webhook is receiving notifications
- [ ] Test subscription activation flow
- [ ] Test subscription cancellation
- [ ] Switch to LIVE API keys
- [ ] Update webhook URL to production
- [ ] Test with small real transaction
- [ ] Monitor first 24 hours closely

### **Environment Variables (Production):**

```bash
XENDIT_SECRET_KEY=xnd_production_...  # LIVE KEY!
XENDIT_CALLBACK_TOKEN=...             # MUST MATCH WEBHOOK
FRONTEND_URL=https://geovera.com      # PRODUCTION URL
```

---

## 🐛 TROUBLESHOOTING

### **Common Issues:**

**1. Webhook not received:**
- Check webhook URL is correct
- Verify callback token matches
- Check Supabase function logs

**2. Payment not activating subscription:**
- Check webhook handler logs
- Verify invoice_id exists in database
- Check subscription table for errors

**3. Invoice creation fails:**
- Verify API key is correct
- Check Xendit API status
- Validate request data format

**4. User can't access after payment:**
- Check subscription status in database
- Verify `current_period_end` is in future
- Check brand `subscription_status` field

---

## 📞 SUPPORT

### **Xendit Support:**
- Dashboard: https://dashboard.xendit.co
- Docs: https://docs.xendit.co
- Email: support@xendit.co
- Phone: +62 21 5091 5151

### **Test Mode Notes:**
- All test payments are FREE
- No real money charged
- Webhook still sent (test it!)
- Switch to live keys when ready

---

**✅ XENDIT INTEGRATION READY FOR TEST MODE!** 🚀

**Next Steps:**
1. Deploy xendit-payment-handler.ts to Supabase
2. Configure webhook in Xendit dashboard
3. Test payment flow end-to-end
4. Go live when ready!
