import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Simple Onboarding] Request received');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[Simple Onboarding] Missing auth header');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify JWT and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('[Simple Onboarding] Invalid token:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Simple Onboarding] User authenticated:', user.id);

    const body = await req.json();
    console.log('[Simple Onboarding] Request body:', body);

    const { brand_name, category, country, web_url, description } = body;

    // Validate required fields
    if (!brand_name || !category || !country) {
      console.error('[Simple Onboarding] Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: brand_name, category, country' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has a brand
    const { data: existingBrands, error: checkError } = await supabase
      .from('user_brands')
      .select('brand_id')
      .eq('user_id', user.id);

    if (checkError) {
      console.error('[Simple Onboarding] Error checking existing brands:', checkError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error checking existing brands' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingBrands && existingBrands.length > 0) {
      console.log('[Simple Onboarding] User already has a brand');
      return new Response(
        JSON.stringify({ success: false, error: 'User already has a brand. Each user can only create one brand.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create brand
    console.log('[Simple Onboarding] Creating brand...');
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .insert({
        brand_name: brand_name,
        category: category,
        country: country,
        web_url: web_url || null,
        description: description || null,
        subscription_tier: 'essential',  // Default to Basic tier ($399/mo)
        onboarding_completed: true
      })
      .select()
      .single();

    if (brandError) {
      console.error('[Simple Onboarding] Brand creation error:', brandError);
      return new Response(
        JSON.stringify({ success: false, error: brandError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Simple Onboarding] Brand created:', brand.id);

    // Link brand to user
    const { error: linkError } = await supabase
      .from('user_brands')
      .insert({
        user_id: user.id,
        brand_id: brand.id,
        role: 'owner'
      });

    if (linkError) {
      console.error('[Simple Onboarding] User-brand link error:', linkError);
      return new Response(
        JSON.stringify({ success: false, error: linkError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Simple Onboarding] Brand linked to user successfully');

    return new Response(
      JSON.stringify({
        success: true,
        brand_id: brand.id,
        brand: brand,
        message: 'Brand created successfully!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Simple Onboarding] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
