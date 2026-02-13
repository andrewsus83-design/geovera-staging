import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Xendit API Base URL
const XENDIT_API_URL = 'https://api.xendit.co';

interface CreateInvoiceRequest {
  user_id: string;
  brand_id: string;
  plan: 'BASIC' | 'PREMIUM' | 'PARTNER';
  billing_cycle: 'monthly' | 'yearly';
  customer_email: string;
  customer_name: string;
}

interface CheckPaymentRequest {
  invoice_id: string;
}

// Pricing in IDR (Indonesian Rupiah)
const PRICING = {
  BASIC: {
    monthly: 5990000, // $399 × 15,000 IDR
    yearly: 65835000, // $4,389 × 15,000 IDR (1 month FREE)
  },
  PREMIUM: {
    monthly: 10485000, // $699 × 15,000 IDR
    yearly: 115335000, // $7,689 × 15,000 IDR (1 month FREE)
  },
  PARTNER: {
    monthly: 16485000, // $1,099 × 15,000 IDR
    yearly: 181335000, // $12,089 × 15,000 IDR (1 month FREE)
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const xenditApiKey = Deno.env.get('XENDIT_SECRET_KEY') ?? '';
    const xenditAuthHeader = `Basic ${btoa(xenditApiKey + ':')}`;

    const { action, ...data } = await req.json();

    // ========================================================================
    // CREATE INVOICE (Payment Link)
    // ========================================================================
    if (action === 'create_invoice') {
      const invoiceData: CreateInvoiceRequest = data as CreateInvoiceRequest;

      // Validate required fields
      if (!invoiceData.user_id || !invoiceData.brand_id || !invoiceData.plan) {
        return new Response(
          JSON.stringify({ error: 'user_id, brand_id, and plan are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get pricing
      const amount = PRICING[invoiceData.plan][invoiceData.billing_cycle];
      const description = `GeoVera ${invoiceData.plan} - ${invoiceData.billing_cycle === 'yearly' ? 'Yearly (1 month FREE)' : 'Monthly'}`;

      // Create invoice via Xendit
      const xenditResponse = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
        method: 'POST',
        headers: {
          'Authorization': xenditAuthHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_id: `geovera_${invoiceData.brand_id}_${Date.now()}`,
          amount: amount,
          payer_email: invoiceData.customer_email,
          description: description,
          invoice_duration: 86400, // 24 hours
          success_redirect_url: `${Deno.env.get('FRONTEND_URL')}/payment/success`,
          failure_redirect_url: `${Deno.env.get('FRONTEND_URL')}/payment/failed`,
          currency: 'IDR',
          items: [
            {
              name: `GeoVera ${invoiceData.plan}`,
              quantity: 1,
              price: amount,
              category: 'Subscription',
            }
          ],
          customer: {
            given_names: invoiceData.customer_name,
            email: invoiceData.customer_email,
          },
          customer_notification_preference: {
            invoice_created: ['email'],
            invoice_reminder: ['email'],
            invoice_paid: ['email'],
          }
        })
      });

      if (!xenditResponse.ok) {
        const errorData = await xenditResponse.json();
        throw new Error(`Xendit API error: ${JSON.stringify(errorData)}`);
      }

      const invoice = await xenditResponse.json();

      // Save invoice to database
      const { data: savedInvoice, error: saveError } = await supabaseClient
        .from('gv_invoices')
        .insert({
          invoice_id: invoice.id,
          external_id: invoice.external_id,
          user_id: invoiceData.user_id,
          brand_id: invoiceData.brand_id,
          plan: invoiceData.plan,
          billing_cycle: invoiceData.billing_cycle,
          amount: amount,
          currency: 'IDR',
          status: invoice.status,
          invoice_url: invoice.invoice_url,
          xendit_data: invoice,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving invoice:', saveError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          invoice: {
            id: invoice.id,
            external_id: invoice.external_id,
            amount: amount,
            currency: 'IDR',
            status: invoice.status,
            invoice_url: invoice.invoice_url,
            expiry_date: invoice.expiry_date,
          },
          message: 'Invoice created successfully. Please complete payment.'
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // CHECK PAYMENT STATUS
    // ========================================================================
    if (action === 'check_payment_status') {
      const checkData: CheckPaymentRequest = data as CheckPaymentRequest;

      if (!checkData.invoice_id) {
        return new Response(
          JSON.stringify({ error: 'invoice_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get invoice from Xendit
      const xenditResponse = await fetch(`${XENDIT_API_URL}/v2/invoices/${checkData.invoice_id}`, {
        method: 'GET',
        headers: {
          'Authorization': xenditAuthHeader,
        }
      });

      if (!xenditResponse.ok) {
        const errorData = await xenditResponse.json();
        throw new Error(`Xendit API error: ${JSON.stringify(errorData)}`);
      }

      const invoice = await xenditResponse.json();

      // Update invoice in database
      await supabaseClient
        .from('gv_invoices')
        .update({
          status: invoice.status,
          paid_at: invoice.paid_at || null,
          payment_channel: invoice.payment_channel || null,
          xendit_data: invoice,
          updated_at: new Date().toISOString(),
        })
        .eq('invoice_id', invoice.id);

      return new Response(
        JSON.stringify({
          success: true,
          invoice: {
            id: invoice.id,
            status: invoice.status,
            amount: invoice.amount,
            currency: invoice.currency,
            paid_at: invoice.paid_at,
            payment_channel: invoice.payment_channel,
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // WEBHOOK HANDLER (Xendit sends payment notifications)
    // ========================================================================
    if (action === 'webhook') {
      // Verify webhook token
      const callbackToken = req.headers.get('x-callback-token');
      const xenditCallbackToken = Deno.env.get('XENDIT_CALLBACK_TOKEN');

      if (callbackToken !== xenditCallbackToken) {
        return new Response(
          JSON.stringify({ error: 'Invalid callback token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const webhookData = data;

      // Update invoice status
      const { data: invoice } = await supabaseClient
        .from('gv_invoices')
        .select('*')
        .eq('invoice_id', webhookData.id)
        .single();

      if (!invoice) {
        return new Response(
          JSON.stringify({ error: 'Invoice not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabaseClient
        .from('gv_invoices')
        .update({
          status: webhookData.status,
          paid_at: webhookData.paid_at || null,
          payment_channel: webhookData.payment_channel || null,
          xendit_data: webhookData,
          updated_at: new Date().toISOString(),
        })
        .eq('invoice_id', webhookData.id);

      // If payment successful, activate subscription
      if (webhookData.status === 'PAID' || webhookData.status === 'SETTLED') {
        const subscriptionEndDate = invoice.billing_cycle === 'yearly'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // +1 year
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days

        // Create/update subscription
        const { error: subscriptionError } = await supabaseClient
          .from('gv_subscriptions')
          .upsert({
            user_id: invoice.user_id,
            brand_id: invoice.brand_id,
            plan: invoice.plan,
            billing_cycle: invoice.billing_cycle,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: subscriptionEndDate.toISOString(),
            invoice_id: invoice.invoice_id,
            amount_paid: invoice.amount,
            currency: invoice.currency,
            payment_method: webhookData.payment_channel,
            activated_at: new Date().toISOString(),
          }, {
            onConflict: 'brand_id'
          });

        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
        }

        // Update brand status
        await supabaseClient
          .from('brands')
          .update({
            subscription_status: 'active',
            subscription_plan: invoice.plan,
            subscription_activated_at: new Date().toISOString(),
          })
          .eq('id', invoice.brand_id);

        console.log(`✅ Subscription activated for brand ${invoice.brand_id}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Webhook processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // GET SUBSCRIPTION STATUS
    // ========================================================================
    if (action === 'get_subscription') {
      const { brand_id } = data;

      if (!brand_id) {
        return new Response(
          JSON.stringify({ error: 'brand_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: subscription, error } = await supabaseClient
        .from('gv_subscriptions')
        .select('*')
        .eq('brand_id', brand_id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          subscription: subscription || null,
          has_active_subscription: subscription?.status === 'active',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // CANCEL SUBSCRIPTION
    // ========================================================================
    if (action === 'cancel_subscription') {
      const { brand_id } = data;

      if (!brand_id) {
        return new Response(
          JSON.stringify({ error: 'brand_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update subscription to cancelled
      const { error: cancelError } = await supabaseClient
        .from('gv_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('brand_id', brand_id);

      if (cancelError) throw cancelError;

      // Update brand status
      await supabaseClient
        .from('brands')
        .update({
          subscription_status: 'cancelled',
        })
        .eq('id', brand_id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription cancelled successfully. Access will remain until end of billing period.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // GET PAYMENT METHODS (Available methods)
    // ========================================================================
    if (action === 'get_payment_methods') {
      return new Response(
        JSON.stringify({
          success: true,
          payment_methods: {
            virtual_accounts: [
              { code: 'BCA', name: 'Bank BCA', fee: 4000 },
              { code: 'MANDIRI', name: 'Bank Mandiri', fee: 4000 },
              { code: 'BRI', name: 'Bank BRI', fee: 4000 },
              { code: 'BNI', name: 'Bank BNI', fee: 4000 },
              { code: 'PERMATA', name: 'Bank Permata', fee: 4000 },
            ],
            e_wallets: [
              { code: 'OVO', name: 'OVO', fee_percentage: 2 },
              { code: 'DANA', name: 'DANA', fee_percentage: 2 },
              { code: 'LINKAJA', name: 'LinkAja', fee_percentage: 2 },
              { code: 'SHOPEEPAY', name: 'ShopeePay', fee_percentage: 2 },
            ],
            qris: [
              { code: 'QRIS', name: 'QRIS (All Banks)', fee_percentage: 0.7 },
            ],
            credit_card: [
              { code: 'CREDIT_CARD', name: 'Visa/Mastercard/JCB', fee_percentage: 2.9, fixed_fee: 2000 },
            ],
            retail: [
              { code: 'ALFAMART', name: 'Alfamart', fee: 5000 },
              { code: 'INDOMARET', name: 'Indomaret', fee: 5000 },
            ]
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Xendit payment handler error:', error);
    return new Response(
      JSON.stringify({
        error: 'Payment processing failed',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
