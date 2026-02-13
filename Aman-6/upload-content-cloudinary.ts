import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME') || 'geovera';
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'content-type'
      } 
    });
  }

  try {
    const { file_content, filename, resource_type, folder = 'geovera/kopi-kenangan' } = await req.json();

    if (!file_content || !filename) {
      throw new Error('file_content and filename required');
    }

    console.log(`[Upload] Starting: ${filename} (${resource_type})`);

    // Generate timestamp
    const timestamp = Math.round(Date.now() / 1000);
    
    // Create signature
    const params = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const msgBuffer = new TextEncoder().encode(params);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Build form data
    const formData = new FormData();
    formData.append('file', `data:${getContentType(resource_type)};base64,${file_content}`);
    formData.append('api_key', CLOUDINARY_API_KEY!);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('public_id', filename.replace(/\.[^/.]+$/, ''));

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resource_type}/upload`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('[Upload] Failed:', errorText);
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();
    console.log('[Upload] Success:', result.secure_url);

    return new Response(
      JSON.stringify({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );

  } catch (error: any) {
    console.error('[Upload] Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

function getContentType(resourceType: string): string {
  switch (resourceType) {
    case 'image': return 'image/png';
    case 'video': return 'video/mp4';
    case 'raw': return 'text/markdown';
    default: return 'application/octet-stream';
  }
}