{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red19\green118\blue70;\red83\green83\blue83;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c40000\c40000\c40000;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  createClient \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf5 \strokec5 'jsr:@supabase/supabase-js@2'\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 RUNWAY_API_KEY\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'RUNWAY_API_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 SUPABASE_URL\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_URL'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \cb3 \strokec4  \cf7 \strokec7 GenerateVideoRequest\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   image_asset_id?: \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   image_url?: \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   title\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   description\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   target_platform?: \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   duration?: \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   motion_intensity?: \cf2 \cb3 \strokec2 number\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \cb3 \strokec2 async\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf5 \strokec5 'OPTIONS'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf2 \cb3 \strokec2 null\cf4 \cb3 \strokec6 ,\strokec4  \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Methods'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'authorization, x-client-info, apikey, content-type'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf2 \cb3 \strokec2 try\cf4 \cb3 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  supabase \strokec6 =\strokec4  createClient\strokec6 (\cf7 \strokec7 SUPABASE_URL\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  \cb1 \
\cb3       brand_id\strokec6 ,\strokec4  \cb1 \
\cb3       image_asset_id\strokec6 ,\cb1 \strokec4 \
\cb3       image_url\strokec6 :\strokec4  provided_image_url\strokec6 ,\cb1 \strokec4 \
\cb3       title\strokec6 ,\strokec4  \cb1 \
\cb3       description\strokec6 ,\cb1 \strokec4 \
\cb3       target_platform \strokec6 =\strokec4  \cf5 \strokec5 'instagram'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       duration \strokec6 =\strokec4  \cf8 \strokec8 5\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       motion_intensity \strokec6 =\strokec4  \cf8 \strokec8 7\cf4 \cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec6 .\strokec4 json\strokec6 ()\strokec4  \cf2 \cb3 \strokec2 as\cf4 \cb3 \strokec4  \cf7 \strokec7 GenerateVideoRequest\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Create job\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  jobData\strokec6 ,\strokec4  error\strokec6 :\strokec4  jobError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\strokec6 .\strokec4 rpc\strokec6 (\cf5 \strokec5 'create_content_job'\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       p_brand_id\strokec6 :\strokec4  brand_id\strokec6 ,\cb1 \strokec4 \
\cb3       p_content_type\strokec6 :\strokec4  \cf5 \strokec5 'video'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       p_target_platform\strokec6 :\strokec4  target_platform\cb1 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 jobError\strokec6 )\strokec4  \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Job creation failed: \cf4 \strokec6 $\{\strokec4 jobError\strokec6 .\strokec4 message\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  job_id \strokec6 =\strokec4  jobData\strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Get image URL from asset if provided\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  image_url \strokec6 =\strokec4  provided_image_url\strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  source_image_asset \strokec6 =\strokec4  \cf2 \cb3 \strokec2 null\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 image_asset_id \strokec6 &&\strokec4  \strokec6 !\strokec4 image_url\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  imageAsset \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3         \strokec6 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec6 (\cf5 \strokec5 'gv_content_assets'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3         \strokec6 .\strokec4 select\strokec6 (\cf5 \strokec5 'image_url, title'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3         \strokec6 .\strokec4 eq\strokec6 (\cf5 \strokec5 'id'\cf4 \strokec6 ,\strokec4  image_asset_id\strokec6 )\cb1 \strokec4 \
\cb3         \strokec6 .\strokec4 single\strokec6 ();\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 imageAsset\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         image_url \strokec6 =\strokec4  imageAsset\strokec6 .\strokec4 image_url\strokec6 ;\cb1 \strokec4 \
\cb3         source_image_asset \strokec6 =\strokec4  imageAsset\strokec6 ;\cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (!\strokec4 image_url\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 'Either image_asset_id or image_url is required'\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[Video Gen] Using image: \cf4 \strokec6 $\{\strokec4 image_url\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Step 1: Generate motion prompt with platform optimization\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  rulesData \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec6 (\cf5 \strokec5 'gv_platform_optimization_rules'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf5 \strokec5 'rules'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf5 \strokec5 'brand_id'\cf4 \strokec6 ,\strokec4  brand_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 single\strokec6 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  platform_rules \strokec6 =\strokec4  rulesData\strokec6 ?.\strokec4 rules\strokec6 ?.[\strokec4 target_platform\strokec6 ]\strokec4  \strokec6 ||\strokec4  \strokec6 \{\};\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Build motion prompt based on platform\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  motion_prompt \strokec6 =\strokec4  \cf5 \strokec5 `\cf4 \strokec6 $\{\strokec4 description\strokec6 \}\cf5 \strokec5 . `\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 target_platform \strokec6 ===\strokec4  \cf5 \strokec5 'tiktok'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       motion_prompt \strokec6 +=\strokec4  \cf5 \strokec5 'Dynamic camera movement, fast-paced, energetic. Hook viewer in first second.'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 else\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 target_platform \strokec6 ===\strokec4  \cf5 \strokec5 'instagram'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       motion_prompt \strokec6 +=\strokec4  \cf5 \strokec5 'Smooth, aesthetic camera movement. Premium feel, Instagram-worthy.'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 else\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 target_platform \strokec6 ===\strokec4  \cf5 \strokec5 'linkedin'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       motion_prompt \strokec6 +=\strokec4  \cf5 \strokec5 'Professional, subtle motion. Clean and polished presentation.'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 else\cf4 \cb3 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       motion_prompt \strokec6 +=\strokec4  \cf5 \strokec5 'Engaging camera movement with smooth transitions.'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Step 2: Call Runway Gen-3 API\cf4 \cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 '[Runway] Initiating video generation...'\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  runwayResponse \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\cf5 \strokec5 'https://api.runwayml.com/v1/image_to_video'\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\cf7 \strokec7 RUNWAY_API_KEY\cf4 \strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'X-Runway-Version'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '2024-11-06'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \},\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         model\strokec6 :\strokec4  \cf5 \strokec5 'gen3a_turbo'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         promptImage\strokec6 :\strokec4  image_url\strokec6 ,\cb1 \strokec4 \
\cb3         promptText\strokec6 :\strokec4  motion_prompt\strokec6 ,\cb1 \strokec4 \
\cb3         duration\strokec6 :\strokec4  duration\strokec6 ,\cb1 \strokec4 \
\cb3         ratio\strokec6 :\strokec4  platform_rules\strokec6 .\strokec4 aspect_ratio \strokec6 ===\strokec4  \cf5 \strokec5 '9:16'\cf4 \strokec4  \strokec6 ?\strokec4  \cf5 \strokec5 '9:16'\cf4 \strokec4  \strokec6 :\strokec4  \cf5 \strokec5 '16:9'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         watermark\strokec6 :\strokec4  \cf2 \cb3 \strokec2 false\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (!\strokec4 runwayResponse\strokec6 .\strokec4 ok\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  errorText \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  runwayResponse\strokec6 .\strokec4 text\strokec6 ();\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Runway API error: \cf4 \strokec6 $\{\strokec4 runwayResponse\strokec6 .\strokec4 status\strokec6 \}\cf5 \strokec5  - \cf4 \strokec6 $\{\strokec4 errorText\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  runwayData \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  runwayResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  task_id \strokec6 =\strokec4  runwayData\strokec6 .\strokec4 id\strokec6 ;\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[Runway] Task created: \cf4 \strokec6 $\{\strokec4 task_id\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Step 3: Poll for completion\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  video_url \strokec6 =\strokec4  \cf2 \cb3 \strokec2 null\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 let\cf4 \cb3 \strokec4  attempts \strokec6 =\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  maxAttempts \strokec6 =\strokec4  \cf8 \strokec8 60\cf4 \strokec6 ;\strokec4  \cf9 \cb3 \strokec9 // 5 minutes max (5s intervals)\cf4 \cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 while\cf4 \cb3 \strokec4  \strokec6 (!\strokec4 video_url \strokec6 &&\strokec4  attempts \strokec6 <\strokec4  maxAttempts\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Promise\cf4 \strokec6 (\strokec4 resolve \strokec6 =>\strokec4  setTimeout\strokec6 (\strokec4 resolve\strokec6 ,\strokec4  \cf8 \strokec8 5000\cf4 \strokec6 ));\strokec4  \cf9 \cb3 \strokec9 // Wait 5 seconds\cf4 \cb1 \strokec4 \
\cb3       attempts\strokec6 ++;\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  statusResponse \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\cf5 \strokec5 `https://api.runwayml.com/v1/tasks/\cf4 \strokec6 $\{\strokec4 task_id\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\cf7 \strokec7 RUNWAY_API_KEY\cf4 \strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'X-Runway-Version'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '2024-11-06'\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  statusData \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  statusResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3       console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[Runway] Poll \cf4 \strokec6 $\{\strokec4 attempts\strokec6 \}\cf5 \strokec5 : Status = \cf4 \strokec6 $\{\strokec4 statusData\strokec6 .\strokec4 status\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3       \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 statusData\strokec6 .\strokec4 status \strokec6 ===\strokec4  \cf5 \strokec5 'SUCCEEDED'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         video_url \strokec6 =\strokec4  statusData\strokec6 .\strokec4 output\strokec6 ?.[\cf8 \strokec8 0\cf4 \strokec6 ];\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 break\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3       \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 else\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 statusData\strokec6 .\strokec4 status \strokec6 ===\strokec4  \cf5 \strokec5 'FAILED'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Runway generation failed: \cf4 \strokec6 $\{\strokec4 statusData\strokec6 .\strokec4 failure\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (!\strokec4 video_url\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 'Video generation timed out after 5 minutes'\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[Runway] Video ready: \cf4 \strokec6 $\{\strokec4 video_url\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Step 4: Calculate cost (Runway Gen-3 Turbo pricing)\cf4 \cb1 \strokec4 \
\cb3     \cf9 \cb3 \strokec9 // Gen-3 Turbo: $0.05 per second\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  cost \strokec6 =\strokec4  duration \strokec6 *\strokec4  \cf8 \strokec8 0.05\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Step 5: Create video asset\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  assetData\strokec6 ,\strokec4  error\strokec6 :\strokec4  assetError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec6 (\cf5 \strokec5 'gv_content_assets'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 insert\strokec6 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec6 ,\cb1 \strokec4 \
\cb3         content_type\strokec6 :\strokec4  \cf5 \strokec5 'video'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         platform\strokec6 :\strokec4  target_platform\strokec6 ,\cb1 \strokec4 \
\cb3         title\strokec6 ,\cb1 \strokec4 \
\cb3         description\strokec6 ,\cb1 \strokec4 \
\cb3         video_url\strokec6 ,\cb1 \strokec4 \
\cb3         thumbnail_url\strokec6 :\strokec4  image_url\strokec6 ,\cb1 \strokec4 \
\cb3         parent_asset_id\strokec6 :\strokec4  image_asset_id\strokec6 ,\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  \cf5 \strokec5 'draft'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         prompts_used\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           motion_prompt\strokec6 ,\cb1 \strokec4 \
\cb3           source_image\strokec6 :\strokec4  image_url\strokec6 ,\cb1 \strokec4 \
\cb3           platform\strokec6 :\strokec4  target_platform\cb1 \
\cb3         \strokec6 \},\cb1 \strokec4 \
\cb3         generation_metadata\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           model\strokec6 :\strokec4  \cf5 \strokec5 'gen3a_turbo'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           duration_seconds\strokec6 :\strokec4  duration\strokec6 ,\cb1 \strokec4 \
\cb3           motion_intensity\strokec6 ,\cb1 \strokec4 \
\cb3           runway_task_id\strokec6 :\strokec4  task_id\strokec6 ,\cb1 \strokec4 \
\cb3           aspect_ratio\strokec6 :\strokec4  platform_rules\strokec6 .\strokec4 aspect_ratio \strokec6 ||\strokec4  \cf5 \strokec5 '16:9'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           attempts\cb1 \
\cb3         \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 ()\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 single\strokec6 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 assetError\strokec6 )\strokec4  \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Asset creation failed: \cf4 \strokec6 $\{\strokec4 assetError\strokec6 .\strokec4 message\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \cb3 \strokec9 // Step 6: Complete job\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\strokec6 .\strokec4 rpc\strokec6 (\cf5 \strokec5 'complete_content_job'\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       p_job_id\strokec6 :\strokec4  job_id\strokec6 ,\cb1 \strokec4 \
\cb3       p_asset_id\strokec6 :\strokec4  assetData\strokec6 .\strokec4 id\strokec6 ,\cb1 \strokec4 \
\cb3       p_cost_usd\strokec6 :\strokec4  cost\cb1 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  \cb1 \
\cb3         success\strokec6 :\strokec4  \cf2 \cb3 \strokec2 true\cf4 \cb3 \strokec6 ,\strokec4  \cb1 \
\cb3         job_id\strokec6 ,\cb1 \strokec4 \
\cb3         asset_id\strokec6 :\strokec4  assetData\strokec6 .\strokec4 id\strokec6 ,\cb1 \strokec4 \
\cb3         video_url\strokec6 ,\cb1 \strokec4 \
\cb3         thumbnail_url\strokec6 :\strokec4  image_url\strokec6 ,\cb1 \strokec4 \
\cb3         filename\strokec6 :\strokec4  assetData\strokec6 .\strokec4 filename\strokec6 ,\cb1 \strokec4 \
\cb3         duration_seconds\strokec6 :\strokec4  duration\strokec6 ,\cb1 \strokec4 \
\cb3         cost_usd\strokec6 :\strokec4  cost\strokec6 ,\cb1 \strokec4 \
\cb3         runway_task_id\strokec6 :\strokec4  task_id\strokec6 ,\cb1 \strokec4 \
\cb3         generation_time_seconds\strokec6 :\strokec4  attempts \strokec6 *\strokec4  \cf8 \strokec8 5\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf5 \strokec5 'Error:'\cf4 \strokec6 ,\strokec4  error\strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  success\strokec6 :\strokec4  \cf2 \cb3 \strokec2 false\cf4 \cb3 \strokec6 ,\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf8 \strokec8 500\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}