{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red144\green1\blue18;\red14\green110\blue109;\red19\green118\blue70;\red83\green83\blue83;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c40000\c40000\c40000;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2.39.3'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 OPENAI_API_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'OPENAI_API_KEY'\cf4 \strokec5 );\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 CLOUDINARY_CLOUD_NAME\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'CLOUDINARY_CLOUD_NAME'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \cf6 \strokec6 'geovera'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 CLOUDINARY_API_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'CLOUDINARY_API_KEY'\cf4 \strokec5 );\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 CLOUDINARY_API_SECRET\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'CLOUDINARY_API_SECRET'\cf4 \strokec5 );\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 SUPABASE_URL\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 );\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 );\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \strokec4  \cf7 \strokec7 ContentGenerationRequest\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   generation_ids\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     article_id?: \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     image_ids?: \cf2 \strokec2 string\cf4 \strokec5 [];\cb1 \strokec4 \
\cb3     video_id?: \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   \strokec5 \};\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Automation] Starting complete pipeline...'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3   \cb1 \
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  brand_id\strokec5 ,\strokec4  generation_ids \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec5 .\strokec4 json\strokec5 ()\strokec4  \cf2 \strokec2 as\cf4 \strokec4  \cf7 \strokec7 ContentGenerationRequest\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cf7 \strokec7 SUPABASE_URL\cf4 \strokec5 !,\strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec5 !);\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  results\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       brand_id\strokec5 ,\cb1 \strokec4 \
\cb3       article\strokec5 :\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       images\strokec5 :\strokec4  \strokec5 [],\cb1 \strokec4 \
\cb3       video\strokec5 :\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       total_cost\strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       execution_time_ms\strokec5 :\strokec4  \cf8 \strokec8 0\cf4 \cb1 \strokec4 \
\cb3     \strokec5 \};\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  startTime \strokec5 =\strokec4  \cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ();\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf9 \strokec9 // STEP 1: Generate Images via DALL-E 3\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 generation_ids\strokec5 .\strokec4 image_ids \strokec5 &&\strokec4  generation_ids\strokec5 .\strokec4 image_ids\strokec5 .\strokec4 length \strokec5 >\strokec4  \cf8 \strokec8 0\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Automation] Generating images via DALL-E 3...'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  image_id \cf2 \strokec2 of\cf4 \strokec4  generation_ids\strokec5 .\strokec4 image_ids\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf9 \strokec9 // Get image generation record\cf4 \cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  imageGen \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3             \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_image_generations'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3             \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3             \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  image_id\strokec5 )\cb1 \strokec4 \
\cb3             \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 imageGen\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 `[Automation] Image \cf4 \strokec5 $\{\strokec4 image_id\strokec5 \}\cf6 \strokec6  not found`\cf4 \strokec5 );\cb1 \strokec4 \
\cb3             \cf2 \strokec2 continue\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3           \strokec5 \}\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 `[Automation] Generating image: \cf4 \strokec5 $\{\strokec4 imageGen\strokec5 .\strokec4 style_preset\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 );\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf9 \strokec9 // Call DALL-E 3\cf4 \cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  dalleResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cf6 \strokec6 'https://api.openai.com/v1/images/generations'\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3             headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3               \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3               \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\cf7 \strokec7 OPENAI_API_KEY\cf4 \strokec5 \}\cf6 \strokec6 `\cf4 \cb1 \strokec4 \
\cb3             \strokec5 \},\cb1 \strokec4 \
\cb3             body\strokec5 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3               model\strokec5 :\strokec4  \cf6 \strokec6 'dall-e-3'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3               prompt\strokec5 :\strokec4  imageGen\strokec5 .\strokec4 prompt_text\strokec5 ,\cb1 \strokec4 \
\cb3               n\strokec5 :\strokec4  \cf8 \strokec8 1\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3               size\strokec5 :\strokec4  \cf6 \strokec6 '1024x1024'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3               quality\strokec5 :\strokec4  \cf6 \strokec6 'standard'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3               response_format\strokec5 :\strokec4  \cf6 \strokec6 'url'\cf4 \cb1 \strokec4 \
\cb3             \strokec5 \})\cb1 \strokec4 \
\cb3           \strokec5 \});\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 dalleResponse\strokec5 .\strokec4 ok\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             \cf2 \strokec2 const\cf4 \strokec4  errorText \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  dalleResponse\strokec5 .\strokec4 text\strokec5 ();\cb1 \strokec4 \
\cb3             console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Automation] DALL-E error:'\cf4 \strokec5 ,\strokec4  errorText\strokec5 );\cb1 \strokec4 \
\cb3             \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec5 (\cf6 \strokec6 `DALL-E failed: \cf4 \strokec5 $\{\strokec4 dalleResponse\strokec5 .\strokec4 status\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 );\cb1 \strokec4 \
\cb3           \strokec5 \}\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  dalleData \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  dalleResponse\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  tempImageUrl \strokec5 =\strokec4  dalleData\strokec5 .\strokec4 data\strokec5 [\cf8 \strokec8 0\cf4 \strokec5 ].\strokec4 url\strokec5 ;\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Automation] Image generated, downloading...'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf9 \strokec9 // Download the generated image\cf4 \cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  imageResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\strokec4 tempImageUrl\strokec5 );\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  imageBuffer \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  imageResponse\strokec5 .\strokec4 arrayBuffer\strokec5 ();\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  imageBase64 \strokec5 =\strokec4  btoa\strokec5 (\cf7 \strokec7 String\cf4 \strokec5 .\strokec4 fromCharCode\strokec5 (...\cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Uint8Array\cf4 \strokec5 (\strokec4 imageBuffer\strokec5 )));\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Automation] Uploading to Cloudinary...'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf9 \strokec9 // Upload to Cloudinary\cf4 \cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  timestamp \strokec5 =\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 /\strokec4  \cf8 \strokec8 1000\cf4 \strokec5 );\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  publicId \strokec5 =\strokec4  \cf6 \strokec6 `geovera/kopi-kenangan/images/es-kopi-mantan-\cf4 \strokec5 $\{\strokec4 imageGen\strokec5 .\strokec4 style_preset\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  signatureParams \strokec5 =\strokec4  \cf6 \strokec6 `public_id=\cf4 \strokec5 $\{\strokec4 publicId\strokec5 \}\cf6 \strokec6 &timestamp=\cf4 \strokec5 $\{\strokec4 timestamp\strokec5 \}$\{\cf7 \strokec7 CLOUDINARY_API_SECRET\cf4 \strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  msgBuffer \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 TextEncoder\cf4 \strokec5 ().\strokec4 encode\strokec5 (\strokec4 signatureParams\strokec5 );\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  hashBuffer \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  crypto\strokec5 .\strokec4 subtle\strokec5 .\strokec4 digest\strokec5 (\cf6 \strokec6 'SHA-1'\cf4 \strokec5 ,\strokec4  msgBuffer\strokec5 );\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  hashArray \strokec5 =\strokec4  \cf7 \strokec7 Array\cf4 \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Uint8Array\cf4 \strokec5 (\strokec4 hashBuffer\strokec5 ));\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  signature \strokec5 =\strokec4  hashArray\strokec5 .\strokec4 map\strokec5 (\strokec4 b \strokec5 =>\strokec4  b\strokec5 .\strokec4 toString\strokec5 (\cf8 \strokec8 16\cf4 \strokec5 ).\strokec4 padStart\strokec5 (\cf8 \strokec8 2\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 '0'\cf4 \strokec5 )).\strokec4 join\strokec5 (\cf6 \strokec6 ''\cf4 \strokec5 );\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  formData \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 FormData\cf4 \strokec5 ();\cb1 \strokec4 \
\cb3           formData\strokec5 .\strokec4 append\strokec5 (\cf6 \strokec6 'file'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 `data:image/png;base64,\cf4 \strokec5 $\{\strokec4 imageBase64\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 );\cb1 \strokec4 \
\cb3           formData\strokec5 .\strokec4 append\strokec5 (\cf6 \strokec6 'api_key'\cf4 \strokec5 ,\strokec4  \cf7 \strokec7 CLOUDINARY_API_KEY\cf4 \strokec5 !);\cb1 \strokec4 \
\cb3           formData\strokec5 .\strokec4 append\strokec5 (\cf6 \strokec6 'timestamp'\cf4 \strokec5 ,\strokec4  timestamp\strokec5 .\strokec4 toString\strokec5 ());\cb1 \strokec4 \
\cb3           formData\strokec5 .\strokec4 append\strokec5 (\cf6 \strokec6 'signature'\cf4 \strokec5 ,\strokec4  signature\strokec5 );\cb1 \strokec4 \
\cb3           formData\strokec5 .\strokec4 append\strokec5 (\cf6 \strokec6 'public_id'\cf4 \strokec5 ,\strokec4  publicId\strokec5 );\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  cloudinaryResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cb1 \strokec4 \
\cb3             \cf6 \strokec6 `https://api.cloudinary.com/v1_1/\cf4 \strokec5 $\{\cf7 \strokec7 CLOUDINARY_CLOUD_NAME\cf4 \strokec5 \}\cf6 \strokec6 /image/upload`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3             \strokec5 \{\strokec4  method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\strokec4  body\strokec5 :\strokec4  formData \strokec5 \}\cb1 \strokec4 \
\cb3           \strokec5 );\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 cloudinaryResponse\strokec5 .\strokec4 ok\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec5 (\cf6 \strokec6 'Cloudinary upload failed'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3           \strokec5 \}\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  cloudinaryData \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  cloudinaryResponse\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\cb3           \cf2 \strokec2 const\cf4 \strokec4  finalUrl \strokec5 =\strokec4  cloudinaryData\strokec5 .\strokec4 secure_url\strokec5 ;\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Automation] Image uploaded:'\cf4 \strokec5 ,\strokec4  finalUrl\strokec5 );\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           \cf9 \strokec9 // Update database\cf4 \cb1 \strokec4 \
\cb3           \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3             \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_image_generations'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3             \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3               image_url\strokec5 :\strokec4  finalUrl\strokec5 ,\cb1 \strokec4 \
\cb3               status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3               generation_time_ms\strokec5 :\strokec4  \cf8 \strokec8 15000\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3               cost_usd\strokec5 :\strokec4  \cf8 \strokec8 0.04\cf4 \cb1 \strokec4 \
\cb3             \strokec5 \})\cb1 \strokec4 \
\cb3             \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  image_id\strokec5 );\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           results\strokec5 .\strokec4 images\strokec5 .\strokec4 push\strokec5 (\{\cb1 \strokec4 \
\cb3             id\strokec5 :\strokec4  image_id\strokec5 ,\cb1 \strokec4 \
\cb3             style\strokec5 :\strokec4  imageGen\strokec5 .\strokec4 style_preset\strokec5 ,\cb1 \strokec4 \
\cb3             url\strokec5 :\strokec4  finalUrl\strokec5 ,\cb1 \strokec4 \
\cb3             cost\strokec5 :\strokec4  \cf8 \strokec8 0.04\cf4 \cb1 \strokec4 \
\cb3           \strokec5 \});\cb1 \strokec4 \
\cb3           \cb1 \
\cb3           results\strokec5 .\strokec4 total_cost \strokec5 +=\strokec4  \cf8 \strokec8 0.04\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3           \cb1 \
\cb3         \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 `[Automation] Image \cf4 \strokec5 $\{\strokec4 image_id\strokec5 \}\cf6 \strokec6  failed:`\cf4 \strokec5 ,\strokec4  error\strokec5 .\strokec4 message\strokec5 );\cb1 \strokec4 \
\cb3           results\strokec5 .\strokec4 images\strokec5 .\strokec4 push\strokec5 (\{\cb1 \strokec4 \
\cb3             id\strokec5 :\strokec4  image_id\strokec5 ,\cb1 \strokec4 \
\cb3             error\strokec5 :\strokec4  error\strokec5 .\strokec4 message\cb1 \
\cb3           \strokec5 \});\cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf9 \strokec9 // STEP 2: Handle Article\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 generation_ids\strokec5 .\strokec4 article_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  article \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_content_assets'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  generation_ids\strokec5 .\strokec4 article_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 article\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         results\strokec5 .\strokec4 article \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           id\strokec5 :\strokec4  article\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3           title\strokec5 :\strokec4  article\strokec5 .\strokec4 title\strokec5 ,\cb1 \strokec4 \
\cb3           word_count\strokec5 :\strokec4  article\strokec5 .\strokec4 seo_metadata\strokec5 ?.\strokec4 word_count \strokec5 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'published'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \};\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf9 \strokec9 // STEP 3: Handle Video (placeholder for now)\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 generation_ids\strokec5 .\strokec4 video_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       results\strokec5 .\strokec4 video \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         id\strokec5 :\strokec4  generation_ids\strokec5 .\strokec4 video_id\strokec5 ,\cb1 \strokec4 \
\cb3         status\strokec5 :\strokec4  \cf6 \strokec6 'script_ready'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         note\strokec5 :\strokec4  \cf6 \strokec6 'Video generation requires Runway ML API - coming soon'\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \};\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     results\strokec5 .\strokec4 execution_time_ms \strokec5 =\strokec4  \cf7 \strokec7 Date\cf4 \strokec5 .\strokec4 now\strokec5 ()\strokec4  \strokec5 -\strokec4  startTime\strokec5 ;\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     console\strokec5 .\strokec4 log\strokec5 (\cf6 \strokec6 '[Automation] Pipeline complete!'\cf4 \strokec5 ,\strokec4  results\strokec5 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 results\strokec5 ),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  \cb1 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cb1 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}\strokec4  \cb1 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 :\strokec4  \cf2 \strokec2 any\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     console\strokec5 .\strokec4 error\strokec5 (\cf6 \strokec6 '[Automation] Error:'\cf4 \strokec5 ,\strokec4  error\strokec5 .\strokec4 message\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  \cb1 \
\cb3         success\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec5 ,\strokec4  \cb1 \
\cb3         error\strokec5 :\strokec4  error\strokec5 .\strokec4 message\strokec5 ,\cb1 \strokec4 \
\cb3         stack\strokec5 :\strokec4  error\strokec5 .\strokec4 stack \cb1 \
\cb3       \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  \cb1 \
\cb3         status\strokec5 :\strokec4  \cf8 \strokec8 500\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \});\cb1 \strokec4 \
}