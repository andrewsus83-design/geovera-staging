{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red83\green83\blue83;\red19\green118\blue70;
\red107\green0\blue1;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c40000\c40000\c40000;\cssrgb\c3529\c52549\c34510;
\cssrgb\c50196\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \cb3 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  createClient \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec4  \cf5 \strokec5 'jsr:@supabase/supabase-js@2'\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 OPENAI_API_KEY\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'OPENAI_API_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 SUPABASE_URL\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_URL'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \cb3 \strokec2 get\cf4 \cb3 \strokec6 (\cf5 \strokec5 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \cb3 \strokec4  \cf7 \strokec7 GenerateImageRequest\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   insight_id?: \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   title\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   description\strokec6 :\strokec4  \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   target_platform?: \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
\cb3   target_pillar?: \cf2 \cb3 \strokec2 string\cf4 \cb3 \strokec6 ;\cb1 \strokec4 \
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
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  brand_id\strokec6 ,\strokec4  insight_id\strokec6 ,\strokec4  title\strokec6 ,\strokec4  description\strokec6 ,\strokec4  target_platform \strokec6 =\strokec4  \cf5 \strokec5 'instagram'\cf4 \strokec6 ,\strokec4  target_pillar \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  req\strokec6 .\strokec4 json\strokec6 ()\strokec4  \cf2 \cb3 \strokec2 as\cf4 \cb3 \strokec4  \cf7 \strokec7 GenerateImageRequest\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Create job\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  jobData\strokec6 ,\strokec4  error\strokec6 :\strokec4  jobError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\strokec6 .\strokec4 rpc\strokec6 (\cf5 \strokec5 'create_content_job'\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       p_brand_id\strokec6 :\strokec4  brand_id\strokec6 ,\cb1 \strokec4 \
\cb3       p_content_type\strokec6 :\strokec4  \cf5 \strokec5 'image'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       p_target_platform\strokec6 :\strokec4  target_platform\strokec6 ,\cb1 \strokec4 \
\cb3       p_insight_id\strokec6 :\strokec4  insight_id\cb1 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 jobError\strokec6 )\strokec4  \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Job creation failed: \cf4 \strokec6 $\{\strokec4 jobError\strokec6 .\strokec4 message\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  job_id \strokec6 =\strokec4  jobData\strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Get master prompt and platform rules\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  promptData \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec6 (\cf5 \strokec5 'gv_master_prompts'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf5 \strokec5 'master_prompt'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf5 \strokec5 'brand_id'\cf4 \strokec6 ,\strokec4  brand_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 single\strokec6 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  rulesData \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec6 (\cf5 \strokec5 'gv_platform_optimization_rules'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 (\cf5 \strokec5 'rules'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 eq\strokec6 (\cf5 \strokec5 'brand_id'\cf4 \strokec6 ,\strokec4  brand_id\strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 single\strokec6 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  platform_rules \strokec6 =\strokec4  rulesData\strokec6 ?.\strokec4 rules\strokec6 ?.[\strokec4 target_platform\strokec6 ]\strokec4  \strokec6 ||\strokec4  \strokec6 \{\};\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  master_prompt \strokec6 =\strokec4  promptData\strokec6 ?.\strokec4 master_prompt \strokec6 ||\strokec4  \strokec6 \{\};\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  visual_direction \strokec6 =\strokec4  master_prompt\strokec6 .\strokec4 visual_direction \strokec6 ||\strokec4  \cf5 \strokec5 'modern, professional aesthetic'\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Build DALL-E prompt\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  dalle_prompt \strokec6 =\strokec4  \cf5 \strokec5 `Create a high-quality, professional image for \cf4 \strokec6 $\{\strokec4 title\strokec6 \}\cf5 \strokec5 .\\n\\nDescription: \cf4 \strokec6 $\{\strokec4 description\strokec6 \}\cf5 \strokec5 \\n\\nVisual direction: \cf4 \strokec6 $\{\strokec4 visual_direction\strokec6 \}\cf5 \strokec5 \\n\\nStyle: \cf4 \strokec6 $\{\strokec4 platform_rules\strokec6 .\strokec4 style \strokec6 ||\strokec4  \cf5 \strokec5 'modern'\cf4 \strokec6 \}\cf5 \strokec5 \\nAspect ratio: \cf4 \strokec6 $\{\strokec4 platform_rules\strokec6 .\strokec4 aspect_ratio \strokec6 ||\strokec4  \cf5 \strokec5 '1:1'\cf4 \strokec6 \}\cf5 \strokec5 \\n\\nRequirements:\\n- High visual impact\\n- Clear focal point\\n- Brand-appropriate colors\\n- \cf4 \strokec6 $\{\strokec4 target_platform\strokec6 \}\cf5 \strokec5 -optimized composition`\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Generate image with DALL-E 3\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  openaiResponse \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\cf5 \strokec5 'https://api.openai.com/v1/images/generations'\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\cf7 \strokec7 OPENAI_API_KEY\cf4 \strokec6 \}\cf5 \strokec5 `\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \},\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         model\strokec6 :\strokec4  \cf5 \strokec5 'dall-e-3'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         prompt\strokec6 :\strokec4  dalle_prompt\strokec6 ,\cb1 \strokec4 \
\cb3         n\strokec6 :\strokec4  \cf9 \strokec9 1\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         size\strokec6 :\strokec4  \cf5 \strokec5 '1024x1024'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         quality\strokec6 :\strokec4  \cf5 \strokec5 'hd'\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  openaiData \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  openaiResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  image_url \strokec6 =\strokec4  openaiData\strokec6 .\strokec4 data\strokec6 [\cf9 \strokec9 0\cf4 \strokec6 ].\strokec4 url\strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  revised_prompt \strokec6 =\strokec4  openaiData\strokec6 .\strokec4 data\strokec6 [\cf9 \strokec9 0\cf4 \strokec6 ].\strokec4 revised_prompt\strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  cost \strokec6 =\strokec4  \cf9 \strokec9 0.08\cf4 \strokec6 ;\strokec4  \cf8 \cb3 \strokec8 // DALL-E 3 HD pricing\cf4 \cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Generate alt text with GPT-4o\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  altTextResponse \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  fetch\strokec6 (\cf5 \strokec5 'https://api.openai.com/v1/chat/completions'\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\cf7 \strokec7 OPENAI_API_KEY\cf4 \strokec6 \}\cf5 \strokec5 `\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \},\cb1 \strokec4 \
\cb3       body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3         model\strokec6 :\strokec4  \cf5 \strokec5 'gpt-4o'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         messages\strokec6 :\strokec4  \strokec6 [\cb1 \strokec4 \
\cb3           \strokec6 \{\strokec4  role\strokec6 :\strokec4  \cf5 \strokec5 'system'\cf4 \strokec6 ,\strokec4  content\strokec6 :\strokec4  \cf5 \strokec5 'You are an expert at writing SEO-optimized alt text for images.'\cf4 \strokec4  \strokec6 \},\cb1 \strokec4 \
\cb3           \strokec6 \{\strokec4  role\strokec6 :\strokec4  \cf5 \strokec5 'user'\cf4 \strokec6 ,\strokec4  content\strokec6 :\strokec4  \cf5 \strokec5 `Write concise, descriptive alt text for an image about "\cf4 \strokec6 $\{\strokec4 title\strokec6 \}\cf5 \strokec5 ". Max 125 characters. Focus on key visual elements and accessibility.`\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3         \strokec6 ],\cb1 \strokec4 \
\cb3         max_tokens\strokec6 :\strokec4  \cf9 \strokec9 100\cf4 \cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  altTextData \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  altTextResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  alt_text \strokec6 =\strokec4  altTextData\strokec6 .\strokec4 choices\strokec6 [\cf9 \strokec9 0\cf4 \strokec6 ].\strokec4 message\strokec6 .\strokec4 content\strokec6 .\strokec4 replace\strokec6 (\cf10 \cb3 \strokec10 /"/\cf2 \cb3 \strokec2 g\cf4 \cb3 \strokec6 ,\strokec4  \cf5 \strokec5 ''\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Create asset\cf4 \cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 const\cf4 \cb3 \strokec4  \strokec6 \{\strokec4  data\strokec6 :\strokec4  assetData\strokec6 ,\strokec4  error\strokec6 :\strokec4  assetError \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \cb3 \strokec2 await\cf4 \cb3 \strokec4  supabase\cb1 \
\cb3       \strokec6 .\cf2 \cb3 \strokec2 from\cf4 \cb3 \strokec6 (\cf5 \strokec5 'gv_content_assets'\cf4 \strokec6 )\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 insert\strokec6 (\{\cb1 \strokec4 \
\cb3         brand_id\strokec6 ,\cb1 \strokec4 \
\cb3         content_type\strokec6 :\strokec4  \cf5 \strokec5 'image'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         platform\strokec6 :\strokec4  target_platform\strokec6 ,\cb1 \strokec4 \
\cb3         title\strokec6 ,\cb1 \strokec4 \
\cb3         description\strokec6 ,\cb1 \strokec4 \
\cb3         image_url\strokec6 ,\cb1 \strokec4 \
\cb3         alt_text\strokec6 ,\cb1 \strokec4 \
\cb3         target_pillar\strokec6 ,\cb1 \strokec4 \
\cb3         insight_id\strokec6 ,\cb1 \strokec4 \
\cb3         status\strokec6 :\strokec4  \cf5 \strokec5 'draft'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         prompts_used\strokec6 :\strokec4  \strokec6 \{\strokec4  dalle\strokec6 :\strokec4  dalle_prompt\strokec6 ,\strokec4  revised\strokec6 :\strokec4  revised_prompt \strokec6 \},\cb1 \strokec4 \
\cb3         generation_metadata\strokec6 :\strokec4  \strokec6 \{\strokec4  model\strokec6 :\strokec4  \cf5 \strokec5 'dall-e-3'\cf4 \strokec6 ,\strokec4  quality\strokec6 :\strokec4  \cf5 \strokec5 'hd'\cf4 \strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 select\strokec6 ()\cb1 \strokec4 \
\cb3       \strokec6 .\strokec4 single\strokec6 ();\cb1 \strokec4 \
\
\cb3     \cf2 \cb3 \strokec2 if\cf4 \cb3 \strokec4  \strokec6 (\strokec4 assetError\strokec6 )\strokec4  \cf2 \cb3 \strokec2 throw\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Asset creation failed: \cf4 \strokec6 $\{\strokec4 assetError\strokec6 .\strokec4 message\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf8 \cb3 \strokec8 // Complete job\cf4 \cb1 \strokec4 \
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
\cb3         image_url\strokec6 ,\cb1 \strokec4 \
\cb3         filename\strokec6 :\strokec4  assetData\strokec6 .\strokec4 filename\strokec6 ,\cb1 \strokec4 \
\cb3         alt_text\strokec6 ,\cb1 \strokec4 \
\cb3         cost_usd\strokec6 :\strokec4  cost\cb1 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf2 \cb3 \strokec2 catch\cf4 \cb3 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf5 \strokec5 'Error:'\cf4 \strokec6 ,\strokec4  error\strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \cb3 \strokec2 return\cf4 \cb3 \strokec4  \cf2 \cb3 \strokec2 new\cf4 \cb3 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  success\strokec6 :\strokec4  \cf2 \cb3 \strokec2 false\cf4 \cb3 \strokec6 ,\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf9 \strokec9 500\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}