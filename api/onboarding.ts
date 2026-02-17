// Vercel Edge Function - Replacement for Supabase
// Deploy: Just git push (auto-deployed by Vercel)

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { brand_name, country } = await req.json();

    // Validation
    if (!brand_name) {
      throw new Error('brand_name is required');
    }

    if (!country) {
      throw new Error('country is required');
    }

    // Call your existing Supabase function as a backend
    // OR implement the logic here directly
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/onboarding-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ brand_name, country }),
    });

    const result = await response.json();

    // Save HTML to file system via Vercel Blob/Storage
    // Or return directly for client-side save

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
