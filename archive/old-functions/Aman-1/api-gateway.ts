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
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \strokec5 ;\cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2.39.3'\cf4 \strokec5 ;\cb1 \strokec4 \
\
\cf2 \cb3 \strokec2 const\cf4 \strokec4  corsHeaders \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   \cf6 \strokec6 'Access-Control-Allow-Headers'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'authorization, x-client-info, apikey, content-type'\cf4 \strokec5 ,\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \};\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 interface\cf4 \strokec4  \cf7 \strokec7 BrandOverview\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   brand_id\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   brand_name\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   overall_score\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   scores\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     visibility\strokec5 :\strokec4  \strokec5 \{\strokec4  score\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  confidence\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  \strokec5 \};\cb1 \strokec4 \
\cb3     discovery\strokec5 :\strokec4  \strokec5 \{\strokec4  score\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  confidence\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  \strokec5 \};\cb1 \strokec4 \
\cb3     trust\strokec5 :\strokec4  \strokec5 \{\strokec4  score\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  confidence\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  \strokec5 \};\cb1 \strokec4 \
\cb3     revenue\strokec5 :\strokec4  \strokec5 \{\strokec4  score\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  confidence\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\strokec4  \strokec5 \};\cb1 \strokec4 \
\cb3   \strokec5 \};\cb1 \strokec4 \
\cb3   insights_count\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   tasks_count\strokec5 :\strokec4  \cf2 \strokec2 number\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   last_run_at\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec4  \strokec5 |\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ;\cb1 \strokec4 \
\cb3   next_scheduled_run\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec4  \strokec5 |\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ;\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf8 \strokec8 // Handle CORS preflight\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'OPTIONS'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf6 \strokec6 'ok'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  corsHeaders \strokec5 \});\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabaseClient \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf7 \strokec7 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_ANON_KEY'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 global\cf4 \strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf7 \strokec7 Authorization\cf4 \strokec5 :\strokec4  req\strokec5 .\strokec4 headers\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'Authorization'\cf4 \strokec5 )!\strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  url \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 URL\cf4 \strokec5 (\strokec4 req\strokec5 .\strokec4 url\strokec5 );\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  pathParts \strokec5 =\strokec4  url\strokec5 .\strokec4 pathname\strokec5 .\strokec4 split\strokec5 (\cf6 \strokec6 '/'\cf4 \strokec5 ).\strokec4 filter\strokec5 (\cf7 \strokec7 Boolean\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Route: GET /api/v1/brands/:id/overview\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'GET'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'api'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'v1'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 2\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'brands'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 4\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'overview'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  brandId \strokec5 =\strokec4  pathParts\strokec5 [\cf9 \strokec9 3\cf4 \strokec5 ];\cb1 \strokec4 \
\
\cb3       \cf8 \strokec8 // Get brand info\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  brand\strokec5 ,\strokec4  error\strokec5 :\strokec4  brandError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'brands'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'id, name'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 brandError\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  brandError\strokec5 ;\cb1 \strokec4 \
\
\cb3       \cf8 \strokec8 // Get latest run\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  latestRun \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_runs'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'id, finished_at'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'status'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'finished_at'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 limit\strokec5 (\cf9 \strokec9 1\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 single\strokec5 ();\cb1 \strokec4 \
\
\cb3       \cf8 \strokec8 // Get pillar scores\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  scores \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_pillar_scores'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'pillar, score, confidence'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'run_id'\cf4 \strokec5 ,\strokec4  latestRun\strokec5 ?.\strokec4 id\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'pillar'\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3       \cf8 \strokec8 // Get insights count\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  count\strokec5 :\strokec4  insightsCount \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_insights'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  count\strokec5 :\strokec4  \cf6 \strokec6 'exact'\cf4 \strokec5 ,\strokec4  head\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'run_id'\cf4 \strokec5 ,\strokec4  latestRun\strokec5 ?.\strokec4 id\strokec5 );\cb1 \strokec4 \
\
\cb3       \cf8 \strokec8 // Get tasks count\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  count\strokec5 :\strokec4  tasksCount \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_tasks'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  count\strokec5 :\strokec4  \cf6 \strokec6 'exact'\cf4 \strokec5 ,\strokec4  head\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'run_id'\cf4 \strokec5 ,\strokec4  latestRun\strokec5 ?.\strokec4 id\strokec5 );\cb1 \strokec4 \
\
\cb3       \cf8 \strokec8 // Build overview\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  overview\strokec5 :\strokec4  \cf7 \strokec7 BrandOverview\cf4 \strokec4  \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         brand_id\strokec5 :\strokec4  brand\strokec5 .\strokec4 id\strokec5 ,\cb1 \strokec4 \
\cb3         brand_name\strokec5 :\strokec4  brand\strokec5 .\strokec4 name\strokec5 ,\cb1 \strokec4 \
\cb3         overall_score\strokec5 :\strokec4  scores \strokec5 ?\strokec4  scores\strokec5 .\strokec4 reduce\strokec5 ((\strokec4 sum\strokec5 ,\strokec4  s\strokec5 )\strokec4  \strokec5 =>\strokec4  sum \strokec5 +\strokec4  s\strokec5 .\strokec4 score\strokec5 ,\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  scores\strokec5 .\strokec4 length \strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         scores\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           visibility\strokec5 :\strokec4  scores\strokec5 ?.\strokec4 find\strokec5 (\strokec4 s \strokec5 =>\strokec4  s\strokec5 .\strokec4 pillar \strokec5 ===\strokec4  \cf6 \strokec6 'visibility'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \strokec5 \{\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  confidence\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3           discovery\strokec5 :\strokec4  scores\strokec5 ?.\strokec4 find\strokec5 (\strokec4 s \strokec5 =>\strokec4  s\strokec5 .\strokec4 pillar \strokec5 ===\strokec4  \cf6 \strokec6 'discovery'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \strokec5 \{\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  confidence\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3           trust\strokec5 :\strokec4  scores\strokec5 ?.\strokec4 find\strokec5 (\strokec4 s \strokec5 =>\strokec4  s\strokec5 .\strokec4 pillar \strokec5 ===\strokec4  \cf6 \strokec6 'trust'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \strokec5 \{\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  confidence\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3           revenue\strokec5 :\strokec4  scores\strokec5 ?.\strokec4 find\strokec5 (\strokec4 s \strokec5 =>\strokec4  s\strokec5 .\strokec4 pillar \strokec5 ===\strokec4  \cf6 \strokec6 'revenue'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \strokec5 \{\strokec4  score\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\strokec4  confidence\strokec5 :\strokec4  \cf9 \strokec9 0\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3         insights_count\strokec5 :\strokec4  insightsCount \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         tasks_count\strokec5 :\strokec4  tasksCount \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         last_run_at\strokec5 :\strokec4  latestRun\strokec5 ?.\strokec4 finished_at \strokec5 ||\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         next_scheduled_run\strokec5 :\strokec4  \cf2 \strokec2 null\cf4 \strokec5 ,\strokec4  \cf8 \strokec8 // TODO: Get from schedule\cf4 \cb1 \strokec4 \
\cb3       \strokec5 \};\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\strokec4 overview\strokec5 ),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Route: GET /api/v1/brands/:id/insights\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'GET'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'api'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'v1'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 2\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'brands'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 4\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'insights'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  brandId \strokec5 =\strokec4  pathParts\strokec5 [\cf9 \strokec9 3\cf4 \strokec5 ];\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  pillar \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'pillar'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  severity \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'severity'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  status \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'status'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  page \strokec5 =\strokec4  parseInt\strokec5 (\strokec4 url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'page'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \cf6 \strokec6 '1'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  perPage \strokec5 =\strokec4  parseInt\strokec5 (\strokec4 url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'per_page'\cf4 \strokec5 )\strokec4  \strokec5 ||\strokec4  \cf6 \strokec6 '20'\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 let\cf4 \strokec4  query \strokec5 =\strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_insights'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  count\strokec5 :\strokec4  \cf6 \strokec6 'exact'\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'confidence'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 false\cf4 \strokec4  \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 range\strokec5 ((\strokec4 page \strokec5 -\strokec4  \cf9 \strokec9 1\cf4 \strokec5 )\strokec4  \strokec5 *\strokec4  perPage\strokec5 ,\strokec4  page \strokec5 *\strokec4  perPage \strokec5 -\strokec4  \cf9 \strokec9 1\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 pillar\strokec5 )\strokec4  query \strokec5 =\strokec4  query\strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'pillar'\cf4 \strokec5 ,\strokec4  pillar\strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 severity\strokec5 )\strokec4  query \strokec5 =\strokec4  query\strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'severity'\cf4 \strokec5 ,\strokec4  severity\strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 status\strokec5 )\strokec4  query \strokec5 =\strokec4  query\strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'status'\cf4 \strokec5 ,\strokec4  status\strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 ,\strokec4  count\strokec5 ,\strokec4  error \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  query\strokec5 ;\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  error\strokec5 ;\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3         data\strokec5 ,\cb1 \strokec4 \
\cb3         meta\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           total\strokec5 :\strokec4  count\strokec5 ,\cb1 \strokec4 \
\cb3           page\strokec5 ,\cb1 \strokec4 \
\cb3           per_page\strokec5 :\strokec4  perPage\strokec5 ,\cb1 \strokec4 \
\cb3           total_pages\strokec5 :\strokec4  \cf7 \strokec7 Math\cf4 \strokec5 .\strokec4 ceil\strokec5 ((\strokec4 count \strokec5 ||\strokec4  \cf9 \strokec9 0\cf4 \strokec5 )\strokec4  \strokec5 /\strokec4  perPage\strokec5 ),\cb1 \strokec4 \
\cb3         \strokec5 \},\cb1 \strokec4 \
\cb3       \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Route: GET /api/v1/brands/:id/tasks\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'GET'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'api'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'v1'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 2\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'brands'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 4\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'tasks'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  brandId \strokec5 =\strokec4  pathParts\strokec5 [\cf9 \strokec9 3\cf4 \strokec5 ];\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  status \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'status'\cf4 \strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  priority \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'priority'\cf4 \strokec5 );\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 let\cf4 \strokec4  query \strokec5 =\strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_tasks'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'priority'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \});\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 status\strokec5 )\strokec4  query \strokec5 =\strokec4  query\strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'status'\cf4 \strokec5 ,\strokec4  status\strokec5 );\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 priority\strokec5 )\strokec4  query \strokec5 =\strokec4  query\strokec5 .\strokec4 lte\strokec5 (\cf6 \strokec6 'priority'\cf4 \strokec5 ,\strokec4  parseInt\strokec5 (\strokec4 priority\strokec5 ));\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 ,\strokec4  error \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  query\strokec5 ;\cb1 \strokec4 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  error\strokec5 ;\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  data \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Route: GET /api/v1/brands/:id/timeline\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'GET'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 0\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'api'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 1\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'v1'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 2\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'brands'\cf4 \strokec4  \strokec5 &&\strokec4  pathParts\strokec5 [\cf9 \strokec9 4\cf4 \strokec5 ]\strokec4  \strokec5 ===\strokec4  \cf6 \strokec6 'timeline'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  brandId \strokec5 =\strokec4  pathParts\strokec5 [\cf9 \strokec9 3\cf4 \strokec5 ];\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 ,\strokec4  error \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_timelines'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 '*'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 ,\strokec4  brandId\strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 order\strokec5 (\cf6 \strokec6 'week'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  ascending\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec4  \strokec5 \});\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \cf2 \strokec2 throw\cf4 \strokec4  error\strokec5 ;\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  data \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3       \strokec5 \});\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf8 \strokec8 // Route not found\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Route not found'\cf4 \strokec4  \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 404\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3     \strokec5 \});\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf7 \strokec7 Response\cf4 \strokec5 (\cf7 \strokec7 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \},\cb1 \strokec4 \
\cb3     \strokec5 \});\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \});\cb1 \strokec4 \
}