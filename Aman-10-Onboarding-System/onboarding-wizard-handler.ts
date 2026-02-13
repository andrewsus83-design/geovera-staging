import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Step1Data {
  brand_name: string;
  category: string;
  description?: string;
  website_url?: string;
  whatsapp_number?: string;
}

interface Step2Corrections {
  essence?: string;
  personality_traits?: string[];
  target_audience?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, brand_id, step, data } = await req.json();

    // STEP 1: Create Brand & Initialize Onboarding
    if (action === 'step1_create_brand') {
      const step1Data: Step1Data = data;
      
      // Create brand
      const { data: brand, error: brandError } = await supabaseClient
        .from('brands')
        .insert({
          brand_name: step1Data.brand_name,
          category: step1Data.category,
          description: step1Data.description || '',
          website_url: step1Data.website_url,
          whatsapp_number: step1Data.whatsapp_number,
          qa_config: { questions_per_day: 5 }
        })
        .select()
        .single();

      if (brandError) throw brandError;

      // Link user to brand as owner
      const { error: linkError } = await supabaseClient
        .from('user_brands')
        .insert({
          user_id: user.id,
          brand_id: brand.id,
          role: 'owner'
        });

      if (linkError) throw linkError;

      // Initialize onboarding progress
      const { data: onboarding, error: onboardingError } = await supabaseClient
        .from('gv_onboarding_progress')
        .insert({
          brand_id: brand.id,
          wizard_step: 1,
          wizard_status: 'step1_completed',
          step1_completed: true,
          step1_completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (onboardingError) throw onboardingError;

      return new Response(
        JSON.stringify({ 
          success: true,
          brand,
          onboarding,
          next_step: 2
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 2: Generate Brand DNA
    if (action === 'step2_generate_dna') {
      // Call OpenAI to generate brand DNA
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      
      const { data: brand } = await supabaseClient
        .from('brands')
        .select('brand_name, category, description, website_url')
        .eq('id', brand_id)
        .single();

      const prompt = `Generate brand DNA for "${brand.brand_name}" in category "${brand.category}".
Description: ${brand.description || 'Not provided'}
Website: ${brand.website_url || 'Not provided'}

Generate:
1. Brand Essence (1-2 sentences)
2. Personality Traits (5-7 adjectives)
3. Target Audience (2-3 sentences)
4. Voice & Tone Guidelines (3-4 points)

Format as JSON.`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a brand strategy expert. Generate brand DNA in valid JSON format.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        })
      });

      const openaiData = await openaiResponse.json();
      const dnaRaw = JSON.parse(openaiData.choices[0].message.content);

      // Save to gv_brand_dna
      const { data: dna, error: dnaError } = await supabaseClient
        .from('gv_brand_dna')
        .insert({
          brand_id: brand_id,
          essence: dnaRaw.brand_essence || dnaRaw.essence,
          personality_traits: dnaRaw.personality_traits || [],
          target_audience: dnaRaw.target_audience,
          voice_tone_guidelines: dnaRaw.voice_tone_guidelines || []
        })
        .select()
        .single();

      if (dnaError) throw dnaError;

      // Update onboarding progress
      const { error: updateError } = await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          wizard_step: 2,
          step2_dna_generated: true,
          step2_dna_confidence: 0.85,
          updated_at: new Date().toISOString()
        })
        .eq('brand_id', brand_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ 
          success: true,
          dna,
          next_step: 2,
          message: 'Brand DNA generated. Please review and validate.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 2: Validate DNA (User Approval)
    if (action === 'step2_validate_dna') {
      const corrections: Step2Corrections = data.corrections || {};

      // Apply corrections if provided
      if (Object.keys(corrections).length > 0) {
        const { error: updateDnaError } = await supabaseClient
          .from('gv_brand_dna')
          .update(corrections)
          .eq('brand_id', brand_id);

        if (updateDnaError) throw updateDnaError;
      }

      // Mark step 2 completed
      const { error: updateError } = await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          wizard_step: 3,
          step2_user_validated: true,
          step2_corrections: corrections,
          step2_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('brand_id', brand_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ 
          success: true,
          next_step: 3,
          message: 'Brand DNA validated. Starting intelligence pipeline...'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 3: FINAL CONFIRMATION (NEW!)
    if (action === 'step3_final_confirmation') {
      // Get all brand data for confirmation screen
      const { data: brand } = await supabaseClient
        .from('brands')
        .select('brand_name, category, country, description, website_url, instagram_url, tiktok_url, youtube_url, whatsapp_number')
        .eq('id', brand_id)
        .single();

      const { data: dna } = await supabaseClient
        .from('gv_brand_dna')
        .select('essence, personality_traits, target_audience')
        .eq('brand_id', brand_id)
        .single();

      // Return confirmation data
      return new Response(
        JSON.stringify({
          success: true,
          confirmation_data: {
            brand,
            dna,
            locked_fields: {
              brand_name: brand.brand_name,
              category: brand.category,
              country: brand.country
            },
            editable_fields: {
              description: brand.description,
              website_url: brand.website_url,
              instagram_url: brand.instagram_url,
              tiktok_url: brand.tiktok_url,
              youtube_url: brand.youtube_url,
              whatsapp_number: brand.whatsapp_number
            },
            warning: {
              title: "⚠️ IMPORTANT: Brand Lock Notice",
              message: "Once you confirm, your BRAND NAME, CATEGORY, and COUNTRY will be LOCKED for 30 days. This ensures deep AI personalization and accurate learning. You CAN still update social media URLs, description, and contact info anytime.",
              locked: ["Brand Name", "Category", "Country"],
              editable: ["Social Media URLs", "Description", "Contact Information", "Website URL"]
            }
          },
          next_step: 4,
          message: 'Please review and confirm your brand details.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 4: CONFIRM & LOCK BRAND (RENAMED from step3)
    if (action === 'step4_confirm_and_lock') {
      // Lock the brand
      const lockedAt = new Date().toISOString();

      const { error: lockError } = await supabaseClient
        .from('brands')
        .update({
          brand_name_locked: true,
          category_locked: true,
          country_locked: true,
          locked_at: lockedAt,
          can_edit_social_urls: true,
          can_edit_description: true,
          can_edit_contact_info: true
        })
        .eq('id', brand_id);

      if (lockError) throw lockError;

      // Also update user_brands with lock
      const { error: userBrandLockError } = await supabaseClient
        .from('user_brands')
        .update({
          locked_at: lockedAt,
          locked_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
          can_switch: false
        })
        .eq('brand_id', brand_id);

      if (userBrandLockError) throw userBrandLockError;

      // Update onboarding progress
      const { error: updateError } = await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          wizard_step: 4,
          step3_brand_locked: true,
          step3_locked_at: lockedAt,
          updated_at: new Date().toISOString()
        })
        .eq('brand_id', brand_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          brand_locked: true,
          locked_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_step: 5,
          message: 'Brand confirmed and locked for 30 days. Starting intelligence pipeline...'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 5: Start Intelligence Pipeline (RENAMED from step3)
    if (action === 'step5_start_pipeline') {
      // Trigger pipeline via orchestrator
      const pipelineResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/orchestrator-v2`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            brand_id: brand_id,
            mode: 'onboarding',
            steps: ['ingestion', 'normalization', 'classification', 'foundation-gate']
          })
        }
      );

      const pipelineData = await pipelineResponse.json();

      // Update onboarding with pipeline run ID
      const { error: updateError } = await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          pipeline_run_id: pipelineData.run_id,
          pipeline_status: 'running',
          pipeline_started_at: new Date().toISOString(),
          pipeline_total_steps: 4,
          pipeline_current_step: 0,
          updated_at: new Date().toISOString()
        })
        .eq('brand_id', brand_id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          run_id: pipelineData.run_id,
          next_step: 5,
          message: 'Intelligence pipeline started. This will take 2-3 minutes.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 6: Complete Onboarding (RENAMED from step4)
    if (action === 'step6_complete') {
      const { data: onboarding } = await supabaseClient
        .from('gv_onboarding_progress')
        .select('pipeline_run_id')
        .eq('brand_id', brand_id)
        .single();

      // Get pipeline results
      const { data: run } = await supabaseClient
        .from('gv_runs')
        .select('status, cost_usd, steps_executed')
        .eq('id', onboarding.pipeline_run_id)
        .single();

      // Mark onboarding completed
      const { error: completeError } = await supabaseClient
        .from('gv_onboarding_progress')
        .update({
          wizard_step: 6,
          wizard_status: 'completed',
          pipeline_status: 'completed',
          pipeline_completed_at: new Date().toISOString(),
          pipeline_progress_pct: 100,
          step6_results: {
            pipeline_cost: run?.cost_usd,
            steps_executed: run?.steps_executed
          },
          updated_at: new Date().toISOString()
        })
        .eq('brand_id', brand_id);

      if (completeError) throw completeError;

      // Create welcome notification
      await supabaseClient
        .from('gv_notifications')
        .insert({
          brand_id: brand_id,
          event_type: 'onboarding_completed',
          severity: 'success',
          title: 'Welcome to GeoVera!',
          message: 'Your brand intelligence platform is ready. Explore your dashboard to see insights.',
          is_read: false
        });

      return new Response(
        JSON.stringify({ 
          success: true,
          wizard_status: 'completed',
          message: 'Onboarding completed! Redirecting to dashboard...',
          redirect_to: '/dashboard'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current onboarding status
    if (action === 'get_status') {
      const { data: onboarding } = await supabaseClient
        .from('gv_onboarding_progress')
        .select('*')
        .eq('brand_id', brand_id)
        .single();

      return new Response(
        JSON.stringify({ success: true, onboarding }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Wizard Handler Error:', error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});