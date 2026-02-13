{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red144\green1\blue18;\red0\green0\blue0;\red14\green110\blue109;\red19\green118\blue70;\red83\green83\blue83;
\red191\green28\blue37;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c63922\c8235\c8235;\cssrgb\c0\c0\c0;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;\cssrgb\c40000\c40000\c40000;
\cssrgb\c80392\c19216\c19216;}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \cf5 \strokec5 "jsr:@supabase/functions-js/edge-runtime.d.ts"\cf4 \strokec6 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec6 \{\strokec4  createClient \strokec6 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf5 \strokec5 'jsr:@supabase/supabase-js@2'\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 SUPABASE_URL\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'SUPABASE_URL'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf7 \strokec7 SUPABASE_ANON_KEY\cf4 \strokec4  \strokec6 =\strokec4  \cf7 \strokec7 Deno\cf4 \strokec6 .\strokec4 env\strokec6 .\cf2 \strokec2 get\cf4 \strokec6 (\cf5 \strokec5 'SUPABASE_ANON_KEY'\cf4 \strokec6 )!;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 interface\cf4 \strokec4  \cf7 \strokec7 PipelineRequest\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec6 :\strokec4  \cf2 \strokec2 string\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   content_type\strokec6 :\strokec4  \cf5 \strokec5 'article'\cf4 \strokec4  \strokec6 |\strokec4  \cf5 \strokec5 'image'\cf4 \strokec4  \strokec6 |\strokec4  \cf5 \strokec5 'video'\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   title\strokec6 :\strokec4  \cf2 \strokec2 string\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   description?: \cf2 \strokec2 string\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   platforms?: \cf2 \strokec2 string\cf4 \strokec6 [];\cb1 \strokec4 \
\cb3   insight_id?: \cf2 \strokec2 string\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   target_pillar?: \cf2 \strokec2 string\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3   validate_storytelling?: \cf2 \strokec2 boolean\cf4 \strokec6 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 Deno\cf4 \strokec6 .\strokec4 serve\strokec6 (\cf2 \strokec2 async\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 :\strokec4  \cf7 \strokec7 Request\cf4 \strokec6 )\strokec4  \strokec6 =>\strokec4  \strokec6 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 req\strokec6 .\strokec4 method \strokec6 ===\strokec4  \cf5 \strokec5 'OPTIONS'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cf2 \strokec2 null\cf4 \strokec6 ,\strokec4  \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Methods'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Headers'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'authorization, x-client-info, apikey, content-type'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \});\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabase \strokec6 =\strokec4  createClient\strokec6 (\cf7 \strokec7 SUPABASE_URL\cf4 \strokec6 ,\strokec4  \cf7 \strokec7 SUPABASE_SERVICE_KEY\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec6 \{\strokec4  \cb1 \
\cb3       brand_id\strokec6 ,\strokec4  \cb1 \
\cb3       content_type\strokec6 ,\strokec4  \cb1 \
\cb3       title\strokec6 ,\strokec4  \cb1 \
\cb3       description \strokec6 =\strokec4  \cf5 \strokec5 ''\cf4 \strokec6 ,\strokec4  \cb1 \
\cb3       platforms \strokec6 =\strokec4  \strokec6 [\cf5 \strokec5 'linkedin'\cf4 \strokec6 ],\strokec4  \cb1 \
\cb3       insight_id\strokec6 ,\cb1 \strokec4 \
\cb3       target_pillar\strokec6 ,\cb1 \strokec4 \
\cb3       validate_storytelling \strokec6 =\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \cb1 \
\cb3     \strokec6 \}\strokec4  \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  req\strokec6 .\strokec4 json\strokec6 ()\strokec4  \cf2 \strokec2 as\cf4 \strokec4  \cf7 \strokec7 PipelineRequest\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  execution_id \strokec6 =\strokec4  crypto\strokec6 .\strokec4 randomUUID\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  start_time \strokec6 =\strokec4  \cf7 \strokec7 Date\cf4 \strokec6 .\strokec4 now\strokec6 ();\cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  total_cost \strokec6 =\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ;\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[\cf4 \strokec6 $\{\strokec4 execution_id\strokec6 \}\cf5 \strokec5 ] Starting pipeline for \cf4 \strokec6 $\{\strokec4 content_type\strokec6 \}\cf5 \strokec5 : \cf4 \strokec6 $\{\strokec4 title\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Step 1: Generate master content\cf4 \cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[\cf4 \strokec6 $\{\strokec4 execution_id\strokec6 \}\cf5 \strokec5 ] Step 1: Generating master \cf4 \strokec6 $\{\strokec4 content_type\strokec6 \}\cf5 \strokec5 ...`\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  masterAsset\strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  primaryPlatform \strokec6 =\strokec4  platforms\strokec6 [\cf8 \strokec8 0\cf4 \strokec6 ];\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 content_type \strokec6 ===\strokec4  \cf5 \strokec5 'article'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  articleResponse \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\cf5 \strokec5 `\cf4 \strokec6 $\{\cf7 \strokec7 SUPABASE_URL\cf4 \strokec6 \}\cf5 \strokec5 /functions/v1/generate-article`\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\cf7 \strokec7 SUPABASE_ANON_KEY\cf4 \strokec6 \}\cf5 \strokec5 `\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \},\cb1 \strokec4 \
\cb3         body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3           brand_id\strokec6 ,\cb1 \strokec4 \
\cb3           insight_id\strokec6 ,\cb1 \strokec4 \
\cb3           title\strokec6 ,\cb1 \strokec4 \
\cb3           target_platform\strokec6 :\strokec4  primaryPlatform\strokec6 ,\cb1 \strokec4 \
\cb3           target_pillar\cb1 \
\cb3         \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  articleData \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  articleResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (!\strokec4 articleData\strokec6 .\strokec4 success\strokec6 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Article generation failed: \cf4 \strokec6 $\{\strokec4 articleData\strokec6 .\strokec4 error\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\cb3       masterAsset \strokec6 =\strokec4  articleData\strokec6 ;\cb1 \strokec4 \
\cb3       total_cost \strokec6 +=\strokec4  articleData\strokec6 .\strokec4 cost_usd \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 content_type \strokec6 ===\strokec4  \cf5 \strokec5 'image'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  imageResponse \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\cf5 \strokec5 `\cf4 \strokec6 $\{\cf7 \strokec7 SUPABASE_URL\cf4 \strokec6 \}\cf5 \strokec5 /functions/v1/generate-image`\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\cf7 \strokec7 SUPABASE_ANON_KEY\cf4 \strokec6 \}\cf5 \strokec5 `\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \},\cb1 \strokec4 \
\cb3         body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3           brand_id\strokec6 ,\cb1 \strokec4 \
\cb3           insight_id\strokec6 ,\cb1 \strokec4 \
\cb3           title\strokec6 ,\cb1 \strokec4 \
\cb3           description\strokec6 ,\cb1 \strokec4 \
\cb3           target_platform\strokec6 :\strokec4  primaryPlatform\strokec6 ,\cb1 \strokec4 \
\cb3           target_pillar\cb1 \
\cb3         \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  imageData \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  imageResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (!\strokec4 imageData\strokec6 .\strokec4 success\strokec6 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Image generation failed: \cf4 \strokec6 $\{\strokec4 imageData\strokec6 .\strokec4 error\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\cb3       masterAsset \strokec6 =\strokec4  imageData\strokec6 ;\cb1 \strokec4 \
\cb3       total_cost \strokec6 +=\strokec4  imageData\strokec6 .\strokec4 cost_usd \strokec6 ||\strokec4  \cf8 \strokec8 0\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \strokec6 \}\strokec4  \cf2 \strokec2 else\cf4 \strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Error\cf4 \strokec6 (\cf5 \strokec5 `Content type \cf4 \strokec6 $\{\strokec4 content_type\strokec6 \}\cf5 \strokec5  not yet implemented`\cf4 \strokec6 );\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[\cf4 \strokec6 $\{\strokec4 execution_id\strokec6 \}\cf5 \strokec5 ] Master asset created: \cf4 \strokec6 $\{\strokec4 masterAsset\strokec6 .\strokec4 asset_id\strokec6 \}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Step 2: Validate storytelling (if enabled and applicable)\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  storytelling_result\strokec6 ;\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 validate_storytelling \strokec6 &&\strokec4  content_type \strokec6 ===\strokec4  \cf5 \strokec5 'article'\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[\cf4 \strokec6 $\{\strokec4 execution_id\strokec6 \}\cf5 \strokec5 ] Step 2: Validating storytelling...`\cf4 \strokec6 );\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  validateResponse \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\cf5 \strokec5 `\cf4 \strokec6 $\{\cf7 \strokec7 SUPABASE_URL\cf4 \strokec6 \}\cf5 \strokec5 /functions/v1/validate-storytelling`\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\cf7 \strokec7 SUPABASE_ANON_KEY\cf4 \strokec6 \}\cf5 \strokec5 `\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \},\cb1 \strokec4 \
\cb3         body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3           asset_id\strokec6 :\strokec4  masterAsset\strokec6 .\strokec4 asset_id\cb1 \
\cb3         \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  validateData \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  validateResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 validateData\strokec6 .\strokec4 success\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         storytelling_result \strokec6 =\strokec4  validateData\strokec6 ;\cb1 \strokec4 \
\cb3         console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[\cf4 \strokec6 $\{\strokec4 execution_id\strokec6 \}\cf5 \strokec5 ] Storytelling score: \cf4 \strokec6 $\{\strokec4 validateData\strokec6 .\strokec4 overall_score\strokec6 \}\cf5 \strokec5 /100 (\cf4 \strokec6 $\{\strokec4 validateData\strokec6 .\strokec4 passed \strokec6 ?\strokec4  \cf5 \strokec5 'PASSED'\cf4 \strokec4  \strokec6 :\strokec4  \cf5 \strokec5 'FAILED'\cf4 \strokec6 \}\cf5 \strokec5 )`\cf4 \strokec6 );\cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Step 3: Generate platform variants (if multiple platforms)\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  variants \strokec6 =\strokec4  \strokec6 [];\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 platforms\strokec6 .\strokec4 length \strokec6 >\strokec4  \cf8 \strokec8 1\cf4 \strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3       console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[\cf4 \strokec6 $\{\strokec4 execution_id\strokec6 \}\cf5 \strokec5 ] Step 3: Generating \cf4 \strokec6 $\{\strokec4 platforms\strokec6 .\strokec4 length \strokec6 -\strokec4  \cf8 \strokec8 1\cf4 \strokec6 \}\cf5 \strokec5  platform variants...`\cf4 \strokec6 );\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  optimizeResponse \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec6 (\cf5 \strokec5 `\cf4 \strokec6 $\{\cf7 \strokec7 SUPABASE_URL\cf4 \strokec6 \}\cf5 \strokec5 /functions/v1/optimize-for-platform`\cf4 \strokec6 ,\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         method\strokec6 :\strokec4  \cf5 \strokec5 'POST'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         headers\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3           \cf5 \strokec5 'Authorization'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 `Bearer \cf4 \strokec6 $\{\cf7 \strokec7 SUPABASE_ANON_KEY\cf4 \strokec6 \}\cf5 \strokec5 `\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \},\cb1 \strokec4 \
\cb3         body\strokec6 :\strokec4  \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\cb1 \strokec4 \
\cb3           master_asset_id\strokec6 :\strokec4  masterAsset\strokec6 .\strokec4 asset_id\strokec6 ,\cb1 \strokec4 \
\cb3           target_platforms\strokec6 :\strokec4  platforms\strokec6 .\strokec4 slice\strokec6 (\cf8 \strokec8 1\cf4 \strokec6 )\strokec4  \cf9 \strokec9 // Skip first platform (already generated)\cf4 \cb1 \strokec4 \
\cb3         \strokec6 \})\cb1 \strokec4 \
\cb3       \strokec6 \});\cb1 \strokec4 \
\cb3       \cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  optimizeData \strokec6 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  optimizeResponse\strokec6 .\strokec4 json\strokec6 ();\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec6 (\strokec4 optimizeData\strokec6 .\strokec4 success\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         variants \strokec6 =\strokec4  optimizeData\strokec6 .\strokec4 variants \strokec6 ||\strokec4  \strokec6 [];\cb1 \strokec4 \
\cb3         console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[\cf4 \strokec6 $\{\strokec4 execution_id\strokec6 \}\cf5 \strokec5 ] Created \cf4 \strokec6 $\{\strokec4 variants\strokec6 .\strokec4 length\strokec6 \}\cf5 \strokec5  variants`\cf4 \strokec6 );\cb1 \strokec4 \
\cb3       \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 \}\cb1 \strokec4 \
\
\cb3     \cf9 \strokec9 // Step 4: Log execution\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  duration \strokec6 =\strokec4  \strokec6 (\cf7 \strokec7 Date\cf4 \strokec6 .\strokec4 now\strokec6 ()\strokec4  \strokec6 -\strokec4  start_time\strokec6 )\strokec4  \strokec6 /\strokec4  \cf8 \strokec8 1000\cf4 \strokec6 ;\cb1 \strokec4 \
\cb3     \cb1 \
\cb3     \cf2 \strokec2 await\cf4 \strokec4  supabase\strokec6 .\cf2 \strokec2 from\cf4 \strokec6 (\cf5 \strokec5 'phase5_execution_log'\cf4 \strokec6 ).\strokec4 insert\strokec6 (\{\cb1 \strokec4 \
\cb3       task_id\strokec6 :\strokec4  \cf5 \strokec5 'pipeline-executor'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       status\strokec6 :\strokec4  \cf5 \strokec5 'completed'\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3       result\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3         execution_id\strokec6 ,\cb1 \strokec4 \
\cb3         content_type\strokec6 ,\cb1 \strokec4 \
\cb3         master_asset_id\strokec6 :\strokec4  masterAsset\strokec6 .\strokec4 asset_id\strokec6 ,\cb1 \strokec4 \
\cb3         storytelling\strokec6 :\strokec4  storytelling_result\strokec6 ,\cb1 \strokec4 \
\cb3         variants\strokec6 ,\cb1 \strokec4 \
\cb3         platforms\cb1 \
\cb3       \strokec6 \},\cb1 \strokec4 \
\cb3       duration_seconds\strokec6 :\strokec4  duration\strokec6 ,\cb1 \strokec4 \
\cb3       cost_usd\strokec6 :\strokec4  total_cost\cb1 \
\cb3     \strokec6 \});\cb1 \strokec4 \
\
\cb3     console\strokec6 .\strokec4 log\strokec6 (\cf5 \strokec5 `[\cf4 \strokec6 $\{\strokec4 execution_id\strokec6 \}\cf5 \strokec5 ] Pipeline completed in \cf4 \strokec6 $\{\strokec4 duration\strokec6 \}\cf5 \strokec5 s, cost \cf10 \cb3 \strokec10 $\cf4 \cb3 \strokec6 $\{\strokec4 total_cost\strokec6 .\strokec4 toFixed\strokec6 (\cf8 \strokec8 4\cf4 \strokec6 )\}\cf5 \strokec5 `\cf4 \strokec6 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  \cb1 \
\cb3         success\strokec6 :\strokec4  \cf2 \strokec2 true\cf4 \strokec6 ,\cb1 \strokec4 \
\cb3         execution_id\strokec6 ,\cb1 \strokec4 \
\cb3         master_asset\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           id\strokec6 :\strokec4  masterAsset\strokec6 .\strokec4 asset_id\strokec6 ,\cb1 \strokec4 \
\cb3           filename\strokec6 :\strokec4  masterAsset\strokec6 .\strokec4 filename\strokec6 ,\cb1 \strokec4 \
\cb3           job_id\strokec6 :\strokec4  masterAsset\strokec6 .\strokec4 job_id\cb1 \
\cb3         \strokec6 \},\cb1 \strokec4 \
\cb3         storytelling\strokec6 :\strokec4  storytelling_result\strokec6 ,\cb1 \strokec4 \
\cb3         variants\strokec6 ,\cb1 \strokec4 \
\cb3         metrics\strokec6 :\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3           duration_seconds\strokec6 :\strokec4  duration\strokec6 ,\cb1 \strokec4 \
\cb3           total_cost_usd\strokec6 :\strokec4  total_cost\strokec6 ,\cb1 \strokec4 \
\cb3           platforms_count\strokec6 :\strokec4  platforms\strokec6 .\strokec4 length\cb1 \
\cb3         \strokec6 \}\cb1 \strokec4 \
\cb3       \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\
\cb3   \strokec6 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec6 (\strokec4 error\strokec6 )\strokec4  \strokec6 \{\cb1 \strokec4 \
\cb3     console\strokec6 .\strokec4 error\strokec6 (\cf5 \strokec5 'Pipeline error:'\cf4 \strokec6 ,\strokec4  error\strokec6 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec6 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 JSON\cf4 \strokec6 .\strokec4 stringify\strokec6 (\{\strokec4  success\strokec6 :\strokec4  \cf2 \strokec2 false\cf4 \strokec6 ,\strokec4  error\strokec6 :\strokec4  error\strokec6 .\strokec4 message \strokec6 \}),\cb1 \strokec4 \
\cb3       \strokec6 \{\strokec4  status\strokec6 :\strokec4  \cf8 \strokec8 500\cf4 \strokec6 ,\strokec4  headers\strokec6 :\strokec4  \strokec6 \{\strokec4  \cf5 \strokec5 'Content-Type'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 'application/json'\cf4 \strokec6 ,\strokec4  \cf5 \strokec5 'Access-Control-Allow-Origin'\cf4 \strokec6 :\strokec4  \cf5 \strokec5 '*'\cf4 \strokec4  \strokec6 \}\strokec4  \strokec6 \}\cb1 \strokec4 \
\cb3     \strokec6 );\cb1 \strokec4 \
\cb3   \strokec6 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec6 \});\cb1 \strokec4 \
}