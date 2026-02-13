import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Whitelist allowed origins for CORS (more secure than wildcard)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8000',
  'https://vozjwptzutolvkvfpknk.supabase.co',
  // Add your production domains here
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // GET — fetch profile
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const email = url.searchParams.get('email');
      if (!email) return new Response(JSON.stringify({ error: 'email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      const { data: customer, error: ce } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (ce || !customer) return new Response(JSON.stringify({ error: 'customer not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      let brand = null;
      if (customer.user_id) {
        const { data: ub } = await supabase
          .from('user_brands')
          .select('brand_id')
          .eq('user_id', customer.user_id)
          .limit(1)
          .single();

        if (ub?.brand_id) {
          const { data: b } = await supabase
            .from('brands')
            .select('*')
            .eq('id', ub.brand_id)
            .single();
          brand = b;
        }
      }

      return new Response(JSON.stringify({ customer, brand }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST — update profile
    if (req.method === 'POST') {
      const body = await req.json();
      const { email, customer: custUpdate, brand: brandUpdate } = body;

      if (!email) return new Response(JSON.stringify({ error: 'email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      // Get customer
      const { data: cust } = await supabase.from('customers').select('*').eq('email', email).single();
      if (!cust) return new Response(JSON.stringify({ error: 'customer not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      // Update customer
      let updatedCustomer = cust;
      if (custUpdate) {
        const { data: uc, error: uce } = await supabase
          .from('customers')
          .update({ ...custUpdate, updated_at: new Date().toISOString() })
          .eq('id', cust.id)
          .select()
          .single();
        if (uc) updatedCustomer = uc;
      }

      // Update brand
      let updatedBrand = null;
      if (brandUpdate && cust.user_id) {
        const { data: ub } = await supabase
          .from('user_brands')
          .select('brand_id')
          .eq('user_id', cust.user_id)
          .limit(1)
          .single();

        if (ub?.brand_id) {
          const { data: ub2 } = await supabase
            .from('brands')
            .update({ ...brandUpdate, updated_at: new Date().toISOString() })
            .eq('id', ub.brand_id)
            .select()
            .single();
          updatedBrand = ub2;
        }
      }

      return new Response(JSON.stringify({ customer: updatedCustomer, brand: updatedBrand }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
