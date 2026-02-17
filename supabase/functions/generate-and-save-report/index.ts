import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { brand_name, country } = await req.json()

    if (!brand_name) {
      throw new Error('brand_name is required')
    }

    if (!country) {
      throw new Error('country is required')
    }

    console.log(`Generating and saving report for: ${brand_name} (${country})`)

    // Call the main onboarding-workflow function
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

    const workflowResponse = await fetch(`${SUPABASE_URL}/functions/v1/onboarding-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ brand_name, country }),
    })

    if (!workflowResponse.ok) {
      const errorText = await workflowResponse.text()
      throw new Error(`Workflow failed: ${errorText}`)
    }

    const result = await workflowResponse.json()

    if (!result.success || !result.html_content) {
      throw new Error('Report generation failed or no HTML content returned')
    }

    // Generate slug
    const slug = brand_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Save HTML to file system
    const reportPath = `/Users/drew83/Desktop/geovera-staging/frontend/reports/${slug}.html`

    try {
      await Deno.writeTextFile(reportPath, result.html_content)
      console.log(`✅ Report saved to: ${reportPath}`)
    } catch (fileError) {
      console.error(`❌ Failed to save file: ${fileError}`)
      // Return success anyway with note about file save failure
      return new Response(
        JSON.stringify({
          success: true,
          html_content: result.html_content,
          report_url: result.report_url,
          slug,
          file_save_error: `Could not save to filesystem: ${fileError.message}`,
          note: 'Report generated successfully but file save failed. HTML content is in response.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        report_url: `https://geovera-staging.vercel.app/reports/${slug}.html`,
        local_path: reportPath,
        slug,
        message: `Report generated and saved successfully for ${brand_name}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
