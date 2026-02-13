import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  try {
    const { html, path } = await req.json();
    if (!html || !path) {
      return new Response(JSON.stringify({ error: 'html and path required' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const blob = new Blob([html], { type: 'text/html' });

    const { data, error } = await supabase.storage
      .from('pages')
      .upload(path, blob, {
        contentType: 'text/html',
        cacheControl: '300',
        upsert: true,
      });

    if (error) throw error;

    const projectUrl = Deno.env.get('SUPABASE_URL')!;
    const publicUrl = `${projectUrl}/storage/v1/object/public/pages/${path}`;

    return new Response(JSON.stringify({ success: true, url: publicUrl, path: data.path }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
