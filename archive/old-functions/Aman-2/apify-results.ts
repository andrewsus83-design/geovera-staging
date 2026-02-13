{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue255;\red236\green236\blue236;\red52\green52\blue52;
\red0\green0\blue0;\red144\green1\blue18;\red83\green83\blue83;\red14\green110\blue109;\red19\green118\blue70;
}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c100000;\cssrgb\c94118\c94118\c94118;\cssrgb\c26667\c26667\c26667;
\cssrgb\c0\c0\c0;\cssrgb\c63922\c8235\c8235;\cssrgb\c40000\c40000\c40000;\cssrgb\c0\c50196\c50196;\cssrgb\c3529\c52549\c34510;
}
\paperw11900\paperh16840\margl1440\margr1440\vieww29200\viewh17740\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  serve \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://deno.land/std@0.168.0/http/server.ts'\cf4 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 import\cf4 \strokec4  \strokec5 \{\strokec4  createClient \strokec5 \}\strokec4  \cf2 \strokec2 from\cf4 \strokec4  \cf6 \strokec6 'https://esm.sh/@supabase/supabase-js@2.39.3'\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 /**\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Apify Results Fetcher\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  * Fetch completed Apify actor run results and store in database\cf4 \cb1 \strokec4 \
\cf7 \cb3 \strokec7  */\cf4 \cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 serve\strokec5 (\cf2 \strokec2 async\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 )\strokec4  \strokec5 =>\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  corsHeaders \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'Access-Control-Allow-Origin'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 '*'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3     \cf6 \strokec6 'Access-Control-Allow-Headers'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'authorization, x-client-info, apikey, content-type'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 req\strokec5 .\strokec4 method \strokec5 ===\strokec4  \cf6 \strokec6 'OPTIONS'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cf6 \strokec6 'ok'\cf4 \strokec5 ,\strokec4  \strokec5 \{\strokec4  headers\strokec5 :\strokec4  corsHeaders \strokec5 \})\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  supabaseClient \strokec5 =\strokec4  createClient\strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_URL'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'SUPABASE_SERVICE_ROLE_KEY'\cf4 \strokec5 )\strokec4  \strokec5 ??\strokec4  \cf6 \strokec6 ''\cf4 \cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  url \strokec5 =\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 URL\cf4 \strokec5 (\strokec4 req\strokec5 .\strokec4 url\strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  runId \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'run_id'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  brandId \strokec5 =\strokec4  url\strokec5 .\strokec4 searchParams\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'brand_id'\cf4 \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 runId\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'run_id parameter required'\cf4 \strokec4  \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 400\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  apifyToken \strokec5 =\strokec4  \cf8 \strokec8 Deno\cf4 \strokec5 .\strokec4 env\strokec5 .\cf2 \strokec2 get\cf4 \strokec5 (\cf6 \strokec6 'APIFY_API_TOKEN'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 apifyToken\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'APIFY_API_TOKEN not configured'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf7 \strokec7 // Get run status\cf4 \cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  statusResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cb1 \strokec4 \
\cb3       \cf6 \strokec6 `https://api.apify.com/v2/actor-runs/\cf4 \strokec5 $\{\strokec4 runId\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\strokec4 apifyToken\strokec5 \}\cf6 \strokec6 `\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 statusResponse\strokec5 .\strokec4 ok\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'Failed to fetch run status'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 const\cf4 \strokec4  statusData \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  statusResponse\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  status \strokec5 =\strokec4  statusData\strokec5 .\strokec4 data\strokec5 .\strokec4 status\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  actorId \strokec5 =\strokec4  statusData\strokec5 .\strokec4 data\strokec5 .\strokec4 actId\cb1 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 status \strokec5 ===\strokec4  \cf6 \strokec6 'RUNNING'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'running'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           message\strokec5 :\strokec4  \cf6 \strokec6 'Actor is still running. Try again later.'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           started_at\strokec5 :\strokec4  statusData\strokec5 .\strokec4 data\strokec5 .\strokec4 startedAt\strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 status \strokec5 ===\strokec4  \cf6 \strokec6 'FAILED'\cf4 \strokec4  \strokec5 ||\strokec4  status \strokec5 ===\strokec4  \cf6 \strokec6 'ABORTED'\cf4 \strokec4  \strokec5 ||\strokec4  status \strokec5 ===\strokec4  \cf6 \strokec6 'TIMED-OUT'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  status\strokec5 .\strokec4 toLowerCase\strokec5 (),\cb1 \strokec4 \
\cb3           error\strokec5 :\strokec4  statusData\strokec5 .\strokec4 data\strokec5 .\strokec4 statusMessage \strokec5 ||\strokec4  \cf6 \strokec6 'Run failed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 status \strokec5 ===\strokec4  \cf6 \strokec6 'SUCCEEDED'\cf4 \strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3       \cf7 \strokec7 // Get results from dataset\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  datasetId \strokec5 =\strokec4  statusData\strokec5 .\strokec4 data\strokec5 .\strokec4 defaultDatasetId\cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  resultsResponse \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  fetch\strokec5 (\cb1 \strokec4 \
\cb3         \cf6 \strokec6 `https://api.apify.com/v2/datasets/\cf4 \strokec5 $\{\strokec4 datasetId\strokec5 \}\cf6 \strokec6 /items`\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Authorization'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 `Bearer \cf4 \strokec5 $\{\strokec4 apifyToken\strokec5 \}\cf6 \strokec6 `\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 const\cf4 \strokec4  results \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  resultsResponse\strokec5 .\strokec4 json\strokec5 ()\cb1 \strokec4 \
\
\cb3       \cf7 \strokec7 // Find existing artifact to get brand_id and platform\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 let\cf4 \strokec4  artifact_brand_id \strokec5 =\strokec4  brandId\cb1 \
\cb3       \cf2 \strokec2 let\cf4 \strokec4  platform \strokec5 =\strokec4  \cf6 \strokec6 'web'\cf4 \cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 artifact_brand_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  data\strokec5 :\strokec4  existingArtifact \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3           \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_raw_artifacts'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3           \strokec5 .\strokec4 select\strokec5 (\cf6 \strokec6 'brand_id, platform'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3           \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'payload_hash'\cf4 \strokec5 ,\strokec4  runId\strokec5 )\cb1 \strokec4 \
\cb3           \strokec5 .\strokec4 single\strokec5 ()\cb1 \strokec4 \
\
\cb3         \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 existingArtifact\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           artifact_brand_id \strokec5 =\strokec4  existingArtifact\strokec5 .\strokec4 brand_id\cb1 \
\cb3           platform \strokec5 =\strokec4  existingArtifact\strokec5 .\strokec4 platform\cb1 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (!\strokec4 artifact_brand_id\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Error\cf4 \strokec5 (\cf6 \strokec6 'brand_id not found. Provide brand_id parameter.'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf7 \strokec7 // Process and store results\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  newArtifacts \strokec5 =\strokec4  \strokec5 []\cb1 \strokec4 \
\cb3       \cf2 \strokec2 for\cf4 \strokec4  \strokec5 (\cf2 \strokec2 const\cf4 \strokec4  item \cf2 \strokec2 of\cf4 \strokec4  results\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  artifact \strokec5 =\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3           brand_id\strokec5 :\strokec4  artifact_brand_id\strokec5 ,\cb1 \strokec4 \
\cb3           source\strokec5 :\strokec4  \cf6 \strokec6 'apify'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           platform\strokec5 ,\cb1 \strokec4 \
\cb3           source_category\strokec5 :\strokec4  getSourceCategory\strokec5 (\strokec4 platform\strokec5 ),\cb1 \strokec4 \
\cb3           signal_layer\strokec5 :\strokec4  getSignalLayer\strokec5 (\strokec4 platform\strokec5 ),\cb1 \strokec4 \
\cb3           impact_level\strokec5 :\strokec4  \cf6 \strokec6 'high'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           change_rate\strokec5 :\strokec4  platform \strokec5 ===\strokec4  \cf6 \strokec6 'tiktok'\cf4 \strokec4  \strokec5 ?\strokec4  \cf6 \strokec6 'fast'\cf4 \strokec4  \strokec5 :\strokec4  \cf6 \strokec6 'slow'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           raw_payload\strokec5 :\strokec4  item\strokec5 ,\cb1 \strokec4 \
\cb3           payload_hash\strokec5 :\strokec4  \cf6 \strokec6 `\cf4 \strokec5 $\{\strokec4 runId\strokec5 \}\cf6 \strokec6 _\cf4 \strokec5 $\{\strokec4 newArtifacts\strokec5 .\strokec4 length\strokec5 \}\cf6 \strokec6 `\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           collected_at\strokec5 :\strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 ().\strokec4 toISOString\strokec5 (),\cb1 \strokec4 \
\cb3           cycle_window\strokec5 :\strokec4  \cf6 \strokec6 '7d'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3         \strokec5 \}\cb1 \strokec4 \
\
\cb3         newArtifacts\strokec5 .\strokec4 push\strokec5 (\strokec4 artifact\strokec5 )\cb1 \strokec4 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf7 \strokec7 // Insert new artifacts\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec5 \{\strokec4  error\strokec5 :\strokec4  insertError \strokec5 \}\strokec4  \strokec5 =\strokec4  \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_raw_artifacts'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 insert\strokec5 (\strokec4 newArtifacts\strokec5 )\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 insertError\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3         \cf2 \strokec2 throw\cf4 \strokec4  insertError\cb1 \
\cb3       \strokec5 \}\cb1 \strokec4 \
\
\cb3       \cf7 \strokec7 // Update original artifact with completion status\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 await\cf4 \strokec4  supabaseClient\cb1 \
\cb3         \strokec5 .\cf2 \strokec2 from\cf4 \strokec5 (\cf6 \strokec6 'gv_raw_artifacts'\cf4 \strokec5 )\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 update\strokec5 (\{\cb1 \strokec4 \
\cb3           raw_payload\strokec5 :\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3             actor_id\strokec5 :\strokec4  actorId\strokec5 ,\cb1 \strokec4 \
\cb3             run_id\strokec5 :\strokec4  runId\strokec5 ,\cb1 \strokec4 \
\cb3             status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3             items_count\strokec5 :\strokec4  results\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           \strokec5 \},\cb1 \strokec4 \
\cb3         \strokec5 \})\cb1 \strokec4 \
\cb3         \strokec5 .\strokec4 eq\strokec5 (\cf6 \strokec6 'payload_hash'\cf4 \strokec5 ,\strokec4  runId\strokec5 )\cb1 \strokec4 \
\
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3         \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\cb1 \strokec4 \
\cb3           success\strokec5 :\strokec4  \cf2 \strokec2 true\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           status\strokec5 :\strokec4  \cf6 \strokec6 'completed'\cf4 \strokec5 ,\cb1 \strokec4 \
\cb3           run_id\strokec5 :\strokec4  runId\strokec5 ,\cb1 \strokec4 \
\cb3           items_fetched\strokec5 :\strokec4  results\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           artifacts_created\strokec5 :\strokec4  newArtifacts\strokec5 .\strokec4 length\strokec5 ,\cb1 \strokec4 \
\cb3           duration_seconds\strokec5 :\strokec4  \cf8 \strokec8 Math\cf4 \strokec5 .\strokec4 round\strokec5 (\cb1 \strokec4 \
\cb3             \strokec5 (\cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 (\strokec4 statusData\strokec5 .\strokec4 data\strokec5 .\strokec4 finishedAt\strokec5 ).\strokec4 getTime\strokec5 ()\strokec4  \strokec5 -\strokec4  \cb1 \
\cb3              \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Date\cf4 \strokec5 (\strokec4 statusData\strokec5 .\strokec4 data\strokec5 .\strokec4 startedAt\strokec5 ).\strokec4 getTime\strokec5 ())\strokec4  \strokec5 /\strokec4  \cf9 \strokec9 1000\cf4 \cb1 \strokec4 \
\cb3           \strokec5 ),\cb1 \strokec4 \
\cb3         \strokec5 \}),\cb1 \strokec4 \
\cb3         \strokec5 \{\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3       \strokec5 )\cb1 \strokec4 \
\cb3     \strokec5 \}\cb1 \strokec4 \
\
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  \cf6 \strokec6 'Unknown status'\cf4 \strokec5 ,\strokec4  status \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \strokec5 ...\strokec4 corsHeaders\strokec5 ,\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\
\cb3   \strokec5 \}\strokec4  \cf2 \strokec2 catch\cf4 \strokec4  \strokec5 (\strokec4 error\strokec5 )\strokec4  \strokec5 \{\cb1 \strokec4 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf8 \strokec8 Response\cf4 \strokec5 (\cb1 \strokec4 \
\cb3       \cf8 \strokec8 JSON\cf4 \strokec5 .\strokec4 stringify\strokec5 (\{\strokec4  error\strokec5 :\strokec4  error\strokec5 .\strokec4 message \strokec5 \}),\cb1 \strokec4 \
\cb3       \strokec5 \{\strokec4  status\strokec5 :\strokec4  \cf9 \strokec9 500\cf4 \strokec5 ,\strokec4  headers\strokec5 :\strokec4  \strokec5 \{\strokec4  \cf6 \strokec6 'Content-Type'\cf4 \strokec5 :\strokec4  \cf6 \strokec6 'application/json'\cf4 \strokec4  \strokec5 \}\strokec4  \strokec5 \}\cb1 \strokec4 \
\cb3     \strokec5 )\cb1 \strokec4 \
\cb3   \strokec5 \}\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \})\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  getSourceCategory\strokec5 (\strokec4 platform\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 string\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 ([\cf6 \strokec6 'instagram'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'tiktok'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'youtube'\cf4 \strokec5 ].\strokec4 includes\strokec5 (\strokec4 platform\strokec5 ))\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 'social'\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 (\strokec4 platform \strokec5 ===\strokec4  \cf6 \strokec6 'google'\cf4 \strokec5 )\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 'serp'\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 'open_api'\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  getSignalLayer\strokec5 (\strokec4 platform\strokec5 :\strokec4  \cf2 \strokec2 string\cf4 \strokec5 ):\strokec4  \cf2 \strokec2 number\cf4 \strokec4  \strokec5 \{\cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  \strokec5 ([\cf6 \strokec6 'instagram'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'tiktok'\cf4 \strokec5 ,\strokec4  \cf6 \strokec6 'youtube'\cf4 \strokec5 ].\strokec4 includes\strokec5 (\strokec4 platform\strokec5 ))\strokec4  \cf2 \strokec2 return\cf4 \strokec4  \cf9 \strokec9 3\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf9 \strokec9 2\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3 \strokec5 \}\cb1 \strokec4 \
}