import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token',
};

const XENDIT_API_URL = 'https://api.xendit.co';

// Pricing in IDR
const PRICING: Record<string, Record<string, number>> = {
  BASIC:   { monthly: 5990000,  yearly: 65835000  },
  PREMIUM: { monthly: 10485000, yearly: 115335000 },
  PARTNER: { monthly: 16485000, yearly: 181335000 },
};

// Map Xendit plan key → DB subscription_tier value
const planToTier = (planKey: string): string => {
  const map: Record<string, string> = { BASIC: 'basic', PREMIUM: 'premium', PARTNER: 'partner' };
  return map[planKey] ?? 'basic';
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const isWebhookPath = url.pathname.endsWith('/webhook');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const xenditApiKey = Deno.env.get('XENDIT_SECRET_KEY') ?? '';
    const xenditAuthHeader = `Basic ${btoa(xenditApiKey + ':')}`;

    // ── WEBHOOK PATH ──────────────────────────────────────────────────
    if (isWebhookPath) {
      const callbackToken = req.headers.get('x-callback-token');
      if (callbackToken !== Deno.env.get('XENDIT_CALLBACK_TOKEN')) {
        return new Response(JSON.stringify({ error: 'Invalid callback token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const webhookData = await req.json();

      const { data: invoice } = await supabase
        .from('gv_invoices')
        .select('*')
        .eq('invoice_id', webhookData.id)
        .single();

      if (!invoice) {
        return new Response(JSON.stringify({ error: 'Invoice not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      await supabase.from('gv_invoices').update({
        status: webhookData.status,
        paid_at: webhookData.paid_at || null,
        payment_channel: webhookData.payment_channel || null,
        xendit_data: webhookData,
        updated_at: new Date().toISOString(),
      }).eq('invoice_id', webhookData.id);

      if (webhookData.status === 'PAID' || webhookData.status === 'SETTLED') {
        const planKey = (invoice.plan || 'BASIC').toUpperCase();
        const cycle = invoice.billing_cycle || 'monthly';
        const periodEnd = cycle === 'yearly'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await supabase.from('gv_subscriptions').upsert({
          user_id: invoice.user_id,
          brand_id: invoice.brand_id,
          plan: invoice.plan,
          billing_cycle: invoice.billing_cycle,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          invoice_id: invoice.invoice_id,
          amount_paid: invoice.amount,
          currency: invoice.currency,
          payment_method: webhookData.payment_channel,
          activated_at: new Date().toISOString(),
        }, { onConflict: 'brand_id' });

        // Update canonical brands table
        await supabase.from('brands').update({
          subscription_status: 'active',
          subscription_tier: planToTier(planKey),
          subscription_activated_at: new Date().toISOString(),
          subscription_expires_at: periodEnd.toISOString(),
          xendit_invoice_id: invoice.invoice_id,
        }).eq('id', invoice.brand_id);

        console.log('Subscription activated for brand', invoice.brand_id);
      }

      return new Response(JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── ACTION-BASED ROUTING ──────────────────────────────────────────
    const body = await req.json();
    const { action, ...data } = body;

    // CREATE INVOICE
    if (action === 'create_invoice') {
      const { user_id, brand_id, plan, billing_cycle, customer_email, customer_name } = data;

      if (!user_id || !brand_id || !plan) {
        return new Response(JSON.stringify({ error: 'user_id, brand_id, and plan are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const planKey = (plan as string).toUpperCase();
      const cycle = (billing_cycle || 'monthly') as string;
      const amount = PRICING[planKey]?.[cycle] ?? PRICING.BASIC.monthly;
      const description = `GeoVera ${planKey} - ${cycle === 'yearly' ? 'Yearly (1 month FREE)' : 'Monthly'}`;
      const frontendUrl = Deno.env.get('FRONTEND_URL') ?? 'https://app.geovera.xyz';

      const xenditRes = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
        method: 'POST',
        headers: { 'Authorization': xenditAuthHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          external_id: `geovera_${brand_id}_${Date.now()}`,
          amount,
          payer_email: customer_email,
          description,
          invoice_duration: 86400,
          success_redirect_url: `${frontendUrl}/payment/success`,
          failure_redirect_url: `${frontendUrl}/payment/failed`,
          currency: 'IDR',
          items: [{ name: `GeoVera ${planKey}`, quantity: 1, price: amount, category: 'Subscription' }],
          customer: { given_names: customer_name, email: customer_email },
          customer_notification_preference: {
            invoice_created: ['email'],
            invoice_reminder: ['email'],
            invoice_paid: ['email'],
          },
        }),
      });

      if (!xenditRes.ok) {
        const err = await xenditRes.json();
        throw new Error(`Xendit error: ${JSON.stringify(err)}`);
      }

      const invoice = await xenditRes.json();

      await supabase.from('gv_invoices').insert({
        invoice_id: invoice.id,
        external_id: invoice.external_id,
        user_id,
        brand_id,
        plan: planKey,
        billing_cycle: cycle,
        amount,
        currency: 'IDR',
        status: invoice.status,
        invoice_url: invoice.invoice_url,
        xendit_data: invoice,
      });

      await supabase.from('brands').update({
        xendit_invoice_id: invoice.id,
      }).eq('id', brand_id);

      return new Response(JSON.stringify({
        success: true,
        invoice: {
          id: invoice.id,
          external_id: invoice.external_id,
          amount,
          currency: 'IDR',
          status: invoice.status,
          invoice_url: invoice.invoice_url,
          expiry_date: invoice.expiry_date,
        },
      }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ACTIVATE FREE TIER
    if (action === 'activate_free_tier') {
      const { brand_id, user_id, plan } = data;

      if (!brand_id) {
        return new Response(JSON.stringify({ error: 'brand_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const planKey = (plan || 'BASIC').toUpperCase();
      const tierVal = planToTier(planKey);
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await supabase.from('gv_subscriptions').upsert({
        user_id,
        brand_id,
        plan: planKey,
        billing_cycle: 'monthly',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        invoice_id: null,
        amount_paid: 0,
        currency: 'IDR',
        payment_method: 'free_tier',
        activated_at: new Date().toISOString(),
      }, { onConflict: 'brand_id' });

      await supabase.from('brands').update({
        is_free_tier: true,
        subscription_status: 'active',
        subscription_tier: tierVal,
        subscription_activated_at: new Date().toISOString(),
        subscription_expires_at: periodEnd.toISOString(),
      }).eq('id', brand_id);

      return new Response(JSON.stringify({ success: true, message: 'Free tier activated' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // CHECK PAYMENT STATUS
    if (action === 'check_payment_status') {
      const { invoice_id } = data;
      if (!invoice_id) {
        return new Response(JSON.stringify({ error: 'invoice_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const xenditRes = await fetch(`${XENDIT_API_URL}/v2/invoices/${invoice_id}`, {
        headers: { 'Authorization': xenditAuthHeader },
      });

      if (!xenditRes.ok) {
        const err = await xenditRes.json();
        throw new Error(`Xendit error: ${JSON.stringify(err)}`);
      }

      const invoice = await xenditRes.json();

      await supabase.from('gv_invoices').update({
        status: invoice.status,
        paid_at: invoice.paid_at || null,
        payment_channel: invoice.payment_channel || null,
        xendit_data: invoice,
        updated_at: new Date().toISOString(),
      }).eq('invoice_id', invoice.id);

      return new Response(JSON.stringify({
        success: true,
        invoice: {
          id: invoice.id,
          status: invoice.status,
          amount: invoice.amount,
          currency: invoice.currency,
          paid_at: invoice.paid_at,
          payment_channel: invoice.payment_channel,
        },
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET SUBSCRIPTION
    if (action === 'get_subscription') {
      const { brand_id } = data;
      if (!brand_id) {
        return new Response(JSON.stringify({ error: 'brand_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data: sub, error } = await supabase
        .from('gv_subscriptions')
        .select('*')
        .eq('brand_id', brand_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const { data: brand } = await supabase
        .from('brands')
        .select('is_free_tier, subscription_status, subscription_expires_at, subscription_tier')
        .eq('id', brand_id)
        .single();

      return new Response(JSON.stringify({
        success: true,
        subscription: sub || null,
        brand_payment: brand || null,
        has_active_subscription: sub?.status === 'active' || brand?.is_free_tier === true,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // CANCEL SUBSCRIPTION
    if (action === 'cancel_subscription') {
      const { brand_id } = data;
      if (!brand_id) {
        return new Response(JSON.stringify({ error: 'brand_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      await supabase.from('gv_subscriptions').update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('brand_id', brand_id);

      await supabase.from('brands').update({
        subscription_status: 'cancelled',
      }).eq('id', brand_id);

      return new Response(JSON.stringify({ success: true, message: 'Subscription cancelled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET PAYMENT METHODS
    if (action === 'get_payment_methods') {
      return new Response(JSON.stringify({
        success: true,
        payment_methods: {
          virtual_accounts: [
            { code: 'BCA', name: 'Bank BCA', fee: 4000 },
            { code: 'MANDIRI', name: 'Bank Mandiri', fee: 4000 },
            { code: 'BRI', name: 'Bank BRI', fee: 4000 },
            { code: 'BNI', name: 'Bank BNI', fee: 4000 },
          ],
          e_wallets: [
            { code: 'OVO', name: 'OVO', fee_percentage: 2 },
            { code: 'DANA', name: 'DANA', fee_percentage: 2 },
            { code: 'SHOPEEPAY', name: 'ShopeePay', fee_percentage: 2 },
          ],
          qris: [{ code: 'QRIS', name: 'QRIS (All Banks)', fee_percentage: 0.7 }],
          credit_card: [{ code: 'CREDIT_CARD', name: 'Visa/Mastercard/JCB', fee_percentage: 2.9, fixed_fee: 2000 }],
          retail: [
            { code: 'ALFAMART', name: 'Alfamart', fee: 5000 },
            { code: 'INDOMARET', name: 'Indomaret', fee: 5000 },
          ],
        },
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Xendit handler error:', msg);
    return new Response(JSON.stringify({ error: 'Payment processing failed', details: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
