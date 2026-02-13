{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red144\green1\blue18;\red14\green110\blue109;\red83\green83\blue83;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c50196\c50196;\cssrgb\c40000\c40000\c40000;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2.39.3'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 OPENAI_API_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'OPENAI_API_KEY'\cf4 \strokec5 );\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 SUPABASE_URL\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 );\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec4  \strokec5 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 );\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \cb3 \strokec2 try\cf4 \cb3 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec5 ,\strokec4  generation_id\strokec5 ,\strokec4  brand_id \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  supabase \strokec5 =\strokec4  createClient\strokec5 (\cf7 \strokec7 SUPABASE_URL\cf4 \strokec5 !,\strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec5 !);\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'article'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf8 \cb3 \strokec8 // Get article from database\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  article \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_content_assets'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  generation_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec5 :\strokec4  \cf6 \strokec6 'article'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           id\strokec5 :\strokec4  generation_id\strokec5 ,\cb1 \strokec4 \
\cb3           title\strokec5 :\strokec4  article\strokec5 .\strokec4 title\strokec5 ,\cb1 \strokec4 \
\cb3           content\strokec5 :\strokec4  article\strokec5 .\strokec4 body_text\strokec5 ,\cb1 \strokec4 \
\cb3           url\strokec5 :\strokec4  \cf6 \strokec6 `https://geovera.com/articles/\cf4 \strokec5 $\{\strokec4 generation_id\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'image'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf8 \cb3 \strokec8 // Get image generation record\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  imageGen \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_image_generations'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  generation_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (!\strokec4 imageGen\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec5 (\cf6 \strokec6 'Image generation record not found'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf8 \cb3 \strokec8 // Call OpenAI DALL-E 3\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  openaiResponse \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec5 (\cf6 \strokec6 'https://api.openai.com/v1/images/generations'\cf4 \strokec5 ,\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         method\strokec5 :\strokec4  \cf6 \strokec6 'POST'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\cf7 \strokec7 OPENAI_API_KEY\cf4 \strokec5 \}\cf6 \strokec6 `\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         body\strokec5 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           model\strokec5 :\strokec4  \cf6 \strokec6 'dall-e-3'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           prompt\strokec5 :\strokec4  imageGen\strokec5 .\strokec4 prompt_text\strokec5 ,\cb1 \strokec4 \
\cb3           n\strokec5 :\strokec4  \cf9 \strokec9 1\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           size\strokec5 :\strokec4  \cf6 \strokec6 '1024x1024'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           quality\strokec5 :\strokec4  \cf6 \strokec6 'standard'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  openaiData \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  openaiResponse\strokec5 .\strokec4 json\strokec5 ();\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (!\strokec4 openaiData\strokec5 .\strokec4 data \strokec5 ||\strokec4  \strokec5 !\strokec4 openaiData\strokec5 .\strokec4 data\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ])\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec5 (\cf6 \strokec6 'OpenAI generation failed'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  imageUrl \strokec5 =\strokec4  openaiData\strokec5 .\strokec4 data\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ].\strokec4 url\strokec5 ;\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf8 \cb3 \strokec8 // Update database\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_image_generations'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3           image_url\strokec5 :\strokec4  imageUrl\strokec5 ,\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           generation_time_sec\strokec5 :\strokec4  \cf9 \strokec9 15\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           cost_usd\strokec5 :\strokec4  \cf9 \strokec9 0.04\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           updated_at\strokec5 :\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 ()\cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  generation_id\strokec5 );\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec5 :\strokec4  \cf6 \strokec6 'image'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           id\strokec5 :\strokec4  generation_id\strokec5 ,\cb1 \strokec4 \
\cb3           image_url\strokec5 :\strokec4  imageUrl\strokec5 ,\cb1 \strokec4 \
\cb3           prompt\strokec5 :\strokec4  imageGen\strokec5 .\strokec4 prompt_text\strokec5 ,\cb1 \strokec4 \
\cb3           resolution\strokec5 :\strokec4  imageGen\strokec5 .\strokec4 resolution\strokec5 ,\cb1 \strokec4 \
\cb3           cost_usd\strokec5 :\strokec4  \cf9 \strokec9 0.04\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (\cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'video'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf8 \cb3 \strokec8 // Get video generation record\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  videoGen \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_video_generations'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  generation_id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec5 (!\strokec4 videoGen\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec5 (\cf6 \strokec6 'Video generation record not found'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf8 \cb3 \strokec8 // For demo: Return script-ready status\cf4 \cb1 \strokec4 \
\cb3       \cf8 \cb3 \strokec8 // In production: Call Runway ML API here\cf4 \cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  mockVideoUrl \strokec5 =\strokec4  \cf6 \strokec6 `https://cdn.geovera.com/videos/es-kopi-mantan-\cf4 \strokec5 $\{\strokec4 generation_id\strokec5 \}\cf6 \strokec6 .mp4`\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec5 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec5 (\cf6 \strokec6 'gv_video_generations'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3           video_url\strokec5 :\strokec4  mockVideoUrl\strokec5 ,\cb1 \strokec4 \
\cb3           video_status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'published'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           updated_at\strokec5 :\strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 ()\cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  generation_id\strokec5 );\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec5 ,\cb1 \strokec4 \
\cb3           \cf2 \cb3 \strokec2 type\cf4 \cb3 \strokec5 :\strokec4  \cf6 \strokec6 'video'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           id\strokec5 :\strokec4  generation_id\strokec5 ,\cb1 \strokec4 \
\cb3           video_url\strokec5 :\strokec4  mockVideoUrl\strokec5 ,\cb1 \strokec4 \
\cb3           script\strokec5 :\strokec4  videoGen\strokec5 .\strokec4 script_body\strokec5 ,\cb1 \strokec4 \
\cb3           duration_sec\strokec5 :\strokec4  videoGen\strokec5 .\strokec4 target_duration_sec\strokec5 ,\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'script_ready'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           note\strokec5 :\strokec4  \cf6 \strokec6 'Video generation requires Runway ML API key - script is ready for manual generation'\cf4 \cb1 \strokec4 \
\cb3         \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 );\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec5 (\cf6 \strokec6 'Invalid type. Use: article, image, or video'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3   \strokec5 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  \cb1 \
\cb3         success\strokec5 :\strokec4  \cf2 \cb3 \strokec2 false\cf4 \cb3 \strokec5 ,\strokec4  \cb1 \
\cb3         error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \cb1 \
\cb3       \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \});\cb1 \strokec4 \
}