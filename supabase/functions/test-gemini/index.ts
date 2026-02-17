import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY')!;

    // List available models
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${GOOGLE_AI_API_KEY}`
    );

    const models = await listResponse.json();
    const availableModels = models.models
      ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: any) => m.name) || [];

    return new Response(
      JSON.stringify({
        success: true,
        available_models: availableModels,
        total: availableModels.length
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
