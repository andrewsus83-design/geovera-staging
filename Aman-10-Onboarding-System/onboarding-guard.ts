import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's brands
    const { data: userBrands, error: brandsError } = await supabaseClient
      .from('user_brands')
      .select('brand_id, brands(id, brand_name)')
      .eq('user_id', user.id);

    if (brandsError) throw brandsError;

    if (!userBrands || userBrands.length === 0) {
      return new Response(
        JSON.stringify({ 
          requires_onboarding: true,
          reason: 'no_brands',
          message: 'User has no brands. Must complete onboarding.',
          redirect_to: '/onboarding'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check onboarding status for each brand
    const onboardingStatuses = [];
    for (const userBrand of userBrands) {
      const { data: onboarding } = await supabaseClient
        .from('gv_onboarding_progress')
        .select('*')
        .eq('brand_id', userBrand.brand_id)
        .single();

      onboardingStatuses.push({
        brand_id: userBrand.brand_id,
        brand_name: userBrand.brands?.brand_name,
        onboarding_exists: !!onboarding,
        wizard_status: onboarding?.wizard_status || 'not_started',
        wizard_step: onboarding?.wizard_step || 0,
        is_completed: onboarding?.wizard_status === 'completed'
      });
    }

    // Check if any brand requires onboarding
    const incomplete = onboardingStatuses.find(s => !s.is_completed);
    
    if (incomplete) {
      return new Response(
        JSON.stringify({ 
          requires_onboarding: true,
          reason: 'incomplete_wizard',
          message: `Brand "${incomplete.brand_name}" requires onboarding completion.`,
          brand_id: incomplete.brand_id,
          current_step: incomplete.wizard_step,
          redirect_to: '/onboarding',
          statuses: onboardingStatuses
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All brands completed onboarding
    return new Response(
      JSON.stringify({ 
        requires_onboarding: false,
        message: 'All brands have completed onboarding.',
        brands: onboardingStatuses,
        default_brand_id: userBrands[0].brand_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Onboarding Guard Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});